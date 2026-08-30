'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Send, Camera, Image as ImageIcon, MoreVertical, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function CouturierMessagesPage() {
  const { id } = useParams()
  const [messages, setMessages] = useState([
    { id: 'm1', sender: 'couturier', text: 'Bonjour ! J\'ai bien reçu votre demande pour la robe Wax.', time: '10:30', isSystem: false },
    { id: 'm2', sender: 'system', text: 'Le devis a été envoyé par Sape Elite.', time: '10:45', isSystem: true },
    { id: 'm3', sender: 'client', text: 'Super, j\'ai validé et payé l\'acompte !', time: '11:00', isSystem: false },
    { id: 'm4', sender: 'couturier', text: 'Parfait, je commence la coupe dès demain.', time: '11:05', isSystem: false },
  ])
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'couturier',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    }])
    setInputText('')
  }

  return (
    <div className="min-h-screen bg-[#E5DDD5] flex flex-col max-w-md mx-auto relative h-[100dvh]">
      {/* Background Pattern WhatsApp-like */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0l30 30-30 30L0 30z\' fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>

      {/* Header */}
      <header className="bg-primary text-white px-3 py-3 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-2">
          <Link href={`/couturier/dashboard`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/10">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="font-bold">SM</span>
            </div>
            <div>
              <h1 className="font-semibold leading-tight">Sophie M.</h1>
              <p className="text-xs text-white/70">Client • Commande #{typeof id === 'string' ? id.substring(0,6) : '...'}</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 z-10 pb-20">
        <div className="text-center mb-6">
          <span className="bg-[#FFEEDB] text-[#806B52] text-xs px-3 py-1 rounded-lg font-medium shadow-sm inline-block">
            Les échanges ici sont protégés et font foi en cas de litige.
          </span>
        </div>

        {messages.map(msg => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="text-center my-4">
                <span className="bg-[#E1F3FB] text-[#4A7285] text-xs px-3 py-1.5 rounded-lg shadow-sm inline-block max-w-[85%]">
                  {msg.text}
                </span>
              </div>
            )
          }

          // In couturier view, isMe is when sender is 'couturier'
          const isMe = msg.sender === 'couturier'

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm relative ${
                isMe 
                  ? 'bg-[#DCF8C6] rounded-tr-sm text-gray-800' 
                  : 'bg-white rounded-tl-sm text-gray-800'
              }`}>
                <p className="text-sm leading-snug break-words pr-2">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-gray-500">{msg.time}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-blue-500" />}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="bg-[#F0F0F0] p-2 flex items-end gap-2 fixed bottom-0 w-full max-w-md z-20">
        <div className="flex-1 bg-white rounded-full flex items-center px-2 py-1 shadow-sm">
          <Button type="button" variant="ghost" size="icon" className="rounded-full text-gray-500 h-10 w-10 shrink-0">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <form onSubmit={handleSend} className="flex-1">
            <input 
              type="text" 
              placeholder="Message" 
              className="w-full bg-transparent border-none focus:outline-none text-sm px-2 py-3"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </form>
          <Button type="button" variant="ghost" size="icon" className="rounded-full text-gray-500 h-10 w-10 shrink-0">
            <Camera className="w-5 h-5" />
          </Button>
        </div>
        
        {inputText.trim() ? (
          <Button 
            onClick={handleSend}
            className="w-12 h-12 rounded-full bg-emerald text-white shadow-sm shrink-0 hover:bg-emerald/90 flex items-center justify-center p-0"
          >
            <Send className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button 
            type="button"
            className="w-12 h-12 rounded-full bg-emerald text-white shadow-sm shrink-0 hover:bg-emerald/90 flex items-center justify-center p-0"
          >
            <span className="font-bold">🎤</span>
          </Button>
        )}
      </div>
    </div>
  )
}
