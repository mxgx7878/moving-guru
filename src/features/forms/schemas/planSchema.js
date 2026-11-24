import * as yup from 'yup';

export const buildPlanSchema = (isEdit, billingCycles) => yup.object({
  id: isEdit
    ? yup.string()
    : yup.string().required('ID is required')
        .matches(/^[a-z0-9][a-z0-9_-]*$/, 'Lowercase letters, numbers, hyphens or underscores only')
        .max(32, 'Max 32 characters'),
  name:            yup.string().trim().required('Name is required').max(64),
  description:     isEdit
    ? yup.string().nullable().max(255)
    : yup.string().trim().required('Description is required').max(255),
  price:           yup.number().typeError('Must be a number').required('Price is required').min(0),
  billingCycle:    yup.string().required().oneOf(billingCycles),
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
