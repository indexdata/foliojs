#!/usr/bin/env node

import Folio from '../lib/index.js';

if (process.argv.length !== 4) {
  console.error('Usage:', process.argv[1], '<targetTenant> <descriptor>');
  process.exit(1);
}
const targetTenant = process.argv[2];
const mdFilename = process.argv[3];

const URL = process.env.OKAPI_URL || 'https://harvester-dev-okapi.folio-dev.indexdata.com';
const TENANT = process.env.OKAPI_TENANT || 'supertenant';
const USER = process.env.OKAPI_USER || 'okapi_admin';
const PW = process.env.OKAPI_PW;
if (!PW) {
  console.error(process.argv[1], 'cannot run without $OKAPI_PW');
  process.exit(2);
}

const service = Folio.service(URL);
const session = await service.login(TENANT, USER, PW);
const md = Folio.parseModuleDescriptor(mdFilename);
await session.disable(targetTenant, md);
md.incrementVersion();
await session.postModule(md);
await session.enable(targetTenant, md);
