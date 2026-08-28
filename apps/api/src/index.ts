import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import * as trpcExpress from '@trpc/server/adapters/express';
import {appRouter, createContext} from './trpc/index.js';
import HttpRouter from './http/routes/index.js';
import {globalErrorHandler} from './http/middlewares/index.js';
import {getCorsOptions} from './lib/cors.js';
import {session} from './http/middlewares/session.middleware.js';

const app = express();

app
  .use(express.json())
  .use(express.urlencoded({extended: true}))
  .use(cors(getCorsOptions()))
  .use(cookieParser())
  .use(
    helmet({
      crossOriginResourcePolicy: {policy: 'cross-origin'},
    }),
  )
  .use(morgan('dev'))
  .use(session());

app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);
app.use(
  '/api',
  (req, res, next) => {
    console.log(req.session);
    next();
  },
  HttpRouter,
);

app.use(globalErrorHandler);

app.listen(3000, () => console.log('Listening at http://localhost:3000'));
