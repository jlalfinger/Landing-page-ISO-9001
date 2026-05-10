import React, { useEffect, useState } from "react";
import { 
  BarChart3, 
  Download, 
  Settings, 
  Users, 
  LogOut, 
  Save, 
  AlertCircle,
  Database,
  Trash2,
  Lock,
  ChevronRight,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import * as XLSX from "xlsx";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface Registrant {
  id: number;
  fullname: string;
  email: string;
  company: string;
  position: string;
  created_at: string;
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"registrants" | "config">("registrants");
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success">("idle");

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regRes, configRes] = await Promise.all([
        fetch("/api/admin/registrants"),
        fetch("/api/config")
      ]);
      if (regRes.ok) setRegistrants(await regRes.json());
      if (configRes.ok) setConfig(await configRes.json());
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Password incorrecto");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
  };

  const [imagePreviews, setImagePreviews] = useState<any>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreviews((prev: any) => ({ ...prev, [key]: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newConfig = {
      hero_title: formData.get("hero_title"),
      hero_subtitle: formData.get("hero_subtitle"),
      primary_color: formData.get("primary_color"),
      event_date: formData.get("event_date"),
      // Add images from previews if they exist, otherwise keep existing config values
      logo_url: imagePreviews.logo_url || config?.logo_url,
      presenter_1_url: imagePreviews.presenter_1_url || config?.presenter_1_url,
      presenter_2_url: imagePreviews.presenter_2_url || config?.presenter_2_url,
      presenter_3_url: imagePreviews.presenter_3_url || config?.presenter_3_url,
    };
    
    await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    });
    setConfig(newConfig);
    alert("Configuración guardada exitosamente");
  };

  const exportToExcel = () => {
    if (!registrants || registrants.length === 0) {
      alert("No hay registros para exportar");
      return;
    }

    setExportStatus("exporting");
    
    // Small delay to show "Exporting" state for better UX
    setTimeout(() => {
      try {
        const dataToExport = registrants.map(r => ({
          "Nombre Completo": r.fullname || (r as any).fullName || "Sin nombre",
          "Email": r.email,
          "Empresa": r.company || "—",
          "Cargo": r.position || "—",
          "Fecha de Registro": new Date(r.created_at).toLocaleString('es-ES')
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Candidatos");
        
        const fileName = `Vinci_Consultores_ISO9001_Registros_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // More robust download method
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setExportStatus("success");
      } catch (error) {
        console.error("Export failed:", error);
        alert("Error al exportar a Excel. Intente de nuevo.");
        setExportStatus("idle");
      } finally {
        // Reset after 3 seconds
        setTimeout(() => setExportStatus("idle"), 3000);
      }
    }, 800);
  };

  // Logic to calculate candidates per day
  const getStats = () => {
    const stats: { [key: string]: number } = {};
    registrants.forEach(r => {
      const date = new Date(r.created_at).toLocaleDateString();
      stats[date] = (stats[date] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6 swiss-grid">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-2xl border border-stone-200"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center text-white">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-black text-center text-stone-900 mb-2">Panel Administrativo</h1>
          <p className="text-center text-stone-500 text-sm mb-8">Ingrese su contraseña para continuar</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 focus:outline-none transition-all"
                placeholder="••••••••"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-600 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
            <button className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
              Acceder al Dashboard <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-white flex flex-col p-6 fixed inset-y-0 z-30">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-white font-black italic">V</div>
          <span className="font-display font-bold text-xl tracking-tight">Admin<span className="text-emerald-500">Hub</span></span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab("registrants")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
              activeTab === "registrants" ? "bg-white/10 text-emerald-400" : "text-stone-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Users className="w-4 h-4" /> Registros
          </button>
          <button 
            onClick={() => setActiveTab("config")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
              activeTab === "config" ? "bg-white/10 text-emerald-400" : "text-stone-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Settings className="w-4 h-4" /> Configuración
          </button>
        </nav>

        <div className="pt-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-stone-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        <header className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-display font-black text-stone-900">
              {activeTab === "registrants" ? "Candidatos Registrados" : "Editor de Contenido"}
            </h2>
            <p className="text-stone-500 text-sm mt-1">Gestión administrativa y métricas en tiempo real.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm flex items-center gap-2">
              <Database className={cn("w-4 h-4", config?.db_connected ? "text-emerald-500" : "text-amber-500")} />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                DB Status: {config?.db_connected ? "Conectado (Postgres)" : "Sesión Temporal (Sin DB)"}
              </span>
            </div>
            {!config?.db_connected && (
              <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 flex items-center gap-2 text-[10px] font-bold uppercase">
                <AlertCircle className="w-3 h-3" /> Los cambios se perderán al reiniciar el servidor
              </div>
            )}
            {activeTab === "registrants" && (
              <button 
                onClick={exportToExcel}
                disabled={exportStatus !== "idle" || registrants.length === 0}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                  exportStatus === "idle" && "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
                  exportStatus === "exporting" && "bg-stone-200 text-stone-500 shadow-none",
                  exportStatus === "success" && "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-none"
                )}
              >
                {exportStatus === "idle" && (
                  <>
                    <Download className="w-4 h-4" /> Exportar Excel
                  </>
                )}
                {exportStatus === "exporting" && (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                    Exportando...
                  </>
                )}
                {exportStatus === "success" && (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Exportado con éxito
                  </>
                )}
              </button>
            )}
          </div>
        </header>

        {activeTab === "registrants" ? (
          <div className="space-y-8">
            {/* Simple Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Registros</p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-display font-black text-stone-900">{registrants.length}</p>
                  <TrendingUp className="text-emerald-500 w-6 h-6 mb-1" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm col-span-2 overflow-hidden relative">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Nuevos candidatos por día</p>
                <div className="flex items-end gap-3 h-12">
                  {getStats().slice(-10).map(([date, count], i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div 
                        className="w-full bg-emerald-500/20 group-hover:bg-emerald-500 rounded-t-sm transition-all" 
                        style={{ height: `${(count / Math.max(...getStats().map(s => s[1]))) * 100}%`, minHeight: '4px' }} 
                      />
                      <span className="text-[8px] text-stone-400 font-bold">{date.split('/')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Empresa / Cargo</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr><td colSpan={5} className="p-20 text-center text-stone-400 italic">Cargando registros...</td></tr>
                  ) : registrants.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center text-stone-400 italic">No hay registros aún.</td></tr>
                  ) : (
                    registrants.map((reg) => (
                      <tr key={reg.id || Math.random()} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-stone-900">
                          {reg.fullname || (reg as any).fullName || "Sin nombre"}
                        </td>
                        <td className="px-6 py-4 text-stone-600">{reg.email}</td>
                        <td className="px-6 py-4">
                          <p className="text-stone-900 font-medium text-sm">{reg.company || '—'}</p>
                          <p className="text-stone-400 text-xs">{reg.position || '—'}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-stone-400">
                          {new Date(reg.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-stone-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-[2rem] border border-stone-200 shadow-sm max-w-4xl">
            <form onSubmit={handleSaveConfig} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Título Principal (Hero)</label>
                  <textarea 
                    name="hero_title"
                    defaultValue={config?.hero_title}
                    rows={3}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-display font-bold text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Subtítulo (Hero)</label>
                  <textarea 
                    name="hero_subtitle"
                    defaultValue={config?.hero_subtitle}
                    rows={3}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm leading-relaxed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Color Primario (Hex)</label>
                  <div className="flex gap-4">
                    <input 
                      type="color" 
                      name="primary_color"
                      defaultValue={config?.primary_color}
                      className="h-12 w-20 rounded-lg p-1 bg-stone-100 border border-stone-200 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      defaultValue={config?.primary_color}
                      className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-sm uppercase"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Fecha del Evento</label>
                  <input 
                    type="datetime-local" 
                    name="event_date"
                    defaultValue={config?.event_date?.split('.')[0]}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-stone-100">
                {[
                  { label: "Logo (.png)", key: "logo_url" },
                  { label: "Luis Carlos Cabareda", key: "presenter_1_url" },
                  { label: "Hilda Ramírez", key: "presenter_2_url" },
                  { label: "José Luis Alfinger", key: "presenter_3_url" },
                ].map((item) => (
                  <div key={item.key} className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{item.label}</label>
                    <div className="relative group aspect-square bg-stone-100 rounded-2xl overflow-hidden border-2 border-dashed border-stone-200 flex flex-col items-center justify-center p-4">
                      {imagePreviews[item.key] || config?.[item.key] ? (
                        <img 
                          src={imagePreviews[item.key] || config?.[item.key]} 
                          className="w-full h-full object-cover" 
                          alt="Preview"
                        />
                      ) : (
                        <div className="text-center">
                          <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                          <p className="text-[10px] text-stone-400">Subir imagen</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, item.key)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-stone-100 flex justify-end">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-display font-bold text-lg flex items-center gap-3 transition-all">
                  <Save className="w-5 h-5" /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
