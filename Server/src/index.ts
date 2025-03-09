import dotenv from 'dotenv';
import App from './app/App';

/**
 * Entry point for the MonaScore server application
 * Loads environment variables and initializes the Express server
 */
dotenv.config({ path: '.env.public' });

App();
