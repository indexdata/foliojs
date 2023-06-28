#!/usr/bin/env node

// In development, run with: yarn exec ./folio-fetch-users.js

// eslint-disable-next-line import/extensions
import Folio from '../lib/index.js';

const service = Folio.service('https://folio-snapshot-okapi.dev.folio.org');
const session1 = await service.login('diku', 'diku_admin', 'admin');
const body = await session1.folioFetch('/users?limit=3&query=(active=="true")');
console.log(body);
