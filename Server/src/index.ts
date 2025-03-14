import dotenv from 'dotenv';
import App from './app/App';

let env = '';

if (process.env.IS_PRODUCTION === 'production') {
  env = '.env.production';
} else {
  env = '.env.public';
}

/**
 * Entry point for the MonaScore server application
 * Loads environment variables and initializes the Express server
 */
dotenv.config({ path: env });

App();
