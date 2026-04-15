import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import api from '../../utils/api';

const MOCK_PARTNERS = [
  { id: '1', name: 'Barber Supply', description: 'Fornecedor premium de produtos para barbearia.', logoUrl: null, website: '#' },
  { id: '2', name: 'Gold Scissors', description: 'Ferramentas profissionais de alta qualidade.', logoUrl: null, website: '#' },
  { id: '3', name: 'Viking Ink', description: 'Estúdio de tatuagem parceiro.', logoUrl: null, website: '#' },
  { id: '4', name: 'Premium Beard', description: 'Produtos exclusivos para barba.', logoUrl: null, website: '#' },
];

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/partners')
      .then(({ data }) => setPartners(data.partners?.length ? data.partners : MOCK_PARTNERS))
      .catch(() => setPartners(MOCK_PARTNERS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-viking-black pt-20">
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-viking-gold text-xs font-semibold tracking-[0.4em] uppercase">Quem apoia</span>
            <h1 className="font-viking text-4xl md:text-5xl font-black text-viking-text-primary mt-3">
              NOSSOS PARCEIROS
            </h1>
            <div className="gold-divider" />
            <p className="text-viking-text-secondary text-lg">
              Marcas e empresas que confiam na qualidade ALEMÃO.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-8 animate-pulse flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-viking-gray-mid" />
                  <div className="h-4 w-3/4 bg-viking-gray-mid rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {partners.map((partner, i) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card-hover p-8 text-center group"
                >
                  {partner.logoUrl ? (
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="w-20 h-20 object-contain mx-auto mb-4 filter grayscale group-hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-viking-gray-mid rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="font-viking font-black text-xl text-gradient-gold">
                        {partner.name?.[0]}
                      </span>
                    </div>
                  )}
                  <h3 className="font-viking font-bold text-viking-text-primary mb-2">{partner.name}</h3>
                  {partner.description && (
                    <p className="text-viking-text-muted text-xs mb-4">{partner.description}</p>
                  )}
                  {partner.website && partner.website !== '#' && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-viking-gold hover:underline"
                    >
                      Visitar <ExternalLink size={10} />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
