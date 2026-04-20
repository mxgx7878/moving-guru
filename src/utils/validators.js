// Shared form validation helpers. Each validator returns an errors object
// keyed by field name; callers treat an empty object as "valid".
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail    = (v) => EMAIL_RE.test(String(v || '').trim());
export const isNotEmpty = (v) => String(v ?? '').trim().length > 0;

const required = (errors, key, value, label) => {
  if (!isNotEmpty(value)) errors[key] = `${label} is required`;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  required(errors, 'email', email, 'Email');
  if (!errors.email && !isEmail(email)) errors.email = 'Enter a valid email';
  required(errors, 'password', password, 'Password');
  return errors;
};

export const validateJobForm = (form) => {
  const errors = {};
  required(errors, 'title',       form.title,       'Title');
  required(errors, 'description', form.description, 'Role description');
  return errors;
};

export const validateGrowForm = (form) => {
  const errors = {};
  required(errors, 'title',       form.title,       'Title');
  required(errors, 'description', form.description, 'Description');
  required(errors, 'location',    form.location,    'Location');
  if (form.price !== '' && form.price !== null && Number(form.price) < 0) {
    errors.price = 'Price cannot be negative';
  }
  if (form.spots !== '' && form.spots !== null && Number(form.spots) < 0) {
    errors.spots = 'Spots cannot be negative';
  }
  return errors;
};

export const validateApplyMessage = (message) => {
  const errors = {};
  // Message is optional but if entered must not be only whitespace.
  if (message && !message.trim()) errors.message = 'Message cannot be blank';
  if (message && message.length > 2000) errors.message = 'Message is too long (max 2000)';
  return errors;
};

export const validateStudioProfile = (form) => {
  const errors = {};
  required(errors, 'studioName',  form.studioName,  'Studio name');
  required(errors, 'contactName', form.contactName, 'Contact name');
  required(errors, 'location',    form.location,    'Location');
  if (form.profileStatus === 'active') {
    required(
      errors,
      'hiringRoleDescription',
      form.hiringRoleDescription,
      'Role description',
    );
  }
  return errors;
};

export const validateInstructorProfile = (form) => {
  const errors = {};
  required(errors, 'name',     form.name,     'Name');
  required(errors, 'location', form.location, 'Location');
  if (form.email && !isEmail(form.email)) errors.email = 'Enter a valid email';
  return errors;
};
