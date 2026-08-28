import type {CorsOptions} from 'cors';

export function getCorsOptions(): CorsOptions {
  return {
    origin: ['http://localhost:5173'],
    credentials: true,
  };
}
