import { useState, useMemo } from 'react';
import { Check, User, Building2, Shield } from 'lucide-react';
import { Modal, Button, Input, SelectField } from '../../components/ui';

const ROLE_OPTIONS = [
  { id: 'instructor', label: 'Instructor', icon: User,       color: '#CE4F56' },
  { id: 'studio',     label: 'Studio',     icon: Building2,  color: '#2DA4D6' },
//   { id: 'admin',      label: 'Admin',      icon: Shield,     color: '#7F77DD' },
];

const STATUS_OPTIONS = [
  { id: 'active',    label: 'Active' },
  { id: 'pending',   label: 'Pending approval' },
  { id: 'suspended', label: 'Suspended' },
];

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
  const [form, setForm] = useState(() => (user ? userToForm(user) : EMPTY_FORM));
  const [errors, setErrors] = useState({});

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const isStudio = form.role === 'studio';
  const accent = useMemo(
    () => ROLE_OPTIONS.find((r) => r.id === form.role)?.color || '#7F77DD',
    [form.role],
  );

  const validate = () => {
    const errs = {};
    if (isStudio) {
      if (!form.studio_name.trim()) errs.studio_name = 'Studio name is required';
    } else if (!form.name.trim()) {
      errs.name = 'Name is required';
    }
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!isEditing && (!form.password || form.password.length < 6)) {
      errs.password = 'Password must be at least 6 characters';
    }
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = {
      role:        form.role,
      email:       form.email.trim(),
      phone:       form.phone.trim() || null,
      location:    form.location.trim() || null,
      bio:         form.bio.trim() || null,
      status:      form.status,
      is_verified: Boolean(form.is_verified),
    };
    if (isStudio) payload.studio_name = form.studio_name.trim();
    else          payload.name        = form.name.trim();

    if (!isEditing && form.password) payload.password = form.password;
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
          <Button variant="primary" icon={Check} loading={saving} onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Create User'}
          </Button>
        </>
      }
    >
      {/* Role picker — create mode only */}
      {!isEditing && (
        <div>
          <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
            Account Type *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((r) => {
              const Icon = r.icon;
              const active = form.role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => update('role', r.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-bold transition-all
                    ${active ? 'text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
                  style={active ? { backgroundColor: r.color, borderColor: r.color } : {}}
                >
                  <Icon size={16} />
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Identity */}
      {isStudio ? (
        <Input
          label="Studio Name *"
          value={form.studio_name}
          onChange={(e) => update('studio_name', e.target.value)}
          placeholder="e.g. Shakti Yoga Studio"
          error={errors.studio_name}
          accent={accent}
        />
      ) : (
        <Input
          label="Full Name *"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Maya Patel"
          error={errors.name}
          accent={accent}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email *"
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="user@example.com"
          error={errors.email}
          accent={accent}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="+1 555 123 4567"
          accent={accent}
        />
      </div>

      {/* Password only on create */}
      {!isEditing && (
        <Input
          label="Password *"
          type="password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          placeholder="At least 6 characters"
          error={errors.password}
          hint="Share this with the user — they can change it after first login."
          accent={accent}
        />
      )}

      <Input
        label="Location"
        value={form.location}
        onChange={(e) => update('location', e.target.value)}
        placeholder="e.g. Bali, Indonesia"
        accent={accent}
      />

      <Input
        textarea
        label={isStudio ? 'Studio description' : 'Bio'}
        value={form.bio}
        onChange={(e) => update('bio', e.target.value)}
        rows={4}
        maxLength={1000}
        placeholder={isStudio
          ? 'Short description shown on the studio profile...'
          : 'Short bio shown on the instructor profile...'}
        accent={accent}
      />

      {/* Status + verification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <SelectField
            label="Account Status"
            value={form.status}
            onChange={(v) => update('status', v)}
            options={STATUS_OPTIONS.map((s) => ({ value: s.id, label: s.label }))}
            placeholder="Select status"
          />
        </div>

        {isStudio && (
          <label className="flex items-center gap-2 text-sm text-[#3E3D38] cursor-pointer self-end pb-3">
            <input
              type="checkbox"
              checked={form.is_verified}
              onChange={(e) => update('is_verified', e.target.checked)}
              className="w-4 h-4 accent-[#2DA4D6]"
            />
            Mark studio as verified
          </label>
        )}
      </div>
    </Modal>
  );
}