import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Check } from 'lucide-react';

import { Modal, Button, RHFInput, SelectField, Toggle } from '../../components/ui';

const DISCOUNT_TYPES = [
  { value: 'percent', label: 'Percent (%)' },
  { value: 'fixed',   label: 'Fixed amount' },
];

const DURATIONS = [
  { value: 'once',      label: 'Once (first invoice only)' },
  { value: 'repeating', label: 'Repeating (N months)' },
  { value: 'forever',   label: 'Forever' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' }, { value: 'AUD', label: 'AUD' },
  { value: 'GBP', label: 'GBP' }, { value: 'EUR', label: 'EUR' },
  { value: 'CAD', label: 'CAD' }, { value: 'NZD', label: 'NZD' },
  { value: 'INR', label: 'INR' }, { value: 'AED', label: 'AED' },
];

const schema = yup.object({
  code: yup.string().trim().required('Code is required')
    .matches(/^[A-Za-z0-9_-]+$/, 'Letters, numbers, hyphens, underscores only').max(64),
  discountType:  yup.string().required().oneOf(['percent', 'fixed']),
  discountValue: yup.number().typeError('Must be a number').required('Required').moreThan(0, 'Must be greater than 0'),
  currency:      yup.string().when('discountType', {
    is: 'fixed', then: (s) => s.required('Currency required for fixed').length(3), otherwise: (s) => s.nullable(),
  }),
  duration:         yup.string().required().oneOf(['once', 'repeating', 'forever']),
  durationInMonths: yup.number().when('duration', {
    is: 'repeating', then: (s) => s.typeError('Required').required('Required').integer().min(1).max(36),
    otherwise: (s) => s.nullable(),
  }),
  maxRedemptions: yup.number().typeError('Must be a number').nullable().integer().min(1)
    .transform((v, o) => (o === '' || o === null ? null : v)),
  expiresAt: yup.string().nullable(),
  isActive:  yup.boolean(),
}).test('percent-max', null, (val, ctx) => {
  if (val.discountType === 'percent' && Number(val.discountValue) > 100) {
    return ctx.createError({ path: 'discountValue', message: 'Percent cannot exceed 100' });
  }
  return true;
});

const EMPTY = {
  code: '', discountType: 'percent', discountValue: 10, currency: 'USD',
  duration: 'once', durationInMonths: 3, maxRedemptions: '', expiresAt: '', isActive: true,
};

export default function PromoCodeForm({ saving = false, onCancel, onSubmit }) {
  const resolver = useMemo(() => yupResolver(schema), []);
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver, defaultValues: EMPTY,
  });

  const discountType = watch('discountType');
  const duration     = watch('duration');

  const submit = (v) => {
    const payload = {
      code:           v.code.trim().toUpperCase(),
      discountType:   v.discountType,
      discountValue:  Number(v.discountValue),
      currency:       v.discountType === 'fixed' ? v.currency : null,
      duration:       v.duration,
      durationInMonths: v.duration === 'repeating' ? Number(v.durationInMonths) : null,
      maxRedemptions: v.maxRedemptions ? Number(v.maxRedemptions) : null,
      expiresAt:      v.expiresAt || null,
      isActive:       Boolean(v.isActive),
    };
    onSubmit(payload);
  };

  return (
    <Modal
      open size="lg" onClose={onCancel}
      title="Create Promo Code"
      subtitle="Creates a Stripe Coupon + Promotion Code. Discount details can't be edited later — deactivate and recreate to change them."
      bodyClassName="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
      footer={(
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" icon={Check} loading={saving} onClick={handleSubmit(submit)}>
            Create Code
          </Button>
        </>
      )}
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <RHFInput
          control={control} errors={errors}
          name="code" label="Code"
          placeholder="e.g. LAUNCH20"
          help="Shown to customers. Auto-uppercased."
        />

        <div className="grid sm:grid-cols-3 gap-4">
          <Controller
            control={control} name="discountType"
            render={({ field }) => (
              <SelectField label="Type" options={DISCOUNT_TYPES}
                value={field.value} onChange={field.onChange} error={errors.discountType?.message} />
            )}
          />
          <RHFInput
            control={control} errors={errors}
            name="discountValue"
            label={discountType === 'percent' ? 'Percent off (%)' : 'Amount off'}
            type="number" step="0.01" min={0}
          />
          {discountType === 'fixed' && (
            <Controller
              control={control} name="currency"
              render={({ field }) => (
                <SelectField label="Currency" options={CURRENCY_OPTIONS}
                  value={field.value} onChange={field.onChange} error={errors.currency?.message} />
              )}
            />
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Controller
            control={control} name="duration"
            render={({ field }) => (
              <SelectField label="Duration" options={DURATIONS}
                value={field.value} onChange={field.onChange} error={errors.duration?.message} />
            )}
          />
          {duration === 'repeating' && (
            <RHFInput
              control={control} errors={errors}
              name="durationInMonths" label="For how many months?" type="number" min={1} max={36}
            />
          )}
          <RHFInput
            control={control} errors={errors}
            name="maxRedemptions" label="Max total uses" type="number" min={1}
            help="Blank = unlimited (still 1 per user)."
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 items-start pt-2 border-t border-[#E5E0D8]">
          <RHFInput
            control={control} errors={errors}
            name="expiresAt" label="Expires at" type="date"
            help="Blank = no expiry."
          />
          <Controller
            control={control} name="isActive"
            render={({ field }) => (
              <div>
                <Toggle label="Active" checked={field.value} onChange={field.onChange} />
                <p className="text-[10px] text-[#9A9A94] mt-1">Inactive codes are rejected at checkout.</p>
              </div>
            )}
          />
        </div>

        <p className="text-[11px] text-[#6B6B66] bg-[#F5FDA6] rounded-lg px-3 py-2">
          Each customer can use a given code only <strong>once</strong> — reuse is blocked automatically.
        </p>
      </form>
    </Modal>
  );
}