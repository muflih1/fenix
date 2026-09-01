import 'dotenv/config';
import {UserService} from '../services/index.js';

async function seedManager() {
  await UserService.createEmployee({
    name: 'Manager',
    email: process.env.MANAGER_EMAIL as string,
    password: process.env.MANAGER_PASSWORD as string,
    role: 'MANAGER',
  });
}

async function bootstrap() {
  await seedManager();
}

bootstrap()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
