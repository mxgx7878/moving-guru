export const getErrorMessage = (error) => {
  const res = error.response?.data;
  if (res?.errors) {
    const messages = Object.values(res.errors)
      .flatMap((entry) => Array.isArray(entry) ? entry : [entry])
      .filter((entry) => typeof entry === 'string' && entry.trim());
    if (messages.length) return messages.join(' ');
  }
  return res?.message || error.message || 'Something went wrong';
};
