import React from 'react';
import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/estimator')({
  component: EstimatorPageRedirect,
});

export function EstimatorPageRedirect() {
  return <Navigate to="/" replace />;
}
