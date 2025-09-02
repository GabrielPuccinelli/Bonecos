'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { CollectibleForm } from '@/components/collectibles/CollectibleForm'
import { CollectibleCard } from '@/components/collectibles/CollectibleCard'
import { Collectible } from '@/types'
import { Plus, Package, TrendingUp, Users } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [collectibles, setCollectibles] = useState<Collectible[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCollectible, setEditingCollectible] = useState<Collectible | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    // Carregar colecionáveis do usuário
    loadUserCollectibles()
  }, [session, status, router])

  const loadUserCollectibles = async () => {
    // Simular carregamento de dados
    const mockCollectibles: Collectible[] = [
      {
        id: '1',
        name: 'Homem-Aranha',
        source: 'Homem-Aranha: Sem Volta para Casa',
        year: '2021',
        condition: 'novo',
        isForTrade: true,
        imageUrls: ['/api/placeholder/300/300'],
        ownerId: 'user1',
        ownerUsername: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Homem de Ferro',
        source: 'Vingadores: Ultimato',
        year: '2019',
        condition: 'usado',
        isForTrade: false,
        imageUrls: ['/api/placeholder/300/300'],
        ownerId: 'user1',
        ownerUsername: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    setCollectibles(mockCollectibles)
  }

  const handleAddCollectible = () => {
    setEditingCollectible(null)
    setIsFormOpen(true)
  }

  const handleEditCollectible = (collectible: Collectible) => {
    setEditingCollectible(collectible)
    setIsFormOpen(true)
  }

  const handleDeleteCollectible = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este colecionável?')) return
    
    try {
      // Simular deleção
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCollectibles(prev => prev.filter(c => c.id !== id))
      // Em produção, aqui seria a chamada real para a API
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingCollectible) {
        // Editar colecionável existente
        const updated = collectibles.map(c => 
          c.id === editingCollectible.id 
            ? { ...c, ...data, updatedAt: new Date() }
            : c
        )
        setCollectibles(updated)
      } else {
        // Adicionar novo colecionável
        const newCollectible: Collectible = {
          id: Date.now().toString(),
          ...data,
          ownerId: 'user1',
          ownerUsername: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setCollectibles(prev => [newCollectible, ...prev])
      }
      
      setIsFormOpen(false)
      setEditingCollectible(null)
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Meu Dashboard
              </h1>
              <p className="text-gray-400 text-lg">
                Gerencie sua coleção de colecionáveis
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <div className="card text-center">
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {collectibles.length}
                </h3>
                <p className="text-gray-400">Colecionáveis</p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {collectibles.filter(c => c.isForTrade).length}
                </h3>
                <p className="text-gray-400">Para Negociação</p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  12
                </h3>
                <p className="text-gray-400">Visualizações</p>
              </div>
            </motion.div>

            {/* Add Collectible Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <button
                onClick={handleAddCollectible}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar Novo Colecionável</span>
              </button>
            </motion.div>

            {/* Collectibles Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-6">
                Minha Coleção
              </h2>
              
              {collectibles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {collectibles.map((collectible, index) => (
                    <motion.div
                      key={collectible.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <CollectibleCard 
                        collectible={collectible}
                        onEdit={() => handleEditCollectible(collectible)}
                        onDelete={() => handleDeleteCollectible(collectible.id)}
                        isOwner={true}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    Sua coleção está vazia
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Comece adicionando seu primeiro colecionável!
                  </p>
                  <button
                    onClick={handleAddCollectible}
                    className="btn-primary"
                  >
                    Adicionar Primeiro Item
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Collectible Form Modal */}
      {isFormOpen && (
        <CollectibleForm
          collectible={editingCollectible}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setEditingCollectible(null)
          }}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  )
}
