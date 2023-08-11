# Change history for @indexdata/foliojs

## [0.0.2](https://github.com/MikeTaylor/foliojs/tree/v0.0.2) (IN PROGRESS)

* When the response to `authn/login` lacks an Okapi token in its body (which happens sometimes but I don't know under what circumstances), the token is copied there from the `x-okapi-token` header. As a result, login works against such services.

## [0.0.1](https://github.com/MikeTaylor/foliojs/tree/v0.0.1) (2023-07-28)

* New library created from scratch.

