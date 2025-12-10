import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Settings, MessageSquare } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import NotificationDropdown from '@/components/notification/NotificationDropdown'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 flex items-center justify-between shadow-sm sticky top-0 z-30">
      {/* App Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-75 animate-pulse" />
          <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
        </div>
        <h1 className="text-xl font-bold gradient-text">Chat Realtime</h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Dropdown */}
        <NotificationDropdown />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl transition-smooth group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-smooth">
              <span className="text-white font-semibold text-sm">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.username || 'User'}</span>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                {/* User Info */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.username}</p>
                      <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-100 rounded-lg transition-smooth group"
                    onClick={() => {
                      setShowUserMenu(false)
                      // Navigate to settings page (will implement later)
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-smooth">
                      <Settings className="w-4 h-4 text-gray-700" />
                    </div>
                    <span className="text-gray-700 font-medium">Cài đặt</span>
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-red-50 rounded-lg transition-smooth group"
                    onClick={() => {
                      setShowUserMenu(false)
                      handleLogout()
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-smooth">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-red-600 font-medium">Đăng xuất</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
