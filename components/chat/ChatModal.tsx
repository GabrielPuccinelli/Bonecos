'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, User } from 'lucide-react'
import { Collectible } from '@/types'
import Image from 'next/image'

interface ChatModalProps {
  collectible: Collectible
  isOpen: boolean
  onClose: () => void
}

interface ChatMessage {
  id: string
  senderId: string
  senderUsername: string
  text: string
  timestamp: Date
  isOwn: boolean
}

export function ChatModal({ collectible, isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock messages for demo
  useEffect(() => {
    if (isOpen) {
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          senderId: 'owner',
          senderUsername: collectible.ownerUsername,
          text: `Olá! Você tem interesse no meu ${collectible.name}?`,
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
          isOwn: false,
        },
        {
          id: '2',
          senderId: 'me',
          senderUsername: 'Você',
          text: 'Sim! Qual é o valor?',
          timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 min ago
          isOwn: true,
        },
        {
          id: '3',
          senderId: 'owner',
          senderUsername: collectible.ownerUsername,
          text: 'Estou aceitando ofertas. O que você acha de R$ 150?',
          timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 min ago
          isOwn: false,
        },
      ]
      setMessages(mockMessages)
    }
  }, [isOpen, collectible])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    
    try {
      // Simular envio de mensagem
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const message: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        senderUsername: 'Você',
        text: newMessage.trim(),
        timestamp: new Date(),
        isOwn: true,
      }
      
      setMessages(prev => [...prev, message])
      setNewMessage('')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-600">
            <div className="flex items-center space-x-4">
              <Image
                src={collectible.imageUrls[0] || '/api/placeholder/50/50'}
                alt={collectible.name}
                width={50}
                height={50}
                className="rounded-lg object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Chat sobre {collectible.name}
                </h3>
                <p className="text-sm text-gray-400">
                  @{collectible.ownerUsername}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[400px]">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.isOwn
                      ? 'bg-primary-500 text-dark-900'
                      : 'bg-dark-700 text-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {message.senderUsername}
                    </span>
                  </div>
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.isOwn ? 'text-dark-700' : 'text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-6 border-t border-dark-600">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 input-field"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark-900"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
