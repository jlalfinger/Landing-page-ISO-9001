import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Clock, 
  Monitor, 
  Check, 
  ChevronDown, 
  Globe, 
  MapPin, 
  Linkedin,
  ArrowRight
} from "lucide-react";
import RegistrationForm from "./RegistrationForm.tsx";
import { cn } from "../lib/utils";

export default function LandingPage() {
  const [config, setConfig] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);

  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then(async res => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        const text = await res.text();
        throw new Error(text || "Config response not JSON");
      })
      .then(data => {
        setConfig(data);
        if (data.primary_color) {
          document.documentElement.style.setProperty('--color-primary', data.primary_color);
        }
        if (data.event_date) {
          const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(data.event_date).getTime() - now;
            if (distance < 0) {
              clearInterval(timer);
              setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
            } else {
              setTimeLeft({
                d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((distance % (1000 * 60)) / 1000),
              });
            }
          }, 1000);
          return () => clearInterval(timer);
        }
      })
      .catch(err => {
        console.error("Failed to fetch config:", err);
        // Fallback to minimal defaults if API fails
        setConfig({
          hero_title: "Transición Estratégica a la Nueva versión de ISO 9001:2026",
          hero_subtitle: "Los borradores de la nueva versión ya están sobre la mesa. Contexto, Liderazgo y Evidencia no son \"extras\": son el nuevo estándar.",
          company_name: "Vinci Consultores",
          primary_color: "#00A86B",
        });
      });
  }, []);

  if (!config) return <div className="h-screen w-screen flex items-center justify-center font-display text-2xl animate-pulse">Cargando...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 glass border-b border-stone-100 py-4 lg:py-6">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {config.logo_url ? (
              <img src={config.logo_url} alt={config.company_name || "Vinci Consultores"} className="h-24 lg:h-32 xl:h-40 w-auto object-contain py-2" />
            ) : (
              <>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl italic shadow-lg shadow-primary/20">V</div>
                <span className="font-display font-black text-2xl lg:text-3xl tracking-tighter text-stone-900">Vinci <span className="text-primary">Consultores</span></span>
              </>
            )}
          </div>
          <a href="#register" className="hidden sm:block text-xs font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-colors border-b-2 border-primary/20 pb-1">
            Registrarse Ahora →
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col lg:flex-row overflow-hidden swiss-grid">
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-24 py-16 lg:py-24 z-10 bg-white/80">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-primary/20"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            En Vivo • Online • Sin Costo
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-7xl font-display font-black text-stone-900 mb-6 leading-[1.05]"
          >
            {config.hero_title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-stone-600 mb-10 max-w-2xl leading-relaxed font-light"
          >
            {config.hero_subtitle}
          </motion.p>

          {/* Countdown Timer */}
          {timeLeft && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 mb-10"
            >
              {[
                { label: 'dias', value: timeLeft.d },
                { label: 'hrs', value: timeLeft.h },
                { label: 'min', value: timeLeft.m },
                { label: 'seg', value: timeLeft.s }
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white border border-stone-200 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-2xl font-display font-black text-primary">{t.value.toString().padStart(2, '0')}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-2">{t.label}</span>
                </div>
              ))}
            </motion.div>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 border-l-2 border-stone-200 pl-8"
          >
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-bold text-stone-900 leading-tight">40 minutos</p>
                <p className="text-xs text-stone-500">Directo al punto</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-bold text-stone-900 leading-tight">30 de mayo, 2026</p>
                <p className="text-xs text-stone-500">Evento en vivo</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Monitor className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-bold text-stone-900 leading-tight">En vivo por Internet</p>
                <p className="text-xs text-stone-500">Acceso global</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-stone-50 p-6 rounded-2xl border border-stone-200 shadow-sm max-w-lg mb-8"
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 inline-block border-b border-stone-200 pb-2">Horarios internacionales</h3>
            <div className="grid grid-cols-2 gap-4 text-[11px] leading-tight">
              <div className="space-y-2">
                <p><span className="font-bold text-stone-900">10:00 AM:</span> CDMX, Guatemala, San José, San Salvador</p>
                <p><span className="font-bold text-stone-900">11:00 AM:</span> Lima, Bogotá, Quito</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-bold text-stone-900">12:00 PM:</span> Este USA/Canadá, Caracas, Santiago</p>
                <p><span className="font-bold text-stone-900">01:00 PM:</span> Buenos Aires</p>
                <p><span className="font-bold text-stone-900">06:00 PM:</span> España peninsular</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-2xl border border-stone-100 mt-12 mb-8"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Reserva tu cupo sin costo</h3>
            <RegistrationForm onSuccess={() => {}} buttonText="QUIERO MI CUPO →" />
          </motion.div>
        </div>
        
        {/* Hero Background Image Area */}
        <div className="hidden lg:block w-[40%] bg-stone-100 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1553028212-04ce9965da03?auto=format&fit=crop&q=80&w=2070" 
            alt="ISO 9001 Professional Environment"
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white" />
          <div className="absolute bottom-12 left-12 p-8 glass max-w-sm rounded-2xl shadow-2xl">
            <p className="font-display font-bold text-stone-900 text-lg mb-2 italic">"Contexto, Liderazgo y Evidencia no son 'extras': son el nuevo estándar."</p>
            <div className="w-12 h-1 bg-primary rounded-full" />
          </div>
        </div>
      </section>

      {/* Para quien es section */}
      <section className="py-24 bg-white px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 px-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 italic">Público Objetivo</h2>
            <h3 className="text-3xl lg:text-5xl font-display font-bold text-stone-900 tracking-tight">Esto es para ti si...</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              "Eres gerente o especialista de calidad y sabes que se viene un cambio de versión de norma.",
              "Quieres entender qué significan en la práctica los conceptos de impactos en el ambiente, operación y resiliencia.",
              "Te preocupa que tu organización haga una transición puramente documental sin aprovechar el potencial estratégico.",
              "Eres gerente general de una pyme y quieres saber si tu sistema de gestión realmente agrega valor al negocio.",
              "No tienes tiempo para leer 200 páginas de borradores pero necesitas estar al día.",
              "Quieres liderar la conversación sobre calidad en tu organización, no solo ejecutarla."
            ].map((item, i) => (
              <motion.div 
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                key={i} 
                className="flex items-start gap-4 p-6 bg-stone-50 rounded-xl border border-stone-100 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <p className="text-stone-700 leading-relaxed font-medium">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lo que vas a descubrir section */}
      <section className="py-24 bg-stone-950 text-white px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -ml-48 -mb-48" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 italic">Contenido Exclusivo</h2>
            <h3 className="text-3xl lg:text-5xl font-display font-bold tracking-tight">En solo 40 minutos, te llevarás esto:</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-16">
              <div className="flex gap-6 items-start group">
                <span className="text-5xl font-display font-black text-primary/30 shrink-0">01</span>
                <div>
                  <h4 className="text-xl font-bold mb-3">Aprovechamiento de Mercado</h4>
                  <p className="text-stone-400 leading-relaxed max-w-sm">El FDIS no exige explícitamente Digitalización, ESG, Resiliencia, pero el mercado sí. La norma lo permite y nosotros enseñamos a aprovecharlo.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start group">
                <span className="text-5xl font-display font-black text-primary/30 shrink-0">02</span>
                <div>
                  <h4 className="text-xl font-bold mb-3">Niveles de Madurez</h4>
                  <p className="text-stone-400 leading-relaxed max-w-sm">La norma no define Niveles de Madurez, pero el mercado sí distingue quién tiene las mejores prácticas.</p>
                </div>
              </div>
            </div>
            <div className="space-y-16">
              <div className="flex gap-6 items-start group">
                <span className="text-5xl font-display font-black text-primary/30 shrink-0">03</span>
                <div>
                  <h4 className="text-xl font-bold mb-3">Reformulación Estratégica</h4>
                  <p className="text-stone-400 leading-relaxed max-w-sm">Cómo reformular brechas de Contexto, Liderazgo y Evidencia para que no suenen solo como requisitos normativos.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start group">
                <span className="text-5xl font-display font-black text-primary/30 shrink-0">04</span>
                <div>
                  <h4 className="text-xl font-bold mb-3">Vulnerabilidad → Ventaja</h4>
                  <p className="text-stone-400 leading-relaxed max-w-sm">Cerrar brechas no es cumplir. Es convertir una vulnerabilidad en una ventaja competitiva para tu organización.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Presentadores section */}
      <section className="py-24 bg-white px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 italic">Nuestros Ponentes</h2>
            <h3 className="text-3xl lg:text-5xl font-display font-bold text-stone-900 tracking-tight">Cierra la brecha con los expertos</h3>
          </div>
          
          <div className="space-y-20">
            {[
              {
                name: "Luis Carlos Cabareda",
                role: "Consultor, Auditor, Online Speaker",
                desc: "Se dedica a ayudar a los directivos o dueños de negocio a incrementar su rentabilidad y objetivos, mediante consultorías, auditorías y capacitación en normas de Sistemas de Gestión ISO 900, ISO 14001, ISO 45001, ISO 37301, ISO 50001, ISO/IEC 27001, ISO/IEC 42001, ISO 22301 con un enfoque práctico y que agregue valor.",
                image: config?.presenter_1_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
              },
              {
                name: "Hilda Ramírez",
                role: "Consultora y auditora profesional",
                desc: "Consultora, asesora y auditor ISO 9001 calidad de servicios, ISO 20000 y 27001 seguridad de la información, y ISO 45001 seguridad del personal. Aporta un enfoque integral de seguridad y calidad técnica.",
                image: config?.presenter_2_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
              },
              {
                name: "José Luis Alfinger",
                role: "CEO at Vinci Consultores",
                desc: "Trabaja con líderes que saben que el desempeño sostenible se construye con personas, sistemas y propósito, integrando planificación estratégica, personas, calidad, seguridad y continuidad en un sistema vivo.",
                image: config?.presenter_3_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400"
              }
            ].map((p, i) => (
              <div key={i} className={cn("flex flex-col md:flex-row items-center gap-12", i % 2 !== 0 && "md:flex-row-reverse")}>
                <div className="w-64 h-64 shrink-0 overflow-hidden rounded-[2rem] border-4 border-stone-50 shadow-2xl relative group">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-110" />
                  <div className="absolute inset-0 bg-primary/10 mix-blend-multiply group-hover:opacity-0 transition-opacity" />
                </div>
                <div className="text-center md:text-left">
                  <h4 className="text-2xl font-display font-bold text-stone-900 mb-1">{p.name}</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">{p.role}</p>
                  <p className="text-stone-600 leading-relaxed font-light">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-24 bg-stone-50 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-16">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 italic">Soporte</h2>
            <h3 className="text-3xl lg:text-5xl font-display font-bold text-stone-900 tracking-tight">Resolvemos tus dudas antes de que aparezcan</h3>
          </div>
          
          <div className="space-y-3">
            {[
              {
                q: "¿Es realmente gratuito?",
                a: "Sí, el taller de 40 minutos no tiene ningún costo para ti. Está diseñado para compartir contigo información estratégica de valor sobre la nueva versión de la norma. Al finalizar, te invitaremos a conocer nuestro curso de costo compartido de 5 horas, pero la participación en este taller no implica ninguna obligación de compra."
              },
              {
                q: "¿Necesito tener conocimientos previos de la nueva norma?",
                a: "No. El taller está diseñado tanto para quienes ya han leído los borradores como para quienes apenas se están enterando de los cambios. Partimos desde cero en los conceptos nuevos."
              },
              {
                q: "¿Recibiré algún material después del taller?",
                a: "Sí. Todos los inscritos recibirán un resumen con los puntos clave presentados y un checklist de preparación inmediata."
              },
              {
                q: "¿Cómo accedo al taller el día del evento?",
                a: "El día anterior al taller recibirás un correo con el enlace de acceso. También te enviaremos un recordatorio una hora antes del inicio."
              },
              {
                q: "¿El taller queda grabado?",
                a: "El taller se dicta en vivo para fomentar la interacción. Te recomendamos asistir en directo para poder hacer preguntas, pero si, queda grabado para los inscritos."
              },
              {
                q: "¿Puedo invitar a colegas de mi organización?",
                a: "Por supuesto. Mientras más personas de tu organización comprendan el enfoque estratégico, mejor. Solo pedimos que cada uno se inscriba individualmente."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-primary/40 transition-colors">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-stone-50 transition-colors"
                >
                  <span className="font-bold text-stone-900">{faq.q}</span>
                  <ChevronDown className={cn("w-5 h-5 text-stone-400 transition-transform duration-300", openFaq === i && "rotate-180 text-primary")} />
                </button>
                <div 
                  className={cn(
                    "px-6 overflow-hidden transition-all duration-300 ease-in-out",
                    openFaq === i ? "max-h-[500px] pb-6" : "max-h-0"
                  )}
                >
                  <p className="text-stone-600 leading-relaxed text-sm pt-2">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section id="register" className="py-24 bg-gradient-to-br from-primary to-stone-900 text-white px-6 relative overflow-hidden">
        <div className="swiss-grid opacity-10 absolute inset-0" />
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-4xl lg:text-6xl font-display font-black mb-8 leading-tight">La nueva ISO 9001 no espera a nadie.</h3>
              <p className="text-lg text-white/80 mb-8 max-w-xl font-light leading-relaxed">
                Los borradores están avanzando. Etapa 50:00 alcanzada. Las organizaciones que se anticipen con una mirada estratégica serán las que lideren. Las que esperen harán un parche documental.
                <br /><br />
                <span className="font-bold border-b-2 border-white/30 text-white">Tú eliges de qué lado quieres estar.</span>
              </p>
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <Globe className="w-10 h-10 opacity-30" />
                <MapPin className="w-10 h-10 opacity-30" />
                <Linkedin className="w-10 h-10 opacity-30" />
              </div>
            </div>
            
            <div className="w-full max-w-md">
              <div className="bg-white p-8 rounded-[2rem] shadow-2xl">
                <RegistrationForm 
                  onSuccess={() => {}} 
                  buttonText="SÍ, ME INSCRIBO AHORA →" 
                  className="space-y-6"
                />
                <p className="mt-6 text-center text-[10px] text-stone-400 font-medium">
                  Si tienes dudas, escríbenos a <a href="mailto:jlalfinger@gmail.com" className="text-primary underline">jlalfinger@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-top border-stone-100 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-stone-400 text-xs font-medium uppercase tracking-[0.1em]">
          <p>© 2026 VINCI CONSULTORES. TODOS LOS DERECHOS RESERVADOS.</p>
          <div className="flex gap-8">
            <button 
              onClick={() => setLegalModal("privacy")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              POLÍTICA DE PRIVACIDAD
            </button>
            <button 
              onClick={() => setLegalModal("terms")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              TÉRMINOS Y CONDICIONES
            </button>
            <a href="https://www.linkedin.com/in/jose-luis-alfinger" target="_blank" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Linkedin className="w-3 h-3" /> LINKEDIN
            </a>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <AnimatePresence>
        {legalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm"
            onClick={() => setLegalModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl p-8 lg:p-12 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setLegalModal(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 transition-colors"
              >
                <Check className="w-6 h-6 text-stone-400 rotate-45" />
              </button>

              {legalModal === "privacy" ? (
                <div className="prose prose-stone max-w-none">
                  <h2 className="text-2xl font-display font-bold text-stone-900 mb-6">POLÍTICA DE PRIVACIDAD — TALLER GRATUITO</h2>
                  <p className="text-xs text-stone-400 mb-8">Fecha de última actualización: 5 de mayo de 2026</p>
                  
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">1. Responsable del Tratamiento</h3>
                  <p className="text-sm text-stone-600 mb-6">Vinci Consultores (jlalfinger@gmail.com) es quien decide cómo y para qué se tratan tus datos personales al inscribirte en el taller.</p>

                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">2. ¿Qué datos recopilamos y con qué finalidad?</h3>
                  <p className="text-sm text-stone-600 mb-4">Recopilamos: Nombre, email, empresa (opcional) y cargo (opcional).</p>
                  <ul className="text-sm text-stone-600 space-y-2 mb-6 list-disc pl-5">
                    <li>Gestionar tu inscripción y enviar el enlace de acceso.</li>
                    <li>Enviarte recordatorios sobre el evento.</li>
                    <li>Enviarte los materiales prometidos (checklist, libro Excel).</li>
                    <li>Informarte sobre cursos y servicios relacionados de Vinci Consultores.</li>
                  </ul>

                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">3. ¿Por cuánto tiempo conservamos tus datos?</h3>
                  <p className="text-sm text-stone-600 mb-6">Tus datos se conservarán mientras no solicites su supresión. Pasados 24 meses sin interacción, procederemos a eliminarlos.</p>

                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">4. ¿Compartimos tus datos con terceros?</h3>
                  <p className="text-sm text-stone-600 mb-6">No vendemos ni compartimos tus datos con terceros con fines comerciales. Solo utilizamos proveedores tecnológicos bajo contrato de seguridad.</p>

                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">5. Tus Derechos</h3>
                  <p className="text-sm text-stone-600 mb-4">Puedes ejercer tus derechos escribiendo a jlalfinger@gmail.com:</p>
                  <p className="text-sm text-stone-600 italic">Acceso, Rectificación, Supresión, Oposición, Portabilidad y Limitación.</p>
                </div>
              ) : (
                <div className="prose prose-stone max-w-none">
                  <h2 className="text-2xl font-display font-bold text-stone-900 mb-6">TÉRMINOS Y CONDICIONES — TALLER GRATUITO</h2>
                  <p className="text-xs text-stone-400 mb-8">Fecha de última actualización: 5 de mayo de 2026</p>
                  
                  <div className="space-y-6 text-sm text-stone-600">
                    <div>
                      <h3 className="font-bold text-stone-900">1. Objeto</h3>
                      <p>Regulan la inscripción y participación en el taller gratuito "Liderando la Transición Estratégica ISO 9001:2026".</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900">2. Inscripción</h3>
                      <p>La inscripción es gratuita y sujeta a disponibilidad. Vinci Consultores se reserva el derecho de cerrar inscripciones al alcanzar el aforo máximo.</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900">3. Acceso al Taller</h3>
                      <p>Recibirás el enlace por correo. Es responsabilidad del participante disponer de conexión a internet adecuada.</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900">4. Propiedad Intelectual</h3>
                      <p>Todos los contenidos presentados son propiedad intelectual de Vinci Consultores. Está prohibida su reproducción o distribución sin autorización.</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900">5. Grabación</h3>
                      <p>El taller podrá ser grabado para fines promocionales. Al participar e interactuar con voz/cámara, autorizas el uso de tu imagen.</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900">6. Exclusión de Garantías</h3>
                      <p>El taller es informativo. Vinci Consultores no garantiza resultados específicos ya que dependen de factores ajenos al control de la consultora.</p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setLegalModal(null)}
                className="mt-12 w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
              >
                Entendido, cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
