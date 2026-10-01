import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
  json,
} from 'express';

import {
  createDb,
  insertURL,
  deleteURL,
  getShortenedURL,
  incrementHits,
  getURLStats,
} from '#helpers/database';

import md5 from 'md5';

const server = async () => {
  function TUIOutput(outputText: string, ...variables: any[]) {
    return console.log(outputText, ...variables);
  }

  // We create the database on app startup just
  // to make sure
  await createDb();

  const app: Express = express();
  const port = 3000;
  app.use(json());

  // No time for anything other than happy paths, just imagine
  // that I'm doing a lot of responsible try/catching and
  // error handling as well as parameter verification
  app.post('/shorten', async (req: Request, res: Response) => {
    // We assume the payload is a json structured like so:
    // { url: fooURL }
    const rawURL = req.body.url;
    TUIOutput('URL to be shortened:', rawURL);

    // We shorten the URL using md5 because it produces
    // a short, unique enough string as a result
    const shortenedURL = md5(rawURL);

    TUIOutput('URL shortened to:', shortenedURL);
    insertURL(shortenedURL, rawURL);

    TUIOutput('URL shortening stored in database.');
    res.send(shortenedURL);
  });

  app.get(
    '/:urlEncoded',
    async (req: Request<{ urlEncoded: string }>, res: Response) => {
      const shortURL = await getShortenedURL(req.params.urlEncoded);

      if (shortURL != undefined) {
        TUIOutput('Updating URL metadata (incrementing hit counter)');
        incrementHits(shortURL.id);

        TUIOutput('Redirecting user to requested original URL:', shortURL.url);
        res.redirect(shortURL.url);
      }
    }
  );

  app.get(
    '/:urlEncoded/stats',
    async (req: Request<{ urlEncoded: string }>, res: Response) => {
      const shortURL = await getShortenedURL(req.params.urlEncoded);
      const urlStats = await getURLStats(req.params.urlEncoded);

      if (shortURL != undefined && urlStats != undefined) {
        TUIOutput('Click-through stats for url', shortURL.url);
        TUIOutput('Click count so far:', urlStats.hits);
        res.send(urlStats.hits);
      }
    }
  );

  app.delete(
    '/:urlEncoded',
    (
      req: Request<{ urlEncoded: string }>,
      res: Response,
      next: NextFunction
    ) => {
      res.send('*poof* Your URL X shortened to code Y is gone!');
    }
  );

  app.listen(port, () => {
    TUIOutput('URL Shortener service listening on port', port);
  });
};

export default server;
