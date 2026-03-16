
import React, { useState } from 'react';
import { HistoryEntry } from '../types';

interface HistoryManagerProps {
  history: HistoryEntry[];
  onDeleteEntry: (id: string) => void;
}

const HistoryManager: React.FC<HistoryManagerProps> = ({ history, onDeleteEntry }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<HistoryEntry['type'] | 'all'>('all');

  // Navegação do Calendário
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Geração de dias do mês
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const monthDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = monthDays[0].getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  // Filtragem de histórico por data e tipo
  const getEntriesForDate = (dateStr: string) => {
    let filtered = history.filter(e => e.date.split('T')[0] === dateStr);
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }
    return filtered;
  };

  const hasActivity = (dateStr: string) => {
    return history.some(e => e.date.split('T')[0] === dateStr);
  };

  const dayEntries = getEntriesForDate(selectedDate);

  const getEntryStyles = (type: HistoryEntry['type']) => {
    switch(type) {
      case 'task': return { icon: '✅', color: 'text-blue-600', bg: 'bg-blue-50', label: 'Ganho' };
      case 'reward': return { icon: '🎁', color: 'text-green-600', bg: 'bg-green-50', label: 'Resgate' };
      case 'punishment': return { icon: '⚠️', color: 'text-red-600', bg: 'bg-red-50', label: 'Falha' };
      case 'bonus': return { icon: '🔥', color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Bônus' };
      case 'season_end': return { icon: '🏆', color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Temporada' };
    }
  };

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const filterOptions: { id: HistoryEntry['type'] | 'all', label: string, icon: string }[] = [
    { id: 'all', label: 'Tudo', icon: '🌐' },
    { id: 'task', label: 'Missões', icon: '✅' },
    { id: 'reward', label: 'Resgates', icon: '🎁' },
    { id: 'punishment', label: 'Falhas', icon: '⚠️' },
    { id: 'bonus', label: 'Bônus', icon: '🔥' },
    { id: 'season_end', label: 'Season', icon: '🏆' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Sua Jornada</h2>

      {/* Calendário */}
      <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden mb-6">
        <div className="flex justify-between items-center bg-blue-50/50 p-4 border-b border-blue-100">
          <button onClick={prevMonth} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors">◀</button>
          <span className="font-bold text-blue-800 uppercase text-xs tracking-wider">{monthName}</span>
          <button onClick={nextMonth} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors">▶</button>
        </div>

        <div className="grid grid-cols-7 text-center p-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
            <div key={d} className="text-[10px] font-black text-slate-300 py-2 uppercase">{d}</div>
          ))}
          
          {emptyDays.map((_, i) => <div key={`empty-${i}`} className="p-2" />)}
          
          {monthDays.map(day => {
            const dateStr = day.toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            const active = hasActivity(dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm transition-all ${
                  isSelected 
                  ? 'bg-blue-600 text-white font-bold shadow-lg scale-110 z-10' 
                  : isToday 
                    ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {day.getDate()}
                {active && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {filterOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilterType(opt.id)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
              filterType === opt.id 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
              : 'bg-white text-slate-400 border-slate-100'
            }`}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {/* Detalhes do Dia */}
      <div className="space-y-4 pb-32">
        <div className="flex justify-between items-end">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tight">Atividades do dia</h3>
          <span className="text-[10px] font-bold text-slate-300">{selectedDate.split('-').reverse().join('/')}</span>
        </div>

        {dayEntries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <span className="text-4xl block mb-2 opacity-20">📭</span>
            <p className="text-xs text-slate-300">Nenhum registro encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEntries.map(entry => {
              const s = getEntryStyles(entry.type);
              return (
                <div key={entry.id} className={`p-4 rounded-2xl border shadow-sm flex items-center gap-4 transition-all ${entry.type === 'season_end' ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100'}`}>
                  <div className={`w-10 h-10 ${s.bg} rounded-full flex items-center justify-center text-lg shadow-inner`}>{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <span className={`block font-bold truncate text-sm ${entry.type === 'season_end' ? 'text-indigo-800' : 'text-slate-700'}`}>{entry.title}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{s.label}</span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className={`font-black text-sm ${s.color}`}>
                      {entry.type === 'task' || entry.type === 'bonus' || entry.type === 'season_end' ? '+' : '-'}{entry.value}
                    </span>
                    <button 
                        onClick={() => onDeleteEntry(entry.id)} 
                        className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-300 hover:text-red-500 rounded-full transition-colors active:scale-90"
                    >
                        ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryManager;
