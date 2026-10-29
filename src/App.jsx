import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, CheckCircle2, Clock, AlertCircle, Plus, Filter, 
  Users, Video, Share2, Trash2, Edit3, Check, Flame,
  ExternalLink, Play, Film, HeartHandshake, X, Link as LinkIcon,
  Search, Target, Trophy, FolderDown, Download, Upload
} from 'lucide-react';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Funções seguras de persistência direta
const getSavedData = (key, fallback) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Erro ao ler localStorage', e);
    return fallback;
  }
};

const setSavedData = (key, data) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao gravar localStorage', e);
  }
};

const INITIAL_DEMANDS = [
  {
    id: 'd-1',
    title: 'Edição de Reels: Melhores momentos Sofia 15 anos',
    assignee: 'Lucas Editor',
    channel: 'Reels',
    day: 'Segunda-feira',
    status: 'done',
    priority: 'alta'
  },
  {
    id: 'd-2',
    title: 'Post carrossel: Dicas de cardápio e decoração neon',
    assignee: 'Mariana Social',
    channel: 'Feed / Carrossel',
    day: 'Terça-feira',
    status: 'in-progress',
    priority: 'media'
  }
];

const INITIAL_INSTA_REELS = [
  {
    id: 'reel-1',
    title: 'Teaser Neon Debutante 15 Anos',
    publishDate: '2026-10-20',
    author: 'Mariana Social',
    url: 'https://instagram.com/reel/exemplo1',
    monthKey: '2026-10'
  }
];

const INITIAL_VIDEO_LEADS = [
  {
    id: 'vl-1',
    birthdayPerson: 'Isabela Martins (15 Anos)',
    eventDate: '2026-10-24',
    contactsSent: 48,
    status: 'disparado',
    leadVideo: {
      url: 'https://instagram.com/reel/exemplo-isabela',
      name: 'Reels Isabela 15 Anos'
    },
    tributeVideo: {
      url: 'https://drive.google.com',
      name: 'Homenagem Pais e Amigos HD'
    },
    notes: 'Enviado para a lista de convidados.'
  }
];

