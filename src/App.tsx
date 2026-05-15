import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { AdminPage } from './pages/Admin';
import { AuctionDetailPage } from './pages/AuctionDetail';
import { useAuth } from './hooks/useAuth';
import { Gavel, User, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const { user, profile, isAdmin, signInWithGoogle, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg text-white group-hover:scale-110 transition-transform">
              B
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">
              BIDFLOW <span className="text-[10px] font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded ml-2 uppercase hidden sm:inline">Live</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors uppercase tracking-wider">
              Explore
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors uppercase tracking-wider">
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center gap-4 pl-6 border-l border-slate-800">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    {profile && !profile.profileCompleted && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title="Incomplete Profile"></span>
                    )}
                    <p className="text-xs font-semibold leading-none text-white">{user.displayName}</p>
                  </div>
                  <button onClick={logout} className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest mt-1">
                    Sign Out
                  </button>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full border border-slate-700 bg-slate-800" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20"
              >
                Sign In
              </button>
            )}
          </div>

          <button className="md:hidden text-slate-400" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-slate-900 border-t border-slate-800 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-white">Live Auctions</Link>
              {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-white">Admin Panel</Link>}
              {user ? (
                <button onClick={() => { logout(); setIsOpen(false); }} className="block text-lg font-bold text-rose-500">Sign Out</button>
              ) : (
                <button onClick={() => { signInWithGoogle(); setIsOpen(false); }} className="block text-lg font-bold text-white">Sign In</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/auction/:id" element={<AuctionDetailPage />} />
          </Routes>
        </main>
        
        <footer className="py-6 bg-slate-900 border-t border-slate-800">
           <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
             <div className="flex gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  Server: Online
                </span>
                <span>● Database: Stable</span>
             </div>
             <span>&copy; 2026 BIDFLOW ● ALL RIGHTS RESERVED</span>
           </div>
        </footer>
      </div>
    </Router>
  );
}
