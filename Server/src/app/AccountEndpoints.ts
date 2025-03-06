import { BodyParser } from 'body-parser';
import { Express } from 'express';

export default function AccountEndpoints(app: Express, bodyParser: BodyParser) {
  app.get('/test', bodyParser.json(), (req, res) => {
    res.send('Hello World');
  });
}
