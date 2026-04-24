import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useFileUploadPreview
 * ─────────────────────────────────────────────────────────────
 * Unified handling for image uploads across every profile form:
 *   - Single-file mode (avatar, cover image): hook returns a `preview`
 *     string and a `file` to hand to FormData on submit.
 *   - Multi-file mode (gallery, up to `max`): returns `previews[]`
 *     (mix of existing URLs + freshly-created object URLs) and the
 *     matching `files[]` of raw File handles to upload.
 *
 * Existing values (e.g. the profile picture already on the server) can
 * be seeded via `initial` so the UI can start with a rendered preview
 * on mount without the user re-uploading.
 *
 * The hook revokes its own object URLs on unmount / replacement so
 * long-lived forms don't leak memory.
 *
 * @param {object}  opts
 * @param {boolean} [opts.multiple=false]
 * @param {number}  [opts.max=4]     — only used in multiple mode
 * @param {string | string[]} [opts.initial]
 */
export default function useFileUploadPreview({
  multiple = false,
  max = 4,
  initial,
} = {}) {
  const inputRef = useRef(null);

  // Track every blob: URL we create so we can revoke on teardown.
  const createdUrlsRef = useRef([]);

  const [preview, setPreview] = useState(() => {
    if (multiple) return Array.isArray(initial) ? initial : [];
    return typeof initial === 'string' ? initial : null;
  });
  const [files, setFiles] = useState(() => (multiple ? [] : null));

  // Sync initial → preview when it changes (e.g. after updateProfile
  // returns a new URL from the server).
  useEffect(() => {
    if (multiple) {
      setPreview(Array.isArray(initial) ? initial : []);
    } else if (typeof initial === 'string') {
      setPreview(initial);
    }
  }, [initial, multiple]);

  // Revoke blob URLs on unmount.
  useEffect(() => {
    return () => {
      createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      createdUrlsRef.current = [];
    };
  }, []);

  const trackUrl = (url) => {
    createdUrlsRef.current.push(url);
    return url;
  };

  const onChange = useCallback((event) => {
    const list = Array.from(event.target.files || []);
    if (list.length === 0) return;

    if (!multiple) {
      const f = list[0];
      const url = trackUrl(URL.createObjectURL(f));
      setPreview(url);
      setFiles(f);
      return;
    }

    setPreview((prev) => {
      const remaining = Math.max(0, max - prev.length);
      const accepted  = list.slice(0, remaining);
      setFiles((curr) => [...(curr || []), ...accepted]);
      return [...prev, ...accepted.map((f) => trackUrl(URL.createObjectURL(f)))];
    });
    // Reset the input so selecting the same file again still triggers onChange.
    event.target.value = '';
  }, [multiple, max]);

  const removeAt = useCallback((index) => {
    if (!multiple) {
      setPreview(null);
      setFiles(null);
      return;
    }
    setPreview((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => (prev || []).filter((_, i) => i !== index));
  }, [multiple]);

  const reset = useCallback(() => {
    if (multiple) {
      setPreview([]);
      setFiles([]);
    } else {
      setPreview(null);
      setFiles(null);
    }
  }, [multiple]);

  const open = useCallback(() => inputRef.current?.click(), []);

  return { inputRef, preview, files, onChange, removeAt, reset, open };
}
