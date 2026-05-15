import React, { useState } from 'react';
import { auctionService } from '../services/auctionService';
import { useAuth } from '../hooks/useAuth';
import { Timestamp } from 'firebase/firestore';
import { Plus, Image as ImageIcon, Calendar, Tag, AlertCircle, Sparkles, LayoutDashboard, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    startingPrice: '',
    endDate: '',
    endTime: ''
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-zinc-500">Only authorized administrators can access this panel.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { title, description, imageUrl, startingPrice, endDate, endTime } = formData;
      const endTimestamp = Timestamp.fromDate(new Date(`${endDate}T${endTime}`));
      
      if (endTimestamp.toMillis() <= Date.now()) {
        throw new Error("End time must be in the future");
      }

      await auctionService.createAuction({
        title,
        description,
        imageUrl,
        startingPrice: Number(startingPrice),
        endTime: endTimestamp,
        createdBy: user!.uid,
      });

      setSuccess(true);
      setFormData({ title: '', description: '', imageUrl: '', startingPrice: '', endDate: '', endTime: '' });
    } catch (err: any) {
      setError(err.message || "Failed to create auction");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) {
      setError("Please enter a title first");
      return;
    }
    setAiLoading(true);
    setError("");
    try {
      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Write a short, engaging auction description (max 3 sentences) for an item titled: "${formData.title}". Focus on its appeal and why people should bid.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setFormData({ ...formData, description: response.text() });
    } catch (err) {
      console.error("AI Generation failed", err);
      setError("AI generation failed. Please write manually.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border border-indigo-500/20">
          <LayoutDashboard className="w-3 h-3" />
          Auction Control
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Create New Flow</h1>
        <p className="text-slate-500 text-sm">Deploy a new item to the global bidding network</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl relative"
      >
        {success && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl mb-8 border border-emerald-500/20 flex items-center gap-3 text-sm font-bold"
          >
            <Sparkles className="w-4 h-4" />
            Auction live on the network.
          </motion.div>
        )}

        {error && (
          <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl mb-8 border border-rose-500/20 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest mb-1 ml-1">
              <Tag className="w-3 h-3" /> Item Title
            </label>
            <input
              required
              type="text"
              className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-white placeholder:text-slate-700"
              placeholder="e.g. Rare Collectible, High-end Tech..."
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
              <button 
                type="button"
                onClick={handleGenerateDescription}
                disabled={aiLoading || !formData.title}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3 h-3" />
                {aiLoading ? "Generating..." : "Magic Write"}
              </button>
            </div>
            <textarea
              required
              rows={4}
              className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-white placeholder:text-slate-700"
              placeholder="Provide deep details about the item's specifications..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest ml-1">
                <Plus className="w-3 h-3" /> Start Price (₱)
              </label>
              <input
                required
                type="number"
                className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-white placeholder:text-slate-700"
                placeholder="0.00"
                value={formData.startingPrice}
                onChange={e => setFormData({...formData, startingPrice: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest ml-1">
                <ImageIcon className="w-3 h-3" /> Image URL
              </label>
              <input
                type="url"
                className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-white placeholder:text-slate-700"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest ml-1">
                <Calendar className="w-3 h-3" /> End Date
              </label>
              <input
                required
                type="date"
                className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-white inverted-calendar-icon"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest ml-1">
                <Clock className="w-3 h-3" /> End Time
              </label>
              <input
                required
                type="time"
                className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-white inverted-calendar-icon"
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40 disabled:bg-slate-800 uppercase tracking-[0.2em] border border-indigo-500/30 text-sm"
          >
            {loading ? "Initializing..." : "Launch Auction"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
