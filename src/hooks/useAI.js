import { useState } from 'react'
import { isNativeApp } from '../lib/native'
import { generateContentViaProxy, isAiProxyEnabled } from '../lib/aiProxy'

export const useAI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateContent = async (prompt, type = 'caption') => {
    setLoading(true)
    setError(null)

    try {
      if (isNativeApp || isAiProxyEnabled()) {
        return await generateContentViaProxy(prompt, type)
      }

      const apiKey = import.meta.env.VITE_GEMINI_KEY || import.meta.env.VITE_GEMINI_API_KEY

      if (!apiKey) {
        // Fallback to a smart mock if no API key is provided
        await new Promise(resolve => setTimeout(resolve, 1500))
        const mocks = {
          caption: [
            "✨ Transformation Tuesday! See how Planora is changing the game for creators.",
            "🚀 Ready to scale? Our latest AI tools are here to help you grow faster.",
            "💡 Pro Tip: Consistency is the secret sauce to social media success."
          ],
          ideas: [
            "1. A 'Day in the Life' reel showing your workspace setup.\n2. Tutorial: How to use our new scheduling features.\n3. Q&A Session: Answering the most common creator questions."
          ],
          hashtags: "#SocialMediaManager #ContentCreator #AITools #MarketingStrategy #Planora"
        }
        return mocks[type]?.[Math.floor(Math.random() * (mocks[type]?.length || 1))] || mocks.caption[0]
      }

      // Google Gemini API Call (Using gemini-pro for maximum compatibility)
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a social media expert. Generate a professional ${type} for a post about: "${prompt}". Respond with ONLY the generated ${type} text.`
            }]
          }]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to generate content with Gemini')
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated.'
    } catch (err) {
      console.error('AI Error:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { generateContent, loading, error }
}
