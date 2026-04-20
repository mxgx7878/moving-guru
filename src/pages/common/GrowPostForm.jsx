import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, BookOpen, Palmtree, Calendar,
} from 'lucide-react';

import {
  fetchGrowPostDetail,
  fetchMyGrowPosts,
  createGrowPost,
  updateGrowPost,
} from '../../store/actions/grow';
import {
  clearGrowError,
  clearGrowMessage,
  resetSubmitStatus,
} from '../../store/slices/growSlice';
import { ROLE_THEME } from '../../config/portalConfig';
import { STATUS } from '../../constants/apiConstants';
import { EMPTY_GROW_FORM as EMPTY_FORM } from '../../constants/growConstants';
import { Field } from '../../components/ui';
import { postToGrowForm as postToForm } from '../../utils/postToForm';
import { validateGrowForm } from '../../utils/validators';

// Local labels — the Grow form uses longer labels than the public list
// (e.g. "Teacher Training" vs "Training"), so we override the shared icons
// from growConstants to use a different colour palette.
const GROW_TYPES = [
  { id: 'training', label: 'Teacher Training', color: '#2DA4D6', icon: BookOpen },
  { id: 'retreat',  label: 'Retreats',         color: '#6BE6A4', icon: Palmtree },
  { id: 'event',    label: 'Events',           color: '#E89560', icon: Calendar },
];

const DISCIPLINE_LIST = [
  'Reformer Pilates', 'Mat Pilates', 'Vinyasa Yoga', 'Hatha Yoga', 'Yin Yoga',
  'Ashtanga Yoga', 'Barre', 'Breathwork / Pranayama', 'Meditation',
  'Sound Bath / Sound Healing', 'Massage', 'Muay Thai', 'Boxing', 'Kickboxing',
  'Contemporary Dance', 'Dance Movement Therapy', 'Somatic Movement', 'Tai Chi', 'Qigong',
];

