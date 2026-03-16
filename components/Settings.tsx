
import React from 'react';
import { AppData } from '../types';

interface SettingsProps {
  data: AppData;
  onImport: (data: AppData) => void;
  onUpdateTime: (time: string) => void;
  onReset: () => void;
}

const Settings: React.FC<SettingsProps> = ({ data, onImport, onUpdateTime, onReset }) => {
  const exportBackup = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gami_routine_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.stats && importedData.tasks) {
          onImport(importedData);
          alert('Backup importado com sucesso!');
        } else {
          throw new Error('Formato inválido');
        }
      } catch (err) {
        alert('Erro ao importar backup. Verifique o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 pb-32">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Configurações</h2>

      <div className="space-y-6">
        <section className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span>⏰</span> Lembrete de Revisão
          </h3>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">
            Horário para receber um alerta geral e revisar as tarefas do dia:
          </p>
          <input 
            type="time" 
            className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-600 font-bold text-xl"
            value={data.dailyReviewTime}
            onChange={(e) => onUpdateTime(e.target.value)}
          />
        </section>

        <section className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span>💾</span> Dados e Backup
          </h3>
          <div className="space-y-3">
            <button onClick={exportBackup} className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold text-sm uppercase tracking-wide border border-blue-100 flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
              <span>📤</span> Exportar Backup
            </button>
            <div className="relative">
              <input type="file" accept=".json" onChange={importBackup} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <button className="w-full py-4 bg-green-50 text-green-600 rounded-2xl font-bold text-sm uppercase tracking-wide border border-green-100 flex items-center justify-center gap-2 pointer-events-none">
                <span>📥</span> Importar Backup
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl border border-red-50 shadow-sm">
          <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2">
            <span>⚠️</span> Zona de Perigo
          </h3>
          <p className="text-xs text-slate-400 mb-4">Atenção: Esta ação é irreversível e apagará todo o seu progresso.</p>
          <button 
            onClick={onReset}
            className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm uppercase tracking-wide border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <span>🗑️</span> Resetar Aplicação
          </button>
        </section>

        <section className="p-4 bg-blue-600 rounded-3xl text-white">
            <h4 className="font-bold mb-2">Instruções Mobile</h4>
            <ol className="text-xs space-y-2 opacity-90 list-decimal pl-4">
                <li>Abra no Safari (iOS) ou Chrome (Android).</li>
                <li>Toque em "Adicionar à Tela de Início".</li>
                <li>Ele funcionará offline como um app nativo.</li>
            </ol>
        </section>
      </div>
    </div>
  );
};

export default Settings;
