import React, { useState } from 'react';
import { auctionService } from '../services/auctionService';
import { UserProfile } from '../types';
import { User, MapPin, Phone, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  initialData: UserProfile;
  onComplete: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, uid, initialData, onComplete }) => {
  const [name, setName] = useState(initialData.displayName || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !phone) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await auctionService.updateUserProfile(uid, {
        displayName: name,
        address,
        phone
      });
      onComplete();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-500/10 rounded-lg">
                  <User className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Complete Profile</h2>
                  <p className="text-xs text-slate-500">Required contact information for bidding</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Physical Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, State, ZIP"
                      rows={3}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all text-sm resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-indigo-600 text-white rounded-xl py-3.5 text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
