export const PROPERTY_TYPES = ['House', 'Apartment', 'Housing association', 'Commercial'] as const

export function validateQuote(form: FormData) {
  const get = (k: string) => String(form.get(k) ?? '').trim()
  const values = {
    name: get('name'),
    contact: get('contact'),
    postcode: get('postcode'),
    property: get('property'),
    message: get('message'),
  }
  const errors: Partial<Record<keyof typeof values, string>> = {}
  if (values.name.length < 2) errors.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact) && !/^\+?[\d\s-]{7,}$/.test(values.contact)) {
    errors.contact = 'Enter a valid email address or phone number.'
  }
  if (!/^\d{3}\s?\d{2}$/.test(values.postcode)) errors.postcode = 'Enter a five-digit postcode, e.g. 114 35.'
  if (!(PROPERTY_TYPES as readonly string[]).includes(values.property)) errors.property = 'Choose a property type.'
  return { values, errors }
}

export const QUOTE_ERROR_TEXT: Record<string, string> = {
  name: 'Please enter your name.',
  contact: 'Enter a valid email address or phone number.',
  postcode: 'Enter a five-digit postcode, e.g. 114 35.',
  property: 'Choose a property type.',
}
