import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  // WhatsApp number from env or fallback (digits only)
  const whatsapp = import.meta.env.VITE_WHATSAPP || '5500000000000';

  return (
    <footer className="bg-viking-darker border-t border-viking-gray-mid">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center">
                <span className="text-viking-dark font-viking font-black text-sm">A</span>
              </div>
              <span className="font-viking font-bold text-xl tracking-wider text-gradient-gold">
                ALEMÃO
              </span>
            </div>
            <p className="text-viking-text-muted text-sm leading-relaxed mb-6">
              Tradição e estilo para guerreiros modernos. Excelência em corte e barbearia desde 2020.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-viking-gray-mid flex items-center justify-center text-viking-text-muted hover:text-viking-gold hover:bg-viking-gold/10 transition-all"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-viking-gray-mid flex items-center justify-center text-viking-text-muted hover:text-viking-gold hover:bg-viking-gold/10 transition-all"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-viking-gray-mid flex items-center justify-center text-viking-text-muted hover:text-green-400 hover:bg-green-400/10 transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-viking text-sm font-semibold text-viking-gold tracking-widest uppercase mb-4">
              Links Rápidos
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Início' },
                { to: '/sobre', label: 'Sobre Nós' },
                { to: '/servicos', label: 'Serviços' },
                { to: '/galeria', label: 'Galeria' },
                { to: '/parceiros', label: 'Parceiros' },
                { to: '/agendar', label: 'Agendar' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-viking-text-muted text-sm hover:text-viking-gold transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-viking-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Horários */}
          <div>
            <h4 className="font-viking text-sm font-semibold text-viking-gold tracking-widest uppercase mb-4">
              Horário de Atendimento
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { day: 'Segunda — Sexta', hours: '09:00 — 19:00' },
                { day: 'Sábado', hours: '09:00 — 17:00' },
                { day: 'Domingo', hours: 'Fechado' },
              ].map(({ day, hours }) => (
                <li key={day} className="flex justify-between gap-4">
                  <span className="text-viking-text-muted">{day}</span>
                  <span className={hours === 'Fechado' ? 'text-red-400' : 'text-viking-text-secondary'}>
                    {hours}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2 text-viking-text-muted text-sm">
              <Clock size={14} className="text-viking-gold" />
              <span>Agendamentos online 24h</span>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-viking text-sm font-semibold text-viking-gold tracking-widest uppercase mb-4">
              Contato
            </h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="text-viking-gold mt-0.5 shrink-0" />
                <span className="text-viking-text-muted text-sm">(00) 00000-0000</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-viking-gold mt-0.5 shrink-0" />
                <span className="text-viking-text-muted text-sm">
                  Rua dos Vikings, 123<br />
                  Centro, Cidade - UF
                </span>
              </li>
            </ul>
            <Link
              to="/agendar"
              className="w-full btn-gold text-sm py-2.5 block text-center"
            >
              Agendar Horário
            </Link>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="border-t border-viking-gray-mid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h4 className="font-viking text-sm font-semibold text-viking-gold tracking-widest uppercase mb-4 flex items-center gap-2">
            <MapPin size={14} />
            Como Chegar
          </h4>
          <div className="rounded-2xl overflow-hidden border border-viking-gray-mid h-52 md:h-64">
            <iframe
              title="Localização ALEMÃO Barbearia"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1!2d-46.6!3d-23.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMwJzAwLjAiUyA0NsKwMzYnMDAuMCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-viking-gray-mid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-viking-text-muted text-xs text-center">
            © {year} ALEMÃO Barbearia. Todos os direitos reservados{' '}
            <a href="https://marcosaraujo.dev.br" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">
              Desenvolvido por Marcos Araújo
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
