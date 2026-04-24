import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

import { Modal, Button, RHFInput, TabBar, Field } from '../../components/ui';
import { POST_TYPES, POST_AUDIENCE_OPTIONS as AUDIENCE_OPTIONS } from '../../constants/postConstants';

const AUDIENCE_TABS = AUDIENCE_OPTIONS.map((o) => ({ ...o, color: '#7F77DD' }));

const urlField = yup
  .string()
  .nullable()
  .transform((v) => (v === '' ? null : v))
  .test('is-http-url', 'Must be a valid URL starting with http(s)://',
    (v) => !v || /^https?:\/\/.+/i.test(v));

const postSchema = yup.object({
  type:     yup.string().required('Type is required'),
  title:    yup.string().trim().required('Title is required').max(200),
  body:     yup.string().trim().required('Body is required').max(4000),
  audience: yup.string().required('Audience is required'),
  cover_url:      urlField,
  link_url:       urlField,
  link_label:     yup.string().nullable().max(60),
  event_date:     yup.string().nullable().when('type', {
    is:   'event',
    then: (s) => s.required('Event date is required for event posts'),
    otherwise: (s) => s.nullable(),
  }),
  event_location: yup.string().nullable().max(200),
  is_pinned:      yup.boolean(),
});

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
  event_date: p.event_date ? new Date(p.event_date).toISOString().slice(0, 16) : '',
  event_location: p.event_location || '',
  is_pinned: Boolean(p.is_pinned),
});

export default function AdminPostForm({
  post,
  saving = false,
  fieldErrors = null,
  onCancel,
  onSubmit,
}) {
  const isEditing = Boolean(post);

  const {
    control, handleSubmit, watch, setError, formState: { errors },
  } = useForm({
    resolver: yupResolver(postSchema),
    defaultValues: post ? postToForm(post) : EMPTY_FORM,
  });

  const type = watch('type');

  // Push server-side field errors (from Laravel) into RHF's state so the
  // same <Input errors={…}/> binding shows them inline.
  useEffect(() => {
    if (!fieldErrors) return;
    Object.entries(fieldErrors).forEach(([field, message]) => {
      setError(field, { type: 'server', message });
    });
  }, [fieldErrors, setError]);

  const submit = (values) => {
    onSubmit({
      type:           values.type,
      title:          values.title.trim(),
      body:           values.body.trim(),
      audience:       values.audience,
      cover_url:      (values.cover_url || '').trim() || null,
      link_url:       (values.link_url  || '').trim() || null,
      link_label:     (values.link_label || '').trim() || null,
      event_date:     values.event_date || null,
      event_location: (values.event_location || '').trim() || null,
      is_pinned:      Boolean(values.is_pinned),
    });
  };

  const onInvalid = (errs) => {
    const first = Object.values(errs)[0]?.message;
    if (first) toast.error(first);
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
          <Button variant="primary" icon={Check} loading={saving} onClick={handleSubmit(submit, onInvalid)}>
            {isEditing ? 'Save Changes' : 'Create Post'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit, onInvalid)} className="space-y-5">
        <Field label="Type *" error={errors.type?.message}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <TabBar
                tabs={POST_TYPES}
                activeId={field.value}
                onChange={field.onChange}
                layout="stretch"
                size="md"
              />
            )}
          />
        </Field>

        <RHFInput control={control} errors={errors} name="title" label="Title *"
          placeholder="e.g. New Job Listings filter is now live" accent="#7F77DD" />

        <RHFInput control={control} errors={errors} name="body" textarea rows={5}
          label="Body *" placeholder="Write the announcement, news update or event details here..."
          accent="#7F77DD" />

        <Field label="Audience *" error={errors.audience?.message}>
          <Controller
            control={control}
            name="audience"
            render={({ field }) => (
              <TabBar
                tabs={AUDIENCE_TABS}
                activeId={field.value}
                onChange={field.onChange}
                layout="stretch"
                size="md"
              />
            )}
          />
        </Field>

        {type === 'event' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RHFInput control={control} errors={errors} name="event_date" type="datetime-local"
              label="Event date *" accent="#7F77DD" />
            <RHFInput control={control} errors={errors} name="event_location" label="Event location"
              placeholder="e.g. Online · Zoom or Bangkok, Thailand" accent="#7F77DD" />
          </div>
        )}

        <RHFInput control={control} errors={errors} name="cover_url" label="Cover image URL"
          placeholder="https://..." accent="#7F77DD" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RHFInput control={control} errors={errors} name="link_url" label="Call-to-action URL"
            placeholder="https://..." accent="#7F77DD" />
          <RHFInput control={control} errors={errors} name="link_label" label="Button label"
            placeholder="e.g. Learn more" accent="#7F77DD" />
        </div>

        <Controller
          control={control}
          name="is_pinned"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="w-4 h-4 accent-purple-mg"
              />
              Pin this post to the top of feeds
            </label>
          )}
        />
      </form>
    </Modal>
  );
}
