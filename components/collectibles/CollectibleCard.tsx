'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MessageSquare, Eye, Tag, Calendar, User } from 'lucide-react'
import { Collectible } from '@/types'
import { ChatModal } from '@/components/chat/ChatModal'

interface CollectibleCardProps {
  collectible: Collectible
  onEdit?: () => void
  onDelete?: () => void
  isOwner?: boolean
}

export function CollectibleCard({ collectible, onEdit, onDelete, isOwner }: CollectibleCardProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)

  const handleImageClick = () => {
    setIsImageModalOpen(true)
  }

  const handleChatClick = () => {
    setIsChatModalOpen(true)
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        className="card group cursor-pointer"
      >
        {/* Image Section */}
        <div className="relative mb-4 overflow-hidden rounded-lg">
          <Image
            src={collectible.imageUrls[0] || '/api/placeholder/300/300'}
            alt={collectible.name}
            width={300}
            height={300}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            onClick={handleImageClick}
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
            <button
              onClick={handleImageClick}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <Eye className="w-5 h-5 text-white" />
            </button>
            {collectible.isForTrade && (
              <button
                onClick={handleChatClick}
                className="p-2 bg-primary-500 rounded-full hover:bg-primary-600 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Trade Badge */}
          {collectible.isForTrade && (
            <div className="absolute top-3 right-3 bg-primary-500 text-dark-900 px-2 py-1 rounded-full text-xs font-semibold">
              Negociável
            </div>
          )}

          {/* Condition Badge */}
          <div className="absolute top-3 left-3 bg-dark-800/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold">
            {collectible.condition === 'novo' ? 'Novo' : 'Usado'}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white group-hover:text-primary-500 transition-colors">
            {collectible.name}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>{collectible.source}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{collectible.year}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="text-primary-400">@{collectible.ownerUsername}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleImageClick}
              className="flex-1 btn-secondary text-sm py-2"
            >
              Ver Detalhes
            </button>
            
            {collectible.isForTrade && !isOwner && (
              <button
                onClick={handleChatClick}
                className="flex-1 btn-primary text-sm py-2"
              >
                Negociar
              </button>
            )}

            {isOwner && (
              <>
                <button
                  onClick={onEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={onDelete}
                  className="flex-1 btn-danger text-sm py-2"
                >
                  Deletar
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={collectible.imageUrls[0] || '/api/placeholder/800/600'}
              alt={collectible.name}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white text-4xl hover:text-primary-500 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {isChatModalOpen && (
        <ChatModal
          collectible={collectible}
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
        />
      )}
    </>
  )
}
