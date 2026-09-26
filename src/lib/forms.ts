/** Field descriptors rendered by StubForm.astro. */
export type Field =
  | {
      type: 'text' | 'email' | 'tel' | 'url' | 'date';
      name: string;
      label: string;
      placeholder?: string;
      required?: boolean;
      half?: boolean;
      autocomplete?: string;
    }
  | { type: 'textarea'; name: string; label: string; placeholder?: string; required?: boolean; rows?: number }
  | { type: 'select'; name: string; label: string; options: readonly string[]; required?: boolean; half?: boolean }
  | { type: 'checkboxes'; name: string; label: string; options: readonly string[] }
  | { type: 'consent'; name: string; label: string; required?: boolean };
