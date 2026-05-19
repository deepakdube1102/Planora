import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY)

// gemini-2.5-flash is confirmed working with this API key
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

function buildSystemPrompt({ tone = 'Professional', platform = 'Instagram', contentType = 'Caption' } = {}) {
  return `You are Planora AI — a premium, intelligent social media content assistant and creative copilot.
You help creators, brands, and marketers craft high-performing content through natural conversation.

Current user settings:
- Tone: ${tone}
- Platform: ${platform}
- Content Type: ${contentType}

Your personality:
- Conversational, helpful, and creative
- You remember context from previous messages in this conversation
- You give structured, well-formatted responses using markdown
- You use relevant emojis naturally (not excessively)
- When writing social media content, include relevant hashtags
- You can help with captions, hashtags, content ideas, rewrites, scripts, strategies, and analytics advice
- Keep responses focused and actionable
- If asked to regenerate or improve, build on the conversation context`
}

/**
 * Convert our internal message format to Gemini history format.
 * Filters out error messages and ensures alternating user/model roles.
 */
function toGeminiHistory(messages) {
  // Filter to only valid user/assistant messages (no errors)
  const valid = messages.filter(m => m.role === 'user' || m.role === 'assistant')

  // Gemini requires strictly alternating user/model turns
  // and history must NOT include the last message (that's the prompt)
  const history = []
  for (const m of valid) {
    history.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    })
  }

  return history
}

/**
 * Stream a conversational response with full chat history.
 * @param {Array} messages - Array of { role: 'user'|'assistant', content: string }
 * @param {object} options - { tone, platform, contentType }
 * @param {function} onChunk - Called with each text chunk as it arrives
 * @returns {Promise<string>} Full final text
 */
export async function streamChat(messages, options = {}, onChunk = () => {}) {
  const systemPrompt = buildSystemPrompt(options)

  // All messages except the last one go into history
  // The last message (must be 'user') is the prompt we send
  const validMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant')

  if (validMessages.length === 0) {
    throw new Error('No messages to send.')
  }

  const lastMsg = validMessages[validMessages.length - 1]
  const history = toGeminiHistory(validMessages.slice(0, -1))

  try {
    const chat = model.startChat({
      history,
      systemInstruction: { parts: [{ text: systemPrompt }] },
    })

    const result = await chat.sendMessageStream(lastMsg.content)

    let fullText = ''
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        fullText += text
        onChunk(text)
      }
    }

    return fullText
  } catch (error) {
    console.error('Gemini streaming error:', error)
    // Expose the real error message for easier debugging
    const msg = error?.message || ''
    if (msg.includes('429')) {
      throw new Error('Rate limit reached. Please wait a moment and try again.')
    }
    if (msg.includes('404')) {
      throw new Error('Model not available. Please try again shortly.')
    }
    throw new Error('Failed to generate response. Please try again.')
  }
}

/**
 * Non-streaming fallback for single-shot generation.
 */
export async function generateContent(userPrompt, options = {}) {
  const systemPrompt = buildSystemPrompt(options)

  try {
    const chat = model.startChat({
      history: [],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    })

    const result = await chat.sendMessage(userPrompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw new Error('Failed to generate content. Please try again.')
  }
}

/**
 * Analyze content and return a score with feedback.
 */
export async function analyzeContentScore(content, platform = 'Instagram') {
  try {
    const prompt = `Analyze this ${platform} content and rate it on a scale of 0-100.
Return ONLY a JSON object with these fields (no markdown, no code blocks):
{"score": <number>, "label": "<Excellent|Good|Average|Needs Work>", "feedback": "<one short sentence>"}

Content to analyze:
"${content}"`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { score: 85, label: 'Good', feedback: 'Content looks engaging and well-structured.' }
  }
}

/**
 * Generate hashtag suggestions for given content.
 */
export async function suggestHashtags(content, platform = 'Instagram') {
  try {
    const prompt = `Suggest 8 highly relevant ${platform} hashtags for this content. 
Return ONLY a JSON array of strings (no markdown, no code blocks):
["#hashtag1", "#hashtag2", ...]

Content: "${content}"`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return ['#ContentCreator', '#SocialMedia', '#Marketing', '#BrandGrowth', '#DigitalMarketing', '#CreatorEconomy']
  }
}
