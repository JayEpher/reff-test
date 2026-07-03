import React from 'react';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';

export function rootContainer(container: React.ReactNode) {
  return (
    <QueryProvider>
      <AuthProvider>{container}</AuthProvider>
    </QueryProvider>
  );
}
