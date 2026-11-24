import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAccountFields, validateRegistrationStep, firstInvalidRegistrationStep } from '../src/features/auth/registrationValidation.js';
import { buildPlanSchema } from '../src/features/forms/schemas/planSchema.js';
import { resetPasswordSchema, changePasswordSchema } from '../src/features/forms/schemas/authSchema.js';
import { jobSchema, userSchema } from '../src/features/forms/schemas/entitySchema.js';

const account = {
  name: 'Sample Instructor', email: 'sample@example.test',
  password: 'twelveletters', confirmPassword: 'twelveletters',
};

test('instructor and studio account steps reject short passwords before advancing', () => {
  for (const role of ['instructor', 'studio']) {
    assert.match(validateRegistrationStep({ ...account, password: 'abcdef', confirmPassword: 'abcdef' }, role, 1, 6).password, /12/);
    assert.equal(validateRegistrationStep(account, role, 1, 6).password, undefined);
  }
});

test('account fields validate name, email, and confirmation while the user types', () => {
  const errors = validateAccountFields({ ...account, name: 'Al', email: 'bad', confirmPassword: 'mismatch' });
  assert.match(errors.name, /3/);
  assert.match(errors.email, /valid email/);
  assert.equal(errors.confirmPassword, 'Passwords do not match');
});

test('final submission returns to first invalid step instead of calling registration API', () => {
  const invalid = { ...account, password: 'short', confirmPassword: 'short', plan: 'basic' };
  assert.equal(firstInvalidRegistrationStep(invalid, 'studio', 5).step, 1);
  assert.equal(firstInvalidRegistrationStep(invalid, 'instructor', 6).step, 1);
});

const plan = {
  id: 'basic', name: 'Basic', description: '', price: 10, billingCycle: 'month-1',
  trialPeriodDays: 0, features: [], isActive: true, sortOrder: 0,
  discountType: '', discountValue: 0, discountDuration: 'forever', discountMonths: 3,
};

test('plan creation requires a visible description before API call', async () => {
  const schema = buildPlanSchema(false, ['month-1']);
  await assert.rejects(schema.validate(plan), /Description is required/);
  await assert.doesNotReject(schema.validate({ ...plan, description: 'Entry plan' }));
  await assert.doesNotReject(buildPlanSchema(true, ['month-1']).validate({ ...plan, description: '' }));
});

test('reset, change, and admin-user passwords match backend 12-character minimum', async () => {
  await assert.rejects(resetPasswordSchema.validate({ password: 'short123', password_confirmation: 'short123' }), /12/);
  await assert.rejects(changePasswordSchema.validate({ current_password: 'old', password: 'short123', password_confirmation: 'short123' }), /12/);
  await assert.rejects(userSchema.validate({ name: 'Sample', email: 'sample@example.test', role: 'instructor', password: 'short123' }, { context: { isEdit: false } }), /12/);
});

test('job form rejects an empty role description before API call', async () => {
  await assert.rejects(jobSchema.validate({ title: 'Teacher', types: ['hire'], description: '' }), /Role description is required/);
});
