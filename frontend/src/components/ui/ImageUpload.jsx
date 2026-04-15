import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

/**
 * Componente reutilizável de upload de imagem
 * Props:
 *  - value: URL atual da imagem
 *  - onChange: callback(url) chamado após upload ou remoção
 *  - label: texto do label (opcional)
 *  - aspectRatio: 'square' | 'video' | 'banner' (opcional, default 'video')
 *  - placeholder: texto do botão (opcional)
 */
export default function ImageUpload({
  value,
  onChange,
  label,
  aspectRatio = 'video',
  placeholder = 'Clique para adicionar imagem',
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const heights = {
    square: 'h-36',
    video: 'h-40',
    banner: 'h-48',
    logo: 'h-28',
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.url);
      toast.success('Imagem enviada!');
    } catch {
      toast.error('Erro ao enviar imagem. Verifique o Firebase Storage.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      {label && <label className="input-label">{label}</label>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        className="hidden"
        tabIndex={-1}
      />

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="preview"
            className={`w-full ${heights[aspectRatio]} object-cover rounded-xl`}
          />
          {/* Overlay com botão de remover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-xl flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-viking-gold text-viking-dark text-xs font-semibold px-3 py-1.5 rounded-lg"
            >
              Trocar
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-1.5 rounded-lg"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`w-full ${heights[aspectRatio]} border-2 border-dashed border-viking-gray-light rounded-xl flex flex-col items-center justify-center gap-2 hover:border-viking-gold/50 hover:bg-viking-gold/5 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {uploading ? (
            <Loader2 size={24} className="text-viking-gold animate-spin" />
          ) : (
            <ImagePlus size={24} className="text-viking-text-muted" />
          )}
          <span className="text-sm text-viking-text-muted">
            {uploading ? 'Enviando...' : placeholder}
          </span>
          <span className="text-xs text-viking-text-muted opacity-60">
            JPG, PNG ou WEBP — máx. 5MB
          </span>
        </button>
      )}
    </div>
  );
}
