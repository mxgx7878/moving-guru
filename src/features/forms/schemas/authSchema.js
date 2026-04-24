import * as yup from 'yup';

// Shared rules — keep in one place so password policy stays in sync.
const password = yup
  .string()
  .required('Password is required')
  .min(6, 'Password must be at least 6 characters');

export const loginSchema = yup.object({
  email:    yup.string().trim().required('Email is required').email('Enter a valid email'),
  password: yup.string().required('Password is required'),
});

export const forgotPasswordSchema = yup.object({
  email: yup.string().trim().required('Email is required').email('Enter a valid email'),
});

export const resetPasswordSchema = yup.object({
  password:              password,
  password_confirmation: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

export const changePasswordSchema = yup.object({
  current_password:      yup.string().required('Please enter your current password'),
  password:              password,
  password_confirmation: yup.string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});
