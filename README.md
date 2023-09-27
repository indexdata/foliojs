# @indexdata/foliojs

Copyright (C) 2023 Index Data Aps.

This software is distributed under the terms of the Apache License, Version 2.0. See the file "[LICENSE](LICENSE)" for more information.

<!-- md2toc -l 2 README.md -->
* [Overview](#overview)
* [How to use this library](#how-to-use-this-library)
* [API](#api)
* [Environment](#environment)
* [Logging](#logging)
* [Author](#author)


## Overview

FolioJS is a simple Node library to allow the creation of scripts that manipulate instances of [the FOLIO library services platform](https://www.folio.org/). For example, [a very simple program](bin/folio-list-users.js) to list the first 20 usernames, with asterisks next to the active ones, might read as follows:
```
import Folio from '@indexdata/foliojs';

const service = Folio.service('https://folio-snapshot-okapi.dev.folio.org');
const session = await service.login('diku', 'user-basic-view', 'user-basic-view');
const body = await session.folioFetch('/users?limit=20');
console.log(body.users.map(u => `${u.active ? '*' : ' '} ${u.username}`).join('\n'));
session.close();
```

Other applications might include:
* [Updating the module-descriptor in use for a module](bin/folio-update-md.js)
* [Adding to a user the permissions defined in a module](bin/folio-add-perms.js)


## How to use this library

(People who are already familiar with Node ecosystem can skip this part.)

1. Create an area for the project that's going to use FolioJS.
2. In that area, make a `package.json` file that specifies `type` as `module` and has a dependency that provides the `@indexdata/foliojs` library (see below).
3. Write your program, including FolioJS library with `import Folio from '@indexdata/foliojs'`.

The dependency on this library can be expressed numerically, in which case a corresponding released version will be used; or it can be expressed as a GitHub repository name, in which case the current version will be used. At present, no release has yet been made, so the latter approach must be used. So for example the following `package.json` can be used:
```
{
  "type": "module",
  "dependencies": {
    "@indexdata/foliojs": "MikeTaylor/foliojs"
  }
}
```


## API

The API is described in a separate document, [The FolioJS API](doc/api.md).


## Environment

The behaviour of the FolioJS library can be modified by the values of the following environment variables:

* `LOGGING_CATEGORIES` or `LOGCAT` -- see [Logging](#logging) below.
* `FOLIOJS_OLD_AUTH` -- if defined and set to a truthy value such as `1`, new-style (cookie-based) authentication is not used, only old-style (Okapi token-based) authentication.
* `FOLIOJS_SESSION_TIMEOUT` -- if defined, the number of seconds after which a new session cookie will be requested. (If not defined, the default is to request a new cookie after half of the lifetime of the old one, which is typically about ten minutes.)

## Logging

This library uses the tiny but beautiful [`categorical-logger`](https://github.com/openlibraryenvironment/categorical-logger) library to provide optional logging. This is configured at run-time by the `LOGGING_CATEGORIES` or `LOGCAT` environment variable, which is set to a comma-separated list of categories such as `op,curl,status`. Messages in all the listed categories are logged.

Apart from categories used by `log` invocations in application code, the following categories are used by the libarary itself:
* `op`: whenever a high-level Okapi operation is about to be executed, its name and parameters are logged.
* `auth`: emits messages when authenticating or re-authenticating a session.
* `curl`: whenever an HTTP request is made, the equivalent `curl` command is logged. This can be useful for reproducing bugs.
* `status`: whenever an HTTP response is received, its HTTP status and content-type are logged. The combination of `op,status` is useful for tracing what a program is doing.
* `response`: whenever an HTTP response is received, its content is logged.


## Author

Mike Taylor (mike@indexdata.com),
for [Index Data Aps](https://www.indexdata.com/).



