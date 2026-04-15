import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import api from '../../utils/api';

const MOCK_PHOTOS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80', caption: 'Corte clássico' },
  { id: '2', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80', caption: 'Barba estilo' },
  { id: '3', url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80', caption: 'Degrade moderno' },
  { id: '4', url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80', caption: 'Ambiente premium' },
  { id: '5', url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80', caption: 'Barbearia Vikings' },
  { id: '6', url: 'https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?w=600&q=80', caption: 'Resultado impecável' },
  { id: '7', url: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fb6b8?w=600&q=80', caption: 'Estilo Viking' },
  { id: '8', url: 'https://images.unsplash.com/photo-1559131397-f94da358f7ca?w=600&q=80', caption: 'Transformação' },
];

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gallery')
      .then(({ data }) => setPhotos(data.photos?.length ? data.photos : MOCK_PHOTOS))
      .catch(() => setPhotos(MOCK_PHOTOS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-viking-black pt-20">
      {/* Header */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-viking-gold text-xs font-semibold tracking-[0.4em] uppercase">Nosso Trabalho</span>
            <h1 className="font-viking text-4xl md:text-5xl font-black text-viking-text-primary mt-3">GALERIA</h1>
            <div className="gold-divider" />
            <p className="text-viking-text-secondary text-lg">Cada foto conta uma história de transformação.</p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-viking-gray rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="break-inside-avoid group relative cursor-pointer rounded-xl overflow-hidden"
                  onClick={() => setSelected(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Vikings Barbearia'}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <ZoomIn
                      size={24}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-white text-xs font-medium">{photo.caption}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              onClick={() => setSelected(null)}
            >
              <X size={28} />
            </button>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selected.url}
                alt={selected.caption}
                className="w-full rounded-2xl shadow-dark-lg"
              />
              {selected.caption && (
                <p className="text-center text-viking-text-secondary mt-3 text-sm">{selected.caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
