import bodyParser, { BodyParser } from 'body-parser';
import express, { Express } from 'express';
import UserRequestsInit from './UserRequestsInit';
import DBClient from '../database/DBClient';
import UserRequestHandler from './UserRequestHandler';
import MonaScoreContract from '../evm/MonaScoreContract';

/**
 * Creates and initializes an Express application server
 * @returns {Object} The initialized server instance
 */
export default function App() {
  const server = new (class App {
    /** The Express application instance */
    private app: Express;

    /**
     * The database client instance used for database operations
     */
    private dbClient: DBClient;

    /**
     * The user request handler instance that processes user-related requests
     */
    private userRequestHandler: UserRequestHandler;

    /**
     * The contracts used in the application
     */
    private contracts: {
      monaScore: MonaScoreContract;
    };

    /**
     * Initializes the Express app and starts the server
     */
    constructor() {
      this.app = express();

      this.dbClient = new DBClient();

      this.contracts = {
        monaScore: new MonaScoreContract(),
      };

      this.userRequestHandler = new UserRequestHandler(this.dbClient, this.contracts.monaScore);

      this.contracts = {
        monaScore: new MonaScoreContract(),
      };

      this.app.listen(process.env.SERVER_PORT, () => {
        console.log(`Server is running on port ${process.env.SERVER_PORT}`);
      });

      this.app.get('/health', (req, res) => {
        res.sendStatus(200);
      });
    }

    /**
     * Registers requests with the Express application
     * @param {Function} registerCb - Callback function to register requests
     * @param {Express} registerCb.app - The Express application instance
     * @param {BodyParser} registerCb.bodyParser - The body-parser middleware
     */
    public registerRequests(
      registerCb: (app: Express, bodyParser: BodyParser, userHandler: UserRequestHandler) => void
    ) {
      registerCb(this.app, bodyParser, this.userRequestHandler);

      return this;
    }
  })();

  server.registerRequests(UserRequestsInit);

  return server;
}
