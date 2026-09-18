import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import client from '../api/client'

function AssistantChat() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const historyEndRef = useRef(null)

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) return null

  async function handleSubmit(event) {
    event.preventDefault()
    const content = input.trim()

    if (!content || isSending) return

    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setIsSending(true)

    try {
      const { data } = await client.post('/assistant/chat', { messages: nextMessages })
      setMessages((current) => [...current, { role: 'model', content: data.reply }])
    } catch {
      setMessages((current) => [
        ...current,
        { role: 'model', content: 'Something went wrong, try again.' },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <section
          aria-label="AI shopping assistant"
          className="mb-3 flex h-[28rem] w-80 flex-col rounded border border-zinc-700 bg-zinc-950 text-zinc-100 shadow-xl sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-zinc-700 p-3">
            <h2 className="font-semibold">Panel &amp; Co. Assistant</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded px-2 py-1 text-sm hover:bg-zinc-800"
              aria-label="Close assistant chat"
            >
              Close
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <p className="text-sm text-zinc-300">Ask for product recommendations or outfit ideas.</p>
            )}
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={message.role === 'user' ? 'ml-8 text-right' : 'mr-8 text-left'}
              >
                <pre
                  className={`inline-block whitespace-pre-wrap rounded px-3 py-2 text-sm ${
                    message.role === 'user' ? 'bg-violet-700 text-white' : 'bg-zinc-800 text-zinc-100'
                  }`}
                >
                  {message.content}
                </pre>
              </div>
            ))}
            {isSending && <p className="text-sm text-zinc-400">...</p>}
            <div ref={historyEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-zinc-700 p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isSending}
              className="min-w-0 flex-1 rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm"
              placeholder="Ask about products..."
              aria-label="Assistant message"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="rounded bg-violet-700 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="rounded-full bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-lg"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close assistant chat' : 'Open assistant chat'}
      >
        {isOpen ? 'Close chat' : 'Ask AI'}
      </button>
    </div>
  )
}

export default AssistantChat
