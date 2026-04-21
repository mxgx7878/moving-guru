import { useState } from 'react';
import { toast } from 'sonner';
import {
  Calendar, Megaphone, Bell, Globe, Users, Building2, Check,
} from 'lucide-react';
import { Modal, Button, Input } from '../../components/ui';

const POST_TYPES = [
  { id: 'announcement', label: 'Announcement', icon: Megaphone, color: '#7F77DD' },
  { id: 'event',        label: 'Event',        icon: Calendar,  color: '#E89560' },
  { id: 'news',         label: 'News',         icon: Bell,      color: '#2DA4D6' },
];

const AUDIENCE_OPTIONS = [
  { id: 'all',         label: 'Everyone',    icon: Globe },
  { id: 'instructors', label: 'Instructors', icon: Users },
  { id: 'studios',     label: 'Studios',     icon: Building2 },
];

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
  event_date: p.event_date || '',
  event_location: p.event_location || '',
  is_pinned: Boolean(p.is_pinned),
});

// Admin broadcast-post form. Handles announcements, news and events — the
// event type surfaces extra date/location fields.
export default function AdminPostForm({ post, saving = false, onCancel, onSubmit }) {
  const isEditing = Boolean(post);
  const [form, setForm] = useState(() => post ? postToForm(post) : EMPTY_FORM);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.body.trim()) return toast.error('Body is required');
    if (form.type === 'event' && !form.event_date) {
      return toast.error('Event date is required for event posts');
    }

    onSubmit({
      type: form.type,
      title: form.title.trim(),
      body: form.body.trim(),
      audience: form.audience,
      cover_url: form.cover_url.trim() || null,
      link_url: form.link_url.trim() || null,
      link_label: form.link_label.trim() || null,
      event_date: form.event_date || null,
      event_location: form.event_location.trim() || null,
      is_pinned: Boolean(form.is_pinned),
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
      <div>
        <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Type *</label>
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
      </div>

      <Input
        label="Title *"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        placeholder="e.g. New Job Listings filter is now live"
        accent="#7F77DD"
      />

      <Input
        textarea
        label="Body *"
        value={form.body}
        onChange={(e) => update('body', e.target.value)}
        rows={5}
        placeholder="Write the announcement, news update or event details here..."
        accent="#7F77DD"
      />

      <div>
        <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Audience *</label>
        <div className="flex gap-2">
          {AUDIENCE_OPTIONS.map((o) => {
            const Icon = o.icon;
            const active = form.audience === o.id;
            return (
              <button key={o.id} type="button" onClick={() => update('audience', o.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all
                  ${active ? 'bg-[#7F77DD] text-white border-[#7F77DD]' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}>
                <Icon size={12} /> {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {form.type === 'event' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            label="Event date *"
            value={form.event_date}
            onChange={(e) => update('event_date', e.target.value)}
            accent="#7F77DD"
          />
          <Input
            label="Event location"
            value={form.event_location}
            onChange={(e) => update('event_location', e.target.value)}
            placeholder="e.g. Online · Zoom or Bangkok, Thailand"
            accent="#7F77DD"
          />
        </div>
      )}

      <Input
        label="Cover image URL"
        value={form.cover_url}
        onChange={(e) => update('cover_url', e.target.value)}
        placeholder="https://..."
        accent="#7F77DD"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Call-to-action URL"
          value={form.link_url}
          onChange={(e) => update('link_url', e.target.value)}
          placeholder="https://..."
          accent="#7F77DD"
        />
        <Input
          label="Button label"
          value={form.link_label}
          onChange={(e) => update('link_label', e.target.value)}
          placeholder="e.g. Learn more"
          accent="#7F77DD"
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
