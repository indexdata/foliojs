# @indexdata/foliojs

Copyright (C) 2023 Index Data Aps.

This software is distributed under the terms of the Apache License, Version 2.0. See the file "[LICENSE](LICENSE)" for more information.

<!-- md2toc -l 2 README.md -->
* [Overview](#overview)
* [API](#api)
* [Logging](#logging)
* [Synchronous and asynchronous operations](#synchronous-and-asynchronous-operations)
* [Author](#author)


## Overview

FolioJS is a simple Node library to allow the creation of scripts that manipulate instances of [the FOLIO library services platform](https://www.folio.org/). For example, [a very simple program](bin/folio-list-users.js) to list the first 20 usernames, with asterisks next to the active ones, might read as follows:
```
import Folio from '../lib/index.js';

const service = Folio.service('https://folio-snapshot-okapi.dev.folio.org');
const session = await service.login('diku', 'user-basic-view', 'user-basic-view');
const body = await session.folioFetch('/users?limit=20');
console.log(body.users.map(u => `${u.active ? '*' : ' '} ${u.username}`).join('\n'));
```

Other applications might include:
* [Updating the module-descriptor in use for a module](bin/folio-update-md.js)
* [Adding to a user the permissions defined in a module](bin/folio-add-perms.js)


## API

The API is described in a separate document, [The FolioJS API](doc/api.md).


## Logging

This library uses the tiny but beautiful [`categorical-logger`](https://github.com/openlibraryenvironment/categorical-logger) library to provide optional logging. This is configured at run-time by the `LOGGING_CATEGORIES` or `LOGCAT` environment variable, which is set to a comma-separated list of categories such as `op,curl,status`. Messages in all the listed categories are logged.

Apart from categories used by `log` invocations in application code, the following categories are used by the libarary itself:
* `op`: whenever a high-level Okapi operation is about to be executed, its name and parameters are logged.
* `curl`: whenever an HTTP request is made, the equivalent `curl` command is logged. This can be useful for reproducing bugs.
* `status`: whenever an HTTP response is received, its HTTP status and content-type are logged. The combination of `op,status` is useful for tracing what a program is doing.
* `response`: whenever an HTTP response is received, its content is logged.


## Author

Mike Taylor (mike@indexdata.com),
for [Index Data Aps](https://www.indexdata.com/).



