import * as yup from 'yup';

// Shared building blocks.
const email = yup.string().trim().email('Enter a valid email');

// ── Job listing (studio creates / edits) ─────────────────────────
export const jobSchema = yup.object({
  title: yup.string().trim().required('Title is required').max(120),
  type:  yup.string().required('Select a listing type'),
  role_type: yup.string().nullable(),
  location:  yup.string().trim().nullable().max(120),
  start_date: yup.string().nullable(),
  duration:   yup.string().nullable().max(80),
  compensation: yup.string().nullable().max(120),
  qualification_level: yup.string().nullable(),
  vacancies: yup
    .number()
    .transform((v, orig) => (orig === '' || orig == null ? undefined : v))
    .min(1, 'At least one vacancy is required')
    .integer('Vacancies must be a whole number')
    .default(1),
  description:  yup.string().max(4000, 'Keep the description under 4000 characters').nullable(),
  requirements: yup.string().max(4000, 'Keep requirements under 4000 characters').nullable(),
});

// ── Admin "create / edit user" ───────────────────────────────────
// Password is required on create, optional on edit. Consumers pass
// { isEdit: true } via the `context` option when calling `.validate()`.
export const userSchema = yup.object({
  name:    yup.string().trim().required('Name is required').max(120),
  email:   email.required('Email is required'),
  role:    yup.string().required('Role is required').oneOf(['instructor', 'studio', 'admin']),
  password: yup.string().when('$isEdit', {
    is:   true,
    then: (s) => s.nullable().test('optional-min', 'Password must be at least 6 characters',
            (v) => !v || v.length >= 6),
    otherwise: (s) => s.required('Password is required').min(6, 'Password must be at least 6 characters'),
  }),
});

// ── Admin announcement / platform post ───────────────────────────
export const adminPostSchema = yup.object({
  title: yup.string().trim().required('Title is required').max(200),
  body:  yup.string().trim().required('Post body is required').max(4000),
  kind:  yup.string().nullable(),
  published_at: yup.string().nullable(),
});
