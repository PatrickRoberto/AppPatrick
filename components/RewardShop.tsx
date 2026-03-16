
import React, { useState } from 'react';
import { Reward } from '../types';

interface RewardShopProps {
  rewards: Reward[];
  coins: number;
  onUpdateRewards: (rewards: Reward[]) => void;
  onPurchase: (id: string) => void;
}

const RewardShop: React.FC<RewardShopProps> = ({ rewards, coins, onUpdateRewards, onPurchase }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCost, setNewCost] = useState(100);

  const resetForm = () => {
    setNewTitle('');
    setNewCost(100);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (reward: Reward) => {
    setEditingId(reward.id);
    setNewTitle(reward.title);
    setNewCost(reward.cost);
    setShowForm(true);
  };

  const saveReward = () => {
    if (!newTitle.trim()) return;
    
    const rewardData: Reward = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      title: newTitle,
      cost: newCost,
      purchased: false,
      description: ''
    };

    if (editingId) {
      onUpdateRewards(rewards.map(r => r.id === editingId ? rewardData : r));
    } else {
      onUpdateRewards([...rewards, rewardData]);
    }
    resetForm();
  };

  const removeReward = (id: string) => {
    if (confirm('Deseja remover este prêmio?')) {
      onUpdateRewards(rewards.filter(r => r.id !== id));
    }
  };

  return (
    <div className="p-6 pb-32">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Loja de Prêmios</h2>
          <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Saldo: {coins} 🪙</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl shadow-lg active:scale-95 transition-transform"
        >
          +
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xl space-y-5 animate-in slide-in-from-top duration-300">
          <h3 className="font-bold text-black uppercase text-xs tracking-widest">
            {editingId ? 'Editar Recompensa' : 'Nova Recompensa'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Título do Prêmio</label>
              <input 
                type="text" 
                placeholder="Ex: 1h de videogame, Chocolate..."
                className="w-full bg-white text-black border-2 border-slate-100 p-3 rounded-2xl focus:outline-none focus:border-green-400 font-medium"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Custo em Moedas</label>
              <input 
                type="number" 
                className="w-full bg-white text-black border-2 border-slate-100 p-3 rounded-2xl font-bold text-green-600"
                value={newCost}
                onChange={(e) => setNewCost(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={resetForm} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase">Cancelar</button>
              <button onClick={saveReward} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95">Salvar</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {rewards.length === 0 ? (
          <div className="col-span-2 text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-green-100">
            <span className="text-5xl block mb-4 opacity-40">🎁</span>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Nenhum prêmio cadastrado</p>
          </div>
        ) : (
          rewards.map(reward => {
            const canAfford = coins >= reward.cost;
            return (
              <div key={reward.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex flex-col items-center relative group overflow-hidden">
                <div className="absolute top-1 right-1 flex">
                  <button onClick={() => handleEdit(reward)} className="p-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">✏️</button>
                  <button onClick={() => removeReward(reward.id)} className="p-2 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
                
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner">
                  🎁
                </div>
                
                <h4 className="font-bold text-slate-700 text-center text-xs line-clamp-2 mb-1 min-h-[32px]">{reward.title}</h4>
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{reward.cost} 🪙</span>
                </div>
                
                <button 
                  disabled={!canAfford}
                  onClick={() => onPurchase(reward.id)}
                  className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    canAfford 
                    ? 'bg-green-600 text-white shadow-md shadow-green-100 active:scale-95' 
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Resgatar' : 'Saldo Insufic.'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RewardShop;
