import { useCallback, useEffect, useRef, useState } from 'react';

export default function useFileUploadPreview({
  multiple = false,
  max = 4,
  initial,
} = {}) {
  const inputRef = useRef(null);

  const createdUrlsRef = useRef([]);

  const [preview, setPreview] = useState(() => {
    if (multiple) return Array.isArray(initial) ? initial : [];
    return typeof initial === 'string' ? initial : null;
  });
  const [files, setFiles] = useState(() => (multiple ? [] : null));

  useEffect(() => {
    if (multiple) {
      setPreview(Array.isArray(initial) ? initial : []);
    } else if (typeof initial === 'string') {
      setPreview(initial);
    }
  }, [initial, multiple]);

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
