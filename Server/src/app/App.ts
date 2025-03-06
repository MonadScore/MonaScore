import bodyParser, { BodyParser } from 'body-parser';
import express, { Express } from 'express';
import AccountEndpoints from './AccountEndpoints';

/**
 * Creates and initializes an Express application server
 * @returns {Object} The initialized server instance
 */
export default function App() {
  const server = new (class App {
    /** The Express application instance */
    private app: Express;

    /**
     * Initializes the Express app and starts the server
     */
    constructor() {
      this.app = express();

      this.app.listen(process.env.SERVER_PORT, () => {
        console.log(`Server is running on port ${process.env.SERVER_PORT}`);
      });
    }

    /**
     * Registers endpoints with the Express application
     * @param {Function} registerCb - Callback function to register endpoints
     * @param {Express} registerCb.app - The Express application instance
     * @param {BodyParser} registerCb.bodyParser - The body-parser middleware
     */
    public registerEndpoints(registerCb: (app: Express, bodyParser: BodyParser) => void) {
      registerCb(this.app, bodyParser);

      return this;
    }
  })();

  server.registerEndpoints(AccountEndpoints);

  return server;
}
