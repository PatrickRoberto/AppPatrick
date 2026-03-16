
import React, { useState } from 'react';
import { Punishment } from '../types';

interface PunishmentManagerProps {
  punishments: Punishment[];
  onUpdatePunishments: (punishments: Punishment[]) => void;
  onApply: (id: string) => void;
}

const PunishmentManager: React.FC<PunishmentManagerProps> = ({ punishments, onUpdatePunishments, onApply }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCost, setNewCost] = useState(50);

  const todayStr = new Date().toISOString().split('T')[0];

  const resetForm = () => {
    setNewTitle('');
    setNewCost(50);
    setEditingId(null);
    setShowForm(false);
  };

  const savePunishment = () => {
    if (!newTitle.trim()) return;
    const punData: Punishment = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      title: newTitle,
      cost: newCost
    };

    if (editingId) {
        onUpdatePunishments(punishments.map(p => p.id === editingId ? { ...punData, lastAppliedDate: p.lastAppliedDate } : p));
    } else {
        onUpdatePunishments([...punishments, punData]);
    }
    resetForm();
  };

  const handleEdit = (pun: Punishment) => {
    setEditingId(pun.id);
    setNewTitle(pun.title);
    setNewCost(pun.cost);
    setShowForm(true);
  };

  return (
    <div className="p-6 pb-32">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Câmara de Punições</h2>
          <p className="text-xs text-red-500 font-medium">Falhar tem um preço...</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl shadow-lg"
        >
          +
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-3xl border border-orange-100 shadow-xl space-y-4">
          <h3 className="font-bold text-black uppercase text-xs tracking-widest">{editingId ? 'Editar Punição' : 'Nova Punição'}</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Título da Falha</label>
              <input 
                type="text" 
                className="w-full bg-white text-black border-2 border-slate-100 p-3 rounded-2xl focus:outline-none focus:border-orange-400 font-medium"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Custo (Perda 🪙)</label>
              <input 
                type="number" 
                className="w-full bg-white text-black border-2 border-slate-100 p-3 rounded-2xl font-bold text-red-600"
                value={newCost}
                onChange={(e) => setNewCost(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={resetForm} className="flex-1 py-3 text-slate-400 font-black text-[10px] uppercase">Cancelar</button>
            <button onClick={savePunishment} className="flex-1 py-3 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-md">Salvar</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {punishments.map(p => {
          const isAppliedToday = p.lastAppliedDate === todayStr;
          return (
            <div key={p.id} className={`bg-white p-4 rounded-2xl border border-orange-50 shadow-sm flex items-center gap-4 transition-all ${isAppliedToday ? 'opacity-50 grayscale' : ''}`}>
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-lg">⚠️</div>
              <div className="flex-1 min-w-0">
                <span className={`block font-bold text-slate-700 ${isAppliedToday ? 'line-through' : ''} truncate`}>{p.title}</span>
                <span className="text-xs font-bold text-orange-600">-{p.cost} Moedas</span>
              </div>
              <div className="flex items-center gap-1">
                  {!isAppliedToday && <button onClick={() => handleEdit(p)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg">✏️</button>}
                  {isAppliedToday ? (
                    <span className="text-orange-500 font-black px-3 text-[10px] uppercase">OK</span>
                  ) : (
                    <button onClick={() => onApply(p.id)} className="bg-orange-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm active:scale-95">Falhei</button>
                  )}
                  <button onClick={() => onUpdatePunishments(punishments.filter(pun => pun.id !== p.id))} className="p-2 text-slate-300 hover:text-red-500 transition-colors">🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PunishmentManager;
