import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Image, Megaphone } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ui/ImageUpload';

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [banners, setBanners] = useState([]);
  const [tab, setTab] = useState('gallery');
  const [loading, setLoading] = useState(true);
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [photoForm, setPhotoForm] = useState({ url: '', caption: '', category: 'geral' });
  const [bannerForm, setBannerForm] = useState({ title: '', description: '', imageUrl: '', buttonText: 'Agendar', buttonLink: '/agendar' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [gRes, bRes] = await Promise.all([api.get('/gallery'), api.get('/gallery/banners')]);
      setPhotos(gRes.data.photos || []);
      setBanners(bRes.data.banners || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addPhoto = async (e) => {
    e.preventDefault();
    if (!photoForm.url) { toast.error('Selecione uma imagem'); return; }
    setSaving(true);
    try {
      await api.post('/gallery', photoForm);
      toast.success('Foto adicionada');
      setShowPhotoForm(false);
      setPhotoForm({ url: '', caption: '', category: 'geral' });
      load();
    } catch { toast.error('Erro ao adicionar'); }
    finally { setSaving(false); }
  };

  const deletePhoto = async (id) => {
    if (!window.confirm('Remover foto?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      setPhotos((p) => p.filter((photo) => photo.id !== id));
      toast.success('Foto removida');
    } catch { toast.error('Erro ao remover'); }
  };

  const addBanner = async (e) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.imageUrl) { toast.error('Título e imagem obrigatórios'); return; }
    setSaving(true);
    try {
      await api.post('/gallery/banners', bannerForm);
      toast.success('Banner criado');
      setShowBannerForm(false);
      setBannerForm({ title: '', description: '', imageUrl: '', buttonText: 'Agendar', buttonLink: '/agendar' });
      load();
    } catch { toast.error('Erro ao criar banner'); }
    finally { setSaving(false); }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm('Remover banner?')) return;
    try {
      await api.delete(`/gallery/banners/${id}`);
      setBanners((b) => b.filter((banner) => banner.id !== id));
      toast.success('Banner removido');
    } catch { toast.error('Erro ao remover'); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-viking text-2xl font-bold text-viking-text-primary">Galeria & Banners</h1>
        <button
          onClick={() => tab === 'gallery' ? setShowPhotoForm(true) : setShowBannerForm(true)}
          className="btn-gold text-sm flex items-center gap-1.5"
        >
          <Plus size={16} />
          {tab === 'gallery' ? 'Adicionar Foto' : 'Criar Banner'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-viking-gray rounded-xl p-1 mb-6 w-fit">
        {[{ value: 'gallery', label: 'Galeria', icon: Image }, { value: 'banners', label: 'Banners', icon: Megaphone }].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === value ? 'bg-viking-gold text-viking-dark' : 'text-viking-text-secondary hover:text-viking-text-primary'
            }`}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Gallery Tab */}
      {tab === 'gallery' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-viking-gray animate-pulse" />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="card p-12 text-center">
              <Image size={48} className="text-viking-text-muted mx-auto mb-3" />
              <p className="text-viking-text-muted mb-4">Nenhuma foto na galeria</p>
              <button onClick={() => setShowPhotoForm(true)} className="btn-gold">Adicionar primeira foto</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative group aspect-square rounded-xl overflow-hidden"
                >
                  <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 text-white p-2 rounded-lg hover:bg-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                    {photo.caption && (
                      <p className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs text-center px-2">{photo.caption}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Banners Tab */}
      {tab === 'banners' && (
        <div className="space-y-4">
          {banners.length === 0 && !loading && (
            <div className="card p-12 text-center">
              <Megaphone size={48} className="text-viking-text-muted mx-auto mb-3" />
              <p className="text-viking-text-muted mb-4">Nenhum banner ativo</p>
              <button onClick={() => setShowBannerForm(true)} className="btn-gold">Criar primeiro banner</button>
            </div>
          )}
          {banners.map((banner, i) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card overflow-hidden"
            >
              <div className="relative h-40 md:h-52">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-viking font-bold text-white">{banner.title}</h3>
                  {banner.description && <p className="text-gray-300 text-sm">{banner.description}</p>}
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="text-xs text-viking-text-muted">
                  Botão: <span className="text-viking-gold">{banner.buttonText}</span> → {banner.buttonLink}
                </div>
                <button onClick={() => deleteBanner(banner.id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Add Photo */}
      {showPhotoForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowPhotoForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-viking-dark border border-viking-gray-mid rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-viking font-bold text-viking-text-primary mb-4">Adicionar Foto</h3>
            <form onSubmit={addPhoto} className="space-y-3">
              <ImageUpload
                value={photoForm.url}
                onChange={(url) => setPhotoForm((p) => ({ ...p, url }))}
                label="Foto *"
                aspectRatio="square"
                placeholder="Clique para adicionar foto"
              />
              <div>
                <label className="input-label">Legenda</label>
                <input value={photoForm.caption} onChange={(e) => setPhotoForm((p) => ({ ...p, caption: e.target.value }))} placeholder="Descrição da foto" className="input-field" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowPhotoForm(false)} className="btn-ghost flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" /> : 'Adicionar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Create Banner */}
      {showBannerForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowBannerForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-viking-dark border border-viking-gray-mid rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-viking font-bold text-viking-text-primary mb-4">Criar Banner/Promoção</h3>
            <form onSubmit={addBanner} className="space-y-3">
              <div>
                <label className="input-label">Título *</label>
                <input value={bannerForm.title} onChange={(e) => setBannerForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ex: 20% OFF esta semana!" className="input-field" />
              </div>
              <div>
                <label className="input-label">Descrição</label>
                <input value={bannerForm.description} onChange={(e) => setBannerForm((p) => ({ ...p, description: e.target.value }))} placeholder="Detalhes da promoção" className="input-field" />
              </div>
              <ImageUpload
                value={bannerForm.imageUrl}
                onChange={(url) => setBannerForm((p) => ({ ...p, imageUrl: url }))}
                label="Imagem do Banner *"
                aspectRatio="banner"
                placeholder="Clique para adicionar imagem"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Texto do Botão</label>
                  <input value={bannerForm.buttonText} onChange={(e) => setBannerForm((p) => ({ ...p, buttonText: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Link do Botão</label>
                  <input value={bannerForm.buttonLink} onChange={(e) => setBannerForm((p) => ({ ...p, buttonLink: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowBannerForm(false)} className="btn-ghost flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" /> : 'Criar Banner'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
