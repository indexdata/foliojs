# Change history for @indexdata/foliojs

## 1.1.0 (IN PROGRESS)

* Provide access to old-style authentication token (as `session.getToken()`) and new-style session cookie (as `session.getSessionCookie()`). Document these new session methods, with notes on why they should not be used. Fixes #2.
* Re-authentication timeout is configurable using the `FOLIOJS_SESSION_TIMEOUT` environment variable. Fixes #3.
* If the `FOLIOJS_OLD_AUTH` environment variable is set, authentication is limited to old-style (session token). Fixes #4.

## [1.0.0](https://github.com/MikeTaylor/foliojs/tree/v1.0.0) (2023-09-02)

* BREAKING: `session.close()` is introduced, and _must_ be called when a session is no longer needed, otherwise the program will not terminate.
* Use new-style cookie-based authentication when available, instead of old `X-Okapi-Token` authentication, refreshing the token after half of its TTL has elapsed. Fixes #1.
* Add logging category for authentication/reauthentication.
* Internally, use an HTTPError exception class.

## [0.0.2](https://github.com/MikeTaylor/foliojs/tree/v0.0.2) (2023-08-11)

* When the response to `authn/login` lacks an Okapi token in its body (which happens sometimes but I don't know under what circumstances), the token is copied there from the `x-okapi-token` header. As a result, login works against such services.

## [0.0.1](https://github.com/MikeTaylor/foliojs/tree/v0.0.1) (2023-07-28)

* New library created from scratch.

