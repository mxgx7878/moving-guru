import * as yup from 'yup';

export const reasonSchema = yup.object({
  reason: yup
    .string()
    .trim()
    .required('Please provide a reason')
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Keep the reason under 500 characters'),
});

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

export const reviewSchema = yup.object({
  rating:  yup.number().required('Please pick a rating').min(1).max(5),
  comment: yup.string().trim().max(1000, 'Keep your review under 1000 characters').nullable(),
});
