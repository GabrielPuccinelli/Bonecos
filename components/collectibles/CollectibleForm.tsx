'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Trash2, Tag, Calendar, Package } from 'lucide-react'
import { Collectible } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const collectibleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  source: z.string().min(1, 'Fonte é obrigatória'),
  year: z.string().min(1, 'Ano é obrigatório'),
  condition: z.enum(['novo', 'usado']),
  isForTrade: z.boolean(),
})

type CollectibleFormData = z.infer<typeof collectibleSchema>

interface CollectibleFormProps {
  collectible?: Collectible | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export function CollectibleForm({ collectible, isOpen, onClose, onSubmit }: CollectibleFormProps) {
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CollectibleFormData>({
    resolver: zodResolver(collectibleSchema),
  })

  useEffect(() => {
    if (collectible) {
      setValue('name', collectible.name)
      setValue('source', collectible.source)
      setValue('year', collectible.year)
      setValue('condition', collectible.condition)
      setValue('isForTrade', collectible.isForTrade)
      setImagePreviews(collectible.imageUrls)
    } else {
      reset()
      setImages([])
      setImagePreviews([])
    }
  }, [collectible, setValue, reset])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const newImages = [...images, ...files]
    
    if (newImages.length > 4) {
      toast.error('Máximo de 4 imagens permitido')
      return
    }
    
    setImages(newImages)
    
    // Criar previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleFormSubmit = async (data: CollectibleFormData) => {
    if (imagePreviews.length === 0) {
      toast.error('Adicione pelo menos uma imagem')
      return
    }

    setIsLoading(true)
    
    try {
      // Em produção, aqui seria o upload real das imagens
      const formData = {
        ...data,
        images: imagePreviews, // URLs das imagens
      }
      
      await onSubmit(formData)
      toast.success(collectible ? 'Colecionável atualizado!' : 'Colecionável adicionado!')
      onClose()
    } catch (error) {
      toast.error('Erro ao salvar colecionável')
    } finally {
      setIsLoading(false)
    }
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
          className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-600">
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-primary-500" />
              <h2 className="text-xl font-semibold text-white">
                {collectible ? 'Editar Colecionável' : 'Adicionar Novo Colecionável'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Imagens do Colecionável (máximo 4)
              </label>
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-dark-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <div className="border-2 border-dashed border-dark-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-400">
                    Clique para selecionar imagens
                  </span>
                  <span className="text-sm text-gray-500">
                    PNG, JPG até 4 imagens
                  </span>
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Colecionável
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Ex: Homem-Aranha"
                    className="input-field pl-10"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Filme/Série/Desenho
                </label>
                <input
                  {...register('source')}
                  type="text"
                  placeholder="Ex: Vingadores: Ultimato"
                  className="input-field"
                />
                {errors.source && (
                  <p className="text-red-400 text-sm mt-1">{errors.source.message}</p>
                )}
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ano
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('year')}
                    type="text"
                    placeholder="Ex: 2019"
                    className="input-field pl-10"
                  />
                </div>
                {errors.year && (
                  <p className="text-red-400 text-sm mt-1">{errors.year.message}</p>
                )}
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Condição
                </label>
                <select
                  {...register('condition')}
                  className="input-field"
                >
                  <option value="novo">Novo</option>
                  <option value="usado">Usado</option>
                </select>
                {errors.condition && (
                  <p className="text-red-400 text-sm mt-1">{errors.condition.message}</p>
                )}
              </div>
            </div>

            {/* Trade Checkbox */}
            <div className="flex items-center space-x-3">
              <input
                {...register('isForTrade')}
                type="checkbox"
                id="isForTrade"
                className="w-5 h-5 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 focus:ring-2"
              />
              <label htmlFor="isForTrade" className="text-gray-300">
                Disponível para negociação (venda/troca)
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark-900"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>{collectible ? 'Atualizar' : 'Adicionar'}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
