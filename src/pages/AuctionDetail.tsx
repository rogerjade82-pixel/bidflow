import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import { AuctionItem, Bid, AuctionStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Gavel, Clock, Trophy, ChevronLeft, Send, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin, signInWithGoogle, signInWithFacebook } = useAuth();
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const unsubAuction = auctionService.getAuction(id, (data) => {
      setAuction(data);
      setLoading(false);

      // Auto-finalize if time passed but still marked active (Admin only or system check)
      if (isAdmin && data && data.status === AuctionStatus.ACTIVE && data.endTime.toMillis() < Date.now()) {
        auctionService.endAuction(id).catch(console.error);
      }
    });
    const unsubBids = auctionService.getBids(id, (data) => {
      setBids(data);
    });
    return () => {
      unsubAuction();
      unsubBids();
    };
  }, [id]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      signInWithGoogle();
      return;
    }
    if (!id || !auction) return;

    setError("");
    setBidLoading(true);

    try {
      const amount = Number(bidAmount);
      await auctionService.placeBid(id, amount, user.displayName || "Anonymous");
      setBidAmount("");
    } catch (err: any) {
      setError(err.message || "Failed to place bid");
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">Loading item details...</div>;
  if (!auction) return <div className="p-12 text-center">Item not found.</div>;

  const isEnded = auction.status === AuctionStatus.ENDED || auction.endTime.toMillis() < Date.now();
  const minBid = auction.currentBid > 0 ? auction.currentBid : auction.startingPrice;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 font-medium text-sm">
        <ChevronLeft className="w-4 h-4" />
        Portal Gallery
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image and Description */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[4/3] rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 relative group"
          >
            <img 
              src={auction.imageUrl || 'https://images.unsplash.com/photo-1542491841-77363375f674?q=80&w=2670&auto=format&fit=crop'} 
              alt={auction.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6">
               <span className={cn(
                 "px-3 py-1 rounded border text-[10px] font-bold tracking-widest uppercase backdrop-blur-md",
                 isEnded ? "bg-slate-900/80 text-slate-500 border-slate-800" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
               )}>
                 {isEnded ? "Auction Closed" : "Live Bidding"}
               </span>
            </div>
          </motion.div>

          <div className="bg-slate-900/30 p-10 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
            <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">{auction.title}</h1>
            <p className="text-slate-400 leading-relaxed text-lg whitespace-pre-wrap">{auction.description}</p>
          </div>
        </div>

        {/* Right Column: Bidding Action and History */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
             
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                  <Clock className="w-4 h-4" />
                  Time Remaining
                </div>
                {!isEnded && (
                  <span className="text-rose-500 font-mono font-bold text-lg">
                    {formatDistanceToNow(auction.endTime.toMillis(), { addSuffix: true })}
                  </span>
                )}
             </div>

             <div className="mb-10">
               <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block mb-2">
                 Current Highest Bid
               </span>
               <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-black text-white tracking-tighter">₱{auction.currentBid.toLocaleString()}</span>
               </div>
               {auction.highestBidderName && (
                 <div className="mt-4 flex items-center gap-2 p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
                    <Trophy className="w-4 h-4 text-indigo-400" />
                    <p className="text-xs text-slate-300">Held by <span className="text-indigo-400 font-bold">@{auction.highestBidderName}</span></p>
                 </div>
               )}
             </div>

             <form onSubmit={handlePlaceBid} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Place New Bid (PHP)</label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-600 group-focus-within:text-indigo-400 transition-colors">₱</span>
                    <input 
                      type="number" 
                      placeholder={`Min: ₱${(minBid + 1).toLocaleString()}`}
                      step="any"
                      className="w-full pl-10 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold text-xl text-white disabled:opacity-50"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      disabled={isEnded || bidLoading}
                    />
                  </div>
                </div>
                {error && <p className="text-rose-500 text-xs font-bold bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</p>}
                
                {!user ? (
                  <div className="space-y-4">
                    <button 
                      type="button"
                      onClick={signInWithGoogle}
                      className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-lg border border-slate-200"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Login with Google
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                      <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]"><span className="bg-slate-900 px-2 text-slate-500">or</span></div>
                    </div>
                    <button 
                      type="button"
                      onClick={signInWithFacebook}
                      className="w-full py-3 bg-[#1877F2]/10 text-white rounded-xl font-bold hover:bg-[#1877F2]/20 transition-all flex items-center justify-center gap-3 border border-[#1877F2]/30 text-xs"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook Auth
                    </button>
                    <p className="text-[9px] text-center text-slate-500 uppercase tracking-widest mt-4">Required to place a bid</p>
                  </div>
                ) : (
                  <button 
                    type="submit"
                    disabled={isEnded || bidLoading || !bidAmount || Number(bidAmount) <= minBid}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none border border-indigo-500/30"
                  >
                    <Gavel className="w-5 h-5 text-indigo-300" />
                    {bidLoading ? "Securing Bid..." : "COMMIT BID"}
                  </button>
                )}
             </form>
           </div>

           {/* Bid History */}
           <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800/50">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                  <History className="w-4 h-4" />
                  Live Activity
                </div>
                <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded italic">Realtime</span>
             </div>
             <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {bids.map((bid, index) => (
                    <motion.div 
                      key={`bid-${bid.id || index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all",
                        index === 0 ? "bg-slate-800/80 border-indigo-500/50 shadow-lg shadow-indigo-500/5" : "bg-slate-900/50 border-slate-800 opacity-80"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${bid.userName}`}
                          alt="" 
                          className={cn(
                            "w-8 h-8 rounded-full border border-slate-700 bg-slate-800",
                            index === 0 && "border-indigo-500"
                          )} 
                        />
                        <div>
                          <p className="font-bold text-xs text-white">{bid.userName}</p>
                          <p className="text-[9px] text-slate-500 font-medium">
                            {bid.createdAt ? formatDistanceToNow(bid.createdAt.toMillis(), { addSuffix: true }) : "Just now"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "font-black text-sm",
                          index === 0 ? "text-indigo-400" : "text-slate-300"
                        )}>₱{bid.amount.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {bids.length === 0 && (
                  <p className="text-center text-slate-600 py-12 text-sm italic border border-dashed border-slate-800 rounded-2xl">No bids recorded yet.</p>
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
