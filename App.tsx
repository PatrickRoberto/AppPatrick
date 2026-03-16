
import React, { useState, useEffect } from 'react';
import { View, Task, Reward, Punishment, HistoryEntry, AppData, Season } from './types';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import RewardShop from './components/RewardShop';
import PunishmentManager from './components/PunishmentManager';
import HistoryManager from './components/HistoryManager';
import Settings from './components/Settings';
import Navbar from './components/Navbar';

const APP_ICON = "https://i.ibb.co/C386YvW/patrick-pixel.png";

const INITIAL_DATA: AppData = {
  tasks: [],
  rewards: [],
  punishments: [],
  history: [],
  stats: {
    totalCoins: 0,
  },
  currentSeason: null,
  dailyReviewTime: '21:00',
  seasonCount: 0
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('gami_routine_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      
      parsed.tasks = (parsed.tasks || []).map((t: Task) => {
        if (t.type === 'recurring' && t.completed && t.lastCompletedDate !== today) {
          return { ...t, completed: false };
        }
        return t;
      });
      return parsed;
    }
    return INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('gami_routine_data', JSON.stringify(data));
  }, [data]);

  const addHistoryEntry = (type: HistoryEntry['type'], title: string, value: number, relatedId?: string) => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      value,
      date: new Date().toISOString(),
      relatedId
    } as HistoryEntry;
  };

  const handleCompleteTask = (taskId: string) => {
    const task = data.tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    const today = new Date().toISOString().split('T')[0];
    const newTasks = data.tasks.map(t => 
      t.id === taskId ? { ...t, completed: true, lastCompletedDate: today, completionCount: (t.completionCount || 0) + 1 } : t
    );

    setData(prev => ({
      ...prev,
      tasks: newTasks,
      history: [addHistoryEntry('task', task.title, task.xp, task.id), ...prev.history],
      currentSeason: prev.currentSeason ? {
        ...prev.currentSeason,
        currentPoints: prev.currentSeason.currentPoints + task.xp
      } : null,
      stats: { ...prev.stats, totalCoins: prev.stats.totalCoins + task.coins }
    }));
  };

  const handleReactivateTask = (taskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: false, lastCompletedDate: undefined } : t)
    }));
  };

  const handleDeleteHistoryEntry = (entryId: string) => {
    setData(prev => ({
      ...prev,
      history: prev.history.filter(h => h.id !== entryId)
    }));
  };

  const handleApplyPunishment = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const pun = data.punishments.find(p => p.id === id);
    if (!pun || pun.lastAppliedDate === today) return;

    setData(prev => ({
      ...prev,
      punishments: prev.punishments.map(p => p.id === id ? { ...p, lastAppliedDate: today } : p),
      history: [addHistoryEntry('punishment', pun.title, pun.cost, pun.id), ...prev.history],
      stats: { ...prev.stats, totalCoins: prev.stats.totalCoins - pun.cost }
    }));
  };

  const handleCreateSeason = (season: Season) => {
    const nextSeasonNumber = data.seasonCount + 1;
    setData({ ...data, currentSeason: { ...season, seasonNumber: nextSeasonNumber }, seasonCount: nextSeasonNumber });
  };

  const handleEndSeason = () => {
    if (!data.currentSeason) return;
    setData({ ...data, currentSeason: null });
    alert("Season encerrada com sucesso!");
  };

  const isNegative = data.stats.totalCoins < 0;

  return (
    <div className="flex flex-col h-full bg-blue-50 text-slate-800 overflow-hidden">
      <header className="pt-4 pb-4 px-6 bg-white border-b border-blue-100 shadow-sm flex justify-between items-center relative z-50">
        <div className="flex items-center gap-3">
          <img src={APP_ICON} className="w-10 h-10 rounded-full border-2 border-blue-100 shadow-md object-cover" alt="Logo" />
          <div>
            <h1 className="text-lg font-black text-blue-600 leading-tight">Patrick's Life</h1>
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">App Local</p>
          </div>
        </div>
        <div className={`flex items-center px-3 py-1 rounded-full border transition-all ${isNegative ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-200'}`}>
            <span className="text-xs font-bold mr-1">🪙</span>
            <span className={`text-sm font-black ${isNegative ? 'text-red-600' : 'text-green-600'}`}>{data.stats.totalCoins}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 -webkit-overflow-scrolling-touch">
        {currentView === 'dashboard' && (
          <Dashboard 
            stats={data.stats} tasks={data.tasks} rewards={data.rewards} punishments={data.punishments} season={data.currentSeason}
            onCompleteTask={handleCompleteTask} 
            onPurchaseReward={(id) => {
              const r = data.rewards.find(x => x.id === id);
              if (r && data.stats.totalCoins >= r.cost) {
                setData(prev => ({...prev, stats: {...prev.stats, totalCoins: prev.stats.totalCoins - r.cost}, history: [addHistoryEntry('reward', r.title, r.cost), ...prev.history]}));
              }
            }}
            onApplyPunishment={handleApplyPunishment}
            onCreateSeason={handleCreateSeason}
            onEndSeason={handleEndSeason}
          />
        )}
        {currentView === 'tasks' && <TaskManager tasks={data.tasks} onUpdateTasks={(tasks) => setData({...data, tasks})} onReactivateTask={handleReactivateTask} />}
        {currentView === 'shop' && <RewardShop rewards={data.rewards} coins={data.stats.totalCoins} onUpdateRewards={(rewards) => setData({...data, rewards})} onPurchase={(id) => {
          const r = data.rewards.find(x => x.id === id);
          if (r && data.stats.totalCoins >= r.cost) {
            setData(prev => ({...prev, stats: {...prev.stats, totalCoins: prev.stats.totalCoins - r.cost}, history: [addHistoryEntry('reward', r.title, r.cost), ...prev.history]}));
          }
        }} />}
        {currentView === 'punishments' && <PunishmentManager punishments={data.punishments} onUpdatePunishments={(punishments) => setData({...data, punishments})} onApply={handleApplyPunishment} />}
        {currentView === 'history' && <HistoryManager history={data.history} onDeleteEntry={handleDeleteHistoryEntry} />}
        {currentView === 'settings' && <Settings data={data} onImport={setData} onUpdateTime={(time) => setData({...data, dailyReviewTime: time})} onReset={() => { if(confirm('Resetar?')) setData(INITIAL_DATA); }} />}
      </main>
      <Navbar activeView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;
