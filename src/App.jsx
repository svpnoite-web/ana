import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Users,
  Video,
  Share2,
  Trash2,
  Edit3,
  Check,
  Flame,
  ExternalLink,
  Play,
  Film,
  HeartHandshake,
  X,
  Link as LinkIcon,
  Search,
  Target,
  Trophy,
  FolderDown,
} from "lucide-react";

const INITIAL_DEMANDS = [
  {
    id: "d-1",
    title: "Edição de Reels: Melhores momentos Sofia 15 anos",
    assignee: "Lucas Editor",
    channel: "Reels",
    day: "Segunda-feira",
    deadline: "2026-10-26",
    status: "done",
    priority: "alta",
  },
  {
    id: "d-2",
    title: "Post carrossel: Dicas de cardápio e decoração neon",
    assignee: "Mariana Social",
    channel: "Feed / Carrossel",
    day: "Terça-feira",
    deadline: "2026-10-27",
    status: "in-progress",
    priority: "media",
  },
  {
    id: "d-3",
    title: "Gravação de stories ao vivo no salão nobre",
    assignee: "Beatriz Stories",
    channel: "Stories",
    day: "Quarta-feira",
    deadline: "2026-10-28",
    status: "todo",
    priority: "alta",
  },
  {
    id: "d-4",
    title: "Campanha de Tráfego: Aniversário Teen & 15 Anos",
    assignee: "Rafael Tráfego",
    channel: "Tráfego Pago",
    day: "Quinta-feira",
    deadline: "2026-10-29",
    status: "todo",
    priority: "alta",
  },
  {
    id: "d-5",
    title: "Vídeo TikTok: Tendência bastidores da iluminação",
    assignee: "Mariana Social",
    channel: "TikTok",
    day: "Sexta-feira",
    deadline: "2026-10-30",
    status: "todo",
    priority: "baixa",
  },
];

const INITIAL_VIDEO_LEADS = [
  {
    id: "vl-1",
    birthdayPerson: "Isabela Martins (15 Anos)",
    eventDate: "2026-10-24",
    contactsSent: 48,
    dealsClosed: 3,
    status: "disparado",
    leadVideo: {
      type: "link",
      url: "https://instagram.com/reel/exemplo-isabela",
      name: "Reels Isabela 15 Anos",
    },
    tributeVideo: {
      type: "link",
      url: "https://drive.google.com/drive/folders/exemplo-homenagem-isabela",
      name: "Homenagem Pais e Amigos HD",
    },
    notes:
      "Enviado para a lista de convidados. 12 mães elogiaram o corte e 3 já fecharam visitas no salão!",
  },
  {
    id: "vl-2",
    birthdayPerson: "Lorenzo (1 Aninho Safari)",
    eventDate: "2026-10-25",
    contactsSent: 35,
    dealsClosed: 1,
    status: "respondendo",
    leadVideo: {
      type: "link",
      url: "https://vimeo.com/exemplo-lorenzo",
      name: "Teaser Safari Vídeo Lead",
    },
    tributeVideo: {
      type: "link",
      url: "https://drive.google.com/drive/folders/lorenzo-familia",
      name: "Vídeo Homenagem Retrospectiva",
    },
    notes:
      "Vídeo teaser com trilha emocional. Alta taxa de cliques e respostas no WhatsApp.",
  },
  {
    id: "vl-3",
    birthdayPerson: "Clara & Gabriel (Gêmeos 7 Anos)",
    eventDate: "2026-10-31",
    contactsSent: 60,
    dealsClosed: 0,
    status: "pendente",
    leadVideo: {
      type: "link",
      url: "",
      name: "",
    },
    tributeVideo: {
      type: "link",
      url: "",
      name: "",
    },
    notes:
      "Aguardando render da retrospectiva animada e finalização dos cortes no drone.",
  },
];

const CHANNELS = [
  "Reels",
  "TikTok",
  "Stories",
  "Feed / Carrossel",
  "Tráfego Pago",
  "YouTube",
];
const DAYS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
const TEAM_MEMBERS = [
  "Lucas Editor",
  "Mariana Social",
  "Beatriz Stories",
  "Rafael Tráfego",
  "Todos",
];

