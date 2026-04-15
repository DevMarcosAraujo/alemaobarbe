import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Booking() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-viking-black pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar size={28} className="text-viking-dark" />
          </div>
          <h1 className="font-viking text-3xl font-bold text-viking-text-primary mb-3">Pronto para agendar!</h1>
          <p className="text-viking-text-secondary mb-8">Você já está logado. Vá para a área do cliente para agendar seu horário.</p>
          <Link to="/cliente/agendar" className="btn-gold">
            Fazer Agendamento
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-viking-black pt-20 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="text-viking-gold text-xs font-semibold tracking-[0.4em] uppercase">Agendamento Online</span>
          <h1 className="font-viking text-4xl font-black text-viking-text-primary mt-3">
            AGENDAR HORÁRIO
          </h1>
          <div className="gold-divider" />
          <p className="text-viking-text-secondary">
            Para agendar, faça login ou crie sua conta. É rápido e gratuito!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/login"
              className="card-hover p-8 text-center block group"
            >
              <div className="w-14 h-14 bg-viking-gold/10 border border-viking-gold/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-viking-gold/20 transition-colors">
                <LogIn size={24} className="text-viking-gold" />
              </div>
              <h3 className="font-viking font-bold text-viking-text-primary mb-2">Já tenho conta</h3>
              <p className="text-viking-text-muted text-sm">Faça login para continuar</p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/cadastro"
              className="card-hover p-8 text-center block group border-viking-gold/20"
            >
              <div className="w-14 h-14 bg-viking-gold/10 border border-viking-gold/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-viking-gold/20 transition-colors">
                <UserPlus size={24} className="text-viking-gold" />
              </div>
              <h3 className="font-viking font-bold text-viking-text-primary mb-2">Criar conta</h3>
              <p className="text-viking-text-muted text-sm">Cadastre-se gratuitamente</p>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
