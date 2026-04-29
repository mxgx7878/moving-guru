// src/features/forms/PlanForm.jsx

import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Check, Plus, X } from 'lucide-react';

import { Modal, Button, RHFInput, SelectField } from '../../components/ui';

// ── Currency dropdown — extend as needed ──────────────────────────
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'NZD', label: 'NZD — New Zealand Dollar' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'AED', label: 'AED — UAE Dirham' },
];

// ── Billing cycle = (interval + intervalCount) combined ───────────
// Stripe doesn't have a "6-month" interval, so 6-month billing is
// expressed as `interval=month, intervalCount=6`. This dropdown hides
// that detail from the admin.
const BILLING_CYCLES = [
  { value: 'month-1',  label: 'Monthly',         interval: 'month', intervalCount: 1, period: '/mo'  },
  { value: 'month-3',  label: 'Every 3 months',  interval: 'month', intervalCount: 3, period: '/3mo' },
  { value: 'month-6',  label: 'Every 6 months',  interval: 'month', intervalCount: 6, period: '/6mo' },
  { value: 'year-1',   label: 'Yearly',          interval: 'year',  intervalCount: 1, period: '/yr'  },
];

const cycleFromPlan = (p) => {
  if (!p) return 'month-1';
  const match = BILLING_CYCLES.find(
    (c) => c.interval === p.interval && c.intervalCount === Number(p.intervalCount),
  );
  return match?.value || 'month-1';
};

// ── Schema ────────────────────────────────────────────────────────
const buildSchema = (isEdit) => yup.object({
  id: isEdit
    ? yup.string()
    : yup.string().required('ID is required')
        .matches(/^[a-z0-9][a-z0-9_-]*$/, 'Lowercase letters, numbers, hyphens or underscores only')
        .max(32, 'Max 32 characters'),
  name:         yup.string().trim().required('Name is required').max(64),
  description:  yup.string().nullable().max(255),
  price:        yup.number().typeError('Must be a number').required('Price is required').min(0),
  currency:     yup.string().required('Currency is required').length(3),
  billingCycle: yup.string().required().oneOf(BILLING_CYCLES.map((c) => c.value)),
  features:     yup.array().of(yup.string().max(140)),
  sortOrder:    yup.number().typeError('Must be a number').integer().min(0).max(9999),
});

const EMPTY_FORM = {
  id: '', name: '', description: '',
  price: 0, currency: 'USD',
  billingCycle: 'month-1',
  features: [], sortOrder: 0,
};

const planToForm = (p) => ({
  id:           p.id,
  name:         p.name || '',
  description:  p.description || '',
  price:        Number(p.price) || 0,
  currency:     p.currency || 'USD',
  billingCycle: cycleFromPlan(p),
  features:     Array.isArray(p.features) ? p.features : [],
  sortOrder:    Number(p.sortOrder) || 0,
});

// ── Component ─────────────────────────────────────────────────────
export default function PlanForm({ plan, saving = false, onCancel, onSubmit }) {
  const isEditing = Boolean(plan);
  const schema = useMemo(() => buildSchema(isEditing), [isEditing]);

  const {
    control, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: plan ? planToForm(plan) : EMPTY_FORM,
  });

  const features = watch('features') || [];

  const addFeature = () =>
    setValue('features', [...features, ''], { shouldValidate: true });

  const updateFeature = (i, val) => {
    const next = [...features]; next[i] = val;
    setValue('features', next, { shouldValidate: true });
  };

  const removeFeature = (i) =>
    setValue('features', features.filter((_, idx) => idx !== i), { shouldValidate: true });

  const submit = (values) => {
    const cycle = BILLING_CYCLES.find((c) => c.value === values.billingCycle)
                  || BILLING_CYCLES[0];

    const payload = {
      ...values,
      description:   values.description?.trim() || null,
      // Expand the cycle back into the API's shape
      interval:      cycle.interval,
      intervalCount: cycle.intervalCount,
      period:        cycle.period,
      features:      (values.features || []).map((f) => f.trim()).filter(Boolean),
      // Keep these consistent with backend defaults; admins no longer
      // toggle them in the form, but the API still expects them.
      isFeatured:    plan?.isFeatured ?? false,
      isActive:      plan?.isActive   ?? true,
    };

    delete payload.billingCycle;
    if (isEditing) delete payload.id; // never edit the slug

    onSubmit(payload);
  };

  return (
    <Modal
      open
      size="lg"
      onClose={onCancel}
      title={isEditing ? 'Edit Plan' : 'Create Plan'}
      subtitle={isEditing
        ? 'Changes sync to Stripe. Price/cycle changes archive the old Stripe Price and create a new one.'
        : 'Creates a new Stripe Product + Price automatically.'}
      bodyClassName="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
      footer={(
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" icon={Check} loading={saving} onClick={handleSubmit(submit)}>
            {isEditing ? 'Save Changes' : 'Create Plan'}
          </Button>
        </>
      )}
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-5">

        {/* ─── Identity ─── */}
        <div className="grid sm:grid-cols-2 gap-4">
          <RHFInput
            control={control} errors={errors}
            name="id" label="Plan ID (slug)"
            placeholder="e.g. pro, enterprise"
            disabled={isEditing}
            help={isEditing ? 'IDs cannot be changed.' : 'Lowercase, no spaces. Used as the API key.'}
          />
          <RHFInput
            control={control} errors={errors}
            name="name" label="Display name"
            placeholder="e.g. Pro Plan"
          />
        </div>

        <RHFInput
          control={control} errors={errors}
          name="description" label="Description"
          placeholder="One-line description shown to subscribers"
          textarea rows={2}
        />

        {/* ─── Pricing ─── */}
        <div className="grid sm:grid-cols-3 gap-4">
          <RHFInput
            control={control} errors={errors}
            name="price" label="Price" type="number" step="0.01"
          />
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <SelectField
                label="Currency"
                options={CURRENCY_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.currency?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="billingCycle"
            render={({ field }) => (
              <SelectField
                label="Billing cycle"
                options={BILLING_CYCLES}
                value={field.value}
                onChange={field.onChange}
                error={errors.billingCycle?.message}
              />
            )}
          />
        </div>

        {/* ─── Features list ─── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#3E3D38] uppercase tracking-wider">Features</label>
            <Button variant="secondary" size="xs" icon={Plus} onClick={addFeature} type="button">
              Add feature
            </Button>
          </div>
          {features.length === 0 ? (
            <p className="text-xs text-[#9A9A94] italic">No features yet — add bullet points subscribers will see.</p>
          ) : (
            <div className="space-y-2">
              {features.map((feat, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 border border-[#E5E0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F77DD]"
                    value={feat}
                    onChange={(e) => updateFeature(i, e.target.value)}
                    placeholder="e.g. Unlimited messages"
                  />
                  <Button variant="ghost" size="sm" icon={X} onClick={() => removeFeature(i)} type="button" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Sort order ─── */}
        <div className="pt-2 border-t border-[#E5E0D8]">
          <RHFInput
            control={control} errors={errors}
            name="sortOrder" label="Sort order" type="number"
            help="Lower numbers appear first in the user portal. e.g. 1, 2, 3."
          />
        </div>
      </form>
    </Modal>
  );
}