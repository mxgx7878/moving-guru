// src/features/forms/PlanForm.jsx
//
// CHANGE: Added "Trial period (days)" input — admin can set per-plan
// trial length. 0 = no trial. Value is stored on the plan row; trial
// is applied at subscription creation time in StripeService.

import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Check, Plus, X } from 'lucide-react';

import { Modal, Button, RHFInput, SelectField, Toggle } from '../../components/ui';

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

const BILLING_CYCLES = [
  { value: 'month-1', label: 'Monthly',        interval: 'month', intervalCount: 1, period: '/mo'  },
  { value: 'month-3', label: 'Every 3 months', interval: 'month', intervalCount: 3, period: '/3mo' },
  { value: 'month-6', label: 'Every 6 months', interval: 'month', intervalCount: 6, period: '/6mo' },
  { value: 'year-1',  label: 'Yearly',         interval: 'year',  intervalCount: 1, period: '/yr'  },

];

const DISCOUNT_DURATIONS = [
  { value: 'once',      label: 'First payment only' },
  { value: 'repeating', label: 'For N months' },
  { value: 'forever',   label: 'Every payment (forever)' },
];

const cycleFromPlan = (p) => {
  if (!p) return 'month-1';
  const match = BILLING_CYCLES.find(
    (c) => c.interval === p.interval && c.intervalCount === Number(p.intervalCount),
  );
  return match?.value || 'month-1';
};

const buildSchema = (isEdit) => yup.object({
  id: isEdit
    ? yup.string()
    : yup.string().required('ID is required')
        .matches(/^[a-z0-9][a-z0-9_-]*$/, 'Lowercase letters, numbers, hyphens or underscores only')
        .max(32, 'Max 32 characters'),
  name:            yup.string().trim().required('Name is required').max(64),
  description:     yup.string().nullable().max(255),
  price:           yup.number().typeError('Must be a number').required('Price is required').min(0),
  // currency:        yup.string().required('Currency is required').length(3),
  billingCycle:    yup.string().required().oneOf(BILLING_CYCLES.map((c) => c.value)),
  trialPeriodDays: yup.number()
    .typeError('Must be a number')
    .integer('Whole days only')
    .min(0, 'Cannot be negative')
    .max(365, 'Maximum 365 days'),
  features:        yup.array().of(yup.string().max(140)),
  isActive:        yup.boolean(),
  sortOrder:       yup.number().typeError('Must be a number').integer().min(0).max(9999),
  discountType:  yup.string().oneOf(['', 'percent', 'fixed']).nullable(),
  discountValue: yup.number().typeError('Must be a number').min(0, 'Cannot be negative').nullable(),
  discountDuration: yup.string().oneOf(['', 'once', 'repeating', 'forever']).nullable(),
  discountMonths:   yup.number().typeError('Must be a number').nullable().integer().min(1).max(36),
});
  const DISCOUNT_TYPES = [
  { value: '',        label: 'No discount' },
  { value: 'percent', label: 'Percent (%)' },
  { value: 'fixed',   label: 'Fixed amount' },
];

const EMPTY_FORM = {
  id: '', name: '', description: '',
  price: 0, currency: 'AUD',
  billingCycle: 'month-1',
  trialPeriodDays: 0,
  features: [], isActive: true, sortOrder: 0,
  discountType: '', discountValue: 0,   discountDuration: 'forever', discountMonths: 3,
};

