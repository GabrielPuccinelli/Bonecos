'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, User, LogOut, Settings, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/gallery' })
  }

  return (
    <header className="bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-dark-900 font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-display font-bold text-gradient">
              PortalColecionaveis
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/gallery" className="text-gray-300 hover:text-primary-500 transition-colors">
              Galeria
            </Link>
            <Link href="/search" className="text-gray-300 hover:text-primary-500 transition-colors">
              Buscar
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-primary-500 transition-colors">
              Sobre
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-primary-500 transition-colors">
              Contato
            </Link>
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="btn-primary flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Perfil"
                        width={32}
                        height={32}
                        className="rounded-full border-2 border-primary-500"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <span className="hidden sm:block">{session.user?.name}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link href="/profile" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-white transition-colors">
                        <User className="w-4 h-4" />
                        <span>Perfil</span>
                      </Link>
                      <Link href="/messages" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Mensagens</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-red-600 hover:text-white transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-300 hover:text-primary-500 transition-colors">
                  Entrar
                </Link>
                <Link href="/register" className="btn-primary">
                  Cadastrar
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-800 border-t border-dark-700"
          >
            <div className="px-4 py-4 space-y-4">
              <Link href="/gallery" className="block text-gray-300 hover:text-primary-500 transition-colors">
                Galeria
              </Link>
              <Link href="/search" className="block text-gray-300 hover:text-primary-500 transition-colors">
                Buscar
              </Link>
              <Link href="/about" className="block text-gray-300 hover:text-primary-500 transition-colors">
                Sobre
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-primary-500 transition-colors">
                Contato
              </Link>
              
              {session && (
                <>
                  <hr className="border-dark-600" />
                  <Link href="/dashboard" className="block text-gray-300 hover:text-primary-500 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/profile" className="block text-gray-300 hover:text-primary-500 transition-colors">
                    Perfil
                  </Link>
                  <Link href="/messages" className="block text-gray-300 hover:text-primary-500 transition-colors">
                    Mensagens
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left text-red-400 hover:text-red-300 transition-colors"
                  >
                    Sair
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
