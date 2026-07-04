import React from 'react';
import { AuthProvider } from './providers/AuthProvider';

export function rootContainer(container: React.ReactNode) {
  return <AuthProvider>{container}</AuthProvider>;
}
