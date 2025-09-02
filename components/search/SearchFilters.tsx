'use client'

import { Search, Filter, X } from 'lucide-react'
import { SearchFilters as SearchFiltersType } from '@/types'
import { useState } from 'react'

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  const handleFilterChange = (key: keyof SearchFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      trade: 'todos',
      condition: 'todos',
    })
    setSearchQuery('')
  }

  const hasActiveFilters = filters.trade !== 'todos' || filters.condition !== 'todos'

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, filme, série ou usuário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          className="flex items-center space-x-2 text-gray-300 hover:text-primary-500 transition-colors"
        >
          <Filter className="w-5 h-5" />
          <span>Filtros</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={`space-y-4 transition-all duration-300 ${
        isFiltersExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trade Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Disponível para Negociação
            </label>
            <select
              value={filters.trade}
              onChange={(e) => handleFilterChange('trade', e.target.value)}
              className="input-field"
            >
              <option value="todos">Todos</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Condição
            </label>
            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="input-field"
            >
              <option value="todos">Todas</option>
              <option value="novo">Novo</option>
              <option value="usado">Usado</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ano
            </label>
            <input
              type="text"
              placeholder="Ex: 2021"
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="input-field"
            />
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filme/Série
            </label>
            <input
              type="text"
              placeholder="Ex: Vingadores"
              value={filters.source || ''}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.trade !== 'todos' && (
              <span className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm border border-primary-500/30">
                Negociação: {filters.trade === 'sim' ? 'Sim' : 'Não'}
              </span>
            )}
            {filters.condition !== 'todos' && (
              <span className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm border border-primary-500/30">
                Condição: {filters.condition === 'novo' ? 'Novo' : 'Usado'}
              </span>
            )}
            {filters.year && (
              <span className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm border border-primary-500/30">
                Ano: {filters.year}
              </span>
            )}
            {filters.source && (
              <span className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm border border-primary-500/30">
                Fonte: {filters.source}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
