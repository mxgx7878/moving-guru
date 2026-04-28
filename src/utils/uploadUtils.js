export const MULTIPART = {
  headers: { 'Content-Type': 'multipart/form-data' },
};

export const fileConfig = (payload) =>
  payload instanceof FormData ? MULTIPART : {};

export const withMethodOverride = (formData, method = 'PATCH') => {
  if (!(formData instanceof FormData)) return formData;
  formData.append('_method', method);
  return formData;
};