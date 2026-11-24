export const validateAccountFields = (form) => {
  const errors = {};
  if (!form.name?.trim()) errors.name = "Name is required";
  else if (form.name.trim().length < 3) errors.name = "Name must be at least 3 characters";
  if (!form.email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email address";
  if (!form.password) errors.password = "Password is required";
  else if (form.password.length < 12) errors.password = "Password must be at least 12 characters";
  if (!form.confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";
  return errors;
};

export const validateRegistrationStep = (form, role, step, lastStep) => {
  if (step === 1) return validateAccountFields(form);
  const errors = {};
  if (role === "instructor") {
    if (step === 2) {
      const age = Number(form.age);
      if (!form.age) errors.age = "Age is required";
      else if (!Number.isInteger(age) || age < 16 || age > 100) errors.age = "Age must be between 16 and 100";
    }
    if (step === 3 && !form.countryFrom) errors.countryFrom = "Please select your country";
    if (step === 3 && !form.availableFrom) errors.availableFrom = "Please select a start date";
    if (step === 4 && !form.disciplines?.length) errors.disciplines = "Select at least one discipline";
  }
  if (role === "studio") {
    if (step === 2 && !form.studioName?.trim()) errors.studioName = "Studio name is required";
    if (step === 2 && !form.location?.trim()) errors.location = "City is required";
    if (step === 2 && !form.country) errors.country = "Country is required";
    if (step === 3 && !form.disciplines?.length) errors.disciplines = "Select at least one discipline";
  }
  if (form.bio?.length > 500 && step === lastStep - 1) errors.bio = "Bio must be 500 characters or fewer";
  if (step === lastStep && !form.plan) errors.plan = "Please select a subscription plan";
  return errors;
};

export const firstInvalidRegistrationStep = (form, role, lastStep) => {
  for (let step = 1; step <= lastStep; step += 1) {
    const errors = validateRegistrationStep(form, role, step, lastStep);
    if (Object.keys(errors).length) return { step, errors };
  }
  return null;
};
