
import React, { useState } from 'react';
import { Task, Reward, Punishment, UserStats, Season } from '../types';

interface DashboardProps {
  stats: UserStats;
  tasks: Task[];
  rewards: Reward[];
  punishments: Punishment[];
  season: Season | null;
  onCompleteTask: (id: string) => void;
  onPurchaseReward: (id: string) => void;
  onApplyPunishment: (id: string) => void;
  onCreateSeason: (season: Season) => void;
  onEndSeason: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, tasks, rewards, punishments, season, onCompleteTask, onPurchaseReward, onApplyPunishment, onCreateSeason, onEndSeason }) => {
  // Estados para controlar o que está aberto ou fechado
  const [isOneTimeOpen, setIsOneTimeOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isPunishmentsOpen, setIsPunishmentsOpen] = useState(false);

  // Estados para o formulário de nova temporada
  const [newSName, setNewSName] = useState('');
  const [newSTarget, setNewSTarget] = useState(5000);
  const [newSReward, setNewSReward] = useState('');
  const [newSEndDate, setNewSEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentDayOfWeek = today.getDay();
  const currentDateNum = today.getDate();

  const isTaskDueToday = (task: Task) => {
    if (task.type === 'one-time') return false; // Pontuais ficam em outra seção
    if (task.completed && task.lastCompletedDate === todayStr) return true;
    
    if (task.recurringType === 'monthly' && task.monthlyPattern) {
      const { week, day } = task.monthlyPattern;
      if (currentDayOfWeek !== day) return false;
      if (week <= 4) {
        let count = 0;
        for (let d = 1; d <= currentDateNum; d++) {
          if (new Date(today.getFullYear(), today.getMonth(), d).getDay() === day) count++;
        }
        return count === week;
      } else if (week === 5) {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return nextWeek.getMonth() !== today.getMonth();
      }
    }
    return (task.recurringDays || []).includes(currentDayOfWeek);
  };

  const routineTasks = tasks.filter(isTaskDueToday);
  const oneTimeTasks = tasks.filter(t => t.type === 'one-time' && !t.completed);
  const affordableRewards = rewards.filter(r => r.cost <= stats.totalCoins);

  const getSeasonProgress = () => {
    if (!season) return 0;
    return Math.min(100, (season.currentPoints / season.targetPoints) * 100);
  };

  const isGoalReached = season ? season.currentPoints >= season.targetPoints : false;
  const isNegative = stats.totalCoins < 0;

  return (
    <div className="p-6 space-y-4">
      {/* 1. SEÇÃO DE TEMPORADA */}
      {!season ? (
        <section className="bg-white rounded-3xl p-6 border-2 border-dashed border-blue-200 shadow-sm">
          <div className="text-center mb-6">
            <span className="text-4xl block mb-2">🏆</span>
            <h3 className="font-bold text-slate-800 text-lg">Nova Temporada</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Defina seu próximo grande objetivo</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Título da Season</label>
              <input value={newSName} onChange={e => setNewSName(e.target.value)} placeholder="Ex: Foco Total..." className="w-full bg-white text-black border-2 border-slate-100 p-3 rounded-2xl focus:outline-none focus:border-blue-400 font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Meta XP</label>
                <input type="number" value={newSTarget} onChange={e => setNewSTarget(parseInt(e.target.value) || 0)} className="w-full bg-white text-black border-2 border-slate-100 p-3 rounded-2xl font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Data de Fim</label>
                <input type="date" value={newSEndDate} onChange={e => setNewSEndDate(e.target.value)} className="w-full bg-white text-black border-2 border-slate-100 p-3 rounded-2xl font-bold" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Recompensa (Prêmio)</label>
              <input value={newSReward} onChange={e => setNewSReward(e.target.value)} placeholder="O que você ganhará?" className="w-full bg-white text-black border-2 border-slate-100 p-3 rounded-2xl font-medium" />
            </div>
            <button onClick={() => onCreateSeason({id: Math.random().toString(36).substr(2, 9), title: newSName, startDate: new Date().toISOString(), endDate: newSEndDate, targetPoints: newSTarget, currentPoints: 0, reward: newSReward, isActive: true, seasonNumber: 0})} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-transform">Iniciar Temporada</button>
          </div>
        </section>
      ) : (
        <section className={`rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br ${isGoalReached ? 'from-emerald-600 to-green-700' : 'from-indigo-600 to-blue-700'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black uppercase opacity-70 tracking-widest mb-1">Temporada #{season.seasonNumber}</p>
              <h3 className="text-2xl font-bold truncate">{season.title}</h3>
            </div>
            {isGoalReached && (
              <button onClick={onEndSeason} className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase backdrop-blur-sm">Concluir</button>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase">
              <span>{season.currentPoints} pts</span>
              <span className="opacity-60">Meta: {season.targetPoints}</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-4 p-1 overflow-hidden shadow-inner">
              <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isGoalReached ? 'bg-white' : 'bg-yellow-400'}`} style={{ width: `${getSeasonProgress()}%` }} />
            </div>
          </div>
        </section>
      )}

      {/* 2. ALERTA DE SALDO NEGATIVO (Banner abaixo do card de season) */}
      {isNegative && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center gap-3 animate-pulse shadow-sm">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none mb-1">Dívida de Moedas!</p>
                <p className="text-[11px] text-red-500 font-bold leading-tight">Você está com {stats.totalCoins} 🪙. Complete missões para sair do vermelho!</p>
            </div>
        </div>
      )}

      {/* 3. MISSÕES DE ROTINA (Sempre Visível) */}
      <section className="pt-2">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 flex items-center gap-2">
          <span className="text-lg">📅</span> Rotina de Hoje
        </h2>
        <div className="space-y-3">
          {routineTasks.length === 0 ? (
            <div className="bg-white/50 p-6 rounded-3xl border border-dashed border-blue-100 text-center">
               <p className="text-xs text-slate-400 font-medium italic">Nenhuma missão de rotina para hoje.</p>
            </div>
          ) : routineTasks.map(task => (
            <div key={task.id} className={`bg-white p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all ${task.completed ? 'opacity-50 grayscale' : 'border-blue-50'}`}>
              <div className="flex-1">
                <span className={`block font-bold text-slate-700 ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase">+{task.xp} XP</span>
                  <span className="text-[9px] bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded font-black uppercase">🪙 {task.coins}</span>
                </div>
              </div>
              {!task.completed && (
                <button onClick={() => onCompleteTask(task.id)} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold active:bg-blue-600 active:text-white">✓</button>
              )}
              {task.completed && <span className="text-green-500 font-bold px-3">OK</span>}
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÕES OCULTAS (COLLAPSIBLES) */}
      <div className="space-y-2 pb-10">
        
        {/* 4. MISSÕES PONTUAIS */}
        <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
          <button onClick={() => setIsOneTimeOpen(!isOneTimeOpen)} className="w-full p-4 flex justify-between items-center bg-purple-50/20 active:bg-purple-50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="font-bold text-purple-800 text-sm">Missões Pontuais</span>
              {oneTimeTasks.length > 0 && <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{oneTimeTasks.length}</span>}
            </div>
            <span className={`text-purple-300 transform transition-transform ${isOneTimeOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {isOneTimeOpen && (
            <div className="p-4 space-y-3 border-t border-purple-100 bg-purple-50/10">
              {oneTimeTasks.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-2 font-medium">Nenhuma missão pontual pendente.</p>
              ) : (
                oneTimeTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-50 shadow-sm">
                    <div>
                      <span className="block text-xs font-bold text-slate-700">{task.title}</span>
                      <span className="text-[9px] font-black text-purple-600 uppercase">+{task.xp} XP | {task.coins} 🪙</span>
                    </div>
                    <button onClick={() => onCompleteTask(task.id)} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95">Concluir</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 5. RECOMPENSAS / LOJA */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
          <button onClick={() => setIsRewardsOpen(!isRewardsOpen)} className="w-full p-4 flex justify-between items-center bg-emerald-50/20 active:bg-emerald-50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <span className="font-bold text-emerald-800 text-sm">Resgates Disponíveis</span>
              {affordableRewards.length > 0 && <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{affordableRewards.length}</span>}
            </div>
            <span className={`text-emerald-300 transform transition-transform ${isRewardsOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {isRewardsOpen && (
            <div className="p-4 space-y-3 border-t border-emerald-100 bg-emerald-50/10">
              {affordableRewards.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-2 font-medium">Você ainda não tem moedas suficientes para resgates.</p>
              ) : (
                affordableRewards.map(reward => (
                  <div key={reward.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-50 shadow-sm">
                    <div>
                      <span className="block text-xs font-bold text-slate-700">{reward.title}</span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase">Custo: {reward.cost} 🪙</span>
                    </div>
                    <button onClick={() => onPurchaseReward(reward.id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95">Resgatar</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 6. FALHAS / PUNIÇÕES */}
        <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-sm">
          <button onClick={() => setIsPunishmentsOpen(!isPunishmentsOpen)} className="w-full p-4 flex justify-between items-center bg-orange-50/20 active:bg-orange-50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚖️</span>
              <span className="font-bold text-orange-800 text-sm">Registrar Falhas</span>
            </div>
            <span className={`text-orange-300 transform transition-transform ${isPunishmentsOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {isPunishmentsOpen && (
            <div className="p-4 space-y-3 border-t border-orange-100 bg-orange-50/10">
              {punishments.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-2 font-medium">Cadastre falhas na aba "Punir".</p>
              ) : (
                punishments.map(p => {
                  const isAppliedToday = p.lastAppliedDate === todayStr;
                  return (
                    <div key={p.id} className={`flex items-center justify-between p-3 bg-white rounded-xl border border-orange-100 shadow-sm transition-all ${isAppliedToday ? 'opacity-50 grayscale' : ''}`}>
                      <div className="flex-1 min-w-0 pr-2">
                        <span className={`block text-xs font-bold text-slate-700 ${isAppliedToday ? 'line-through' : ''} truncate`}>{p.title}</span>
                        <span className="text-[10px] font-black text-orange-600 uppercase">Multa: -{p.cost} 🪙</span>
                      </div>
                      {isAppliedToday ? (
                        <span className="text-orange-600 font-bold px-3 text-[10px]">OK</span>
                      ) : (
                        <button onClick={() => onApplyPunishment(p.id)} className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:scale-95">Registrar</button>
                      )}
                    </div>
                  );
                })
              )}
              <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-tight">Cada falha só pode ser registrada uma vez por dia.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
