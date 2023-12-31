# The FolioJS API

Copyright (C) 2023 Index Data Aps.

<!-- md2toc -l 2 api.md -->
* [Introduction](#introduction)
* [Top level](#top-level)
    * [Folio.service(url)](#folioserviceurl)
    * [async Folio.defaultSetup()](#async-foliodefaultsetup)
    * [Folio.parseModuleDescriptor(filename, [type])](#folioparsemoduledescriptorfilename-type)
* [class `FolioService`](#class-folioservice)
    * [log(category, args...)](#logcategory-args)
    * [async login(tenant, username, password)](#async-logintenant-username-password)
    * [resumeSession(tenant, token)](#resumesessiontenant-token)
* [class `FolioSession`](#class-foliosession)
    * [close()](#close)
    * [log(category, args...)](#logcategory-args)
    * [async folioFetch(path, options)](#async-foliofetchpath-options)
    * [async postModule(md)](#async-postmodulemd)
    * [async modulesEnabled(tenant)](#async-modulesenabledtenant)
    * [async disable(tenant, moduleDescriptorOrId)](#async-disabletenant-moduledescriptororid)
    * [async enable(tenant, moduleDescriptorOrId)](#async-enabletenant-moduledescriptororid)
    * [async addPermsToUser(targetUser, perms)](#async-addpermstousertargetuser-perms)
    * [getToken()](#gettoken)
    * [getSessionCookie()](#getsessioncookie)
* [class `FolioModuleDescriptor`](#class-foliomoduledescriptor)
    * [getName()](#getname)
    * [getVersion()](#getversion)
    * [getId()](#getid)
    * [getJson()](#getjson)
    * [incrementVersion()](#incrementversion)
    * [permissionNames()](#permissionnames)
* [Note: synchronous and asynchronous operations](#note-synchronous-and-asynchronous-operations)



## Introduction

FolioJS is a simple Node library to allow the creation of scripts that manipulate instances of [the FOLIO library services platform](https://www.folio.org/).

The API consists of a single exported object which provides three functions, and three classes. Except where noted, all errors (including non-2xx HTTP responses) result in exceptions being thrown.



## Top level

A single object, `Folio`, is imported. It provides three functions:


### Folio.service(url)

Creates and returns a new `FolioService` object associated with the specified Okapi URL. It is possible for a program to use multiple FOLIO services. See below for details of the `FolioService` class.


### async Folio.defaultSetup()

A convenience function that sets up a service and a session using that service, returned together as the array `[service, session]`.

The service uses the URL specified by the `OKAPI_URL` environment variable; the session is for the tenant specified by the `OKAPI_TENANT` environment variable, and is authenticated by the username and password specified in the `OKAPI_USER` and `OKAPI_PW` environment variables. An exception is thrown if any of these required environment variables is unset.

(The names of these enviroment variables follow an informal convention that is used by some other command-line FOLIO utilities, including [`okapi-curl`](https://github.com/MikeTaylor/okapi-curl).)


### Folio.parseModuleDescriptor(filename, [type])

Parses the module descriptor in `filename` and returns a new `FolioModuleDescriptor` object representing it.

The type may be `md` (in which case the file is assumed to be already in module-descriptor form, as is the case for back-end FOLIO modules) or `package` (in which case it is assumed to be the package file of a Node module providing a UI module, and is translated into a module descriptor using the same rules as `stripes mod descriptor --full`).

If `type` is undefined or omitted, then the nominated file is assumed to be a Node package file if it ends with `package.json`, and a module descriptor otherwise.



## class `FolioService`

Service objects are not created directly by client code, but by the `Folio.service` factory function.

A service object is not associated with any particular tenant: for that, you need a session.

Aside from the private constructor, the following methods exist:


### log(category, args...)

Emits a log message in the specified category: see below for details.


### async login(tenant, username, password)

Creates and returns a new `FolioService` object, representing a session in the specified tenant of the service, logged in with the specified credentials (username and password). The session object retains the authentication token, and re-uses it for subsequent operations.


### resumeSession(tenant, token)

Creates and returns a new `FolioService` object, representing a session that was previously created a login, indicated by the specified token -- usually a 236-character-long string beginning `eyJhbGci`. This is arguably a rather rude thing to do, but can sometimes be invaluable for recovering from certain kinds of problem.



## class `FolioSession`

Session objects are not created directly by client code, but by the `service.login` factory function. Each session is permanently associated with a particular service, and permanently pertains to a particular tenant on that service. It is possible for a program to use sessions on the same or different FOLIO services.

Aside from the private constructor and a private login method, the following public methods exist:


### close()

Ends a session and releases its resources.

> **Note.**
> It is _critically important_ to close session when they are no longer needed, otherwise the thread that periodically refreshes the session's access token is never shut down and the program will not terminate.


### log(category, args...)

Emits a log message in the specified category: see below for details.


### async folioFetch(path, options)

Asynchronously performs the specified HTTP operation on the session, using an API much like that of [standard `fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch). As usual, the optional `options` object can be used to set `method`, `headers`, `body`, etc.

The differences from regular `fetch` are:
* A path is passed rather than a full URL: this is interpreted relative to the service URL that was specified in the constructor of the service that the session is on.
* The `X-Okapi-Tenant` header is automatically set from the session.
* The `X-Okapi-Token` header is automatically set from the login response.
* If the provided `options` has a `json` member, which should be of type object, it is stringified and set as the body of the reqeust, and a `Content-type: application/json` header is added.
* If a body is provided (either as `body` or `json`) and no method is specified, then POST is used.
* All non-2xx HTTP responses are converted into exceptions of type `Error`.
* The value returted from a successful call is the parsed JSON of the response, or undefined if there is no content, rather than a [Response object](https://developer.mozilla.org/en-US/docs/Web/API/Response).

All of these changes make this fetch function convenient to use with FOLIO services.


### async postModule(md)

Posts the module specified by the `FolioModuleDescriptor` object `md` to the session's service, making it available to be enabled by tenants on that service.


### async modulesEnabled(tenant)

Returns a list of all modules that are enabled for the specified tenant. Note that this is not necessarily the tenant of the session: in particular, this method may be evoked by a supertenant session to inspect the modules enabled for a regular tenant.


### async disable(tenant, moduleDescriptorOrId)

Disables the module specified by the supplied module-descriptor (a `FolioModuleDescriptor` object) or ID (string) for the specified tenant.


### async enable(tenant, moduleDescriptorOrId)

Enables the module specified by the supplied module-descriptor (a `FolioModuleDescriptor` object) or ID (string) for the specified tenant.


### async addPermsToUser(targetUser, perms)

Adds the specified array permissions (such as those returned by `md.permissions()`) to the user whose username is specified.


### getToken()

If the session was logged in using old-style FOLIO authentication with a long-lived token that is used as the value of the `X-Okapi-Token` header in subsequent operations, then its value is returned by this call. <span style="font-weight: 700; color: #c00">Note. You are encouraged not to use this</span> but instead to continue using the session object, which handles its own authentication.


### getSessionCookie()

If the session was logged in using new-style FOLIO authentication with a short-lived cookie that is returned in the headers of subsequent reqeuests, then its value is returned by this call. <span style="font-weight: 700; color: #c00">Note. You are encouraged not to use this</span> but instead to continue using the session object, which handles its own authentication. In particular, note that session cookies expire without warning, potentially leading to mysterious failures.


## class `FolioModuleDescriptor`

Service objects are not created directly by client code, but by the `Folio.parseModuleDescriptor` factory function. They represent parsed module descriptors.

Aside from the private constructor, the following methods exist:


### getName()

Returns the name of the module, e.g. `folio_circulation-log` (a UI module in the `@folio` space) or `mod-graphql` (a back-end module).


### getVersion()

Returns the version number of the module as a three-facet string, e.g. `3.0.0` or `1.11.0`.


### getId()

Returns the full ID of the module, combining the name and version, as used in Okapi requests: for example, 
`folio_circulation-log-3.0.0` (a UI module) or `mod-graphql-1.11.0` (a back-end module).

The name, version and ID should all be treated as opaque tokens.


### getJson()

Returns the JSON structure of the module descriptor, whether it was read directly from a module-descriptor file (type=`md`) or translated from a Node package file (type=`package`). Note that this is an object, not a string.


### incrementVersion()

Statefully increments the version number of the module by increasing its patchlevel by one. The major and minor parts of the version number are unaffected, so for example `2.0.13` becomes `2.0.14`.

**Note.** This method exists only for its side-effect. If this was a Ruby library, the method name would end with `!`. After it is invoked, any old values of the module version, ID or content must be discarded, and new values obtained using `md.getVersion()`, `md.getId()` and `md.getJson()`.


### permissionNames()

Returns an array of the names of all the permissions defined by the module descriptor.



## Note: synchronous and asynchronous operations

In Node programming, many operations are asynchronous -- a feature that is powerful, but which requires some thought to use correctly. The asynchronous functions provided by this library are marked `async` above, and can be invoked synchronously by prefixing their invocation with `await`. This is probably the right way to do things in most scripting contexts, but more sophisticated applications can be built if desired.



