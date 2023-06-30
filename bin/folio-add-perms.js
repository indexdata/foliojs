#!/usr/bin/env node

import Folio from '../lib/index.js';

if (process.argv.length !== 4) {
  console.error('Usage:', process.argv[1], '<descriptor> <targetUser>');
  process.exit(1);
}

const mdFilename = process.argv[2];
const targetUser = process.argv[3];

const md = Folio.parseModuleDescriptor(mdFilename);
const perms = md.permissionNames();
const [_, session] = await Folio.defaultSetup();
await session.addPermsToUser(targetUser, perms);
