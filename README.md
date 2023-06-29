# @indexdata/foliojs

Copyright (C) 2023 Index Data Aps.

This software is distributed under the terms of the Apache License, Version 2.0. See the file "[LICENSE](LICENSE)" for more information.

<!-- md2toc -l 2 README.md -->
* [Overview](#overview)
* [API](#api)
    * [Top level](#top-level)
        * [Folio.service(url)](#folioserviceurl)
        * [Folio.parseModuleDescriptor(type, filename)](#folioparsemoduledescriptortype-filename)
    * [class `FolioService`](#class-folioservice)
        * [log(category, args...)](#logcategory-args)
        * [async login(tenant, username, password)](#async-logintenant-username-password)
    * [class `FolioSession`](#class-foliosession)
        * [log(category, args...)](#logcategory-args)
        * [async folioFetch(path, options)](#async-foliofetchpath-options)
        * [async postModule(md)](#async-postmodulemd)
        * [async modulesEnabled(tenant)](#async-modulesenabledtenant)
        * [async disable(tenant, moduleId)](#async-disabletenant-moduleid)
        * [async enable(tenant, moduleId)](#async-enabletenant-moduleid)
    * [class `FolioModuleDescriptor`](#class-foliomoduledescriptor)
        * [getName()](#getname)
        * [getVersion()](#getversion)
        * [getId()](#getid)
        * [getJson()](#getjson)
        * [incrementVersion()](#incrementversion)
* [Logging](#logging)
* [Synchronous and asynchronous operations](#synchronous-and-asynchronous-operations)
* [Author](#author)



## Overview

This is a simple Node library to allow the creation of scripts that manipulate instances of [the FOLIO library services platform](https://www.folio.org/). For example, [a very simple program](bin/folio-list-users.js) to fetch list the first 20 usernames with asterisks next to the active ones might read as follows:
```
import Folio from '../lib/index.js';

const service = Folio.service('https://folio-snapshot-okapi.dev.folio.org');
const session = await service.login('diku', 'user-basic-view', 'user-basic-view');
const body = await session.folioFetch('/users?limit=20');
console.log(body.users.map(u => `${u.active ? '*' : ' '} ${u.username}`).join('\n'));
```



## API

The API consists of a single exported object which provides two functions, and three classes. Except where noted, all errors (including non-2xx HTTP responses) result in exceptions being thrown.


### Top level

A single object, `Folio`, is imported. It provides two functions:

#### Folio.service(url)

Creates and returns a new `FolioService` object associated with the specified Okapi URL. It is possible for a program to use multiple FOLIO services. See below for details of the `FolioService` class.

#### Folio.parseModuleDescriptor(type, filename)

Parses the module descriptor in `filename` and returns a new `FolioModuleDescriptor` object representing it. The type may be `md` (in which case the file is assumed to be already in module-descriptor form, as is the case for back-end FOLIO modules) or `package` (in which case it is assumed to be the package file of a Node module providing a UI module, and is translated into a module descriptor using the same rules as `stripes mod descriptor --full`).


### class `FolioService`

Service objects are not created directly by client code, but by the `Folio.service` factory function.

A service object is not associated with any particular tenant: for that, you need a session.

Aside from the private constructor, the following methods exist:

#### log(category, args...)

Emits a log message in the specified category: see below for details.

#### async login(tenant, username, password)

Creates and returns a new `FolioService` object, representing a session in the specified tenant of the service, logged in with the specified credentials (username and password). The session object retains the authentication token, and re-uses it for subsequent operations.

### class `FolioSession`

Session objects are not created directly by client code, but by the `service.login` factory function. Each session is permanently associated with a particular service, and permanently pertains to a particular tenant on that service. It is possible for a program to use sessions on the same or different FOLIO services.

Aside from the private constructor and a private login method, the following public methods exist:

#### log(category, args...)

Emits a log message in the specified category: see below for details.

#### async folioFetch(path, options)

Asynchronously performs the specified HTTP operation on the session, using an API much like that of [standard `fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch). As usual, the optional `options` object can be used to set `method`, `headers`, `body`, etc.

The differences from regular `fetch` are:
* A path is passed rather than a full URL: this is interpreted relative to the service URL that was specified in the constructor of the service that the session is on.
* The `X-Okapi-Tenant` header is automatically set from the session.
* The `X-Okapi-Token` header is automatically set from the login response.
* If the provided `options` has a `json` member, which should be of type object, it is stringified and set as the body of the reqeust, and a `Content-type: application/json` header is added.
* All non-2xx HTTP responses are converted into exceptions of type `Error`.
* The value returted from a successful call is the parsed JSON of the response, or undefined if there is no content, rather than a [Response object](https://developer.mozilla.org/en-US/docs/Web/API/Response).

All of these changes make this fetch function convenient to use with FOLIO services.

#### async postModule(md)

Posts the module specified by the `FolioModuleDescriptor` object `md` to the session's service, making it available to be enabled by tenants on that service.

#### async modulesEnabled(tenant)

Returns a list of all modules that are enabled for the specified tenant. Note that this is not necessarily the tenant of the session: in particular, this method may be evoked by a supertenant session to inspect the modules enabled for a regular tenant.

#### async disable(tenant, moduleId)

Disables the module specified by the supplied ID for the specified tenant.

#### async enable(tenant, moduleId)

Enables the module specified by the supplied ID for the specified tenant.


### class `FolioModuleDescriptor`

Service objects are not created directly by client code, but by the `Folio.parseModuleDescriptor` factory function. They represent parsed module descriptors.

Aside from the private constructor, the following methods exist:

#### getName()

Returns the name of the module, e.g. `folio_circulation-log` (a UI module in the `@folio` space) or `mod-graphql` (a back-end module).

#### getVersion()

Returns the version number of the module as a three-facet string, e.g. `3.0.0` or `1.11.0`.

#### getId()

Returns the full ID of the module, combining the name and version, as used in Okapi requests: for example, 
`folio_circulation-log-3.0.0` (a UI module) or `mod-graphql-1.11.0` (a back-end module).

The name, version and ID should all be treated as opaque tokens.

#### getJson()

Returns the JSON structure of the module descriptor, whether it was read directly from a module-descriptor file (type=`md`) or translated from a Node package file (type=`package`). Note that this is an object, not a string.

#### incrementVersion()

Statefully increments the version number of the module by increasing its patchlevel by one. The major and minor parts of the version number are unaffected, so for example `2.0.13` becomes `2.0.14`.

**Note.** This method exists only for its side-effect. If this was a Ruby library, the method name would end with `!`. After it is invoked, any old values of the module version, ID or content must be discarded, and new values obtained using `md.getVersion()`, `md.getId()` and `md.getJson()`.



## Logging

This library uses [`categorical-logger`](https://github.com/openlibraryenvironment/categorical-logger) to provide optional logging. This is configured at run-time by setting `LOGGING_CATEGORIES` or `LOGCAT` environment variabl, which is set to a comma-separated list of categories such as `curl,status,response`. Messages in all the listed categories are logged.

Apart from categories used by `log` invocations in application node, the following categories are used by the libarary itself:
* `curl`: whenever an HTTP request is made, the equivalent `curl` command is logged. This can be useful for reproducing bugs.
* `status`: whenever an HTTP response is received, its HTTP status and content-type are logged.
* `response`: whenever an HTTP response is received, its content is logged.


## Synchronous and asynchronous operations

In Node programming, many operations are asynchronous -- a feature that is powerful, but which requires some thought to use correctly. The asynchronous functions provided by this library are marked `async` above, and can be invoked synchronously by prefixing their invocation with `await`. This is probably the right way to do things in most scripting contexts, but more sophisticated applications can be built if desired.



## Author

Mike Taylor (mike@indexdata.com)


