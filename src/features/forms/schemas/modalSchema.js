import * as yup from 'yup';

// ── Admin action modals (Reject / Suspend / RejectUser) ──────────
// All three want a brief free-text reason. Minimum length keeps the
// admin from accidentally submitting an empty string.
export const reasonSchema = yup.object({
  reason: yup
    .string()
    .trim()
    .required('Please provide a reason')
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Keep the reason under 500 characters'),
});

// ── Apply to a job ───────────────────────────────────────────────
// The message is optional but, if provided, should be meaningful —
// tiny "hi" submissions tend to get auto-rejected.
export const applyJobSchema = yup.object({
  message: yup
    .string()
    .trim()
    .max(1000, 'Keep your note under 1000 characters')
    .test('length-or-empty', 'Add a few sentences so the studio knows why you applied', (v) => {
      if (!v) return true;
      return v.trim().length >= 20;
    }),
});

// ── Review form ──────────────────────────────────────────────────
export const reviewSchema = yup.object({
  rating:  yup.number().required('Please pick a rating').min(1).max(5),
  comment: yup.string().trim().max(1000, 'Keep your review under 1000 characters').nullable(),
});
