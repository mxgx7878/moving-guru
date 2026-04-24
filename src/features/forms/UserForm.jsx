import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Check, User, Building2 } from 'lucide-react';

import { Modal, Button, RHFInput, SelectField } from '../../components/ui';

const ROLE_OPTIONS = [
  { id: 'instructor', label: 'Instructor', icon: User,      color: '#CE4F56' },
  { id: 'studio',     label: 'Studio',     icon: Building2, color: '#2DA4D6' },
];

const STATUS_OPTIONS = [
  { id: 'active',    label: 'Active' },
  { id: 'pending',   label: 'Pending approval' },
  { id: 'suspended', label: 'Suspended' },
];

// Schema lives here (not in entitySchema.js) because it conditions on
// `role` + `isEdit`, which are UserForm-specific.
const buildSchema = (isEdit) => yup.object({
  role:        yup.string().required().oneOf(['instructor', 'studio', 'admin']),
  name:        yup.string().when('role', {
    is:   (r) => r !== 'studio',
    then: (s) => s.trim().required('Name is required').max(120),
    otherwise: (s) => s.nullable(),
  }),
  studio_name: yup.string().when('role', {
    is:   'studio',
    then: (s) => s.trim().required('Studio name is required').max(120),
    otherwise: (s) => s.nullable(),
  }),
  email:       yup.string().trim().required('Email is required').email('Invalid email address'),
  password:    isEdit
    ? yup.string().nullable().test('optional-min',
        'Password must be at least 6 characters',
        (v) => !v || v.length >= 6)
    : yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  phone:       yup.string().nullable(),
  location:    yup.string().nullable(),
  bio:         yup.string().max(1000, 'Keep the bio under 1000 characters').nullable(),
  status:      yup.string().required(),
  is_verified: yup.boolean(),
});

const EMPTY_FORM = {
  role:         'instructor',
  name:         '',
  studio_name:  '',
  email:        '',
  password:     '',
  phone:        '',
  location:     '',
  bio:          '',
  status:       'active',
  is_verified:  false,
};

const userToForm = (u) => ({
  role:         u.role         || 'instructor',
  name:         u.name         || '',
  studio_name:  u.studio_name  || '',
  email:        u.email        || '',
  password:     '',
  phone:        u.phone        || '',
  location:     u.location     || '',
  bio:          u.bio          || u.description || '',
  status:       u.status       || (u.is_active === false ? 'suspended' : 'active'),
  is_verified:  Boolean(u.is_verified),
});

/**
 * UserForm — admin create/edit dialog for instructors, studios and admins.
 *   - `user` null → create mode (role picker + password)
 *   - `user` object → edit mode (role locked, password hidden)
 */
export default function UserForm({ user, saving = false, onCancel, onSubmit }) {
  const isEditing = Boolean(user);

  const schema = useMemo(() => buildSchema(isEditing), [isEditing]);

  const {
    control, handleSubmit, watch, setValue, formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: user ? userToForm(user) : EMPTY_FORM,
  });

  const role = watch('role');
  const isStudio = role === 'studio';
  const accent = useMemo(
    () => ROLE_OPTIONS.find((r) => r.id === role)?.color || '#7F77DD',
    [role],
  );

  // Clear the opposite name field so validation doesn't trip when
  // switching role while creating.
  useEffect(() => {
    if (isStudio) setValue('name', '');
    else          setValue('studio_name', '');
  }, [isStudio, setValue]);

  const submit = (values) => {
    const payload = {
      role:        values.role,
      email:       values.email.trim(),
      phone:       (values.phone || '').trim() || null,
      location:    (values.location || '').trim() || null,
      bio:         (values.bio || '').trim() || null,
      status:      values.status,
      is_verified: Boolean(values.is_verified),
    };
    if (values.role === 'studio') payload.studio_name = values.studio_name.trim();
    else                          payload.name        = values.name.trim();

    if (!isEditing && values.password) payload.password = values.password;
    onSubmit(payload);
  };

  return (
    <Modal
      open
      size="lg"
      onClose={onCancel}
      title={isEditing ? 'Edit User' : 'Create User'}
      subtitle={isEditing
        ? 'Update account details, role cannot be changed once set.'
        : 'Manually onboard an instructor, studio or admin.'}
      bodyClassName="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" icon={Check} loading={saving} onClick={handleSubmit(submit)}>
            {isEditing ? 'Save Changes' : 'Create User'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        {/* Role picker — create mode only */}
        {!isEditing && (
          <div>
            <label className="block text-[10px] font-bold text-ink-soft tracking-widest uppercase mb-2">
              Account Type *
            </label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map((r) => {
                    const Icon = r.icon;
                    const active = field.value === r.id;
                    return (
                      <Button
                        key={r.id}
                        type="button"
                        variant={active ? 'primary' : 'secondary'}
                        size="md"
                        fullWidth
                        icon={Icon}
                        onClick={() => field.onChange(r.id)}
                        style={active ? { backgroundColor: r.color, borderColor: r.color } : undefined}
                      >
                        {r.label}
                      </Button>
                    );
                  })}
                </div>
              )}
            />
          </div>
        )}

        {isStudio ? (
          <RHFInput
            control={control}
            errors={errors}
            name="studio_name"
            label="Studio Name *"
            placeholder="e.g. Shakti Yoga Studio"
            accent={accent}
          />
        ) : (
          <RHFInput
            control={control}
            errors={errors}
            name="name"
            label="Full Name *"
            placeholder="e.g. Maya Patel"
            accent={accent}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RHFInput
            control={control}
            errors={errors}
            name="email"
            type="email"
            label="Email *"
            placeholder="user@example.com"
            accent={accent}
          />
          <RHFInput
            control={control}
            errors={errors}
            name="phone"
            label="Phone"
            placeholder="+1 555 123 4567"
            accent={accent}
          />
        </div>

        {!isEditing && (
          <RHFInput
            control={control}
            errors={errors}
            name="password"
            type="password"
            label="Password *"
            placeholder="At least 6 characters"
            hint="Share this with the user — they can change it after first login."
            accent={accent}
          />
        )}

        <RHFInput
          control={control}
          errors={errors}
          name="location"
          label="Location"
          placeholder="e.g. Bali, Indonesia"
          accent={accent}
        />

        <RHFInput
          control={control}
          errors={errors}
          name="bio"
          textarea
          rows={4}
          maxLength={1000}
          label={isStudio ? 'Studio description' : 'Bio'}
          placeholder={isStudio
            ? 'Short description shown on the studio profile...'
            : 'Short bio shown on the instructor profile...'}
          accent={accent}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <SelectField
                label="Account Status"
                value={field.value}
                onChange={field.onChange}
                options={STATUS_OPTIONS.map((s) => ({ value: s.id, label: s.label }))}
                placeholder="Select status"
              />
            )}
          />

          {isStudio && (
            <Controller
              control={control}
              name="is_verified"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm text-ink cursor-pointer self-end pb-3">
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="w-4 h-4 accent-sky-mg"
                  />
                  Mark studio as verified
                </label>
              )}
            />
          )}
        </div>
      </form>
    </Modal>
  );
}
