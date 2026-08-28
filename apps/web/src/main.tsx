import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import {getRouter} from './router';
import {RouterProvider} from '@tanstack/react-router';
import { ToastRegion } from './components/Toast';

const router = getRouter();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <ToastRegion />
  </StrictMode>,
);
