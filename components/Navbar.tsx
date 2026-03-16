
import React from 'react';
import { View } from '../types';

interface NavbarProps {
  activeView: View;
  setView: (view: View) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setView }) => {
  const items = [
    { id: 'dashboard' as View, label: 'Início', icon: '🏠' },
    { id: 'tasks' as View, label: 'Missões', icon: '📝' },
    { id: 'shop' as View, label: 'Loja', icon: '🎁' },
    { id: 'punishments' as View, label: 'Punir', icon: '⚖️' },
    { id: 'history' as View, label: 'Histórico', icon: '📜' },
    { id: 'settings' as View, label: 'Ajustes', icon: '⚙️' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 flex justify-around items-center px-2 py-3 safe-bottom shadow-lg z-50">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            activeView === item.id ? 'text-blue-600 scale-110' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-[8px] font-bold uppercase tracking-wider">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
