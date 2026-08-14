import { useCallback, useState } from 'react';

export function useCollection<T extends { id: string }>(initialValue: T[]) {
  const [items, setItems] = useState<T[]>(initialValue);

  const add = useCallback((item: Omit<T, 'id'>, prepend = false): T => {
    const newItem = { ...item, id: crypto.randomUUID() } as T;
    setItems((prev) => (prepend ? [newItem, ...prev] : [...prev, newItem]));
    return newItem;
  }, []);

  const update = useCallback((id: string, patch: Partial<T>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, setItems, add, update, remove };
}
