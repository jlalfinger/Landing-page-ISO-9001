import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { cn } from "../lib/utils";

interface RegistrationFormProps {
  onSuccess: () => void;
  className?: string;
  buttonText?: string;
}

export default function RegistrationForm({ onSuccess, className, buttonText = "Quiero Mi Cupo" }: RegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      company: formData.get("company"),
      position: formData.get("position"),
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let result;
      const text = await res.text();
      
      try {
        result = JSON.parse(text);
      } catch (parseErr) {
        // If not JSON, we have a serious server/infrastructure issue
        if (!res.ok) {
          throw new Error(`Servidor devolvió error no-JSON (Status ${res.status}): ${text.substring(0, 100)}...`);
        }
        result = { success: true }; // Fallback if 200 OK but weird body
      }

      if (res.ok) {
        setSuccess(true);
        onSuccess();
      } else {
        throw new Error(result?.details || result?.error || "Error interno en el procesamiento");
      }
    } catch (err: any) {
      console.error("Registration fatal error:", err);
      setError(`No se pudo completar el registro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl shadow-xl border border-emerald-100"
      >
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
        <h3 className="text-2xl font-display font-bold text-stone-900 mb-2">¡Cupo Reservado!</h3>
        <p className="text-stone-600">Te mantenemos informado y el día antes del taller te enviamos detalles del acceso y recordatorio.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Nombre Completo *</label>
          <input
            required
            name="fullName"
            type="text"
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400"
            placeholder="Juan Pérez"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Email *</label>
          <input
            required
            name="email"
            type="email"
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400"
            placeholder="tu@email.com"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Empresa (Opcional)</label>
          <input
            name="company"
            type="text"
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400"
            placeholder="Vinci Consultores"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Cargo (Opcional)</label>
          <input
            name="position"
            type="text"
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400"
            placeholder="Gerente de Calidad"
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-600 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        disabled={loading}
        type="submit"
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-display font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-70 group"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {buttonText}
            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
      
      <p className="text-[10px] text-center text-stone-400 leading-tight uppercase tracking-widest px-4 font-medium">
        Cupos limitados por sesión para garantizar mentoría personalizada. Inscripción sin costo.
      </p>
    </form>
  );
}
