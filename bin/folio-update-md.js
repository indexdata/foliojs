#!/usr/bin/env node

// In development, run with: yarn exec ./folio-update-md.js

// eslint-disable-next-line import/extensions
import Folio from '../lib/index.js';

const md = Folio.parseModuleDescriptor('package', './package.json');
const id = md.id();
const service = Folio.service('https://harvester-dev-okapi.folio-dev.indexdata.com');
const session1 = await service.login('supertenant', 'okapi_admin', 'abc123');
await session1.disable('diku', id);
md.incrementId();
await session1.post(md);
await session1.enable('diku', id);

const session2 = await service.login('diku', 'diku_admin', 'xyz123');
const perms = md.permissionNames();
await session2.addPermsToUser('mike', perms);
