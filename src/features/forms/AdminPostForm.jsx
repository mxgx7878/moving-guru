import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { Modal, Button, Input } from '../../components/ui';
import { POST_TYPES, POST_AUDIENCE_OPTIONS as AUDIENCE_OPTIONS } from '../../constants/postConstants';

const EMPTY_FORM = {
  type: 'announcement',
  title: '',
  body: '',
  audience: 'all',
  cover_url: '',
  link_url: '',
  link_label: '',
  event_date: '',
  event_location: '',
  is_pinned: false,
};

const postToForm = (p) => ({
  type: p.type || 'announcement',
  title: p.title || '',
  body: p.body || '',
  audience: p.audience || 'all',
  cover_url: p.cover_url || '',
  link_url: p.link_url || '',
  link_label: p.link_label || '',
  event_date: p.event_date
    ? new Date(p.event_date).toISOString().slice(0, 16)   // datetime-local
    : '',
  event_location: p.event_location || '',
  is_pinned: Boolean(p.is_pinned),
});

// ── Client-side validation — runs BEFORE dispatch, so the API
//    never sees an obviously-bad payload.
const validate = (form) => {
  const errs = {};
  if (!form.title.trim())  errs.title = 'Title is required';
  if (!form.body.trim())   errs.body  = 'Body is required';
  if (!form.type)          errs.type  = 'Type is required';
  if (!form.audience)      errs.audience = 'Audience is required';

  if (form.type === 'event' && !form.event_date) {
    errs.event_date = 'Event date is required for event posts';
  }

  const urlLike = (v) => !v || /^https?:\/\/.+/i.test(v);
  if (!urlLike(form.cover_url))  errs.cover_url = 'Must be a valid URL starting with http(s)://';
  if (!urlLike(form.link_url))   errs.link_url  = 'Must be a valid URL starting with http(s)://';

  return errs;
};

export default function AdminPostForm({
  post,
  saving = false,
  fieldErrors = null,            // ← from Redux after server validation
  onCancel,
  onSubmit,
}) {
  const isEditing = Boolean(post);
  const [form, setForm] = useState(() => post ? postToForm(post) : EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Merge server-side field errors in whenever they arrive from Redux.
  // We don't overwrite — if the user has started fixing things and local
  // validation cleared a key, respect that.
  useEffect(() => {
    if (fieldErrors) setErrors((prev) => ({ ...fieldErrors, ...prev }));
  }, [fieldErrors]);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();

    // 1. Client-side gate
    const clientErrs = validate(form);
    if (Object.keys(clientErrs).length) {
      setErrors(clientErrs);
      toast.error(Object.values(clientErrs)[0]);
      return;
    }

    // 2. Build payload — normalise empties to null so backend validator
    //    doesn't treat blank strings as invalid URLs etc.
    onSubmit({
      type:           form.type,
      title:          form.title.trim(),
      body:           form.body.trim(),
      audience:       form.audience,
      cover_url:      form.cover_url.trim()  || null,
      link_url:       form.link_url.trim()   || null,
      link_label:     form.link_label.trim() || null,
      event_date:     form.event_date        || null,
      event_location: form.event_location.trim() || null,
      is_pinned:      Boolean(form.is_pinned),
    });
  };

  return (
    <Modal
      open
      size="lg"
      onClose={onCancel}
      title={isEditing ? 'Edit Post' : 'New Post'}
      subtitle="Published posts are visible immediately to the selected audience."
      bodyClassName="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" icon={Check} loading={saving} onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Create Post'}
          </Button>
        </>
      }
    >
      {/* Type */}
      <div>
        <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
          Type *
        </label>
        <div className="flex gap-2">
          {POST_TYPES.map((t) => {
            const Icon = t.icon;
            const active = form.type === t.id;
            return (
              <button key={t.id} type="button" onClick={() => update('type', t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all
                  ${active ? 'text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
                style={active ? { backgroundColor: t.color, borderColor: t.color } : {}}>
                <Icon size={12} /> {t.label}
              </button>
            );
          })}
        </div>
        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
      </div>

      <Input
        label="Title *"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        placeholder="e.g. New Job Listings filter is now live"
        accent="#7F77DD"
        error={errors.title}
      />

      <Input
        textarea
        label="Body *"
        value={form.body}
        onChange={(e) => update('body', e.target.value)}
        rows={5}
        placeholder="Write the announcement, news update or event details here..."
        accent="#7F77DD"
        error={errors.body}
      />

      {/* Audience */}
      <div>
        <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
          Audience *
        </label>
        <div className="flex gap-2">
          {AUDIENCE_OPTIONS.map((o) => {
            const Icon = o.icon;
            const active = form.audience === o.id;
            return (
              <button key={o.id} type="button" onClick={() => update('audience', o.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all
                  ${active
                    ? 'bg-[#7F77DD] text-white border-[#7F77DD]'
                    : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}>
                <Icon size={12} /> {o.label}
              </button>
            );
          })}
        </div>
        {errors.audience && <p className="text-red-500 text-xs mt-1">{errors.audience}</p>}
      </div>

      {/* Event-specific fields */}
      {form.type === 'event' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            label="Event date *"
            value={form.event_date}
            onChange={(e) => update('event_date', e.target.value)}
            accent="#7F77DD"
            error={errors.event_date}
          />
          <Input
            label="Event location"
            value={form.event_location}
            onChange={(e) => update('event_location', e.target.value)}
            placeholder="e.g. Online · Zoom or Bangkok, Thailand"
            accent="#7F77DD"
            error={errors.event_location}
          />
        </div>
      )}

      <Input
        label="Cover image URL"
        value={form.cover_url}
        onChange={(e) => update('cover_url', e.target.value)}
        placeholder="https://..."
        accent="#7F77DD"
        error={errors.cover_url}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Call-to-action URL"
          value={form.link_url}
          onChange={(e) => update('link_url', e.target.value)}
          placeholder="https://..."
          accent="#7F77DD"
          error={errors.link_url}
        />
        <Input
          label="Button label"
          value={form.link_label}
          onChange={(e) => update('link_label', e.target.value)}
          placeholder="e.g. Learn more"
          accent="#7F77DD"
          error={errors.link_label}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-[#3E3D38] cursor-pointer">
        <input type="checkbox" checked={form.is_pinned}
          onChange={(e) => update('is_pinned', e.target.checked)}
          className="w-4 h-4 accent-[#7F77DD]" />
        Pin this post to the top of feeds
      </label>
    </Modal>
  );
}