// ── Component ────────────────────────────────────────────────────
export default function GrowPostForm() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();

  const { user }     = useSelector((s) => s.auth);
  const { myPosts, posts, submitStatus, submitError, message } =
    useSelector((s) => s.grow);

  const role      = user?.role || 'instructor';
  const theme     = ROLE_THEME[role] || ROLE_THEME.instructor;
  const basePath  = role === 'studio' ? '/studio/grow'
                  : role === 'admin'  ? '/admin/grow'
                  : '/portal/grow';

  const isEditing = Boolean(id);

  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(isEditing);

  // ── Load existing post when editing ────────────────────────────
  // Prefer in-memory post (from myPosts / posts) to avoid extra request.
  const existingPost = useMemo(() => {
    if (!id) return null;
    return (
      myPosts.find((p) => String(p.id) === String(id)) ||
      posts.find((p)   => String(p.id) === String(id)) ||
      null
    );
  }, [id, myPosts, posts]);

  useEffect(() => {
    if (!isEditing) {
      setForm(EMPTY_FORM);
      setLoading(false);
      return;
    }

    if (existingPost) {
      setForm(postToForm(existingPost));
      setLoading(false);
      return;
    }

    // Fallback: fetch detail + my posts so we have the record
    setLoading(true);
    Promise.all([
      dispatch(fetchGrowPostDetail(id)),
      dispatch(fetchMyGrowPosts()),
    ]).then(([detailRes]) => {
      const post = detailRes?.payload?.data;
      if (post) setForm(postToForm(post));
      setLoading(false);
    });
  }, [dispatch, id, isEditing, existingPost]);

  // ── Toast feedback + navigate on success ──────────────────────
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearGrowMessage());
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (submitError) {
      toast.error(submitError);
      dispatch(clearGrowError());
    }
  }, [submitError, dispatch]);

  useEffect(() => {
    if (submitStatus === STATUS.SUCCEEDED) {
      dispatch(resetSubmitStatus());
      navigate(basePath);
    }
  }, [submitStatus, dispatch, navigate, basePath]);

  // ── Handlers ──────────────────────────────────────────────────
  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const toggleDiscipline = (d) => {
    setForm((f) => ({
      ...f,
      disciplines: f.disciplines.includes(d)
        ? f.disciplines.filter((x) => x !== d)
        : [...f.disciplines, d],
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const errs = validateGrowForm(form);
    if (form.date_from && form.date_to && form.date_from > form.date_to) {
      errs.date_to = 'Start date must be before end date';
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      // Surface the first message as a toast so the user gets an at-a-glance hint.
      toast.error(Object.values(errs)[0]);
      return;
    }

    const payload = {
      type:         form.type,
      title:        form.title.trim(),
      subtitle:     form.subtitle.trim(),
      description:  form.description.trim(),
      location:     form.location.trim(),
      date_from:    form.date_from || null,
      date_to:      form.date_to   || null,
      price:        String(form.price || '').trim(),
      spots:        form.spots       !== '' ? Number(form.spots)       : null,
      spots_left:   form.spots_left  !== '' ? Number(form.spots_left)  : null,
      external_url: form.external_url.trim() || null,
      disciplines:  form.disciplines,
      tags:         form.tags_raw.split(',').map((t) => t.trim()).filter(Boolean),
      expiry_date:  form.expiry_date || null,
    };

    if (isEditing) dispatch(updateGrowPost({ id, ...payload }));
    else           dispatch(createGrowPost(payload));
  };

  const isSaving = submitStatus === STATUS.LOADING;

  // ── Render ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#2DA4D6]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(basePath)}
          className="p-2 rounded-xl border border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38] hover:text-[#3E3D38] transition-colors"
          aria-label="Back to Grow">
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="text-[#9A9A94] text-xs font-semibold tracking-widest uppercase">
            Grow
          </p>
          <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">
            {isEditing ? 'Edit Post' : 'Post an Opportunity'}
          </h1>
          <p className="text-[#6B6B66] text-xs mt-0.5">
            {isEditing
              ? 'Update the details for your training, retreat or event.'
              : 'Fill in the details. Your post will go live after admin approval.'}
          </p>
        </div>
      </div>

      {/* ── Form Card ──────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#E5E0D8] p-6 space-y-5">

        {/* Type */}
        <Field label="Type *">
          <div className="flex gap-2">
            {GROW_TYPES.map((t) => {
              const Icon = t.icon;
              const active = form.type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update('type', t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all
                    ${active ? 'text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
                  style={active ? { backgroundColor: t.color, borderColor: t.color } : {}}>
                  <Icon size={12} /> {t.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Title *" error={errors.title}>
          <input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Imagine Studios Thailand — Pilates Teacher Training"
            className={`w-full bg-[#FDFCF8] border rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none
              ${errors.title ? 'border-red-400 focus:border-red-500' : 'border-[#E5E0D8] focus:border-[#2DA4D6]'}`} />
        </Field>

        <Field label="Subtitle">
          <input
            value={form.subtitle}
            onChange={(e) => update('subtitle', e.target.value)}
            placeholder="e.g. Internationally accredited 500h program"
            className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
        </Field>

        <Field label="Description *" error={errors.description}>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={5}
            placeholder="Tell people what this is about, what's included, who it's for..."
            className={`w-full bg-[#FDFCF8] border rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none resize-none
              ${errors.description ? 'border-red-400 focus:border-red-500' : 'border-[#E5E0D8] focus:border-[#2DA4D6]'}`} />
        </Field>

        <Field label="Location *" error={errors.location}>
          <input
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="e.g. Koh Samui, Thailand"
            className={`w-full bg-[#FDFCF8] border rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none
              ${errors.location ? 'border-red-400 focus:border-red-500' : 'border-[#E5E0D8] focus:border-[#2DA4D6]'}`} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date From">
            <input
              type="date"
              value={form.date_from}
              onChange={(e) => update('date_from', e.target.value)}
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </Field>
          <Field label="Date To">
            <input
              type="date"
              value={form.date_to}
              onChange={(e) => update('date_to', e.target.value)}
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Price">
            <input
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              placeholder="e.g. From $3,800 USD"
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </Field>
          <Field label="Total Spots">
            <input
              type="number" min="0"
              value={form.spots}
              onChange={(e) => update('spots', e.target.value)}
              placeholder="12"
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </Field>
          <Field label="Spots Left">
            <input
              type="number" min="0"
              value={form.spots_left}
              onChange={(e) => update('spots_left', e.target.value)}
              placeholder="5"
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </Field>
        </div>

        <Field label="Disciplines">
          <div className="flex flex-wrap gap-2">
            {DISCIPLINE_LIST.map((d) => {
              const active = form.disciplines.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDiscipline(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${active
                      ? 'text-white border-transparent'
                      : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
                  style={active ? { backgroundColor: theme.accent } : {}}>
                  {d}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Tags (comma separated)">
          <input
            value={form.tags_raw}
            onChange={(e) => update('tags_raw', e.target.value)}
            placeholder="e.g. 500h, Accredited, Residential"
            className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
        </Field>

        <Field label="Website / More Info URL">
          <input
            value={form.external_url}
            onChange={(e) => update('external_url', e.target.value)}
            placeholder="https://yourstudio.com/training"
            className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
        </Field>

        <Field label="Auto-remove after (expiry date)" hint="Leave blank to keep the post live indefinitely.">
          <input
            type="date"
            value={form.expiry_date}
            onChange={(e) => update('expiry_date', e.target.value)}
            className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
        </Field>

        {!isEditing && (
          <p className="text-[11px] text-[#9A9A94] bg-[#FDFCF8] rounded-xl p-3 border border-[#E5E0D8]">
            Your post will be reviewed by the Moving Guru team before it goes live.
            You&apos;ll be notified once it&apos;s approved.
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3 border-t border-[#F0EBE3]">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="px-5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm font-semibold text-[#6B6B66] hover:bg-[#F5F0E8] transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            aria-busy={isSaving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ backgroundColor: theme.accent }}>
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isEditing ? 'Save Changes' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
}
