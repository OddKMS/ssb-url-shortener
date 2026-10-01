import sqlite from 'sqlite3';
import { open } from 'sqlite';
import type { URL_shortened, URL_stats } from '#types';

const databaseFile = './database.db';

async function openDb() {
  return open({
    filename: databaseFile,
    driver: sqlite.Database,
  });
}

async function createDb() {
  const db = await openDb();

  // Primary database table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS ssb_url_shortener (
      id STRING PRIMARY KEY,
      url STRING NOT NULL
    );
    `);

  // Metadata database table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS ssb_url_stats (
      id STRING PRIMARY KEY,
      hits INT NOT NULL
    );
    `);

  await db.close();
}

async function insertURL(encodedURL: string, rawURL: string) {
  const db = await openDb();

  // Create a record of the url - encoding link
  await db.run(
    `
    INSERT INTO ssb_url_shortener(id, url)
    VALUES (
      ?,
      ?
    );
    `,
    [encodedURL, rawURL]
  );

  // We also create an metadata entry for the encoded URL,
  // initializing the amount of hits to 0
  await db.run(
    `
    INSERT INTO ssb_url_stats(id, hits)
    VALUES (
      ?,
      0
    );
    `,
    [encodedURL]
  );

  await db.close();
}

async function deleteURL(encodedURL: string) {
  const db = await openDb();

  await db.run(
    `
      DELETE FROM ssb_url_shortener
      WHERE id = ?
    `,
    [encodedURL]
  );

  await db.run(
    `
      DELETE FROM ssb_url_stats
      WHERE id = ?
    `,
    [encodedURL]
  );

  await db.close();
}

async function incrementHits(encodedURL: string) {
  const db = await openDb();

  const currentHits = await db.get<URL_stats>(
    `
      SELECT hits FROM ssb_url_stats
      WHERE id = ?
    `,
    [encodedURL]
  );

  // TODO handle undefined
  if (currentHits != undefined) {
    const incrementedHits = currentHits.hits + 1;

    await db.run(
      `
        UPDATE ssb_url_stats
        SET hits = ?
        WHERE id = ?
      `,
      [incrementedHits, encodedURL]
    );
  }

  await db.close();
}

async function getShortenedURL(encodedURL: string) {
  const db = await openDb();

  const shortenedURL = await db.get<URL_shortened>(
    `
      SELECT id, url FROM ssb_url_shortener
      WHERE id = ?
    `,
    [encodedURL]
  );

  await db.close();

  if (shortenedURL != undefined) {
    return shortenedURL;
  }
}

async function getURLStats(encodedURL: string) {
  const db = await openDb();

  const urlStats = await db.get<URL_stats>(
    `
      SELECT id, hits FROM ssb_url_stats
      WHERE id = ?
    `,
    [encodedURL]
  );

  await db.close();

  if (urlStats != undefined) {
    return urlStats;
  }
}

export {
  createDb,
  insertURL,
  deleteURL,
  getShortenedURL,
  incrementHits,
  getURLStats,
};