const planToForm = (p) => ({
  id:              p.id,
  name:            p.name || '',
  description:     p.description || '',
  price:           Number(p.price) || 0,
  currency:        'AUD',
  billingCycle:    cycleFromPlan(p),
  trialPeriodDays: Number(p.trialPeriodDays) || 0,
  features:        Array.isArray(p.features) ? p.features : [],
  isActive:        p.isActive !== undefined ? Boolean(p.isActive) : true,
  sortOrder:       Number(p.sortOrder) || 0,
    discountType:    p.discountType || '',
  discountValue:   Number(p.discountValue) || 0,
    discountDuration: p.discountDuration || 'forever',
  discountMonths:   Number(p.discountMonths) || 3,
});

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
  const trialDays = Number(watch('trialPeriodDays')) || 0;

  const addFeature   = () => setValue('features', [...features, ''], { shouldValidate: true });
  const updateFeature = (i, val) => {
    const next = [...features]; next[i] = val;
    setValue('features', next, { shouldValidate: true });
  };
  const removeFeature = (i) =>
    setValue('features', features.filter((_, idx) => idx !== i), { shouldValidate: true });



  const submit = (values) => {
    const cycle = BILLING_CYCLES.find((c) => c.value === values.billingCycle) || BILLING_CYCLES[0];

    const payload = {
      ...values,
      description:     values.description?.trim() || null,
      interval:        cycle.interval,
      intervalCount:   cycle.intervalCount,
      period:          cycle.period,
      trialPeriodDays: Number(values.trialPeriodDays) || 0,
      features:        (values.features || []).map((f) => f.trim()).filter(Boolean),
      isFeatured:      plan?.isFeatured ?? false,
    };

     const dType  = values.discountType || null;
    const dValue = Number(values.discountValue) || 0;
    payload.discountType  = dType && dValue > 0 ? dType : null;
    payload.discountValue = dType && dValue > 0 ? dValue : null;
    payload.discountDuration = dType && dValue > 0 ? (values.discountDuration || 'forever') : null;
    payload.discountMonths   = dType && dValue > 0 && values.discountDuration === 'repeating'
      ? Number(values.discountMonths) : null;

    delete payload.billingCycle;
    if (isEditing) delete payload.id;

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

        {/* Identity */}
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

        {/* Pricing */}
        <div className="grid sm:grid-cols-3 gap-4">
          <RHFInput
            control={control} errors={errors}
            name="price" label="Price" type="number" step="0.01"
          />
          {/* <Controller
            control={control} name="currency"
            render={({ field }) => (
              <SelectField
                label="Currency" options={CURRENCY_OPTIONS}
                value={field.value} onChange={field.onChange}
                error={errors.currency?.message}
              />
            )}
          /> */}
          <Controller
            control={control} name="billingCycle"
            render={({ field }) => (
              <SelectField
                label="Billing cycle" options={BILLING_CYCLES}
                value={field.value} onChange={field.onChange}
                error={errors.billingCycle?.message}
              />
            )}
          />
        </div>

          <div className="grid sm:grid-cols-3 gap-4">
          <Controller
            control={control} name="discountType"
            render={({ field }) => (
              <SelectField
                label="Discount" options={DISCOUNT_TYPES}
                value={field.value} onChange={field.onChange}
                error={errors.discountType?.message}
              />
            )}
          />
          {watch('discountType') ? (
            <>
              <RHFInput
                control={control} errors={errors}
                name="discountValue"
                label={watch('discountType') === 'percent' ? 'Percent off (%)' : 'Amount off'}
                type="number" step="0.01" min={0}
              />
              <div className="flex items-start pt-6">
                <p className="text-[11px] text-[#6B6B66] leading-relaxed">
                  Discount applies to <strong>all subscribers</strong> of this plan and is charged
                  through Stripe at the reduced price. Set to “No discount” to remove it.
                </p>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2 flex items-start pt-6">
              <p className="text-[11px] text-[#9A9A94]">No discount — subscribers pay the full price above.</p>
            </div>
          )}

          <Controller
                control={control} name="discountDuration"
                render={({ field }) => (
                  <SelectField
                    label="Applies to" options={DISCOUNT_DURATIONS}
                    value={field.value} onChange={field.onChange}
                    error={errors.discountDuration?.message}
                  />
                )}
              />
              {watch('discountDuration') === 'repeating' && (
                <RHFInput
                  control={control} errors={errors}
                  name="discountMonths" label="For how many months?"
                  type="number" min={1} max={36}
                />
              )}
        </div>

        {/* Trial — set once at plan level, applied per-subscription */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <RHFInput
              control={control} errors={errors}
              name="trialPeriodDays" label="Trial period (days)"
              type="number" min={0} max={365} step={1}
              help="0 = no trial"
            />
          </div>
          <div className="sm:col-span-2 flex items-start pt-6">
            <p className="text-[11px] text-[#6B6B66] leading-relaxed">
              {trialDays > 0 ? (
                <>
                  Subscribers will get a <strong className="text-[#3E3D38]">{trialDays}-day free trial</strong>{' '}
                  before being charged. Each user gets only <strong>one trial across the platform</strong> —
                  if they've trialed before (on any plan), they'll be charged immediately. Card is still
                  collected up front, charged at trial end.
                </>
              ) : (
                <>No free trial — subscribers are charged immediately on signup.</>
              )}
            </p>
          </div>
        </div>

        {/* Features list */}
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
                    className="flex-1 border border-[#E5E0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
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

        {/* Status + sort order */}
        <div className="pt-2 border-t border-[#E5E0D8] grid sm:grid-cols-2 gap-4 items-start">
          <Controller
            control={control} name="isActive"
            render={({ field }) => (
              <div>
                <Toggle
                  label="Active"
                  checked={field.value}
                  onChange={field.onChange}
                />
                <p className="text-[10px] text-[#9A9A94] mt-1">
                  When off, plan is archived — hidden from new users.
                  Existing subscribers stay on it until they cancel or switch.
                </p>
              </div>
            )}
          />
          <RHFInput
            control={control} errors={errors}
            name="sortOrder" label="Sort order" type="number"
            help="Lower numbers appear first in the user portal."
          />
        </div>
      </form>
    </Modal>
  );
}