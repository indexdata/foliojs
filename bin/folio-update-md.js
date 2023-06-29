#!/usr/bin/env node

import Folio from '../lib/index.js';

const password = process.env.FOLIO_PASSWORD;
if (!password) {
  console.error(process.argv[1], 'cannot run without $FOLIO_PASSWORD');
  process.exit(1);
}

const md = Folio.parseModuleDescriptor('package', '../../../stripes/ui-harvester-admin/package.json');
const id = md.getId();
const service = Folio.service('https://harvester-dev-okapi.folio-dev.indexdata.com');
const session = await service.login('supertenant', 'okapi_admin', password);
await session.disable('harvester', id);
md.incrementVersion();
await session.postModule(md);
await session.enable('harvester', md.getId());
