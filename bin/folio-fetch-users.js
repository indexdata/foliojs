#!/usr/bin/env node

// In development, run with: yarn exec ./folio-fetch-users.js

import Folio from '../lib/index.js';

const service = Folio.service('https://folio-snapshot-okapi.dev.folio.org');
const session1 = await service.login('diku', 'user-basic-view', 'user-basic-view');
const body = await session1.folioFetch('/users?limit=3&query=(active=="true")');
console.log(body);
