import { encrypt, decrypt } from './crypto';

const STORAGE_PREFIX = 'soul_dash_';

export async function setSecureItem(key: string, value: string, passphrase: string): Promise<void> {
  const encrypted = await encrypt(value, passphrase);
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, encrypted);
}

export async function getSecureItem(key: string, passphrase: string): Promise<string | null> {
  const encrypted = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (!encrypted) return null;
  try {
    return await decrypt(encrypted, passphrase);
  } catch {
    return null;
  }
}

export function setItem(key: string, value: string): void {
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
}

export function getItem(key: string): string | null {
  return localStorage.getItem(`${STORAGE_PREFIX}${key}`);
}

export function removeItem(key: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
}

export async function setSecureObject<T>(key: string, obj: T, passphrase: string): Promise<void> {
  await setSecureItem(key, JSON.stringify(obj), passphrase);
}

export async function getSecureObject<T>(key: string, passphrase: string): Promise<T | null> {
  const raw = await getSecureItem(key, passphrase);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}