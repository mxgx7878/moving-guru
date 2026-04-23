import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Upload, Image as ImageIcon, X } from 'lucide-react';

import {
  fetchGrowPostDetail,
  fetchMyGrowPosts,
  createGrowPost,
  updateGrowPost,
} from '../../store/actions/grow';
import {
  clearGrowError, clearGrowMessage, resetSubmitStatus,
} from '../../store/slices/growSlice';
import { ROLE_THEME } from '../../config/portalConfig';
import { STATUS } from '../../constants/apiConstants';
import {
  GROW_TYPES, EMPTY_GROW_FORM as EMPTY_FORM,
} from '../../constants/growConstants';
import { Field, Button, TabBar } from '../../components/ui';
import {
  MissingLinkConfirmModal, GrowPaymentModal,
} from '../../features/modals';
import { postToGrowForm as postToForm } from '../../utils/postToForm';
import { validateGrowForm } from '../../utils/validators';

const DISCIPLINE_LIST = [
  'Reformer Pilates', 'Mat Pilates', 'Vinyasa Yoga', 'Hatha Yoga', 'Yin Yoga',
  'Ashtanga Yoga', 'Barre', 'Breathwork / Pranayama', 'Meditation',
  'Sound Bath / Sound Healing', 'Massage', 'Muay Thai', 'Boxing', 'Kickboxing',
  'Contemporary Dance', 'Dance Movement Therapy', 'Somatic Movement', 'Tai Chi', 'Qigong',
];

// Read a File as base64 — backend accepts strings under images[].
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload  = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Could not read image'));
  reader.readAsDataURL(file);
});

export default function GrowPostForm() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const imageRef     = useRef(null);

  const { user }     = useSelector((s) => s.auth);
  const { myPosts, posts, submitStatus, submitError, message } =
    useSelector((s) => s.grow);

  const role      = user?.role || 'instructor';
  const theme     = ROLE_THEME[role] || ROLE_THEME.instructor;
  const basePath  = role === 'studio' ? '/studio/grow'
                  : role === 'admin'  ? '/admin/grow'
                  : '/portal/grow';

  const isEditing = Boolean(id);

  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(isEditing);
  const [linkModal, setLinkModal] = useState(false);   // missing-link confirm
  const [payModal, setPayModal]   = useState(false);   // payment gate (create only)

  // ── Load existing post when editing ────────────────────────────
  const existingPost = useMemo(() => {
    if (!id) return null;
    return (
      myPosts.find((p) => String(p.id) === String(id)) ||
      posts.find((p)   => String(p.id) === String(id)) ||
      null
    );
  }, [id, myPosts, posts]);

  useEffect(() => {
    if (!isEditing) { setForm(EMPTY_FORM); setLoading(false); return; }
    if (existingPost) { setForm(postToForm(existingPost)); setLoading(false); return; }
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

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearGrowMessage()); }
  }, [message, dispatch]);

  useEffect(() => {
    if (submitError) { toast.error(submitError); dispatch(clearGrowError()); }
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

 const handleImagePick = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  // Basic safety check — match the Laravel validation we'll add on the backend.
  if (!file.type.startsWith('image/')) {
    toast.error('Please choose an image file (jpg, png, gif, or webp).');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image must be under 5 MB.');
    return;
  }
  // Revoke the previous blob URL so we don't leak memory on repeated picks.
  if (form.cover_image && form.cover_image.startsWith('blob:')) {
    URL.revokeObjectURL(form.cover_image);
  }
  setForm((f) => ({
    ...f,
    cover_image:      URL.createObjectURL(file),  // preview only
    cover_image_file: file,                       // the real File to send
  }));
};

// Also tighten `clearImage` so it marks for removal on edit.
const clearImage = () => {
  if (form.cover_image && form.cover_image.startsWith('blob:')) {
    URL.revokeObjectURL(form.cover_image);
  }
  setForm((f) => ({
    ...f,
    cover_image:        null,
    cover_image_file:   null,
    remove_cover_image: true, // tells backend to wipe the existing image on save
  }));
};

  // ── Validate + decide whether to show link / payment modals ───
  const runPreSubmitChecks = () => {
    const errs = validateGrowForm(form);
    if (form.date_from && form.date_to && form.date_from > form.date_to) {
      errs.date_to = 'Start date must be before end date';
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error(Object.values(errs)[0]);
      return false;
    }
    return true;
  };

  // Submit flow:
  //   1. validate
  //   2. if no external_url → show MissingLinkConfirmModal
  //      └─ "Go back" (cancel)  |  "Submit without link" (continue)
  //   3. if creating (not editing) → show GrowPaymentModal (pick tier, pay)
  //      └─ on success, writes expiry_date + dispatches createGrowPost
  //   4. if editing → dispatch updateGrowPost directly (no payment)
  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!runPreSubmitChecks()) return;

    if (!form.external_url.trim()) {
      setLinkModal(true);
      return;
    }
    proceedToPaymentOrSave();
  };

  const proceedToPaymentOrSave = () => {
    if (isEditing) {
      dispatchSave({ expiry_date: form.expiry_date || null, pricing_tier: null });
    } else {
      setPayModal(true);
    }
  };

  // Build the API payload and dispatch create or update.
