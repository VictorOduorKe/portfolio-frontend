import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Settings, DatabaseBackup, LogOut, Award, Map, Newspaper, MessageSquareQuote, Menu, X, Globe, Activity, Mail } from 'lucide-react';

const DashboardLayout = ({ children, activeTab, setActiveTab, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'projects', label: 'Projects', icon: <LayoutDashboard size={20} /> },
    { id: 'skills', label: 'Skills', icon: <Award size={20} /> },
    { id: 'roadmaps', label: 'Roadmap', icon: <Map size={20} /> },
    { id: 'news', label: 'News', icon: <Newspaper size={20} /> },
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquareQuote size={20} /> },
    { id: 'contacts', label: 'Messages', icon: <Mail size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    { id: 'backup', label: 'Backup Manager', icon: <DatabaseBackup size={20} /> },
    { id: 'logs', label: 'Activity Logs', icon: <Activity size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-background gap-6">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white p-6 flex flex-col gap-4 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="text-xl font-bold">Portfolio Admin</div>
          <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <Link 
          to="/" 
          className="flex items-center gap-3 p-2.5 rounded-md text-white/80 hover:bg-white/10 hover:text-white border border-white/10 transition-colors text-sm font-medium"
        >
          <Globe size={18} />
          View Portfolio Site
        </Link>
        
        <nav className="flex-1 flex flex-col gap-2">
          {menuItems.map(item => (
            <div 
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${activeTab === item.id ? 'bg-white/15 text-white border-l-4 border-secondary font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3 p-3 rounded-md cursor-pointer text-white/80 hover:bg-white/10 hover:text-white mt-auto" onClick={onLogout}>
          <LogOut size={20} />
          Logout
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen w-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 bg-white border-b border-surface-variant z-30 flex-shrink-0">
          <button className="text-primary mr-4" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="font-bold text-primary">Admin Dashboard</div>
        </div>

        <div className="flex-1 p-6 md:p-10 max-w-[1200px] mx-auto w-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
