import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Lock, Star, Save, Eye, EyeOff, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ui/ImageUpload';

export default function ClientProfile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [services, setServices] = useState([]);
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferredService: user?.preferredService || '',
    avatar: user?.avatar || '',
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    api.get('/services').then(({ data }) => setServices(data.services || [])).catch(() => {});
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error('Nome obrigatório'); return; }
    setLoading(true);
    try {
      await updateProfile(profile);
      toast.success('Perfil atualizado!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao atualizar');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.new) { toast.error('Preencha todos os campos'); return; }
    if (passwords.new.length < 6) { toast.error('Nova senha muito curta'); return; }
    if (passwords.new !== passwords.confirm) { toast.error('As senhas não coincidem'); return; }
    setLoading(true);
    try {
      await changePassword(passwords.current, passwords.new);
      toast.success('Senha alterada com sucesso!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-viking text-2xl font-bold text-viking-text-primary">Meu Perfil</h1>
        <p className="text-viking-text-muted text-sm mt-1">Gerencie suas informações pessoais</p>
      </div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
        <div className="relative">
          {profile.avatar ? (
            <img src={profile.avatar} alt={user?.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-viking-gold/30" />
          ) : (
            <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center shadow-gold">
              <span className="font-viking font-black text-2xl text-viking-dark">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setTab('profile')}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-viking-gold rounded-full flex items-center justify-center shadow"
          >
            <Camera size={11} className="text-viking-dark" />
          </button>
        </div>
        <div>
          <p className="font-semibold text-viking-text-primary">{user?.name}</p>
          <p className="text-viking-text-muted text-sm">{user?.email}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-viking-gray rounded-xl p-1 mb-6">
        {[
          { value: 'profile', label: 'Dados Pessoais' },
          { value: 'password', label: 'Alterar Senha' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === value ? 'bg-viking-gold text-viking-dark' : 'text-viking-text-secondary hover:text-viking-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <motion.form onSubmit={handleProfileSave} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <ImageUpload
            value={profile.avatar}
            onChange={(url) => setProfile((p) => ({ ...p, avatar: url }))}
            label="Foto de Perfil"
            aspectRatio="square"
            placeholder="Clique para adicionar foto"
          />

          <div>
            <label className="input-label">
              <User size={13} className="inline mr-1.5" />
              Nome completo
            </label>
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="input-field"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="input-label">
              <Mail size={13} className="inline mr-1.5" />
              Email
            </label>
            <input value={user?.email} disabled className="input-field opacity-60 cursor-not-allowed" />
            <p className="text-xs text-viking-text-muted mt-1">O email não pode ser alterado</p>
          </div>

          <div>
            <label className="input-label">
              <Phone size={13} className="inline mr-1.5" />
              Telefone / WhatsApp
            </label>
            <input
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              className="input-field"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="input-label">
              <Star size={13} className="inline mr-1.5" />
              Serviço favorito
            </label>
            <select
              value={profile.preferredService}
              onChange={(e) => setProfile((p) => ({ ...p, preferredService: e.target.value }))}
              className="input-field"
            >
              <option value="">Nenhum selecionado</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.name}>{svc.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save size={16} />Salvar Alterações</>
            )}
          </button>
        </motion.form>
      )}

      {tab === 'password' && (
        <motion.form onSubmit={handlePasswordSave} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {[
            { key: 'current', label: 'Senha atual', placeholder: 'Digite a senha atual' },
            { key: 'new', label: 'Nova senha', placeholder: 'Mínimo 6 caracteres' },
            { key: 'confirm', label: 'Confirmar nova senha', placeholder: 'Repita a nova senha' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="input-label">
                <Lock size={13} className="inline mr-1.5" />
                {label}
              </label>
              <div className="relative">
                <input
                  type={showPass[key] ? 'text' : 'password'}
                  value={passwords[key]}
                  onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => ({ ...p, [key]: !p[key] }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-viking-text-muted"
                >
                  {showPass[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-viking-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Lock size={16} />Alterar Senha</>
            )}
          </button>
        </motion.form>
      )}
    </div>
  );
}