const dispatchSave = ({ expiry_date, pricing_tier }) => {
  const showSpots = !!form.show_spots;
  const fd = new FormData();

  // Scalars
  fd.append('type',        form.type);
  fd.append('title',       form.title.trim());
  fd.append('subtitle',    form.subtitle.trim());
  fd.append('description', form.description.trim());
  fd.append('location',    form.location.trim());
  fd.append('price',       String(form.price || '').trim());

  // Nullable fields — only append when present so backend sees them as
  // "not supplied" rather than empty string.
  if (form.date_from)       fd.append('date_from',    form.date_from);
  if (form.date_to)         fd.append('date_to',      form.date_to);
  if (form.external_url?.trim()) fd.append('external_url', form.external_url.trim());
  if (expiry_date)          fd.append('expiry_date',  expiry_date);
  if (pricing_tier)         fd.append('pricing_tier', pricing_tier);

  // Spots — only sent when the author opted in.
  if (showSpots) {
    if (form.spots      !== '') fd.append('spots',      String(Number(form.spots)));
    if (form.spots_left !== '') fd.append('spots_left', String(Number(form.spots_left)));
  }

  // Arrays — bracket notation, same as profile updateProfile FormData build.
  (form.disciplines || []).forEach((d, i) => fd.append(`disciplines[${i}]`, d));
  const tags = form.tags_raw.split(',').map((t) => t.trim()).filter(Boolean);
  tags.forEach((t, i) => fd.append(`tags[${i}]`, t));

  // Cover image — the actual File object, mirror of profile_picture handling.
  if (form.cover_image_file instanceof File) {
    fd.append('cover_image', form.cover_image_file);
  }
  // Signal removal on edit when the user cleared the existing image without
  // picking a new one.
  if (form.remove_cover_image) {
    fd.append('remove_cover_image', '1');
  }

  if (isEditing) dispatch(updateGrowPost({ id, formData: fd }));
  else           dispatch(createGrowPost(fd));
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

  const inp = "w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]";

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(basePath)}
          className="p-2 rounded-xl border border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38] hover:text-[#3E3D38] transition-colors"
          aria-label="Back to Grow">
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="text-[#9A9A94] text-xs font-semibold tracking-widest uppercase">Grow</p>
          <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">
            {isEditing ? 'Edit Post' : 'Post an Opportunity'}
          </h1>
          <p className="text-[#6B6B66] text-xs mt-0.5">
            {isEditing
              ? 'Update your post. Every edit is reviewed before going live again.'
              : 'Fill in the details. Payment is collected after you review your post.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#E5E0D8] p-6 space-y-5">

        {/* Type */}
        <Field label="Type *">
          <TabBar
            tabs={GROW_TYPES}
            activeId={form.type}
            onChange={(tid) => update('type', tid)}
            layout="stretch"
            size="md"
          />
        </Field>

        {/* Cover image */}
        <Field
          label="Cover image"
          hint="Shown at the top of your post preview and on the full detail view."
        >
          <div
            onClick={() => !form.cover_image && imageRef.current?.click()}
            className={`w-full h-48 rounded-xl overflow-hidden relative bg-[#FDFCF8]
              ${form.cover_image
                ? 'border border-[#E5E0D8]'
                : 'border-2 border-dashed border-[#E5E0D8] hover:border-[#2DA4D6] cursor-pointer'}`}
          >
            {form.cover_image ? (
              <>
                <img src={form.cover_image} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
                  aria-label="Remove image"
                >
                  <X size={14} className="text-[#3E3D38]" />
                </button>
                <button
                  type="button"
                  onClick={() => imageRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center gap-1 text-xs font-semibold bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow hover:bg-white"
                >
                  <Upload size={12} /> Change
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <ImageIcon size={26} className="text-[#3E3D38]/25" />
                <p className="text-xs text-[#3E3D38]/50 mt-2 font-medium">
                  Click to upload a cover image
                </p>
                <p className="text-[10px] text-[#9A9A94] mt-0.5">
                  JPG or PNG recommended
                </p>
              </div>
            )}
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagePick}
            />
          </div>
        </Field>

        <Field label="Title *" error={errors.title}>
          <input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Imagine Studios Thailand — Pilates Teacher Training"
            className={`${inp} ${errors.title ? 'border-red-400 focus:border-red-500' : ''}`} />
        </Field>

        <Field label="Subtitle">
          <input
            value={form.subtitle}
            onChange={(e) => update('subtitle', e.target.value)}
            placeholder="e.g. Internationally accredited 500h program"
            className={inp} />
        </Field>

        <Field label="Description *" error={errors.description}>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={5}
            placeholder="Tell people what this is about, what's included, who it's for..."
            className={`${inp} resize-none ${errors.description ? 'border-red-400 focus:border-red-500' : ''}`} />
        </Field>

        <Field label="Location *" error={errors.location}>
          <input
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="e.g. Koh Samui, Thailand"
            className={`${inp} ${errors.location ? 'border-red-400 focus:border-red-500' : ''}`} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date From">
            <input
              type="date"
              value={form.date_from}
              onChange={(e) => update('date_from', e.target.value)}
              className={inp} />
          </Field>
          <Field label="Date To">
            <input
              type="date"
              value={form.date_to}
              onChange={(e) => update('date_to', e.target.value)}
              className={inp} />
          </Field>
        </div>

        <Field label="Price">
          <input
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            placeholder="e.g. From $3,800 USD"
            className={inp} />
        </Field>

        {/* Spots toggle */}
        <div className="pt-1">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!form.show_spots}
              onChange={(e) => update('show_spots', e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#2DA4D6] flex-shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-[#3E3D38]">
                Show spots left on this post
              </p>
              <p className="text-xs text-[#9A9A94] mt-0.5">
                Turn this on if you can keep the spots-left number up to date.
                Leave it off to hide the spots information entirely.
              </p>
            </div>
          </label>
        </div>

        {form.show_spots && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7 border-l-2 border-[#E5E0D8]">
            <Field label="Total Spots">
              <input
                type="number" min="0"
                value={form.spots}
                onChange={(e) => update('spots', e.target.value)}
                placeholder="12"
                className={inp} />
            </Field>
            <Field label="Spots Left">
              <input
                type="number" min="0"
                value={form.spots_left}
                onChange={(e) => update('spots_left', e.target.value)}
                placeholder="5"
                className={inp} />
            </Field>
          </div>
        )}

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
                    ${active ? 'text-white border-transparent' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
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
            className={inp} />
        </Field>

        <Field
          label="Website / More Info URL"
          hint="Optional — if omitted, you'll be asked to confirm before submitting."
        >
          <input
            value={form.external_url}
            onChange={(e) => update('external_url', e.target.value)}
            placeholder="https://yourstudio.com/training"
            className={inp} />
        </Field>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate(basePath)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSaving}>
            {isEditing ? 'Save changes' : 'Review & pay'}
          </Button>
        </div>
      </form>

      {/* Missing-link confirmation */}
      <MissingLinkConfirmModal
        open={linkModal}
        onCancel={() => setLinkModal(false)}
        onConfirm={() => { setLinkModal(false); proceedToPaymentOrSave(); }}
      />

      {/* Payment gate (create only) */}
      <GrowPaymentModal
        open={payModal}
        onCancel={() => setPayModal(false)}
        onPaid={({ expiry_date, tier }) => {
          setPayModal(false);
          dispatchSave({ expiry_date, pricing_tier: tier });
        }}
      />
    </div>
  );
}