export default function App() {
  const [activeTab, setActiveTab] = useState("videoLeads");

  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem("@midias_metas_v1");
      return saved
        ? JSON.parse(saved)
        : {
            monthlyVideosTarget: 8,
            monthlyReachTarget: 250,
            weeklyTasksTarget: 10,
          };
    } catch {
      return {
        monthlyVideosTarget: 8,
        monthlyReachTarget: 250,
        weeklyTasksTarget: 10,
      };
    }
  });

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempGoals, setTempGoals] = useState(goals);

  const [demands, setDemands] = useState(() => {
    try {
      const saved = localStorage.getItem("@midias_demandas_v2");
      return saved ? JSON.parse(saved) : INITIAL_DEMANDS;
    } catch {
      return INITIAL_DEMANDS;
    }
  });

  const [videoLeads, setVideoLeads] = useState(() => {
    try {
      const saved = localStorage.getItem("@midias_video_leads_v2");
      return saved ? JSON.parse(saved) : INITIAL_VIDEO_LEADS;
    } catch {
      return INITIAL_VIDEO_LEADS;
    }
  });

  const [selectedAssignee, setSelectedAssignee] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [leadStatusFilter, setLeadStatusFilter] = useState("Todos");
  const [leadSearch, setLeadSearch] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const [driveModal, setDriveModal] = useState({
    isOpen: false,
    partyId: null,
    partyName: "",
    videoType: "",
    videoTitle: "",
    url: "",
    name: "",
  });

  const [playerModal, setPlayerModal] = useState({
    isOpen: false,
    title: "",
    type: "",
    videoData: null,
  });

  const [newDemand, setNewDemand] = useState({
    title: "",
    assignee: "Mariana Social",
    channel: "Reels",
    day: "Segunda-feira",
    deadline: "",
    priority: "alta",
    status: "todo",
  });

  const [newLead, setNewLead] = useState({
    birthdayPerson: "",
    eventDate: "",
    contactsSent: "",
    dealsClosed: "",
    status: "pendente",
    notes: "",
    leadVideoMode: "link",
    leadVideoUrl: "",
    leadVideoFile: null,
    leadVideoFileName: "",
    tributeVideoMode: "link",
    tributeVideoUrl: "",
    tributeVideoFile: null,
    tributeVideoFileName: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem("@midias_metas_v1", JSON.stringify(goals));
    } catch (e) {
      console.error(e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem("@midias_demandas_v2", JSON.stringify(demands));
    } catch (e) {
      console.error(e);
    }
  }, [demands]);

  useEffect(() => {
    try {
      const sanitized = videoLeads.map((l) => ({
        ...l,
        leadVideo: {
          type: l.leadVideo?.type || "link",
          url: l.leadVideo?.type === "file" ? "" : l.leadVideo?.url || "",
          name: l.leadVideo?.name || "",
        },
        tributeVideo: {
          type: l.tributeVideo?.type || "link",
          url: l.tributeVideo?.type === "file" ? "" : l.tributeVideo?.url || "",
          name: l.tributeVideo?.name || "",
        },
      }));
      localStorage.setItem("@midias_video_leads_v2", JSON.stringify(sanitized));
    } catch (e) {
      console.error(e);
    }
  }, [videoLeads]);

  const handleToggleDemandStatus = (id) => {
    setDemands((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextStatus =
            d.status === "done"
              ? "todo"
              : d.status === "todo"
                ? "in-progress"
                : "done";
          return { ...d, status: nextStatus };
        }
        return d;
      }),
    );
  };

  const handleDeleteDemand = (id) => {
    setDemands((prev) => prev.filter((d) => d.id !== id));
  };

  const handleCreateDemand = (e) => {
    e.preventDefault();
    if (!newDemand.title.trim()) return;
    const item = { ...newDemand, id: "d-" + Date.now() };
    setDemands((prev) => [item, ...prev]);
    setIsDemandModalOpen(false);
    setNewDemand({
      title: "",
      assignee: "Mariana Social",
      channel: "Reels",
      day: "Segunda-feira",
      deadline: "",
      priority: "alta",
      status: "todo",
    });
  };

  const handleLeadFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setNewLead((prev) => ({
        ...prev,
        leadVideoFile: objectUrl,
        leadVideoFileName: file.name,
      }));
    }
  };

  const handleTributeFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setNewLead((prev) => ({
        ...prev,
        tributeVideoFile: objectUrl,
        tributeVideoFileName: file.name,
      }));
    }
  };

  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!newLead.birthdayPerson.trim()) return;

    const leadVideoData = {
      type: newLead.leadVideoMode === "upload" ? "file" : "link",
      url:
        newLead.leadVideoMode === "upload"
          ? newLead.leadVideoFile
          : newLead.leadVideoUrl.trim(),
      name:
        newLead.leadVideoMode === "upload"
          ? newLead.leadVideoFileName || "Arquivo de Vídeo Lead"
          : newLead.leadVideoUrl
            ? "Link do Vídeo Lead"
            : "",
    };

    const tributeVideoData = {
      type: newLead.tributeVideoMode === "upload" ? "file" : "link",
      url:
        newLead.tributeVideoMode === "upload"
          ? newLead.tributeVideoFile
          : newLead.tributeVideoUrl.trim(),
      name:
        newLead.tributeVideoMode === "upload"
          ? newLead.tributeVideoFileName || "Arquivo Vídeo Homenagem"
          : newLead.tributeVideoUrl
            ? "Link da Homenagem"
            : "",
    };

    const item = {
      id: "vl-" + Date.now(),
      birthdayPerson: newLead.birthdayPerson,
      eventDate: newLead.eventDate,
      contactsSent: Number(newLead.contactsSent) || 0,
      dealsClosed: Number(newLead.dealsClosed) || 0,
      status: newLead.status,
      notes: newLead.notes,
      leadVideo: leadVideoData,
      tributeVideo: tributeVideoData,
    };

    setVideoLeads((prev) => [item, ...prev]);
    setIsLeadModalOpen(false);

    setNewLead({
      birthdayPerson: "",
      eventDate: "",
      contactsSent: "",
      dealsClosed: "",
      status: "pendente",
      notes: "",
      leadVideoMode: "link",
      leadVideoUrl: "",
      leadVideoFile: null,
      leadVideoFileName: "",
      tributeVideoMode: "link",
      tributeVideoUrl: "",
      tributeVideoFile: null,
      tributeVideoFileName: "",
    });
  };

  const handleDeleteLead = (id) => {
    setVideoLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpdateLeadStatus = (id, newStatus) => {
    setVideoLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)),
    );
  };

  const handleOpenDriveLinkModal = (item, videoKey, videoTitle) => {
    const currentVideo = item[videoKey] || {};
    setDriveModal({
      isOpen: true,
      partyId: item.id,
      partyName: item.birthdayPerson,
      videoType: videoKey,
      videoTitle: videoTitle,
      url: currentVideo.url || "",
      name: currentVideo.name || "",
    });
  };

  const handleSaveDriveLink = (e) => {
    e.preventDefault();
    if (!driveModal.partyId) return;

    setVideoLeads((prev) =>
      prev.map((item) => {
        if (item.id === driveModal.partyId) {
          return {
            ...item,
            [driveModal.videoType]: {
              type: "link",
              url: driveModal.url.trim(),
              name:
                driveModal.name.trim() ||
                (driveModal.url.includes("drive.google.com")
                  ? "Google Drive Link"
                  : "Link do Vídeo"),
            },
          };
        }
        return item;
      }),
    );

    setDriveModal({
      isOpen: false,
      partyId: null,
      partyName: "",
      videoType: "",
      videoTitle: "",
      url: "",
      name: "",
    });
  };

  const handleOpenMedia = (partyName, label, videoObj) => {
    if (!videoObj || (!videoObj.url && !videoObj.name)) return;

    if (videoObj.type === "file" && videoObj.url) {
      setPlayerModal({
        isOpen: true,
        title: `${partyName} — ${label}`,
        type: label,
        videoData: videoObj,
      });
    } else if (videoObj.type === "link" && videoObj.url) {
      window.open(videoObj.url, "_blank", "noopener,noreferrer");
    }
  };

  const isGoogleDriveLink = (url) => {
    return Boolean(
      url &&
      (url.includes("drive.google.com") || url.includes("docs.google.com")),
    );
  };

  const metrics = useMemo(() => {
    const totalDemands = demands.length;
    const completedDemands = demands.filter((d) => d.status === "done").length;
    const completionRate =
      totalDemands > 0
        ? Math.round((completedDemands / totalDemands) * 100)
        : 0;

    const totalLeadsSent = videoLeads.reduce(
      (acc, curr) => acc + (Number(curr.contactsSent) || 0),
      0,
    );
    const totalDeals = videoLeads.reduce(
      (acc, curr) => acc + (Number(curr.dealsClosed) || 0),
      0,
    );
    const totalEvents = videoLeads.length;
    const eventsDispatched = videoLeads.filter(
      (v) => v.status === "disparado" || v.status === "respondendo",
    ).length;
    const partiesWithVideos = videoLeads.filter(
      (v) =>
        (v.leadVideo?.url || v.leadVideo?.name) &&
        (v.tributeVideo?.url || v.tributeVideo?.name),
    ).length;

    const totalVideosDelivered = videoLeads.reduce((acc, curr) => {
      let count = 0;
      if (curr.leadVideo?.url || curr.leadVideo?.name) count += 1;
      if (curr.tributeVideo?.url || curr.tributeVideo?.name) count += 1;
      return acc + count;
    }, 0);

    const videoGoalTarget = Number(goals.monthlyVideosTarget) || 1;
    const videoProgressPercent = Math.min(
      Math.round((totalVideosDelivered / videoGoalTarget) * 100),
      100,
    );
    const videosRemaining = Math.max(videoGoalTarget - totalVideosDelivered, 0);
    const isGoalCompleted = totalVideosDelivered >= videoGoalTarget;

    const reachGoalTarget = Number(goals.monthlyReachTarget) || 1;
    const reachProgressPercent = Math.min(
      Math.round((totalLeadsSent / reachGoalTarget) * 100),
      100,
    );

    return {
      totalDemands,
      completedDemands,
      completionRate,
      totalLeadsSent,
      totalDeals,
      totalEvents,
      eventsDispatched,
      partiesWithVideos,
      totalVideosDelivered,
      videoGoalTarget,
      videoProgressPercent,
      videosRemaining,
      isGoalCompleted,
      reachGoalTarget,
      reachProgressPercent,
    };
  }, [demands, videoLeads, goals]);

  const handleSaveGoals = (e) => {
    e.preventDefault();
    setGoals({
      monthlyVideosTarget: Math.max(
        1,
        Number(tempGoals.monthlyVideosTarget) || 1,
      ),
      monthlyReachTarget: Math.max(
        1,
        Number(tempGoals.monthlyReachTarget) || 1,
      ),
      weeklyTasksTarget: Math.max(1, Number(tempGoals.weeklyTasksTarget) || 1),
    });
    setIsEditingGoals(false);
  };

  const filteredDemands = demands.filter((d) => {
    const matchAssignee =
      selectedAssignee === "Todos" || d.assignee === selectedAssignee;
    const matchStatus =
      selectedStatus === "Todos" || d.status === selectedStatus;
    return matchAssignee && matchStatus;
  });

  const filteredLeads = videoLeads.filter((l) => {
    const matchStatus =
      leadStatusFilter === "Todos" || l.status === leadStatusFilter;
    const matchSearch =
      l.birthdayPerson.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.notes && l.notes.toLowerCase().includes(leadSearch.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const copyWeeklySummaryToWhatsApp = () => {
    let text = `🚀 *RELATÓRIO SEMANAL: MÍDIAS & VÍDEO LEADS DE FESTAS*\n\n`;
    text += `🎯 *METAS DO MÊS:*\n`;
    text += `• Meta de Vídeos Produzidos: ${metrics.totalVideosDelivered}/${metrics.videoGoalTarget} (${metrics.videoProgressPercent}%) ${metrics.isGoalCompleted ? "🎉 META BATIDA!" : `(Faltam ${metrics.videosRemaining})`}\n`;
    text += `• Meta de Alcance: ${metrics.totalLeadsSent}/${metrics.reachGoalTarget} contatos impactados (${metrics.reachProgressPercent}%)\n\n`;
    text += `📊 *RESULTADOS GERAIS:*\n`;
    text += `• Demandas Concluídas: ${metrics.completedDemands}/${metrics.totalDemands} (${metrics.completionRate}%)\n`;
    text += `• Festas com Vídeos Mapeados: ${metrics.eventsDispatched} de ${metrics.totalEvents}\n`;
    text += `• Contatos Notificados / Disparados: ${metrics.totalLeadsSent} convidados\n`;
    text += `• Festas com Vídeo Lead + Homenagem: ${metrics.partiesWithVideos}\n`;
    if (metrics.totalDeals > 0) {
      text += `• Novos Fechamentos/Contratos originados: *${metrics.totalDeals}* 🎯\n`;
    }
    text += `\n🎬 *DETALHAMENTO POR FESTA & ANEXOS DE VÍDEO:*\n`;

    videoLeads.forEach((v) => {
      const hasLead =
        v.leadVideo?.url || v.leadVideo?.name ? "✅ Sim" : "❌ Pendente";
      const hasHomenagem =
        v.tributeVideo?.url || v.tributeVideo?.name ? "✅ Sim" : "❌ Pendente";
      text += `\n🎂 *${v.birthdayPerson}* (${v.eventDate || "Data a definir"})\n`;
      text += `   - Contatos alcançados: ${v.contactsSent} | Status: ${v.status.toUpperCase()}\n`;
      text += `   - Vídeo Lead: ${hasLead} ${v.leadVideo?.url ? "(" + v.leadVideo.url + ")" : ""}\n`;
      text += `   - Vídeo Homenagem: ${hasHomenagem} ${v.tributeVideo?.url ? "(" + v.tributeVideo.url + ")" : ""}\n`;
      if (v.notes) text += `   - Obs: ${v.notes}\n`;
    });

    text += `\n📋 *DEMANDAS EM ABERTO DA EQUIPE:*\n`;
    const openDemands = demands.filter((d) => d.status !== "done");
    if (openDemands.length === 0) {
      text += `_Nenhuma demanda pendente! Toda a grade da semana entregue._ ✨\n`;
    } else {
      openDemands.forEach((d) => {
        text += `• [${d.day.split("-")[0]}] ${d.title} (${d.assignee} - ${d.channel})\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  MídiaFlow & Eventos
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 font-semibold uppercase tracking-wider">
                  Vídeo Lead + Homenagem
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Demandas Semanais & Rastreamento Multimídia de Festas
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyWeeklySummaryToWhatsApp}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs sm:text-sm font-medium shadow-sm hover:shadow-emerald-950"
              title="Copiar relatório formatado de vídeos e demandas para o WhatsApp"
            >
              {copyFeedback ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">Relatório Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Exportar p/ WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* BANNER EDITÁVEL DE METAS DO MÊS */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Metas Estratégicas de Mídia
                  </h2>
                  {metrics.isGoalCompleted ? (
                    <span className="flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold animate-pulse">
                      <Trophy className="w-3 h-3 text-emerald-400" />
                      <span>Meta Batida! 🎉</span>
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-medium">
                      Faltam {metrics.videosRemaining} vídeos
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Acompanhe e ajuste as metas mensais de produção e alcance de
                  convidados
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setTempGoals(goals);
                setIsEditingGoals(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-indigo-400/50 text-xs font-semibold transition-all shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ajustar Metas</span>
            </button>
          </div>

          {/* Cards de Metas Dinâmicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {/* 1. Meta de Vídeos do Mês */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 relative group hover:border-pink-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-pink-400" /> Meta de Vídeos do
                  Mês
                </span>
                <button
                  onClick={() => {
                    setTempGoals(goals);
                    setIsEditingGoals(true);
                  }}
                  className="text-slate-500 hover:text-pink-400 transition-colors p-1"
                  title="Alterar meta de vídeos"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-white">
                    {metrics.totalVideosDelivered}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    / {metrics.videoGoalTarget} vídeos
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    metrics.isGoalCompleted
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                  }`}
                >
                  {metrics.videoProgressPercent}%
                </span>
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    metrics.isGoalCompleted
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : "bg-gradient-to-r from-pink-500 to-purple-500"
                  }`}
                  style={{ width: `${metrics.videoProgressPercent}%` }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>{metrics.partiesWithVideos} festas 100% completas</span>
                <span className="text-slate-300 font-medium">
                  {metrics.isGoalCompleted
                    ? "🎯 Objetivo superado!"
                    : `${metrics.videosRemaining} restantes`}
                </span>
              </div>
            </div>

            {/* 2. Meta de Alcance de Contatos */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 group hover:border-purple-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-purple-400" /> Meta de Contatos
                  Alcançados
                </span>
                <button
                  onClick={() => {
                    setTempGoals(goals);
                    setIsEditingGoals(true);
                  }}
                  className="text-slate-500 hover:text-purple-400 transition-colors p-1"
                  title="Alterar meta de contatos"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-white">
                    {metrics.totalLeadsSent}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    / {metrics.reachGoalTarget} pessoas
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {metrics.reachProgressPercent}%
                </span>
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${metrics.reachProgressPercent}%` }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>{metrics.eventsDispatched} festas disparadas</span>
                <span className="text-slate-300 font-medium">
                  {metrics.totalDeals > 0
                    ? `${metrics.totalDeals} contratos gerados`
                    : "WhatsApp ativo"}
                </span>
              </div>
            </div>

            {/* 3. Eficiência da Semana */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Entregas da
                  Semana
                </span>
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  Equipe
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-white">
                    {metrics.completedDemands}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    / {metrics.totalDemands} tarefas
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {metrics.completionRate}%
                </span>
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${metrics.completionRate}%` }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {demands.filter((d) => d.status === "in-progress").length} em
                  produção
                </span>
                <span className="text-slate-300 font-medium">
                  {demands.filter((d) => d.status === "todo").length} a iniciar
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Abas e Controles de Ação */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("videoLeads")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === "videoLeads"
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Vídeo Lead & Homenagem ({videoLeads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("demandas")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === "demandas"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Demandas da Semana ({demands.length})</span>
            </button>
          </div>

          <div>
            {activeTab === "videoLeads" ? (
              <button
                onClick={() => setIsLeadModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-pink-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Anexar Nova Festa</span>
              </button>
            ) : (
              <button
                onClick={() => setIsDemandModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Demanda</span>
              </button>
            )}
          </div>
        </div>

        {/* ABA: VÍDEO LEAD & VÍDEO HOMENAGEM DE FESTAS */}
        {activeTab === "videoLeads" && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 focus-within:border-indigo-500">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar aniversariante, observação ou tema..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-slate-400 w-full focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Filtrar status:</span>
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="pendente">Pendente de Disparo</option>
                  <option value="disparado">Disparado</option>
                  <option value="respondendo">Respondendo Leads</option>
                </select>
              </div>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">
                  Nenhum registro de festa encontrado.
                </p>
                <button
                  onClick={() => setIsLeadModalOpen(true)}
                  className="mt-3 text-xs text-pink-400 hover:text-pink-300 font-semibold"
                >
                  + Anexar primeiro vídeo de festa
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredLeads.map((item) => {
                  const hasLeadVideo =
                    item.leadVideo?.url || item.leadVideo?.name;
                  const hasTributeVideo =
                    item.tributeVideo?.url || item.tributeVideo?.name;

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] font-mono text-purple-400 font-medium bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                              {item.eventDate
                                ? `Data: ${item.eventDate}`
                                : "Data não informada"}
                            </span>
                            <h3 className="text-lg font-bold text-white mt-1.5">
                              {item.birthdayPerson}
                            </h3>
                          </div>

                          <button
                            onClick={() => handleDeleteLead(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Remover Registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              Contatos Enviados
                            </span>
                            <span className="text-base font-bold text-indigo-400">
                              {item.contactsSent}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              Leads Fechados
                            </span>
                            <span className="text-base font-bold text-emerald-400">
                              {item.dealsClosed || 0}
                            </span>
                          </div>
                        </div>

                        {/* Mídias Anexadas da Festa */}
                        <div className="mt-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                              Mídias Anexadas da Festa:
                            </h4>
                            <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                              <LinkIcon className="w-2.5 h-2.5" /> Suporta
                              Google Drive
                            </span>
                          </div>

                          {/* 1. Vídeo Lead */}
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              hasLeadVideo
                                ? "bg-slate-950/80 border-slate-800"
                                : "bg-slate-950/40 border-dashed border-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-2.5 overflow-hidden pr-2">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    isGoogleDriveLink(item.leadVideo?.url)
                                      ? "bg-amber-500/20 border border-amber-500/30"
                                      : "bg-pink-500/20 border border-pink-500/30"
                                  }`}
                                >
                                  {isGoogleDriveLink(item.leadVideo?.url) ? (
                                    <FolderDown className="w-4 h-4 text-amber-400" />
                                  ) : (
                                    <Video className="w-4 h-4 text-pink-400" />
                                  )}
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-xs font-semibold text-slate-200 truncate">
                                    {item.leadVideo?.name ||
                                      "Vídeo Lead da Festa"}
                                  </p>
                                  <div className="text-[10px] flex items-center gap-1.5 mt-0.5">
                                    {hasLeadVideo ? (
                                      <>
                                        <span className="text-emerald-400 flex items-center gap-0.5">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                          {isGoogleDriveLink(
                                            item.leadVideo?.url,
                                          )
                                            ? "Google Drive"
                                            : item.leadVideo?.type === "file"
                                              ? "Arquivo Anexado"
                                              : "Link Web"}
                                        </span>
                                        {item.leadVideo?.url && (
                                          <span className="text-slate-500 font-mono text-[9px] truncate max-w-[150px]">
                                            {item.leadVideo.url}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-slate-500">
                                        Nenhum vídeo lead vinculado
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                {hasLeadVideo && (
                                  <button
                                    onClick={() =>
                                      handleOpenMedia(
                                        item.birthdayPerson,
                                        "Vídeo Lead",
                                        item.leadVideo,
                                      )
                                    }
                                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                      isGoogleDriveLink(item.leadVideo?.url)
                                        ? "bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300"
                                        : "bg-pink-600/20 hover:bg-pink-600/30 border-pink-500/40 text-pink-300"
                                    }`}
                                    title="Abrir Vídeo Lead"
                                  >
                                    {item.leadVideo?.type === "file" ? (
                                      <>
                                        <Play className="w-3 h-3 fill-current" />
                                        <span>Assistir</span>
                                      </>
                                    ) : (
                                      <>
                                        <ExternalLink className="w-3 h-3" />
                                        <span>
                                          {isGoogleDriveLink(
                                            item.leadVideo?.url,
                                          )
                                            ? "Abrir Drive"
                                            : "Abrir"}
                                        </span>
                                      </>
                                    )}
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    handleOpenDriveLinkModal(
                                      item,
                                      "leadVideo",
                                      "Vídeo Lead",
                                    )
                                  }
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs"
                                  title={
                                    hasLeadVideo
                                      ? "Editar ou colar link do Google Drive"
                                      : "Anexar link do Drive"
                                  }
                                >
                                  <LinkIcon className="w-3.5 h-3.5 text-pink-400" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* 2. Vídeo Homenagem */}
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              hasTributeVideo
                                ? "bg-slate-950/80 border-slate-800"
                                : "bg-slate-950/40 border-dashed border-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-2.5 overflow-hidden pr-2">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    isGoogleDriveLink(item.tributeVideo?.url)
                                      ? "bg-amber-500/20 border border-amber-500/30"
                                      : "bg-purple-500/20 border border-purple-500/30"
                                  }`}
                                >
                                  {isGoogleDriveLink(item.tributeVideo?.url) ? (
                                    <FolderDown className="w-4 h-4 text-amber-400" />
                                  ) : (
                                    <HeartHandshake className="w-4 h-4 text-purple-400" />
                                  )}
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-xs font-semibold text-slate-200 truncate">
                                    {item.tributeVideo?.name ||
                                      "Vídeo Homenagem / Retrospectiva"}
                                  </p>
                                  <div className="text-[10px] flex items-center gap-1.5 mt-0.5">
                                    {hasTributeVideo ? (
                                      <>
                                        <span className="text-emerald-400 flex items-center gap-0.5">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                          {isGoogleDriveLink(
                                            item.tributeVideo?.url,
                                          )
                                            ? "Google Drive"
                                            : item.tributeVideo?.type === "file"
                                              ? "Arquivo Anexado"
                                              : "Link Web"}
                                        </span>
                                        {item.tributeVideo?.url && (
                                          <span className="text-slate-500 font-mono text-[9px] truncate max-w-[150px]">
                                            {item.tributeVideo.url}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-slate-500">
                                        Nenhum vídeo homenagem vinculado
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                {hasTributeVideo && (
                                  <button
                                    onClick={() =>
                                      handleOpenMedia(
                                        item.birthdayPerson,
                                        "Vídeo Homenagem",
                                        item.tributeVideo,
                                      )
                                    }
                                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                      isGoogleDriveLink(item.tributeVideo?.url)
                                        ? "bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300"
                                        : "bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/40 text-purple-300"
                                    }`}
                                    title="Abrir Vídeo Homenagem"
                                  >
                                    {item.tributeVideo?.type === "file" ? (
                                      <>
                                        <Play className="w-3 h-3 fill-current" />
                                        <span>Assistir</span>
                                      </>
                                    ) : (
                                      <>
                                        <ExternalLink className="w-3 h-3" />
                                        <span>
                                          {isGoogleDriveLink(
                                            item.tributeVideo?.url,
                                          )
                                            ? "Abrir Drive"
                                            : "Abrir"}
                                        </span>
                                      </>
                                    )}
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    handleOpenDriveLinkModal(
                                      item,
                                      "tributeVideo",
                                      "Vídeo Homenagem",
                                    )
                                  }
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs"
                                  title={
                                    hasTributeVideo
                                      ? "Editar ou colar link do Google Drive"
                                      : "Anexar link do Drive"
                                  }
                                >
                                  <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {item.notes && (
                          <div className="mt-3 text-xs text-slate-400 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                            <span className="font-semibold text-slate-300">
                              Feedback:
                            </span>{" "}
                            {item.notes}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">
                          Status de Disparo:
                        </span>
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleUpdateLeadStatus(item.id, e.target.value)
                          }
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none transition-all ${
                            item.status === "disparado"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : item.status === "respondendo"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          <option value="pendente">
                            ⏳ Pendente de Disparo
                          </option>
                          <option value="disparado">
                            🚀 Disparado aos Contatos
                          </option>
                          <option value="respondendo">
                            💬 Respondendo Clientes
                          </option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ABA: DEMANDAS DA SEMANA */}
        {activeTab === "demandas" && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filtrar por:
                </span>

                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Todos">Todos os Membros</option>
                  {TEAM_MEMBERS.filter((m) => m !== "Todos").map((member) => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="todo">A Fazer</option>
                  <option value="in-progress">Em Andamento</option>
                  <option value="done">Concluído</option>
                </select>
              </div>

              <span className="text-xs text-slate-400">
                Mostrando <strong>{filteredDemands.length}</strong> demandas
              </span>
            </div>

            {filteredDemands.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                <p className="text-slate-400 text-sm">
                  Nenhuma demanda semanal encontrada com os filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDemands.map((demand) => {
                  const isDone = demand.status === "done";
                  const isInProgress = demand.status === "in-progress";

                  return (
                    <div
                      key={demand.id}
                      className={`relative bg-slate-900 border rounded-2xl p-4 transition-all flex flex-col justify-between ${
                        isDone
                          ? "border-emerald-500/20 bg-emerald-950/10"
                          : isInProgress
                            ? "border-indigo-500/40 shadow-lg shadow-indigo-950/20"
                            : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {demand.day}
                          </span>
                          <div className="flex items-center space-x-1">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                demand.priority === "alta"
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : demand.priority === "media"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-slate-700/50 text-slate-400 border border-slate-600/50"
                              }`}
                            >
                              {demand.priority}
                            </span>
                            <button
                              onClick={() => handleDeleteDemand(demand.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                              title="Excluir Demanda"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4
                          className={`mt-3 text-sm font-semibold leading-snug ${
                            isDone
                              ? "line-through text-slate-500"
                              : "text-slate-100"
                          }`}
                        >
                          {demand.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          <span className="text-xs px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                            <Users className="w-3 h-3 text-indigo-400" />
                            {demand.assignee}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                            {demand.channel}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleDemandStatus(demand.id)}
                          className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all ${
                            isDone
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                              : isInProgress
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                                : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Concluído</span>
                            </>
                          ) : isInProgress ? (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                              <span>Em Produção</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>A Fazer</span>
                            </>
                          )}
                        </button>
                        <span className="text-[11px] text-slate-500">
                          Clique para mudar
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL DE EDIÇÃO DE METAS */}
      {isEditingGoals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Personalizar Metas do Mês
                </h3>
              </div>
              <button
                onClick={() => setIsEditingGoals(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  🎬 Meta de Vídeos do Mês (Lead + Homenagem)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={tempGoals.monthlyVideosTarget}
                    onChange={(e) =>
                      setTempGoals({
                        ...tempGoals,
                        monthlyVideosTarget: e.target.value,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-bold text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-xs">
                    vídeos
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ex: Padrão 8 vídeos. O progresso será calculado
                  automaticamente conforme os vídeos forem vinculados às festas.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  🔥 Meta de Contatos / Leads Alcançados no Mês
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="100000"
                    required
                    value={tempGoals.monthlyReachTarget}
                    onChange={(e) =>
                      setTempGoals({
                        ...tempGoals,
                        monthlyReachTarget: e.target.value,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-bold text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-xs">
                    contatos
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Total acumulado de disparos para convidados das festas.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingGoals(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Salvar Novas Metas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DO PLAYER DE VÍDEO */}
      {playerModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-4 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-white truncate">
                  {playerModal.title}
                </h3>
              </div>
              <button
                onClick={() =>
                  setPlayerModal({
                    isOpen: false,
                    title: "",
                    type: "",
                    videoData: null,
                  })
                }
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              {playerModal.videoData?.url ? (
                <video
                  src={playerModal.videoData.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Seu navegador não suporta este arquivo de vídeo.
                </video>
              ) : (
                <p className="text-xs text-slate-400">
                  Vídeo indisponível ou link inválido.
                </p>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>{playerModal.videoData?.name}</span>
              <button
                onClick={() =>
                  setPlayerModal({
                    isOpen: false,
                    title: "",
                    type: "",
                    videoData: null,
                  })
                }
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
              >
                Fechar Vídeo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR FESTA COM VÍDEO LEAD E VÍDEO HOMENAGEM */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Anexar Festa & Vídeos
                </h3>
                <p className="text-xs text-slate-400">
                  Vincule o Vídeo Lead e o Vídeo Homenagem da festa
                </p>
              </div>
              <button
                onClick={() => setIsLeadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateLead}
              className="space-y-4 mt-4 text-xs"
            >
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Nome do Aniversariante / Festa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Luiza 15 Anos ou Casamento Mariana & Thiago"
                  value={newLead.birthdayPerson}
                  onChange={(e) =>
                    setNewLead({ ...newLead, birthdayPerson: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Data da Festa
                  </label>
                  <input
                    type="date"
                    value={newLead.eventDate}
                    onChange={(e) =>
                      setNewLead({ ...newLead, eventDate: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Contatos Enviados
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 50"
                    value={newLead.contactsSent}
                    onChange={(e) =>
                      setNewLead({ ...newLead, contactsSent: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Fechamentos / Retorno
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 2 contratos"
                    value={newLead.dealsClosed}
                    onChange={(e) =>
                      setNewLead({ ...newLead, dealsClosed: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 1. Vídeo Lead */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-pink-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-pink-300 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-pink-400" /> 1. Vídeo Lead da
                    Festa
                  </span>

                  <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                    <button
                      type="button"
                      onClick={() =>
                        setNewLead({ ...newLead, leadVideoMode: "link" })
                      }
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        newLead.leadVideoMode === "link"
                          ? "bg-pink-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Link Drive / Nuvem
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewLead({ ...newLead, leadVideoMode: "upload" })
                      }
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        newLead.leadVideoMode === "upload"
                          ? "bg-pink-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Upload Arquivo
                    </button>
                  </div>
                </div>

                {newLead.leadVideoMode === "link" ? (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Cole o link do Google Drive (pasta ou arquivo compartilhado)..."
                        value={newLead.leadVideoUrl}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            leadVideoUrl: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 pr-9"
                      />
                      <FolderDown className="w-4 h-4 text-amber-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                    {isGoogleDriveLink(newLead.leadVideoUrl) && (
                      <span className="text-[10px] text-amber-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />{" "}
                        Link do Google Drive detectado com sucesso!
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleLeadFileUpload}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700 cursor-pointer"
                    />
                    {newLead.leadVideoFileName && (
                      <p className="text-[10px] text-pink-300 mt-1">
                        Arquivo selecionado: {newLead.leadVideoFileName}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Vídeo Homenagem */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-purple-400" /> 2.
                    Vídeo Homenagem / Retrospectiva
                  </span>

                  <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                    <button
                      type="button"
                      onClick={() =>
                        setNewLead({ ...newLead, tributeVideoMode: "link" })
                      }
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        newLead.tributeVideoMode === "link"
                          ? "bg-purple-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Link Drive / Nuvem
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewLead({ ...newLead, tributeVideoMode: "upload" })
                      }
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        newLead.tributeVideoMode === "upload"
                          ? "bg-purple-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Upload Arquivo
                    </button>
                  </div>
                </div>

                {newLead.tributeVideoMode === "link" ? (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Cole o link do Google Drive da Homenagem (Drive, Vimeo, Dropbox)..."
                        value={newLead.tributeVideoUrl}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            tributeVideoUrl: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 pr-9"
                      />
                      <FolderDown className="w-4 h-4 text-amber-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                    {isGoogleDriveLink(newLead.tributeVideoUrl) && (
                      <span className="text-[10px] text-amber-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />{" "}
                        Link do Google Drive detectado com sucesso!
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleTributeFileUpload}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                    />
                    {newLead.tributeVideoFileName && (
                      <p className="text-[10px] text-purple-300 mt-1">
                        Arquivo selecionado: {newLead.tributeVideoFileName}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Status Inicial do Disparo
                  </label>
                  <select
                    value={newLead.status}
                    onChange={(e) =>
                      setNewLead({ ...newLead, status: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pendente">Pendente de Disparo</option>
                    <option value="disparado">Disparado aos Contatos</option>
                    <option value="respondendo">Respondendo Leads</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Observações / Reações
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mãe da debutante adorou o clipe"
                    value={newLead.notes}
                    onChange={(e) =>
                      setNewLead({ ...newLead, notes: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl shadow-md shadow-pink-600/30 transition-all"
                >
                  Salvar Relatório da Festa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA DEMANDA SEMANAL */}
      {isDemandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                Nova Demanda Semanal
              </h3>
              <button
                onClick={() => setIsDemandModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateDemand}
              className="space-y-4 mt-4 text-xs"
            >
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  O que precisa ser feito? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Edição de Reels teaser da festa de 15 anos"
                  value={newDemand.title}
                  onChange={(e) =>
                    setNewDemand({ ...newDemand, title: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Responsável
                  </label>
                  <select
                    value={newDemand.assignee}
                    onChange={(e) =>
                      setNewDemand({ ...newDemand, assignee: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {TEAM_MEMBERS.filter((m) => m !== "Todos").map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Formato / Canal
                  </label>
                  <select
                    value={newDemand.channel}
                    onChange={(e) =>
                      setNewDemand({ ...newDemand, channel: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {CHANNELS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Dia da Semana
                  </label>
                  <select
                    value={newDemand.day}
                    onChange={(e) =>
                      setNewDemand({ ...newDemand, day: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={newDemand.status}
                    onChange={(e) =>
                      setNewDemand({ ...newDemand, status: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="todo">A Fazer</option>
                    <option value="in-progress">Em Andamento</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDemandModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all"
                >
                  Salvar Demanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ESPECÍFICO PARA ANEXAR / EDITAR LINK DO GOOGLE DRIVE */}
      {driveModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <FolderDown className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    Anexar Link do Google Drive
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {driveModal.partyName} • {driveModal.videoTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDriveModal({ ...driveModal, isOpen: false })}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveDriveLink}
              className="space-y-4 mt-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Título ou Identificação do Vídeo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pasta Google Drive - Fotos & Vídeo Final HD"
                  value={driveModal.name}
                  onChange={(e) =>
                    setDriveModal({ ...driveModal, name: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Link do Google Drive (URL) *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveModal.url}
                    onChange={(e) =>
                      setDriveModal({ ...driveModal, url: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 placeholder-slate-500 pr-9 font-mono text-[11px]"
                  />
                  <FolderDown className="w-4 h-4 text-amber-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  💡 <em>Dica:</em> Certifique-se de que o link no Google Drive
                  esteja com a permissão{" "}
                  <strong>"Qualquer pessoa com o link pode ver"</strong> para
                  que toda a equipe consiga acessar.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    setDriveModal({ ...driveModal, isOpen: false })
                  }
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                >
                  Salvar Link do Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
