import dotenv from 'dotenv';
import App from './app/App';

if (process.env.IS_PRODUCTION === 'production') {
  dotenv.config({ path: '.env.production' });
} else if (process.env.IS_PRODUCTION === 'development') {
  dotenv.config({ path: '.env.public' });
}

App();
