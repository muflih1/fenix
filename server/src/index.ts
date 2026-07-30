import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers/_app.js';
import { createContext } from './trpc.js';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/trpc')) {
    console.log(`[tRPC] ${req.method} ${req.path}`);
  }
  next();
});

// tRPC express endpoint
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Filix LED Signage ERP API',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build files if built
const clientDist = path.resolve(process.cwd(), '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/trpc') || req.path.startsWith('/api')) {
    return next();
  }
  const indexHtml = path.join(clientDist, 'index.html');
  if (require('fs').existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Filix LED Signage ERP Express Server running at http://localhost:${PORT}`);
  console.log(`🔌 tRPC Endpoint available at http://localhost:${PORT}/trpc`);
});