const CHANNELS = ['Reels', 'TikTok', 'Stories', 'Feed / Carrossel', 'Tráfego Pago', 'YouTube'];
const DAYS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function App() {
  const [activeTab, setActiveTab] = useState('demandas');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey);

  // Estados com leitura segura
  const [monthlyGoals, setMonthlyGoals] = useState(() => 
    getSavedData('@mvp_goals', { [getCurrentMonthKey()]: 12 })
  );

  const [demands, setDemands] = useState(() => 
    getSavedData('@mvp_demands', INITIAL_DEMANDS)
  );

  const [instaReels, setInstaReels] = useState(() => 
    getSavedData('@mvp_reels', INITIAL_INSTA_REELS)
  );

  const [videoLeads, setVideoLeads] = useState(() => 
    getSavedData('@mvp_festas', INITIAL_VIDEO_LEADS)
  );

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempGoalInput, setTempGoalInput] = useState('');

  const [selectedAssignee, setSelectedAssignee] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [leadStatusFilter, setLeadStatusFilter] = useState('Todos');
  const [leadSearch, setLeadSearch] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);

  const [newReel, setNewReel] = useState({
    title: '',
    publishDate: new Date().toISOString().split('T')[0],
    author: '',
    url: ''
  });

  const [driveModal, setDriveModal] = useState({
    isOpen: false,
    partyId: null,
    partyName: '',
    videoType: '',
    videoTitle: '',
    url: '',
    name: ''
  });

  const [newDemand, setNewDemand] = useState({
    title: '',
    assignee: '',
    channel: 'Reels',
    day: 'Segunda-feira',
    priority: 'alta',
    status: 'todo'
  });

  const [newLead, setNewLead] = useState({
    birthdayPerson: '',
    eventDate: '',
    contactsSent: '',
    status: 'pendente',
    notes: '',
    leadVideoName: '',
    leadVideoUrl: '',
    tributeVideoName: '',
    tributeVideoUrl: ''
  });

  // Lista dinâmica de responsáveis
  const dynamicAssignees = useMemo(() => {
    const fromDemands = demands.map(d => d.assignee?.trim()).filter(Boolean);
    const fromReels = instaReels.map(r => r.author?.trim()).filter(Boolean);
    return Array.from(new Set([...fromDemands, ...fromReels])).sort();
  }, [demands, instaReels]);

  // Filtra Reels do mês
  const currentMonthReels = useMemo(() => {
    return instaReels.filter(reel => {
      const itemMonth = reel.monthKey || reel.publishDate?.slice(0, 7);
      return itemMonth === selectedMonth;
    });
  }, [instaReels, selectedMonth]);

  // Métricas
  const metrics = useMemo(() => {
    const totalDemands = demands.length;
    const completedDemands = demands.filter(d => d.status === 'done').length;
    const completionRate = totalDemands > 0 ? Math.round((completedDemands / totalDemands) * 100) : 0;

    const totalLeadsSent = videoLeads.reduce((acc, curr) => acc + (Number(curr.contactsSent) || 0), 0);
    const totalEvents = videoLeads.length;
    const eventsDispatched = videoLeads.filter(v => v.status === 'disparado' || v.status === 'respondendo').length;

    const reelsGoalTarget = Number(monthlyGoals[selectedMonth]) || 12;
    const totalReelsPosted = currentMonthReels.length;
    const reelsProgressPercent = Math.min(Math.round((totalReelsPosted / reelsGoalTarget) * 100), 100);
    const reelsRemaining = Math.max(reelsGoalTarget - totalReelsPosted, 0);
    const isGoalCompleted = totalReelsPosted >= reelsGoalTarget;

    return {
      totalDemands,
      completedDemands,
      completionRate,
      totalLeadsSent,
      totalEvents,
      eventsDispatched,
      totalReelsPosted,
      reelsGoalTarget,
      reelsProgressPercent,
      reelsRemaining,
      isGoalCompleted
    };
  }, [demands, videoLeads, currentMonthReels, monthlyGoals, selectedMonth]);

  // AÇÕES COM GRAVAÇÃO INSTANTÂNEA E FORÇADA NO DISCO
  const handleToggleDemandStatus = (id) => {
    setDemands(prev => {
      const updated = prev.map(d => {
        if (d.id === id) {
          const next = d.status === 'done' ? 'todo' : d.status === 'todo' ? 'in-progress' : 'done';
          return { ...d, status: next };
        }
        return d;
      });
      setSavedData('@mvp_demands', updated);
      return updated;
    });
  };

  const handleDeleteDemand = (id) => {
    setDemands(prev => {
      const updated = prev.filter(d => d.id !== id);
      setSavedData('@mvp_demands', updated);
      return updated;
    });
  };

  const handleCreateDemand = (e) => {
    e.preventDefault();
    if (!newDemand.title.trim()) return;
    const item = { 
      ...newDemand, 
      id: 'd-' + Date.now(),
      assignee: newDemand.assignee.trim() || 'Não atribuído'
    };
    setDemands(prev => {
      const updated = [item, ...prev];
      setSavedData('@mvp_demands', updated);
      return updated;
    });
    setIsDemandModalOpen(false);
    setNewDemand({
      title: '',
      assignee: '',
      channel: 'Reels',
      day: 'Segunda-feira',
      priority: 'alta',
      status: 'todo'
    });
  };

  const handleCreateReel = (e) => {
    e.preventDefault();
    if (!newReel.title.trim()) return;
    
    const dateValue = newReel.publishDate || new Date().toISOString().split('T')[0];
    const monthKey = dateValue.slice(0, 7);

    const item = { 
      ...newReel, 
      id: 'reel-' + Date.now(),
      publishDate: dateValue,
      monthKey: monthKey,
      author: newReel.author.trim() || 'Equipe'
    };

    setInstaReels(prev => {
      const updated = [item, ...prev];
      setSavedData('@mvp_reels', updated);
      return updated;
    });

    setIsReelModalOpen(false);
    setNewReel({
      title: '',
      publishDate: new Date().toISOString().split('T')[0],
      author: '',
      url: ''
    });
  };

  const handleDeleteReel = (id) => {
    setInstaReels(prev => {
      const updated = prev.filter(r => r.id !== id);
      setSavedData('@mvp_reels', updated);
      return updated;
    });
  };

  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!newLead.birthdayPerson.trim()) return;

    const item = {
      id: 'vl-' + Date.now(),
      birthdayPerson: newLead.birthdayPerson.trim(),
      eventDate: newLead.eventDate,
      contactsSent: Number(newLead.contactsSent) || 0,
      status: newLead.status,
      notes: newLead.notes.trim(),
      leadVideo: {
        url: newLead.leadVideoUrl.trim(),
        name: newLead.leadVideoName.trim() || (newLead.leadVideoUrl ? 'Vídeo Lead' : '')
      },
      tributeVideo: {
        url: newLead.tributeVideoUrl.trim(),
        name: newLead.tributeVideoName.trim() || (newLead.tributeVideoUrl ? 'Vídeo Homenagem' : '')
      }
    };

    setVideoLeads(prev => {
      const updated = [item, ...prev];
      setSavedData('@mvp_festas', updated);
      return updated;
    });
    setIsLeadModalOpen(false);
    
    setNewLead({
      birthdayPerson: '',
      eventDate: '',
      contactsSent: '',
      status: 'pendente',
      notes: '',
      leadVideoName: '',
      leadVideoUrl: '',
      tributeVideoName: '',
      tributeVideoUrl: ''
    });
  };

  const handleDeleteLead = (id) => {
    setVideoLeads(prev => {
      const updated = prev.filter(l => l.id !== id);
      setSavedData('@mvp_festas', updated);
      return updated;
    });
  };

  const handleUpdateLeadStatus = (id, newStatus) => {
    setVideoLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, status: newStatus } : l);
      setSavedData('@mvp_festas', updated);
      return updated;
    });
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    const targetVal = Math.max(1, Number(tempGoalInput) || 12);
    setMonthlyGoals(prev => {
      const updated = { ...prev, [selectedMonth]: targetVal };
      setSavedData('@mvp_goals', updated);
      return updated;
    });
    setIsEditingGoals(false);
  };

  // BACKUP E RESTAURAÇÃO PARA NUNCA PERDER DADOS
  const handleExportBackup = () => {
    const data = {
      monthlyGoals,
      demands,
      instaReels,
      videoLeads,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_midias_via_parque_${getCurrentMonthKey()}.json`;
    a.click();
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.demands) {
          setDemands(data.demands);
          setSavedData('@mvp_demands', data.demands);
        }
        if (data.instaReels) {
          setInstaReels(data.instaReels);
          setSavedData('@mvp_reels', data.instaReels);
        }
        if (data.videoLeads) {
          setVideoLeads(data.videoLeads);
          setSavedData('@mvp_festas', data.videoLeads);
        }
        if (data.monthlyGoals) {
          setMonthlyGoals(data.monthlyGoals);
          setSavedData('@mvp_goals', data.monthlyGoals);
        }
        alert('Dados restaurados com sucesso!');
      } catch (err) {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  const filteredDemands = demands.filter(d => {
    const matchAssignee = selectedAssignee === 'Todos' || d.assignee === selectedAssignee;
    const matchStatus = selectedStatus === 'Todos' || d.status === selectedStatus;
    return matchAssignee && matchStatus;
  });

  const filteredLeads = videoLeads.filter(l => {
    const matchStatus = leadStatusFilter === 'Todos' || l.status === leadStatusFilter;
    const matchSearch = l.birthdayPerson.toLowerCase().includes(leadSearch.toLowerCase()) || 
                        (l.notes && l.notes.toLowerCase().includes(leadSearch.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <datalist id="assignees-list">
        {dynamicAssignees.map(name => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg leading-tight text-white">Mídias Via Parque</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 font-semibold uppercase">
                  Reels & Vídeos
                </span>
              </div>
              <p className="text-xs text-slate-400">Demandas Semanais, Reels & Festas</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportBackup}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1"
              title="Baixar Backup dos Dados"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Backup</span>
            </button>

            <label className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 cursor-pointer" title="Restaurar Backup">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Restaurar</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Banner de Metas & Histórico */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Metas & Histórico Mensal</h2>
                <p className="text-xs text-slate-400">Virada automática no início de cada mês</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400 mr-2" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={() => {
                  setTempGoalInput(String(metrics.reelsGoalTarget));
                  setIsEditingGoals(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
              >
                <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                Ajustar Meta
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {/* Reels do Mês */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <InstagramIcon className="w-4 h-4 text-pink-400" /> Reels em {selectedMonth}
                  </span>
                  <button
                    onClick={() => setIsReelModalOpen(true)}
                    className="text-xs px-2 py-0.5 rounded-lg bg-pink-600/20 border border-pink-500/30 text-pink-300 font-semibold"
                  >
                    + Postou?
                  </button>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-white">{metrics.totalReelsPosted}</span>
                  <span className="text-xs text-slate-400">/ {metrics.reelsGoalTarget} meta</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-pink-500 transition-all duration-500"
                    style={{ width: `${metrics.reelsProgressPercent}%` }} 
                  />
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-2">
                {metrics.isGoalCompleted ? 'Meta atingida! 🎉' : `Faltam ${metrics.reelsRemaining} Reels`}
              </span>
            </div>

            {/* Contatos Alcançados */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-purple-400" /> Contatos Alcançados
                </span>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-white">{metrics.totalLeadsSent}</span>
                  <span className="text-xs text-slate-400 ml-1">pessoas impactadas</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-2">{metrics.eventsDispatched} festas disparadas</span>
            </div>

            {/* Demandas da Semana */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Demandas Semanais
                </span>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-white">{metrics.completedDemands}</span>
                  <span className="text-xs text-slate-400">/ {metrics.totalDemands} prontas</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${metrics.completionRate}%` }} 
                  />
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-2">{metrics.completionRate}% concluído</span>
            </div>
          </div>
        </section>

        {/* Abas */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div className="flex flex-wrap space-x-2 gap-y-2">
            <button
              onClick={() => setActiveTab('demandas')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'demandas' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Demandas da Semana ({demands.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('videoLeads')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'videoLeads' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Vídeo Lead & Homenagem ({videoLeads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reelsInsta')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'reelsInsta' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Reels Lançados ({currentMonthReels.length})</span>
            </button>
          </div>

          <div>
            {activeTab === 'demandas' && (
              <button
                onClick={() => setIsDemandModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Demanda</span>
              </button>
            )}

            {activeTab === 'videoLeads' && (
              <button
                onClick={() => setIsLeadModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Anexar Nova Festa</span>
              </button>
            )}

            {activeTab === 'reelsInsta' && (
              <button
                onClick={() => setIsReelModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl text-xs sm:text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Informar Reels Postado</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Demandas da Semana */}
        {activeTab === 'demandas' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filtrar por:
                </span>
                
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="Todos">Todos os Responsáveis</option>
                  {dynamicAssignees.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="todo">A Fazer</option>
                  <option value="in-progress">Em Andamento</option>
                  <option value="done">Concluído</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDemands.map((demand) => (
                <div key={demand.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {demand.day}
                      </span>
                      <button onClick={() => handleDeleteDemand(demand.id)} className="text-slate-500 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="mt-3 text-sm font-semibold text-white">{demand.title}</h4>
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {demand.assignee}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">
                        {demand.channel}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleDemandStatus(demand.id)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border ${
                        demand.status === 'done'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : demand.status === 'in-progress'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {demand.status === 'done' ? 'Concluído' : demand.status === 'in-progress' ? 'Em Produção' : 'A Fazer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Festas */}
        {activeTab === 'videoLeads' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredLeads.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                          {item.eventDate || 'Sem data'}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1.5">{item.birthdayPerson}</h3>
                      </div>
                      <button onClick={() => handleDeleteLead(item.id)} className="text-slate-500 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Contatos Alcançados</span>
                      <span className="text-lg font-extrabold text-indigo-400">{item.contactsSent}</span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {item.leadVideo?.url && (
                        <a href={item.leadVideo.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-pink-300 hover:bg-slate-800">
                          <span>Vídeo Lead</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {item.tributeVideo?.url && (
                        <a href={item.tributeVideo.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-purple-300 hover:bg-slate-800">
                          <span>Vídeo Homenagem</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Status:</span>
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateLeadStatus(item.id, e.target.value)}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-xl border bg-slate-800 border-slate-700 text-white"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="disparado">Disparado</option>
                      <option value="respondendo">Respondendo</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Reels do Mês */}
        {activeTab === 'reelsInsta' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMonthReels.map((reel) => (
                <div key={reel.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md">
                        {reel.publishDate}
                      </span>
                      <button onClick={() => handleDeleteReel(reel.id)} className="text-slate-500 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="mt-3 text-sm font-bold text-white">{reel.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">Por: {reel.author}</p>
                  </div>
                  {reel.url && (
                    <a href={reel.url} target="_blank" rel="noreferrer" className="mt-4 text-xs text-pink-400 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Ver Reels
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Demanda */}
      {isDemandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-white mb-4">Nova Demanda</h3>
            <form onSubmit={handleCreateDemand} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={newDemand.title}
                  onChange={(e) => setNewDemand({ ...newDemand, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Responsável (Digite livremente)</label>
                <input
                  type="text"
                  list="assignees-list"
                  placeholder="Nome do responsável..."
                  value={newDemand.assignee}
                  onChange={(e) => setNewDemand({ ...newDemand, assignee: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Formato</label>
                  <select
                    value={newDemand.channel}
                    onChange={(e) => setNewDemand({ ...newDemand, channel: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Dia</label>
                  <select
                    value={newDemand.day}
                    onChange={(e) => setNewDemand({ ...newDemand, day: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setIsDemandModalOpen(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reels */}
      {isReelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-slate-900 border border-pink-500/30 rounded-3xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-white mb-4">Informar Reels Postado</h3>
            <form onSubmit={handleCreateReel} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Título / Tema *</label>
                <input
                  type="text"
                  required
                  value={newReel.title}
                  onChange={(e) => setNewReel({ ...newReel, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={newReel.publishDate}
                    onChange={(e) => setNewReel({ ...newReel, publishDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Responsável</label>
                  <input
                    type="text"
                    list="assignees-list"
                    value={newReel.author}
                    onChange={(e) => setNewReel({ ...newReel, author: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Link do Reels (opcional)</label>
                <input
                  type="url"
                  value={newReel.url}
                  onChange={(e) => setNewReel({ ...newReel, url: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setIsReelModalOpen(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded-xl font-bold">Salvar Reels</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajustar Meta */}
      {isEditingGoals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-white mb-4">Meta para {selectedMonth}</h3>
            <form onSubmit={handleSaveGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Quantidade de Reels</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={tempGoalInput}
                  onChange={(e) => setTempGoalInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setIsEditingGoals(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Salvar Meta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Festa */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-white mb-4">Anexar Festa</h3>
            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Nome da Festa *</label>
                <input
                  type="text"
                  required
                  value={newLead.birthdayPerson}
                  onChange={(e) => setNewLead({ ...newLead, birthdayPerson: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Data</label>
                  <input
                    type="date"
                    value={newLead.eventDate}
                    onChange={(e) => setNewLead({ ...newLead, eventDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Contatos Enviados</label>
                  <input
                    type="number"
                    value={newLead.contactsSent}
                    onChange={(e) => setNewLead({ ...newLead, contactsSent: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Link do Vídeo Lead</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newLead.leadVideoUrl}
                  onChange={(e) => setNewLead({ ...newLead, leadVideoUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Link da Homenagem</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newLead.tributeVideoUrl}
                  onChange={(e) => setNewLead({ ...newLead, tributeVideoUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setIsLeadModalOpen(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold">Salvar Festa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
