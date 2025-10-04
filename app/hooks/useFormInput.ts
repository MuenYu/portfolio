import type { ChangeEvent, FocusEvent, FormEvent } from 'react';
import { useState } from 'react';

type FormFieldElement = HTMLInputElement | HTMLTextAreaElement;

export function useFormInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (event: ChangeEvent<FormFieldElement>) => {
    setValue(event.currentTarget.value);
    setIsDirty(true);

    // Resolve errors as soon as input becomes valid
    if (error && event.currentTarget.checkValidity()) {
      setError(null);
    }
  };

  const handleInvalid = (event: FormEvent<FormFieldElement>) => {
    // Prevent native errors appearing
    event.preventDefault();
    setError(event.currentTarget.validationMessage);
  };

  const handleBlur = (event: FocusEvent<FormFieldElement>) => {
    // Only validate when the user has made a change
    if (isDirty) {
      event.currentTarget.checkValidity();
    }
  };

  return {
    value,
    error,
    onChange: handleChange,
    onBlur: handleBlur,
    onInvalid: handleInvalid,
  };
}
