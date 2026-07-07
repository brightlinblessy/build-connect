import { useState } from 'react'
import { Send, Paperclip, MoreVertical, Search } from 'lucide-react'
import { featuredEngineers, chatMessages, avatarUrl } from '../../data/mockData'

export default function Messages() {
  const [active, setActive] = useState(featuredEngineers[1])
  const [messages, setMessages] = useState(chatMessages)
  const [draft, setDraft] = useState('')

  function handleSend(e) {
    e.preventDefault()
    if (!draft.trim()) return
    setMessages((m) => [
      ...m,
      { id: `m${m.length + 1}`, from: 'client', text: draft, time: 'Now' },
    ])
    setDraft('')
  }

  return (
    <div className="card h-[calc(100vh-140px)] flex overflow-hidden">
      {/* Conversation list */}
      <div className="w-full sm:w-72 border-r border-ink-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-ink-100">
          <div className="flex items-center gap-2 bg-ink-100 rounded-lg px-3 py-2">
            <Search size={15} className="text-ink-500" />
            <input placeholder="Search conversations" className="bg-transparent text-sm outline-none w-full" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {featuredEngineers.map((eng) => (
            <button
              key={eng.id}
              onClick={() => setActive(eng)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-ink-100 hover:bg-ink-100/60 transition ${
                active.id === eng.id ? 'bg-brand-50' : ''
              }`}
            >
              <img src={avatarUrl(eng.avatarSeed)} alt="" className="w-10 h-10 rounded-full bg-brand-50" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-900 truncate">{eng.name}</p>
                <p className="text-xs text-ink-500 truncate">Thanks! I will review and send you the quotation.</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className="hidden sm:flex flex-col flex-1 min-w-0">
        <div className="h-16 border-b border-ink-100 flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <img src={avatarUrl(active.avatarSeed)} alt="" className="w-9 h-9 rounded-full bg-brand-50" />
            <div>
              <p className="text-sm font-semibold text-ink-900">{active.name}</p>
              <p className="text-xs text-emerald-600">Online</p>
            </div>
          </div>
          <MoreVertical size={18} className="text-ink-500" />
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-ink-100/30">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'client' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                  m.from === 'client'
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-white border border-ink-100 text-ink-900 rounded-bl-sm'
                }`}
              >
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.from === 'client' ? 'text-blue-100' : 'text-ink-500'}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-ink-100 flex items-center gap-2">
          <button type="button" className="p-2 text-ink-500 hover:text-brand-600">
            <Paperclip size={18} />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1"
          />
          <button type="submit" className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
