#!/usr/bin/env node

import Folio from '../lib/index.js';

if (process.argv.length !== 5) {
  console.error('Usage:', process.argv[1], '<targetTenant> [md|package] <descriptor>');
  process.exit(1);
}
const targetTenant = process.argv[2];
const mdType = process.argv[3];
const mdFilename = process.argv[4];

const URL = process.env.OKAPI_URL || 'https://harvester-dev-okapi.folio-dev.indexdata.com';
const TENANT = process.env.OKAPI_TENANT || 'supertenant';
const USER = process.env.OKAPI_USER || 'okapi_admin';
const PW = process.env.OKAPI_PW;
if (!PW) {
  console.error(process.argv[1], 'cannot run without $OKAPI_PW');
  process.exit(2);
}

const md = Folio.parseModuleDescriptor(mdType, mdFilename);
const service = Folio.service(URL);
const session = await service.login(TENANT, USER, PW);
await session.disable(targetTenant, md.getId());
md.incrementVersion();
await session.postModule(md);
await session.enable(targetTenant, md.getId());
