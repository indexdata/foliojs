#!/usr/bin/env node

import Folio from '../lib/index.js';

const service = Folio.service('https://folio-snapshot-okapi.dev.folio.org');
const session = await service.login('diku', 'user-basic-view', 'user-basic-view');
const body = await session.folioFetch('/users?limit=20');
console.log(body.users.map(u => `${u.active ? '*' : ' '} ${u.username}`).join('\n'));
session.close();
