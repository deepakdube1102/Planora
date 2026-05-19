import { create } from 'zustand'

function loadChats(userId) {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(`planora-chats-${userId}`)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveChats(userId, state) {
  if (!userId) return
  try {
    localStorage.setItem(`planora-chats-${userId}`, JSON.stringify({
      chats: state.chats,
      activeChatId: state.activeChatId,
    }))
  } catch {}
}

function makeChat(title = 'New Chat') {
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function timeAgo(dateStr) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

const defaultChat = makeChat('Instagram Post Caption')
defaultChat.messages = [
  {
    id: 'seed-user-1',
    role: 'user',
    content: 'Write a captivating Instagram caption for a skincare brand launching a new vitamin C serum.',
    time: '11:30 AM',
  },
  {
    id: 'seed-ai-1',
    role: 'assistant',
    content: `Glow starts within. ✨\n\nIntroducing our new Vitamin C Serum – your daily dose of radiance.\nFormulated to brighten, protect, and restore your natural glow.\n\n🌿 **Clean ingredients**\n✨ **Visible results**\n🧡 **Made for your glow journey**\n\nBecause healthy skin is always in. 🧡\n\n#GlowNaturally #VitaminCSerum #SkincareRoutine #RadiantSkin #PlanoraGlow`,
    time: '11:30 AM',
  },
]

export const useChatStore = create((set, get) => ({
  userId: null,
  chats: [defaultChat],
  activeChatId: defaultChat.id,
  isStreaming: false,
  streamingMessageId: null,
  isHistoryOpen: false,
  hasAutoCreatedNewChat: false,
  setHistoryOpen: (open) => set({ isHistoryOpen: open }),

  // ── Scoped Load Action (Triggered upon login/logout) ──
  loadUserChats: (userId) => {
    if (!userId) {
      set({ userId: null, chats: [defaultChat], activeChatId: defaultChat.id, hasAutoCreatedNewChat: false })
      return
    }

    const persisted = loadChats(userId)
    if (persisted && persisted.chats && persisted.chats.length > 0) {
      set({ userId, chats: persisted.chats, activeChatId: persisted.activeChatId, hasAutoCreatedNewChat: false })
    } else {
      const freshDefault = makeChat('Instagram Post Caption')
      freshDefault.messages = [...defaultChat.messages]
      set({ userId, chats: [freshDefault], activeChatId: freshDefault.id, hasAutoCreatedNewChat: true })
    }
  },

  // ── Getters ──
  getActiveChat: () => {
    const { chats, activeChatId } = get()
    return chats.find(c => c.id === activeChatId) || chats[0]
  },

  getMessages: () => {
    const chat = get().getActiveChat()
    return chat?.messages || []
  },

  getChatList: () => {
    return get().chats.map(c => ({
      id: c.id,
      title: c.title,
      time: timeAgo(c.updatedAt),
      messageCount: c.messages.length,
    }))
  },

  // ── Chat CRUD ──
  createChat: () => {
    const chat = makeChat('New Chat')
    set(state => {
      const next = { chats: [chat, ...state.chats], activeChatId: chat.id }
      saveChats(state.userId, { ...state, ...next })
      return next
    })
    return chat.id
  },

  switchChat: (chatId) => {
    set(state => {
      const next = { activeChatId: chatId }
      saveChats(state.userId, { ...state, ...next })
      return next
    })
  },

  deleteChat: (chatId) => {
    set(state => {
      const remaining = state.chats.filter(c => c.id !== chatId)
      if (remaining.length === 0) {
        const fresh = makeChat('New Chat')
        remaining.push(fresh)
      }
      const newActive = state.activeChatId === chatId ? remaining[0].id : state.activeChatId
      const next = { chats: remaining, activeChatId: newActive }
      saveChats(state.userId, { ...state, ...next })
      return next
    })
  },

  renameChat: (chatId, newTitle) => {
    set(state => {
      const next = {
        chats: state.chats.map(c =>
          c.id === chatId ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c
        ),
      }
      saveChats(state.userId, { ...state, ...next })
      return next
    })
  },

  // ── Messages ──
  addMessage: (msg) => {
    set(state => {
      const { activeChatId } = state
      const next = {
        chats: state.chats.map(c => {
          if (c.id !== activeChatId) return c
          const isFirstUserMsg = c.messages.length === 0 && msg.role === 'user'
          return {
            ...c,
            messages: [...c.messages, msg],
            title: isFirstUserMsg
              ? (msg.content.length > 30 ? msg.content.substring(0, 30) + '...' : msg.content)
              : c.title,
            updatedAt: new Date().toISOString(),
          }
        }),
      }
      saveChats(state.userId, { ...state, ...next })
      return next
    })
  },

  startStreaming: (messageId) => {
    set(state => {
      const { activeChatId } = state
      const placeholder = {
        id: messageId,
        role: 'assistant',
        content: '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true,
      }
      return {
        isStreaming: true,
        streamingMessageId: messageId,
        chats: state.chats.map(c =>
          c.id === activeChatId
            ? { ...c, messages: [...c.messages, placeholder], updatedAt: new Date().toISOString() }
            : c
        ),
      }
    })
  },

  appendToStream: (chunk) => {
    set(state => {
      const { activeChatId, streamingMessageId } = state
      return {
        chats: state.chats.map(c => {
          if (c.id !== activeChatId) return c
          return {
            ...c,
            messages: c.messages.map(m =>
              m.id === streamingMessageId ? { ...m, content: m.content + chunk } : m
            ),
          }
        }),
      }
    })
  },

  finishStreaming: () => {
    set(state => {
      const { activeChatId, streamingMessageId } = state
      const next = {
        isStreaming: false,
        streamingMessageId: null,
        chats: state.chats.map(c => {
          if (c.id !== activeChatId) return c
          return {
            ...c,
            messages: c.messages.map(m =>
              m.id === streamingMessageId ? { ...m, isStreaming: false } : m
            ),
          }
        }),
      }
      saveChats(state.userId, { ...state, ...next })
      return next
    })
  },

  removeLastAssistant: () => {
    set(state => {
      const { activeChatId } = state
      return {
        chats: state.chats.map(c => {
          if (c.id !== activeChatId) return c
          const msgs = [...c.messages]
          while (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
            msgs.pop()
          }
          return { ...c, messages: msgs }
        }),
      }
    })
  },

  getLastUserMessage: () => {
    const chat = get().getActiveChat()
    if (!chat) return ''
    const userMsgs = chat.messages.filter(m => m.role === 'user')
    return userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].content : ''
  },
}))
