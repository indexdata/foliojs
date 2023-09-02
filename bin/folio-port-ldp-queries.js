#!/usr/bin/env node

// Run as: env LOGCAT=status,ldp OKAPI_URL=https://folio-snapshot-okapi.dev.folio.org OKAPI_TENANT=diku OKAPI_USER=diku_admin OKAPI_PW=swordfish ./folio-port-ldp-queries.js RandomOtherGuy ldp-queries

import fs from 'fs';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import Folio from '../lib/index.js';

if (process.argv.length !== 4) {
  console.error('Usage:', process.argv[1], '<github-owner> <github-repo>');
  console.error('\te.g.', process.argv[1], 'RandomOtherGuy ldp-queries');
  process.exit(1);
}

const ghOwner = process.argv[2];
const ghRepo = process.argv[3];
const queryUrl = `https://api.github.com/repos/${ghOwner}/${ghRepo}/contents/queries`;

let queries;
// eslint-disable-next-line no-constant-condition
if (false) {
  // To avoid pounding GitHub's rate-limited WSAPI
  const text = fs.readFileSync('../bin/cached.json', 'utf8');
  queries = JSON.parse(text);
} else {
  const res = await fetch(queryUrl);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`cannot fetch ${queryUrl}: status ${res.status} (${res.statusText}) and text: ${text}`);
  }
  queries = await res.json();
}

const [_, session] = await Folio.defaultSetup();

// We could run all these uploads in parallel, but we want to know
// straight away if one fails, and have a sense of which ones have
// already succeeded, hence we use `await` in a loop.
/* eslint-disable no-await-in-loop */

for (let i = 0; i < queries.length; i++) {
  const entry = queries[i];
  session.log('ldp', `fetching ${entry.name} from ${entry.download_url}`);
  const res = await fetch(entry.download_url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`cannot fetch ${entry.download_url}: status ${res.status} (${res.statusText}) and text: ${text}`);
  }

  const value = await res.json();
  const id = uuidv4();
  await session.folioFetch('settings/entries', {
    json: {
      id,
      key: id,
      scope: 'ui-ldp.queries',
      value,
    },
  });
}

session.close();
