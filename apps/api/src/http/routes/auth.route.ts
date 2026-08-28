import {Router} from 'express';
import {AuthController} from '../controllers/index.js';

const router = Router();

router.post('/login', AuthController.loginHandler);

export default router;
