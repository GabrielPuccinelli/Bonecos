'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Package, MessageSquare, Settings, Home } from 'lucide-react'
import { motion } from 'framer-motion'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`fixed left-0 top-0 h-full w-70 bg-dark-900 border-r border-dark-700 z-50 lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Profile Section */}
          <div className="p-6 border-b border-dark-700">
            <div className="text-center">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Perfil"
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-primary-500 mx-auto mb-4"
                />
              ) : (
                <div className="w-20 h-20 bg-dark-700 rounded-full border-4 border-primary-500 mx-auto mb-4 flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-white mb-1">
                {session.user?.name || 'Usuário'}
              </h3>
              <p className="text-sm text-gray-400">
                Colecionador
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              <Link
                href="/dashboard"
                className="sidebar-button flex items-center space-x-3"
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/profile"
                className="sidebar-button flex items-center space-x-3"
              >
                <User className="w-5 h-5" />
                <span>Meu Perfil</span>
              </Link>

              <Link
                href="/messages"
                className="sidebar-button flex items-center space-x-3 relative"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Mensagens</span>
                {/* Unread badge can be added here */}
              </Link>

              <Link
                href="/collection"
                className="sidebar-button flex items-center space-x-3"
              >
                <Package className="w-5 h-5" />
                <span>Minha Coleção</span>
              </Link>

              <Link
                href="/settings"
                className="sidebar-button flex items-center space-x-3"
              >
                <Settings className="w-5 h-5" />
                <span>Configurações</span>
              </Link>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-dark-700">
            <div className="text-center text-sm text-gray-400">
              <p>Portal de Colecionáveis</p>
              <p className="text-xs mt-1">© 2024</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
