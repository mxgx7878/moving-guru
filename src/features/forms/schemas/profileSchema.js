import * as yup from 'yup';

const optionalUrl = yup
  .string()
  .trim()
  .nullable()
  .transform((v) => (v === '' ? null : v))
  .test('is-url', 'Must be a valid URL', (v) => {
    if (!v) return true;
    try {
      new URL(v.startsWith('http') ? v : `https://${v}`);
      return true;
    } catch {
      return false;
    }
  });

export const instructorProfileSchema = yup.object({
  name: yup.string().trim().required('Name is required').max(120, 'Name is too long'),
  age:  yup
    .number()
    .transform((v, orig) => (orig === '' || orig == null ? undefined : v))
    .min(16, 'Age must be 16 or older')
    .max(99, 'Please enter a valid age')
    .integer('Age must be a whole number')
    .optional(),
  bio:        yup.string().max(500,  'Bio must be 500 characters or fewer').nullable(),
  lookingFor: yup.string().max(2500, 'Please keep this under 2500 characters').nullable(),
  location:   yup.string().max(120).nullable(),
  availableFrom: yup.string().nullable(),
  availableTo:   yup
    .string()
    .nullable()
    .test(
      'after-from',
      'End date must be on or after the start date',
      function (value) {
        const { availableFrom } = this.parent;
        if (!value || !availableFrom) return true;
        return new Date(value) >= new Date(availableFrom);
      },
    ),
  instagram: optionalUrl,
  facebook:  optionalUrl,
  twitter:   optionalUrl,
  tiktok:    optionalUrl,
  youtube:   optionalUrl,
  linkedin:  optionalUrl,
});

export const studioProfileSchema = yup.object({
  studioName: yup.string().trim().required('Studio name is required').max(120),
  name:       yup.string().trim().required('Contact name is required').max(120),
  email:      yup.string().trim().email('Enter a valid email').nullable(),
  phone:      yup.string().nullable().max(40),
  description: yup.string().max(2500, 'Keep the description under 2500 characters').nullable(),
  website:     optionalUrl,
  instagram:   optionalUrl,
  facebook:    optionalUrl,
  twitter:     optionalUrl,
  tiktok:      optionalUrl,
  youtube:     optionalUrl,
  linkedin:    optionalUrl,
});

export function flattenYupErrors(err) {
  const out = {};
  if (!err || !err.inner) return out;
  err.inner.forEach((issue) => {
    if (!issue.path || out[issue.path]) return;
    out[issue.path] = issue.message;
  });
  return out;
}
