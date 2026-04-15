import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const whatsapp = import.meta.env.VITE_WHATSAPP || '5500000000000';
  const message = encodeURIComponent('Olá! Gostaria de agendar um horário na ALEMÃO Barbearia.');

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {visible && !dismissed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="relative bg-viking-gray border border-viking-gray-mid rounded-2xl px-4 py-3 shadow-lg max-w-[220px]"
          >
            <button
              onClick={() => setDismissed(true)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-viking-gray-mid rounded-full flex items-center justify-center text-viking-text-muted hover:text-viking-text-primary"
              aria-label="Fechar"
            >
              <X size={11} />
            </button>
            <p className="text-xs text-viking-text-secondary leading-snug">
              Agende pelo WhatsApp agora mesmo! 💈
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={`https://wa.me/${whatsapp}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', damping: 12 }}
        className="w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-lg transition-colors"
        aria-label="WhatsApp"
        onClick={() => setDismissed(true)}
      >
        <MessageCircle size={26} className="text-white" fill="white" strokeWidth={0} />
      </motion.a>
    </div>
  );
}
