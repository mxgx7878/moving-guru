import { X, MapPin, Calendar, Globe, MessageCircle, Heart, Star, Instagram, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

const SOCIAL_ICONS = {
  instagram: { color: '#E1306C', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg> },
  facebook:  { color: '#1877F2', icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
  twitter:   { color: '#000', icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{width:12,height:12}}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  tiktok:    { color: '#010101', icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3 6.34 6.34 0 0 0 9.49 21.64a6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z"/></svg> },
  youtube:   { color: '#FF0000', icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  linkedin:  { color: '#0A66C2', icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
};

export default function InstructorProfileModal({ instructor, isSaved, onClose, onMessage, onToggleSave }) {
  if (!instructor) return null;

  const initials = instructor.initials ||
    instructor.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const travelingTo  = instructor.travelingTo  || instructor.traveling_to  || '';
  const countryFrom  = instructor.countryFrom   || instructor.country_from  || instructor.location || '';
  const openTo       = instructor.openTo        || instructor.open_to       || [];
  const availability = instructor.availability  || '';
  const languages    = instructor.languages     || [];
  const photos       = instructor.gallery_photos || instructor.photos || [];

  // Parse social_links array → flat
  const socials = {};
  (instructor.social_links || []).forEach(obj => {
    if (!obj) return;
    const k = Object.keys(obj)[0];
    if (k) socials[k] = obj[k];
  });
  // Also direct fields
  if (instructor.instagram) socials.instagram = instructor.instagram;
  const hasSocials = Object.keys(socials).length > 0;

  const openToColors = {
    'Direct Hire':      { bg: 'bg-[#2DA4D6]/10', text: 'text-[#2DA4D6]' },
    'Swaps':            { bg: 'bg-[#E89560]/15', text: 'text-[#E89560]' },
    'Energy Exchange':  { bg: 'bg-[#6BE6A4]/20', text: 'text-[#3E3D38]' },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Cover + Avatar ── */}
        <div className="relative flex-shrink-0">
          {/* Cover */}
          <div
            className="h-32 rounded-t-2xl"
            style={{
              background: instructor.background_image
                ? `url(${instructor.background_image}) center/cover no-repeat`
                : 'linear-gradient(135deg, #CE4F56 0%, #E89560 40%, #f5fca6 70%, #6BE6A4 100%)'
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <X size={14} className="text-[#3E3D38]" />
          </button>

          {/* Save / favourite button */}
          <button
            onClick={onToggleSave}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all
              ${isSaved ? 'bg-[#CE4F56] shadow-md' : 'bg-white/80 hover:bg-white'}`}
          >
            <Heart size={14} className={isSaved ? 'text-white fill-white' : 'text-[#3E3D38]'} />
          </button>

          {/* Avatar */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center">
              {instructor.profile_picture
                ? <img src={instructor.profile_picture} alt={instructor.name} className="w-full h-full object-cover" />
                : <span className="font-['Unbounded'] text-xl font-black text-white">{initials}</span>
              }
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="pt-12 pb-6 px-6">

          {/* Name + basics */}
          <div className="text-center mb-4">
            <h2 className="font-['Unbounded'] text-lg font-black text-[#3E3D38]">{instructor.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1 text-[#9A9A94] text-xs">
              {instructor.age && <span>{instructor.age} yrs</span>}
              {instructor.pronouns && <span>· {instructor.pronouns}</span>}
              {instructor.studio && <span>· {instructor.studio}</span>}
            </div>

            {/* Status badge */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#6BE6A4]/20 text-[#3E3D38]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6BE6A4]" />
                Actively Seeking
              </span>
            </div>

            {/* Social links */}
            {hasSocials && (
              <div className="flex items-center justify-center gap-2 mt-3">
                {Object.entries(socials).map(([k, url]) => {
                  const s = SOCIAL_ICONS[k];
                  if (!s || !url) return null;
                  return (
                    <a key={k} href={url} target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-all"
                      style={{ backgroundColor: s.color + '15', color: s.color }}
                      title={k}
                    >
                      {s.icon}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Info grid (matches design image) ── */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {countryFrom && (
              <div className="bg-[#EDE8DF]/50 rounded-xl p-3">
                <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Country From → To</p>
                <p className="text-[#3E3D38] text-xs font-medium">
                  {countryFrom}{travelingTo ? ` → ${travelingTo}` : ''}
                </p>
              </div>
            )}
            {availability && (
              <div className="bg-[#EDE8DF]/50 rounded-xl p-3">
                <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Availability</p>
                <p className="text-[#3E3D38] text-xs font-medium flex items-center gap-1">
                  <Calendar size={10} className="text-[#9A9A94]" /> {availability}
                </p>
              </div>
            )}
            {languages.length > 0 && (
              <div className="bg-[#EDE8DF]/50 rounded-xl p-3">
                <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Languages</p>
                <p className="text-[#3E3D38] text-xs font-medium">{languages.join(', ')}</p>
              </div>
            )}
            {openTo.length > 0 && (
              <div className="bg-[#EDE8DF]/50 rounded-xl p-3">
                <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Open To</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {openTo.map(o => {
                    const c = openToColors[o] || { bg: 'bg-[#EDE8DF]', text: 'text-[#6B6B66]' };
                    return (
                      <span key={o} className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${c.bg} ${c.text}`}>{o}</span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Disciplines ── */}
          {(instructor.disciplines || []).length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-2">Disciplines</p>
              <div className="flex flex-wrap gap-1.5">
                {(instructor.disciplines || []).map(d => (
                  <span key={d} className="px-2.5 py-1 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full">{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── Bio ── */}
          {instructor.bio && (
            <div className="mb-4">
              <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-2">About</p>
              <p className="text-[#6B6B66] text-sm leading-relaxed">{instructor.bio}</p>
            </div>
          )}

          {/* ── What I'm Looking For ── */}
          {(instructor.lookingFor || instructor.looking_for) && (
            <div className="mb-4 bg-[#2DA4D6]/8 rounded-xl p-3 border border-[#2DA4D6]/15">
              <p className="text-[10px] text-[#2DA4D6] uppercase tracking-wider font-bold mb-1.5">What I'm Looking For</p>
              <p className="text-[#6B6B66] text-xs leading-relaxed">
                {instructor.lookingFor || instructor.looking_for}
              </p>
            </div>
          )}

          {/* ── Gallery photos ── */}
          {photos.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-2">Gallery</p>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#EDE8DF]">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CTA buttons ── */}
          <div className="flex gap-3 pt-2 border-t border-[#E5E0D8]">
            <button
              onClick={onToggleSave}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border transition-all
                ${isSaved
                  ? 'border-[#CE4F56] text-[#CE4F56] bg-[#CE4F56]/5 hover:bg-[#CE4F56]/10'
                  : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#CE4F56] hover:text-[#CE4F56]'}`}
            >
              <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={onMessage}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#2DA4D6] text-white rounded-xl text-sm font-bold hover:bg-[#2590bd] transition-all"
            >
              <MessageCircle size={15} /> Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}