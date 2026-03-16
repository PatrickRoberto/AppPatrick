
import React, { useState } from 'react';
import { Task } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  onReactivateTask: (id: string) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onUpdateTasks, onReactivateTask }) => {
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newXp, setNewXp] = useState(50);
  const [newCoins, setNewCoins] = useState(10);
  const [taskType, setTaskType] = useState<'recurring' | 'one-time'>('recurring');
  const [recurringType, setRecurringType] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [monthlyWeek, setMonthlyWeek] = useState(1);
  const [monthlyDay, setMonthlyDay] = useState(1);

  const daysOfWeek = [
    { id: 0, label: 'D' }, { id: 1, label: 'S' }, { id: 2, label: 'T' }, 
    { id: 3, label: 'Q' }, { id: 4, label: 'Q' }, { id: 5, label: 'S' }, { id: 6, label: 'S' }
  ];

  const weeksOfMonth = [
    { id: 1, label: '1ª' }, { id: 2, label: '2ª' }, { id: 3, label: '3ª' }, { id: 4, label: '4ª' }, { id: 5, label: 'Última' }
  ];

  const resetForm = () => {
    setNewTitle('');
    setNewXp(50);
    setNewCoins(10);
    setTaskType('recurring');
    setRecurringType('weekly');
    setSelectedDays([1, 2, 3, 4, 5]);
    setMonthlyWeek(1);
    setMonthlyDay(1);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setNewTitle(task.title);
    setNewXp(task.xp);
    setNewCoins(task.coins);
    setTaskType(task.type);
    setRecurringType(task.recurringType || 'weekly');
    setSelectedDays(task.recurringDays);
    if (task.monthlyPattern) {
        setMonthlyWeek(task.monthlyPattern.week);
        setMonthlyDay(task.monthlyPattern.day);
    }
    setShowForm(true);
  };

  const saveTask = () => {
    if (!newTitle.trim()) return;
    
    const taskData: Task = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      title: newTitle,
      xp: newXp,
      coins: newCoins,
      completed: false,
      type: taskType,
      recurringType: taskType === 'recurring' ? recurringType : undefined,
      recurringDays: taskType === 'recurring' && recurringType === 'weekly' ? selectedDays : [],
      monthlyPattern: taskType === 'recurring' && recurringType === 'monthly' ? { week: monthlyWeek, day: monthlyDay } : undefined,
      completionCount: 0
    };

    if (editingId) {
        onUpdateTasks(tasks.map(t => t.id === editingId ? { ...taskData, completed: t.completed, lastCompletedDate: t.lastCompletedDate, completionCount: t.completionCount } : t));
    } else {
        onUpdateTasks([taskData, ...tasks]);
    }
    resetForm();
  };

  const activeTasks = tasks.filter(t => !t.completed || t.type === 'recurring');
  const completedOneTime = tasks.filter(t => t.type === 'one-time' && t.completed);

  return (
    <div className="p-6 pb-32">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciar Missões</h2>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl shadow-lg active:scale-95 transition-transform">+</button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-3xl border border-blue-100 shadow-2xl space-y-5 animate-in slide-in-from-top duration-300">
          <h3 className="font-bold text-black uppercase text-xs tracking-widest">{editingId ? 'Editar Missão' : 'Nova Missão'}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome da Missão</label>
              <input 
                type="text" 
                className="w-full bg-white text-black border-2 border-slate-100 p-3 rounded-2xl focus:outline-none focus:border-blue-400 font-medium"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
                <button onClick={() => setTaskType('recurring')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl border-2 transition-all ${taskType === 'recurring' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>Rotina</button>
                <button onClick={() => setTaskType('one-time')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl border-2 transition-all ${taskType === 'one-time' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>Pontual</button>
            </div>

            {taskType === 'recurring' && (
              <div className="space-y-4 pt-2 border-t border-slate-50">
                <div className="flex bg-slate-50 p-1 rounded-xl">
                    <button onClick={() => setRecurringType('weekly')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-colors ${recurringType === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Semanal</button>
                    <button onClick={() => setRecurringType('monthly')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-colors ${recurringType === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Mensal</button>
                </div>

                {recurringType === 'weekly' ? (
                  <div className="flex justify-between px-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDays(prev => prev.includes(day.id) ? prev.filter(d => d !== day.id) : [...prev, day.id])}
                        className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all ${selectedDays.includes(day.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-2 border-slate-100 text-slate-400'}`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between gap-1">
                      {weeksOfMonth.map(w => (
                        <button key={w.id} onClick={() => setMonthlyWeek(w.id)} className={`flex-1 py-2 rounded-xl text-[9px] font-bold border-2 transition-colors ${monthlyWeek === w.id ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-50 text-slate-400'}`}>{w.label}</button>
                      ))}
                    </div>
                    <div className="flex justify-between gap-1">
                      {daysOfWeek.map(d => (
                        <button key={d.id} onClick={() => setMonthlyDay(d.id)} className={`w-8 h-8 rounded-xl text-[10px] font-bold border-2 transition-colors ${monthlyDay === d.id ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-50 text-slate-400'}`}>{d.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Pts Season</label>
                <input type="number" className="w-full bg-white text-black border-2 border-slate-100 p-3 rounded-2xl font-bold" value={newXp} onChange={e => setNewXp(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Moedas 🪙</label>
                <input type="number" className="w-full bg-white text-black border-2 border-slate-100 p-3 rounded-2xl font-bold text-green-600" value={newCoins} onChange={e => setNewCoins(parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button onClick={resetForm} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase">Cancelar</button>
              <button onClick={saveTask} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95">Salvar</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {activeTasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <span className="block font-bold text-slate-700 truncate">{task.title}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${task.type === 'one-time' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {task.recurringType === 'monthly' ? 'Mensal' : task.type === 'one-time' ? 'Pontual' : 'Rotina'}
                </span>
                <span className="text-[9px] text-slate-400 font-bold">{task.xp} pts | {task.coins} 🪙</span>
              </div>
            </div>
            <div className="flex gap-1">
                <button onClick={() => handleEdit(task)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors">✏️</button>
                <button onClick={() => onUpdateTasks(tasks.filter(t => t.id !== task.id))} className="p-2 text-red-200 hover:text-red-500 rounded-lg transition-colors">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {completedOneTime.length > 0 && (
        <div className="mt-8">
            <button 
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-full py-2 flex items-center justify-between text-slate-400"
            >
                <span className="text-[10px] font-black uppercase tracking-widest">Missões Pontuais Concluídas ({completedOneTime.length})</span>
                <span className={`transform transition-transform ${showCompleted ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showCompleted && (
                <div className="mt-3 space-y-2">
                    {completedOneTime.map(task => (
                        <div key={task.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between opacity-60">
                            <div className="flex-1 truncate pr-4">
                                <span className="block font-bold text-slate-500 line-through truncate">{task.title}</span>
                                <span className="text-[8px] text-slate-400">Concluída em {task.lastCompletedDate?.split('-').reverse().join('/')}</span>
                            </div>
                            <button 
                                onClick={() => onReactivateTask(task.id)}
                                className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase active:scale-95"
                            >
                                Reativar
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TaskManager;
