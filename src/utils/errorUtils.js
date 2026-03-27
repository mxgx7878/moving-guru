export const getErrorMessage = (error) => {
  const res = error.response?.data;
  if (res?.message) return res.message;
  if (res?.errors) {
    // Laravel validation: flatten first error of each field
    const firstErrors = Object.values(res.errors).map((arr) =>
      Array.isArray(arr) ? arr[0] : arr,
    );
    return firstErrors.join(', ');
  }
  return error.message || 'Something went wrong';
};
