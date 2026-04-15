import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Scissors } from 'lucide-react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';

const CATEGORIES = [
  { value: 'all', label: 'Todos' },
  { value: 'corte', label: 'Cortes' },
  { value: 'barba', label: 'Barba' },
  { value: 'tratamento', label: 'Tratamentos' },
  { value: 'combo', label: 'Combos' },
];

const MOCK_SERVICES = [
  { id: '1', name: 'Corte Masculino', price: 40, duration: 45, description: 'Corte clássico ou moderno executado com tesoura e máquina por nossos mestres.', category: 'corte', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80' },
  { id: '2', name: 'Barba Completa', price: 35, duration: 30, description: 'Modelagem e hidratação de barba com navalha de barbeiro. Resultado impecável.', category: 'barba', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80' },
  { id: '3', name: 'Corte + Barba', price: 65, duration: 75, description: 'O combo completo: corte profissional + barba feita com navalha.', category: 'combo', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80' },
  { id: '4', name: 'Sobrancelha', price: 20, duration: 20, description: 'Design e alinhamento de sobrancelha com pinça ou navalha.', category: 'barba' },
  { id: '5', name: 'Relaxamento Capilar', price: 50, duration: 60, description: 'Tratamento para fios rebeldes, deixando os cabelos mais macios e domados.', category: 'tratamento' },
  { id: '6', name: 'Hidratação Profunda', price: 45, duration: 45, description: 'Máscara de nutrição profunda com produtos premium para cabelos ressecados.', category: 'tratamento' },
  { id: '7', name: 'Progressiva Masculina', price: 80, duration: 90, description: 'Alinhamento completo para fios com muito volume. Resultados duradouros.', category: 'tratamento' },
  { id: '8', name: 'Corte Infantil', price: 30, duration: 30, description: 'Corte cuidadoso e divertido para os pequenos guerreiros.', category: 'corte' },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/services')
      .then(({ data }) => setServices(data.services?.length ? data.services : MOCK_SERVICES))
      .catch(() => setServices(MOCK_SERVICES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? services : services.filter((s) => s.category === filter);

  return (
    <div className="min-h-screen bg-viking-black pt-20">
      {/* Header */}
      <section className="py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="text-viking-gold text-xs font-semibold tracking-[0.4em] uppercase">Vikings Barbearia</span>
            <h1 className="font-viking text-4xl md:text-5xl font-black text-viking-text-primary mt-3">
              NOSSOS SERVIÇOS
            </h1>
            <div className="gold-divider" />
            <p className="text-viking-text-secondary text-lg">
              Cada serviço executado com maestria e dedicação total.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filtros */}
      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filter === value
                    ? 'bg-gold-gradient text-viking-dark'
                    : 'bg-viking-gray text-viking-text-secondary hover:text-viking-text-primary border border-viking-gray-mid'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-40 bg-viking-gray-mid rounded-xl mb-4" />
                  <div className="h-4 bg-viking-gray-mid rounded w-3/4 mb-2" />
                  <div className="h-3 bg-viking-gray-mid rounded w-full mb-1" />
                  <div className="h-3 bg-viking-gray-mid rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="card-hover overflow-hidden group"
                >
                  {service.image ? (
                    <div className="h-44 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  ) : (
                    <div className="h-44 bg-viking-gray-mid flex items-center justify-center">
                      <Scissors size={40} className="text-viking-gold/30" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs text-viking-gold uppercase tracking-widest font-semibold">
                          {service.category}
                        </span>
                        <h3 className="font-viking font-bold text-viking-text-primary mt-0.5">
                          {service.name}
                        </h3>
                      </div>
                      <span className="text-viking-gold font-black text-xl">{formatCurrency(service.price)}</span>
                    </div>
                    {service.description && (
                      <p className="text-viking-text-muted text-sm mb-4 leading-relaxed">{service.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-viking-gray-mid">
                      <span className="text-xs text-viking-text-muted flex items-center gap-1.5">
                        <Clock size={13} />
                        {service.duration} min
                      </span>
                      <Link
                        to="/agendar"
                        className="flex items-center gap-1.5 text-sm text-viking-gold font-semibold hover:gap-2.5 transition-all"
                      >
                        Agendar <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-viking-darker border-t border-viking-gray-mid">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-viking text-3xl font-bold text-viking-text-primary mb-4">
            Escolheu seu serviço?
          </h2>
          <p className="text-viking-text-secondary mb-6">
            Agende agora mesmo de forma rápida e fácil. Sem filas, sem espera.
          </p>
          <Link to="/agendar" className="btn-gold text-base px-8 py-4 inline-flex items-center gap-2">
            Agendar Horário <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
