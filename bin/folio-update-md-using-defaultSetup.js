#!/usr/bin/env node

// Run as: env LOGCAT=status OKAPI_URL=https://harvester-dev-okapi.folio-dev.indexdata.com OKAPI_TENANT=supertenant OKAPI_USER=okapi_admin OKAPI_PW=swordfish ../bin/folio-update-md2.js harvester package ../../../stripes/ui-harvester-admin/package.json

import Folio from '../lib/index.js';

if (process.argv.length !== 5) {
  console.error('Usage:', process.argv[1], '<targetTenant> [md|package] <descriptor>');
  process.exit(1);
}
const targetTenant = process.argv[2];
const mdType = process.argv[3];
const mdFilename = process.argv[4];

const [_, session] = await Folio.defaultSetup();
const md = Folio.parseModuleDescriptor(mdType, mdFilename);
await session.disable(targetTenant, md);
md.incrementVersion();
await session.postModule(md);
await session.enable(targetTenant, md);
