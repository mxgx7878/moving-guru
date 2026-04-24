import {
  X, MapPin, Building2, Phone, Globe, Instagram, ExternalLink,
  MessageCircle, Heart, Briefcase, Calendar, Clock, GraduationCap,
} from 'lucide-react';
import { Modal, Button } from '../../components/ui';

const OPEN_TO_COLORS = {
  'Direct Hire':     { bg: 'bg-[#2DA4D6]/10', text: 'text-[#2DA4D6]' },
  'Swaps':           { bg: 'bg-[#E89560]/15', text: 'text-[#E89560]' },
  'Energy Exchange': { bg: 'bg-[#6BE6A4]/20', text: 'text-[#3E3D38]' },
};

// Preview modal shown from the Studio Profile editor — renders exactly what
// instructors will see, so studios can verify their details before saving.
export default function StudioPreviewModal({
  form,
  positionLabels = {},
  qualificationLabels = {},
  onClose,
}) {
  const initials = (form.studioName || 'Studio')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isHiring = form.profileStatus === 'active';
  const photos = (form.photos || []).filter(Boolean);

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      hideClose
      headerClassName="hidden"
      bodyClassName="p-0"
      footer={
        <Button variant="accent" onClick={onClose} fullWidth>
          Back to editor
        </Button>
      }
    >
      <div className="relative">
        <div
          className="h-32 rounded-t-2xl"
          style={{ background: 'linear-gradient(135deg, #2DA4D6 0%, #6BE6A4 60%, #f5fca6 100%)' }}
        />
        <button
          onClick={onClose}
          className="absolute top-3 left-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          aria-label="Close preview"
        >
          <X size={14} className="text-[#3E3D38]" />
        </button>
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/85 text-[#3E3D38] backdrop-blur-sm">
          Preview
        </span>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-[#2DA4D6] to-[#2590bd] flex items-center justify-center">
            {form.avatarPreview
              ? <img src={form.avatarPreview} alt={form.studioName} className="w-full h-full object-cover" />
              : <span className="font-unbounded text-xl font-black text-white">{initials}</span>}
          </div>
        </div>
      </div>

      <div className="pt-12 pb-6 px-6">
        <div className="text-center mb-4">
          <h2 className="font-unbounded text-lg font-black text-[#3E3D38]">
            {form.studioName || 'Your Studio Name'}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1 text-[#9A9A94] text-xs">
            {form.contactName && <span>Managed by {form.contactName}</span>}
            {form.studioSize && <span>· {form.studioSize}</span>}
          </div>

          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold
              ${isHiring ? 'bg-[#6BE6A4]/20 text-[#3E3D38]' : 'bg-[#FBF8E4] text-[#6B6B66]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isHiring ? 'bg-[#6BE6A4]' : 'bg-[#9A9A94]'}`} />
              {isHiring ? 'Actively Hiring' : 'Not Hiring'}
            </span>
            {form.instagram && (
              <a
                href={form.instagram.startsWith('http') ? form.instagram : `https://instagram.com/${form.instagram.replace('@', '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C]/20"
              >
                <Instagram size={11} /> {form.instagram}
              </a>
            )}
            {form.website && (
              <a
                href={form.website.startsWith('http') ? form.website : `https://${form.website}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#2DA4D6]/10 text-[#2DA4D6] hover:bg-[#2DA4D6]/20"
              >
                <Globe size={11} /> Website <ExternalLink size={9} />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {(form.location || form.country) && (
            <InfoTile label="Location" icon={<MapPin size={10} />} value={[form.location, form.country].filter(Boolean).join(', ')} />
          )}
          {form.studioSize && (
            <InfoTile label="Studio Size" icon={<Building2 size={10} />} value={form.studioSize} />
          )}
          {form.phone && (
            <InfoTile label="Phone" icon={<Phone size={10} />} value={form.phone} />
          )}
          {form.openTo?.length > 0 && (
            <div className="bg-[#FBF8E4]/60 rounded-xl p-3">
              <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Open To</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {form.openTo.map(o => {
                  const c = OPEN_TO_COLORS[o] || { bg: 'bg-[#FBF8E4]', text: 'text-[#6B6B66]' };
                  return (
                    <span key={o} className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${c.bg} ${c.text}`}>{o}</span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {isHiring && form.hiringRoleDescription && (
          <div className="mb-4 bg-[#6BE6A4]/10 border border-[#6BE6A4]/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={13} className="text-[#3E3D38]" />
              <p className="text-[10px] text-[#3E3D38] uppercase tracking-wider font-bold">Currently Hiring</p>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.hiringPositionType && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3E3D38] text-white">
                  {positionLabels[form.hiringPositionType] || form.hiringPositionType}
                </span>
              )}
              {form.hiringQualificationLevel && form.hiringQualificationLevel !== 'none' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5fca6] text-[#3E3D38]">
                  <GraduationCap size={10} />
                  {qualificationLabels[form.hiringQualificationLevel] || form.hiringQualificationLevel}
                </span>
              )}
            </div>
            <p className="text-[#3E3D38] text-xs leading-relaxed whitespace-pre-line">
              {form.hiringRoleDescription}
            </p>
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-[#6BE6A4]/30">
              {form.hiringStartDate && (
                <span className="flex items-center gap-1 text-[10px] text-[#3E3D38] font-medium">
                  <Calendar size={10} /> Starts {form.hiringStartDate}
                </span>
              )}
              {form.hiringDuration && (
                <span className="flex items-center gap-1 text-[10px] text-[#3E3D38] font-medium">
                  <Clock size={10} /> {form.hiringDuration}
                </span>
              )}
              {form.hiringCompensation && (
                <span className="text-[10px] text-[#3E3D38] font-semibold">
                  {form.hiringCompensation}
                </span>
              )}
            </div>
          </div>
        )}

        {form.disciplines?.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-2">Disciplines Offered</p>
            <div className="flex flex-wrap gap-1.5">
              {form.disciplines.map(d => (
                <span key={d} className="px-2.5 py-1 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full">{d}</span>
              ))}
            </div>
          </div>
        )}

        {form.bio && (
          <div className="mb-4">
            <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-2">About the Studio</p>
            <p className="text-[#6B6B66] text-sm leading-relaxed whitespace-pre-line">{form.bio}</p>
          </div>
        )}

        {photos.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-2">Gallery</p>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((p, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#FBF8E4]">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-[#E5E0D8]">
          <Button variant="secondary" icon={Heart} disabled title="Preview only">Save</Button>
          <Button variant="primary" icon={MessageCircle} disabled title="Preview only" fullWidth>
            Send Message
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function InfoTile({ label, value, icon }) {
  return (
    <div className="bg-[#FBF8E4]/60 rounded-xl p-3">
      <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">{label}</p>
      <p className="text-[#3E3D38] text-xs font-medium flex items-center gap-1">
        {icon && <span className="text-[#9A9A94]">{icon}</span>} {value}
      </p>
    </div>
  );
}
