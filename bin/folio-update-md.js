#!/usr/bin/env node

// In development, run with: yarn exec ./folio-update-md.js

import Folio from '../lib/index.js';

const password = process.env.FOLIO_PASSWORD;
if (!password) {
  console.error(process.argv[1], 'cannot run without $FOLIO_PASSWORD');
  process.exit(1);
}

const md = Folio.parseModuleDescriptor('package', '../../../stripes/ui-harvester-admin/package.json');
const id = md.getId();
const service = Folio.service('https://harvester-dev-okapi.folio-dev.indexdata.com');
const session1 = await service.login('supertenant', 'okapi_admin', password);
await session1.disable('harvester', id);
md.incrementVersion();
await session1.postModule(md);
await session1.enable('harvester', md.getId());

if (process.env.UPDATE_USER_PERMS) {
  const session2 = await service.login('harvester', 'harvester_admin', 'xyz123');
  const perms = md.permissionNames();
  await session2.addPermsToUser('mike', perms);
}
