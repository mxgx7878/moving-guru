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

const CURRENCY_OPTIONS = [
  { value: 'AUD', label: 'AUD' }, { value: 'USD', label: 'USD' },
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
  code: '', discountType: 'percent', discountValue: 10, currency: 'AUD',
  maxRedemptions: '', expiresAt: '', isActive: true,
};

export default function GrowPromoCodeForm({ saving = false, onCancel, onSubmit }) {
  const resolver = useMemo(() => yupResolver(schema), []);
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver, defaultValues: EMPTY,
  });

  const discountType = watch('discountType');

  const submit = (v) => {
    onSubmit({
      code:           v.code.trim().toUpperCase(),
      discountType:   v.discountType,
      discountValue:  Number(v.discountValue),
      currency:       v.discountType === 'fixed' ? v.currency : null,
      maxRedemptions: v.maxRedemptions ? Number(v.maxRedemptions) : null,
      expiresAt:      v.expiresAt || null,
      isActive:       Boolean(v.isActive),
    });
  };

  return (
    <Modal
      open size="lg" onClose={onCancel}
      title="Create Grow Promo Code"
      subtitle="Applies to Grow listing fees only. Discounts the one-off charge directly — no Stripe coupon is created."
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
          placeholder="e.g. GROW20"
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

        <div className="grid sm:grid-cols-2 gap-4 items-start pt-2 border-t border-[#E5E0D8]">
          <RHFInput
            control={control} errors={errors}
            name="maxRedemptions" label="Max total uses" type="number" min={1}
            help="Blank = unlimited. This is a global cap across everyone."
          />
          <RHFInput
            control={control} errors={errors}
            name="expiresAt" label="Expires at" type="date"
            help="Blank = no expiry."
          />
        </div>

        <Controller
          control={control} name="isActive"
          render={({ field }) => (
            <div>
              <Toggle label="Active" checked={field.value} onChange={field.onChange} />
              <p className="text-[10px] text-[#9A9A94] mt-1">Inactive codes are rejected at checkout.</p>
            </div>
          )}
        />

        <p className="text-[11px] text-[#6B6B66] bg-[#F5FDA6] rounded-lg px-3 py-2">
          Grow codes are limited only by their <strong>total usage cap</strong> and expiry — there is no per-person limit.
        </p>
      </form>
    </Modal>
  );
}
