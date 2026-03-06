import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  BarChart3, 
  LogOut,
  User
} from 'lucide-react';

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Bureaux',
      path: '/bureaux',
      icon: Building2,
    },
    {
      name: 'Rapports',
      path: '/rapports',
      icon: FileText,
    },
    {
      name: 'Statistiques',
      path: '/statistiques',
      icon: BarChart3,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      {/* Logo/Titre */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">Expertise Auto</h1>
        <p className="text-sm text-gray-400 mt-1">Gestion des expertises</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.prenom} {user.nom}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
