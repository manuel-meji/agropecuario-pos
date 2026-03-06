import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

export default function LoginView() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(username, password);
      toast.success('¡Sesión iniciada con éxito!');
      navigate('/pos');
    } catch (error: any) {
      toast.error('Nombre de usuario o contraseña incorrectos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-200px] left-[-200px] w-96 h-96 bg-premium-emerald/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-200px] right-[-200px] w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-premium-emerald rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-premium-emerald/20 relative">
             <Leaf size={40} className="text-white" />
             <div className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md">
                <ShieldCheck size={14} className="text-premium-emerald" />
             </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Agropecuario <span className="text-premium-emerald">POS</span></h1>
          <p className="text-slate-500 font-medium mt-2">Bienvenido de nuevo, inicia sesión para continuar.</p>
        </div>

        <div className="premium-panel p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
           <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nombre de Usuario</label>
                 <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-premium-emerald transition-colors">
                       <User size={20} />
                    </div>
                    <input 
                      type="text" 
                      required
                      placeholder="admin"
                      className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-3xl pl-14 pr-6 py-5 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-premium-emerald/10 transition-all placeholder:text-slate-400"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contraseña</label>
                 <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-premium-emerald transition-colors">
                       <Lock size={20} />
                    </div>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-3xl pl-14 pr-6 py-5 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-premium-emerald/10 transition-all placeholder:text-slate-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                 </div>
              </div>

              <div className="flex items-center justify-between px-2">
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-800 group-hover:border-premium-emerald transition-colors flex items-center justify-center">
                       <div className="w-2.5 h-2.5 bg-premium-emerald rounded-[2px] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Recordarme</span>
                 </label>
                 <a href="#" className="text-xs font-black text-premium-emerald hover:underline">¿Olvidaste tu contraseña?</a>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-premium-emerald py-5 flex items-center justify-center gap-3 shadow-2xl shadow-premium-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                 <span className="font-black text-lg">{loading ? 'Verificando...' : 'Iniciar Sesión'}</span>
                 {!loading && <ArrowRight size={20} />}
              </button>
           </form>
        </div>

        <p className="text-center mt-10 text-sm font-medium text-slate-500">
           ¿No tienes una cuenta? <span className="text-premium-emerald font-black hover:underline cursor-pointer">Solicitar Acceso</span>
        </p>
      </motion.div>
    </div>
  );
}
