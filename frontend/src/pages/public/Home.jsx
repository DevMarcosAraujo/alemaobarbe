import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Scissors, Star, Clock, Shield, ChevronDown, ArrowRight, Play } from 'lucide-react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';

// Componente de contagem animada
const CountUp = ({ end, suffix = '', duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.1, 0.25, 1] }
  }),
};

export default function Home() {
  const [services, setServices] = useState([]);
  const [banners, setBanners] = useState([]);
  const [partners, setPartners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const heroRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [svcRes, banRes, parRes] = await Promise.allSettled([
          api.get('/services'),
          api.get('/gallery/banners'),
          api.get('/partners'),
        ]);
        if (svcRes.status === 'fulfilled') setServices(svcRes.value.data.services?.slice(0, 6) || []);
        if (banRes.status === 'fulfilled') setBanners(banRes.value.data.banners || []);
        if (parRes.status === 'fulfilled') setPartners(parRes.value.data.partners || []);
      } catch {}
    };
    load();
  }, []);

  // Auto-advance banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrentBanner((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const stats = [
    { value: 500, suffix: '+', label: 'Clientes Satisfeitos' },
    { value: 5, suffix: ' anos', label: 'De Experiência' },
    { value: 15, suffix: '+', label: 'Serviços Oferecidos' },
    { value: 4.9, suffix: '★', label: 'Avaliação Média' },
  ];

  const features = [
    { icon: Scissors, title: 'Mestres do Ofício', desc: 'Profissionais treinados com décadas de experiência em cortes clássicos e modernos.' },
    { icon: Star, title: 'Qualidade Premium', desc: 'Produtos e ferramentas de alta qualidade para o melhor resultado possível.' },
    { icon: Clock, title: 'Pontualidade', desc: 'Respeitamos seu tempo. Agendamentos online para máxima comodidade.' },
    { icon: Shield, title: 'Higiene Total', desc: 'Protocolos rigorosos de higienização entre cada atendimento.' },
  ];

  return (
    <div className="bg-viking-black">
      {/* ─── HERO SECTION ─────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-30"
            poster="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&q=80"
          >
            {/* Coloque aqui seu vídeo: src="/videos/hero.mp4" */}
          </video>
          {/* Overlay com gradiente */}
          <div className="absolute inset-0 bg-hero-gradient" />
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-grid opacity-50" />
        </div>

        {/* Decoração Viking */}
        <div className="absolute top-1/4 left-0 w-px h-32 bg-gradient-to-b from-transparent via-viking-gold to-transparent opacity-30" />
        <div className="absolute top-1/4 right-0 w-px h-32 bg-gradient-to-b from-transparent via-viking-gold to-transparent opacity-30" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 text-viking-gold text-xs font-semibold tracking-[0.4em] uppercase bg-viking-gold/10 border border-viking-gold/20 px-4 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-viking-gold" />
                Barbearia Premium
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-viking text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight hero-text-shadow"
            >
              <span className="block text-viking-text-primary">ALEMÃO</span>
              <span className="block text-gradient-gold">BARBEARIA</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-viking-text-secondary text-lg md:text-xl max-w-xl mx-auto leading-relaxed"
            >
              Tradição e estilo para guerreiros modernos. Cortes que contam histórias, barbas que definem caráter.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <Link to="/agendar" className="btn-gold text-base px-8 py-4 w-full sm:w-auto animate-glow">
                Agendar Horário
              </Link>
              <Link to="/servicos" className="btn-outline-gold text-base px-8 py-4 w-full sm:w-auto">
                Ver Serviços
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-viking-text-muted hover:text-viking-gold transition-colors animate-bounce"
        >
          <ChevronDown size={28} />
        </button>
      </section>

      {/* ─── STATS ───────────────────────────────────────────────── */}
      <section className="py-12 border-y border-viking-gray-mid bg-viking-darker">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, suffix, label }, i) => (
              <motion.div
                key={label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <div className="font-viking text-3xl md:text-4xl font-black text-gradient-gold">
                  <CountUp end={value} suffix={suffix} />
                </div>
                <p className="text-viking-text-muted text-sm mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BANNER PROMO ────────────────────────────────────────── */}
      {banners.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl">
              {banners.map((banner, i) => (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: i === currentBanner ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  className={`${i === currentBanner ? 'relative' : 'absolute inset-0'}`}
                >
                  <div
                    className="relative min-h-48 md:min-h-64 rounded-2xl overflow-hidden flex items-center"
                    style={{
                      background: banner.imageUrl
                        ? `url(${banner.imageUrl}) center/cover`
                        : 'linear-gradient(135deg, #1A1A1A, #2A2A2A)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                    <div className="relative z-10 p-8 md:p-12 max-w-lg">
                      <h3 className="font-viking text-2xl md:text-3xl font-bold text-white mb-2">{banner.title}</h3>
                      {banner.description && (
                        <p className="text-viking-text-secondary mb-4">{banner.description}</p>
                      )}
                      <Link to={banner.buttonLink || '/agendar'} className="btn-gold inline-block">
                        {banner.buttonText || 'Agendar'}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
              {banners.length > 1 && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentBanner(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentBanner ? 'bg-viking-gold w-4' : 'bg-viking-text-muted'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── SERVIÇOS ────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <span className="text-viking-gold text-xs font-semibold tracking-[0.3em] uppercase">Nossos Serviços</span>
            <h2 className="section-title mt-2">O QUE FAZEMOS</h2>
            <div className="gold-divider" />
            <p className="section-subtitle max-w-lg mx-auto">
              Do corte clássico à transformação completa — cada serviço executado com maestria.
            </p>
          </motion.div>

          {services.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Corte Masculino', price: 40, duration: 45, desc: 'Corte clássico ou moderno com tesoura e máquina.' },
                { name: 'Barba Completa', price: 35, duration: 30, desc: 'Modelagem e hidratação de barba com navalha.' },
                { name: 'Corte + Barba', price: 65, duration: 75, desc: 'Combo completo para uma transformação total.' },
                { name: 'Sobrancelha', price: 20, duration: 20, desc: 'Design e alinhamento de sobrancelha.' },
                { name: 'Relaxamento', price: 50, duration: 60, desc: 'Tratamento capilar para fios rebeldes.' },
                { name: 'Hidratação', price: 45, duration: 45, desc: 'Nutrição profunda com produtos premium.' },
              ].map((svc, i) => (
                <ServiceCard key={i} service={svc} index={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc, i) => (
                <ServiceCard key={svc.id} service={svc} index={i} />
              ))}
            </div>
          )}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mt-10"
          >
            <Link to="/servicos" className="btn-outline-gold inline-flex items-center gap-2">
              Ver todos os serviços
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── DIFERENCIAIS ────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-viking-darker">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <span className="text-viking-gold text-xs font-semibold tracking-[0.3em] uppercase">Por que nos escolher</span>
            <h2 className="section-title mt-2">NOSSA ESSÊNCIA</h2>
            <div className="gold-divider" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="card-hover p-6 text-center group"
              >
                <div className="w-14 h-14 bg-viking-gold/10 border border-viking-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-viking-gold/20 transition-colors">
                  <Icon size={24} className="text-viking-gold" />
                </div>
                <h3 className="font-viking text-sm font-bold text-viking-text-primary mb-2 tracking-wider">{title}</h3>
                <p className="text-viking-text-muted text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARCEIROS ───────────────────────────────────────────── */}
      {partners.length > 0 && (
        <section className="py-12 px-4 border-t border-viking-gray-mid">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-viking-text-muted text-xs tracking-[0.3em] uppercase mb-8">Nossos Parceiros</p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {partners.map((partner) => (
                <div key={partner.id} className="opacity-50 hover:opacity-100 transition-opacity">
                  {partner.logoUrl ? (
                    <img src={partner.logoUrl} alt={partner.name} className="h-8 object-contain filter grayscale hover:grayscale-0 transition-all" />
                  ) : (
                    <span className="text-viking-text-muted font-semibold">{partner.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA FINAL ───────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-viking text-4xl md:text-5xl font-black text-viking-text-primary mb-4">
              Pronto para a <span className="text-gradient-gold">transformação</span>?
            </h2>
            <p className="text-viking-text-secondary text-lg mb-8">
              Agende seu horário agora mesmo e descubra por que somos os melhores da cidade.
            </p>
            <Link to="/agendar" className="btn-gold text-lg px-10 py-4 inline-flex items-center gap-2 animate-glow">
              Agendar Agora
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ service, index }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.08 } },
      }}
      className="card-hover p-6 group"
    >
      {service.image && (
        <div className="h-36 rounded-xl overflow-hidden mb-4">
          <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-viking font-semibold text-viking-text-primary text-sm tracking-wide">{service.name}</h3>
        <span className="text-viking-gold font-bold text-sm whitespace-nowrap ml-2">
          {formatCurrency(service.price)}
        </span>
      </div>
      {service.description && (
        <p className="text-viking-text-muted text-xs leading-relaxed mb-3">{service.description}</p>
      )}
      <div className="flex items-center justify-between">
        {service.duration && (
          <span className="text-xs text-viking-text-muted flex items-center gap-1">
            <Clock size={12} />
            {service.duration} min
          </span>
        )}
        <Link to="/agendar" className="text-xs text-viking-gold hover:underline flex items-center gap-1 ml-auto">
          Agendar <ArrowRight size={12} />
        </Link>
      </div>
    </motion.div>
  );
}
