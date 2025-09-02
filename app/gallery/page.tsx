'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { CollectibleCard } from '@/components/collectibles/CollectibleCard'
import { SearchFilters } from '@/components/search/SearchFilters'
import { Pagination } from '@/components/ui/Pagination'
import { Collectible, SearchFilters as SearchFiltersType } from '@/types'
import { motion } from 'framer-motion'

export default function GalleryPage() {
  const [collectibles, setCollectibles] = useState<Collectible[]>([])
  const [filteredCollectibles, setFilteredCollectibles] = useState<Collectible[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<SearchFiltersType>({
    trade: 'todos',
    condition: 'todos',
  })

  const itemsPerPage = 12

  useEffect(() => {
    // Simular carregamento de dados
    // Em produção, isso seria uma chamada API
    setTimeout(() => {
      const mockData: Collectible[] = [
        {
          id: '1',
          name: 'Homem-Aranha',
          source: 'Homem-Aranha: Sem Volta para Casa',
          year: '2021',
          condition: 'novo',
          isForTrade: true,
          imageUrls: ['/api/placeholder/300/300'],
          ownerId: 'user1',
          ownerUsername: 'spiderman_fan',
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
          ownerId: 'user2',
          ownerUsername: 'ironman_collector',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Adicione mais itens mock aqui
      ]
      
      setCollectibles(mockData)
      setFilteredCollectibles(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    // Aplicar filtros
    let filtered = collectibles

    if (filters.trade !== 'todos') {
      filtered = filtered.filter(item => 
        filters.trade === 'sim' ? item.isForTrade : !item.isForTrade
      )
    }

    if (filters.condition !== 'todos') {
      filtered = filtered.filter(item => item.condition === filters.condition)
    }

    setFilteredCollectibles(filtered)
    setCurrentPage(1)
  }, [filters, collectibles])

  const totalPages = Math.ceil(filteredCollectibles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredCollectibles.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando galeria...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold text-gradient mb-6">
            Galeria de Colecionáveis
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explore coleções incríveis de fãs como você. Descubra raridades e conecte-se com outros colecionadores.
          </p>
        </motion.section>

        {/* Search and Filters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SearchFilters filters={filters} onFiltersChange={setFilters} />
        </motion.section>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            {filteredCollectibles.length} colecionável{filteredCollectibles.length !== 1 ? 's' : ''} encontrado{filteredCollectibles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Collectibles Grid */}
        {currentItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
          >
            {currentItems.map((collectible, index) => (
              <motion.div
                key={collectible.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CollectibleCard collectible={collectible} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-lg">
              Nenhum colecionável encontrado com os filtros selecionados.
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>
    </div>
  )
}
