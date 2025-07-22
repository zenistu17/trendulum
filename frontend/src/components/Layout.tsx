import React from 'react';
import { Outlet, Link, useLocation, NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ui/theme-toggle';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  User, 
  Lightbulb, 
  DollarSign, 
  LogOut,
  Menu,
  X,
  LayoutGrid,
  UserCircle,
  Bookmark
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { creatorProfileAPI } from '../services/api';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  // Get profiles from backend query for accurate navigation
  const { data: profiles = [] } = useQuery({
    queryKey: ['creator-profiles'],
    queryFn: creatorProfileAPI.getAll,
  });
  const firstProfileId = profiles.length > 0 ? profiles[0].id : null;
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Creator Profile', href: '/profile', icon: User },
    { name: 'Content Ideas', href: firstProfileId ? `/content-ideas/${firstProfileId}` : '/content-ideas', icon: Lightbulb },
    { name: 'Monetization', href: firstProfileId ? `/monetization-ideas/${firstProfileId}` : '/monetization-ideas', icon: DollarSign },
  ];

  const handleLogout = () => {
    logout();
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
      isActive
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const { theme, toggleTheme } = useTheme();
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-[#18181f] via-[#1a1a2e] to-[#2d0b3a] text-white' : 'bg-gradient-to-br from-primary-50 via-white to-secondary-50 text-gray-900'}`}>
      <ThemeToggle />
      {children}
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/70' : 'bg-gray-600 bg-opacity-75'}`} onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 flex w-64 flex-col ${theme === 'dark' ? 'bg-[#18181f] border-r border-[#232336]' : 'bg-white'}` }>
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-pink-400' : 'text-primary-600'}`}>Trendulum</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    theme === 'dark'
                      ? isActive
                        ? 'bg-[#232336] text-pink-400'
                        : 'text-gray-300 hover:bg-[#232336] hover:text-white'
                      : isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      theme === 'dark'
                        ? isActive
                          ? 'text-pink-400'
                          : 'text-gray-400 group-hover:text-white'
                        : isActive
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-pink-400' : 'bg-primary-500'}` }>
                  <span className="text-sm font-medium text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{user?.username}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`mt-3 flex w-full items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:bg-[#232336] hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <LogOut className={`mr-3 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex flex-col flex-grow ${theme === 'dark' ? 'bg-[#18181f] border-r border-[#232336]' : 'bg-white border-r border-gray-200'}`}>
          <div className="flex h-16 items-center px-4">
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-pink-400' : 'text-primary-600'}`}>Trendulum</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    theme === 'dark'
                      ? isActive
                        ? 'bg-[#232336] text-pink-400'
                        : 'text-gray-300 hover:bg-[#232336] hover:text-white'
                      : isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      theme === 'dark'
                        ? isActive
                          ? 'text-pink-400'
                          : 'text-gray-400 group-hover:text-white'
                        : isActive
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-pink-400' : 'bg-primary-500'}` }>
                  <span className="text-sm font-medium text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{user?.username}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`mt-3 flex w-full items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:bg-[#232336] hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <LogOut className={`mr-3 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-4">
            <NavLink to="/" className={navLinkClasses} end>
              <LayoutGrid className="h-4 w-4 mr-2" />
              Dashboard
            </NavLink>
            <NavLink to="/profile" className={navLinkClasses}>
              <UserCircle className="h-4 w-4 mr-2" />
              Profile
            </NavLink>
            <NavLink to="/saved-ideas" className={navLinkClasses}>
              <Bookmark className="h-4 w-4 mr-2" />
              Saved Ideas
            </NavLink>
          </div>
          <button
            onClick={logout}
            className="ml-auto -mr-2 p-2 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <LogOut size={24} />
          </button>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 