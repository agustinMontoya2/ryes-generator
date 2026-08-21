export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const isStrongPassword = (value: string) => STRONG_PASSWORD_RE.test(value);
