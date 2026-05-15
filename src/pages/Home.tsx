import React, { useState, useEffect } from 'react';
import { auctionService } from '../services/auctionService';
import { AuctionItem } from '../types';
import { AuctionCard } from '../components/AuctionCard';
import { Gavel, Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HomePage: React.FC = () => {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = auctionService.getAuctions((data) => {
      setAuctions(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredAuctions = auctions.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-indigo-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-4"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Real-time Auctions
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[0.9]"
          >
            The Auction <br/><span className="text-slate-800">Flow.</span>
          </motion.h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search listings..."
              className="pl-12 pr-6 py-3 w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-sm text-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={`skeleton-${i}`} className="h-[380px] bg-slate-900/50 border border-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAuctions.map((auction) => (
              <AuctionCard 
                key={`auction-${auction.id}`} 
                auction={auction} 
                onBid={(id) => {
                  window.location.href = `/auction/${id}`;
                }}
              />
            ))}
          </div>
          {filteredAuctions.length === 0 && (
            <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800">
               <p className="text-slate-500 font-medium italic">No items found in the current flow.</p>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
