import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Award, Heart, Users } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

export default function About() {
  const values = [
    { icon: Shield, title: 'Tradição', desc: 'Preservamos as técnicas clássicas da barbearia com toque contemporâneo.' },
    { icon: Award, title: 'Excelência', desc: 'Cada corte é tratado como uma obra de arte. Perfeição em cada detalhe.' },
    { icon: Heart, title: 'Cuidado', desc: 'Atendimento personalizado para cada guerreiro que entra em nosso espaço.' },
    { icon: Users, title: 'Comunidade', desc: 'Mais que uma barbearia, somos um ponto de encontro de homens de estilo.' },
  ];

  const team = [
    { name: 'Rodrigo Viking', role: 'Master Barber', years: '10 anos', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=300&q=80' },
    { name: 'Carlos Nórdico', role: 'Barber Especialista', years: '7 anos', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&q=80' },
    { name: 'Thiago Rune', role: 'Cabeleiereiro', years: '5 anos', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
  ];

  return (
    <div className="min-h-screen bg-viking-black pt-20">
      {/* Hero */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} custom={0}>
              <span className="text-viking-gold text-xs font-semibold tracking-[0.4em] uppercase">Nossa história</span>
              <h1 className="font-viking text-4xl md:text-5xl font-black text-viking-text-primary mt-3 mb-6">
                SOBRE A <span className="text-gradient-gold">ALEMÃO</span>
              </h1>
              <div className="space-y-4 text-viking-text-secondary leading-relaxed">
                <p>
                  Nascemos em 2020 com uma missão clara: elevar o padrão da barbearia na cidade. Inspirados pela
                  força e determinação dos Vikings, criamos um espaço onde tradição e modernidade se fundem.
                </p>
                <p>
                  Nossa equipe de mestres barbeiros combina técnicas clássicas com as tendências mais atuais,
                  garantindo que cada cliente saia transformado — pronto para conquistar seu mundo.
                </p>
                <p>
                  Acreditamos que um bom corte é mais que estética: é confiança, é identidade, é o escudo
                  invisível que todo guerreiro moderno precisa.
                </p>
              </div>
              <Link to="/agendar" className="btn-gold mt-8 inline-block">
                Agendar Agora
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} custom={1} className="relative">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80"
                  alt="Vikings Barbearia"
                  className="w-full h-80 md:h-[440px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-viking-black via-transparent to-transparent" />
              </div>
              {/* Badge */}
              <div className="absolute -bottom-4 -left-4 bg-viking-gray border border-viking-gold/30 rounded-2xl p-4 shadow-gold">
                <p className="font-viking font-bold text-2xl text-gradient-gold">5+</p>
                <p className="text-viking-text-muted text-xs">Anos de experiência</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-viking-darker">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <h2 className="section-title">NOSSOS VALORES</h2>
            <div className="gold-divider" />
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="card-hover p-6 text-center group"
              >
                <div className="w-12 h-12 bg-viking-gold/10 border border-viking-gold/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-viking-gold/20 transition-colors">
                  <Icon size={22} className="text-viking-gold" />
                </div>
                <h3 className="font-viking text-sm font-bold text-viking-text-primary mb-2 tracking-wider">{title}</h3>
                <p className="text-viking-text-muted text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <span className="text-viking-gold text-xs font-semibold tracking-[0.4em] uppercase">Quem faz acontecer</span>
            <h2 className="section-title mt-2">NOSSA EQUIPE</h2>
            <div className="gold-divider" />
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {team.map(({ name, role, years, img }, i) => (
              <motion.div
                key={name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="text-center group"
              >
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-viking-gray-mid group-hover:border-viking-gold/50 transition-colors mx-auto">
                    <img src={img} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-viking-gold rounded-lg px-2 py-0.5">
                    <span className="text-viking-dark font-bold text-xs">{years}</span>
                  </div>
                </div>
                <h3 className="font-viking font-bold text-viking-text-primary">{name}</h3>
                <p className="text-viking-gold text-sm mt-0.5">{role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
