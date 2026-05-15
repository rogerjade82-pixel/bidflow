import React, { useState, useEffect } from 'react';
import { AuctionItem, AuctionStatus } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Gavel, Clock, Trophy, ExternalLink, Facebook } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  auction: AuctionItem;
  onBid: (id: string) => void;
}

export const AuctionCard: React.FC<Props> = ({ auction, onBid }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const isEnded = auction.status === AuctionStatus.ENDED || auction.endTime.toMillis() < Date.now();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const end = auction.endTime.toMillis();
      if (end < now) {
        setTimeLeft("Auction Ended");
        clearInterval(timer);
      } else {
        setTimeLeft(formatDistanceToNow(end, { addSuffix: true }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.endTime]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col"
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={auction.imageUrl || 'https://images.unsplash.com/photo-1542491841-77363375f674?q=80&w=2670&auto=format&fit=crop'} 
          alt={auction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
        <div className="absolute top-4 left-4">
          <span className={cn(
            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md",
            isEnded 
              ? "bg-slate-900/80 text-slate-400 border-slate-700" 
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          )}>
            {isEnded ? "Closed" : "Live Now"}
          </span>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const url = `${window.location.origin}/auction/${auction.id}`;
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
            }}
            className="p-2 bg-slate-900/60 backdrop-blur-md rounded-lg border border-slate-800 text-white hover:bg-[#1877F2] transition-colors"
            title="Share on Facebook"
          >
            <Facebook className="w-3.5 h-3.5" />
          </button>
        </div>
        {!isEnded && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 backdrop-blur-md rounded border border-slate-800 text-rose-400 text-[10px] font-mono">
            <Clock className="w-3 h-3" />
            {timeLeft}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-1 truncate">{auction.title}</h3>
        <p className="text-slate-500 text-xs mb-4 line-clamp-1">{auction.description}</p>
        
        <div className="mt-auto p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">
              {isEnded ? "Winning Bid" : "Current Bid"}
            </p>
            <p className="text-xl font-bold text-white">
              ₱{(auction.currentBid || auction.startingPrice).toLocaleString()}
            </p>
          </div>
          {auction.highestBidderName && (
            <div className="text-right">
               <p className="text-[10px] text-indigo-400 font-bold max-w-[80px] truncate italic">@{auction.highestBidderName}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => onBid(auction.id)}
          className={cn(
            "w-full py-3 rounded-lg text-xs font-bold mt-4 transition-all uppercase tracking-widest flex items-center justify-center gap-2",
            isEnded 
              ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700" 
              : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 border border-indigo-500/50"
          )}
        >
          {isEnded ? "View Results" : "Enter Auction"}
        </button>
      </div>
    </motion.div>
  );
};
