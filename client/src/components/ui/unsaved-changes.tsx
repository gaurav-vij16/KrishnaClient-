'use client';
import { createContext, useContext, useState } from 'react';
const UnsavedContext = createContext<{
  unsaved: boolean;
  setUnsaved: (value: boolean) => void;
}>({ unsaved: false, setUnsaved: () => undefined });
export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unsaved, setUnsaved] = useState(false);
  return (
    <UnsavedContext.Provider value={{ unsaved, setUnsaved }}>
      {children}
    </UnsavedContext.Provider>
  );
}
export function useUnsavedChanges() {
  return useContext(UnsavedContext);
}
