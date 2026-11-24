import { toast } from 'sonner';

export const showFormValidationErrors = (errors) => {
  const [field, error] = Object.entries(errors)[0] || [];
  toast.error(error?.message || 'Please check the highlighted fields.');

  requestAnimationFrame(() => {
    const dialogs = document.querySelectorAll('[role="dialog"] form');
    const form = dialogs[dialogs.length - 1] || document.activeElement?.closest('form');
    if (!form) return;

    const input = Array.from(form.querySelectorAll('[name]'))
      .find((element) => element.name === field || element.name.startsWith(`${field}.`))
      || form.querySelector('[aria-invalid="true"]');
    const target = input || form;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
  });
};
