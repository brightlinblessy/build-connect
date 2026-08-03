import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, ArrowLeft, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  getConversationsForUser,
  getOrCreateConversation,
  getDocumentById,
  sendMessage,
  listenToMessages,
} from '../../firebase/firestore'

function otherParticipantId(conversation, myUid) {
  return conversation.participants.find((id) => id !== myUid)
}

function formatTime(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Messages() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const startWith = searchParams.get('with')

  const [conversations, setConversations] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [activeId, setActiveId] = useState(null)
  const [activeOther, setActiveOther] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [mobileView, setMobileView] = useState('list') // list | thread
  const bottomRef = useRef(null)

  // Load the conversation list (joined with the other participant's profile).
  useEffect(() => {
    if (!user) return
    let active = true
    getConversationsForUser(user.uid)
      .then(async (convos) => {
        const withProfiles = await Promise.all(
          convos.map(async (c) => ({
            ...c,
            other: await getDocumentById('users', otherParticipantId(c, user.uid)),
          })),
        )
        if (active) setConversations(withProfiles)
      })
      .finally(() => active && setLoadingList(false))
    return () => {
      active = false
    }
  }, [user])

  // If we arrived with ?with=<userId> (e.g. "Message" from an engineer's
  // profile), open or create that conversation and select it.
  useEffect(() => {
    if (!user || !startWith) return
    let active = true
    getOrCreateConversation(user.uid, startWith).then(async (id) => {
      if (!active) return
      const other = await getDocumentById('users', startWith)
      setActiveId(id)
      setActiveOther(other)
      setMobileView('thread')
      setSearchParams({}, { replace: true })
      setConversations((prev) => (prev.some((c) => c.id === id) ? prev : [{ id, participants: [user.uid, startWith], other }, ...prev]))
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, startWith])

  // Subscribe to messages for whichever conversation is active.
  useEffect(() => {
    if (!activeId) return
    const unsub = listenToMessages(activeId, setMessages)
    return unsub
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function openConversation(convo) {
    setActiveId(convo.id)
    setActiveOther(convo.other)
    setMobileView('thread')
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!draft.trim() || !activeId || !user) return
    const text = draft.trim()
    setDraft('')
    await sendMessage(activeId, user.uid, text)
    // Keep the list's preview/order in sync without a full refetch.
    setConversations((prev) => {
      const updated = prev.map((c) => (c.id === activeId ? { ...c, lastMessage: text } : c))
      const idx = updated.findIndex((c) => c.id === activeId)
      if (idx > 0) {
        const [item] = updated.splice(idx, 1)
        updated.unshift(item)
      }
      return updated
    })
  }

  const filteredConversations = conversations.filter((c) =>
    (c.other?.name || '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="card h-[calc(100vh-140px)] flex overflow-hidden">
      {/* Conversation list */}
      <div className={`w-full sm:w-72 border-r border-ink-100 flex-col shrink-0 ${mobileView === 'thread' ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-ink-100">
          <div className="flex items-center gap-2 bg-ink-100 rounded-lg px-3 py-2">
            <Search size={15} className="text-ink-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations"
              className="bg-transparent text-sm outline-none w-full"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <p className="text-sm text-ink-500 p-4">Loading...</p>
          ) : filteredConversations.length === 0 ? (
            <p className="text-sm text-ink-500 p-4">
              No conversations yet. Message an engineer from their profile to start one.
            </p>
          ) : (
            filteredConversations.map((c) => (
              <button
                key={c.id}
                onClick={() => openConversation(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-ink-100 hover:bg-ink-100/60 transition ${
                  activeId === c.id ? 'bg-brand-50' : ''
                }`}
              >
                <img
                  src={
                    c.other?.photoURL ||
                    `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(c.other?.name || 'User')}`
                  }
                  alt=""
                  className="w-10 h-10 rounded-full bg-brand-50 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900 truncate">{c.other?.name || 'Unknown user'}</p>
                  <p className="text-xs text-ink-500 truncate">{c.lastMessage || 'No messages yet'}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <div className={`flex-col flex-1 min-w-0 ${mobileView === 'thread' ? 'flex' : 'hidden sm:flex'}`}>
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center text-sm text-ink-500">
            Select a conversation to start chatting.
          </div>
        ) : (
          <>
            <div className="h-16 border-b border-ink-100 flex items-center gap-3 px-5 shrink-0">
              <button onClick={() => setMobileView('list')} className="sm:hidden text-ink-500">
                <ArrowLeft size={18} />
              </button>
              <img
                src={
                  activeOther?.photoURL ||
                  `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(activeOther?.name || 'User')}`
                }
                alt=""
                className="w-9 h-9 rounded-full bg-brand-50 object-cover"
              />
              <p className="text-sm font-semibold text-ink-900">{activeOther?.name || 'Unknown user'}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-ink-100/30">
              {messages.length === 0 ? (
                <p className="text-sm text-ink-500 text-center mt-6">Say hello 👋</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                        m.senderId === user.uid
                          ? 'bg-brand-600 text-white rounded-br-sm'
                          : 'bg-white border border-ink-100 text-ink-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.senderId === user.uid ? 'text-blue-100' : 'text-ink-500'}`}>
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-ink-100 flex items-center gap-2 shrink-0">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="input-field flex-1"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
