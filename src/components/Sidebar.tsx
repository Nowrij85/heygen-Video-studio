import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Video, 
  Users, 
  Settings, 
  LogOut,
  Wallet,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Video Agent', path: '/dashboard/create?tab=agent', icon: Sparkles },
  { name: 'Create Video', path: '/dashboard/create?tab=avatar', icon: PlusCircle },
  { name: 'My Videos', path: '/dashboard/videos', icon: Video },
  { name: 'Avatars', path: '/dashboard/avatars', icon: Users },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, balance } = useAppStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#12121a] border-r border-[#1e1e2e] h-screen fixed left-0 top-0 z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 text-[#6366f1]">
            <Video size={32} />
            <h1 className="text-xl font-bold text-white tracking-tight">HeyGen Studio</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path.includes('?') && location.pathname === item.path.split('?')[0] && location.search.includes(item.path.split('?')[1]));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20" 
                    : "text-[#94a3b8] hover:bg-[#1e1e2e] hover:text-white"
                )}
              >
                <Icon size={20} className={cn(isActive ? "text-white" : "text-[#94a3b8] group-hover:text-white")} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1e1e2e]">
          {balance && (
            <div className="mb-4 p-3 bg-[#1e1e2e] rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#94a3b8] mb-1">
                <Wallet size={12} />
                <span>API Balance</span>
              </div>
              <div className="text-sm font-bold text-white">
                {balance.credits} Credits
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="text-xs text-[#94a3b8]">
              <p className="font-medium text-white truncate w-32">admin@sellerbd.com</p>
              <p>Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#12121a] border-t border-[#1e1e2e] flex justify-around items-center h-16 z-50 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path.includes('?') && location.pathname === item.path.split('?')[0] && location.search.includes(item.path.split('?')[1]));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive ? "text-[#6366f1]" : "text-[#94a3b8]"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
