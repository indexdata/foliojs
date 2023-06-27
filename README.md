# @indexdata/folio

Copyright (C) 2023 Index Data Aps.

This software is distributed under the terms of the Apache License, Version 2.0. See the file "[LICENSE](LICENSE)" for more information.


## Overview

This is a simple Node library to allow the creation of scripts that manipulate instances of [the FOLIO library services platform](https://www.folio.org/). Proper documentation will follow when the API settles down, but [a very simple program](bin/folio-fetch-users.js) might read as follows:
```
import FOLIO from '@indexdata/folio';

async function main() {
  const service = FOLIO.service('https://folio-snapshot-okapi.dev.folio.org');
  const session1 = await service.login('diku', 'diku_admin', 'admin');
  const body = await session1.folioFetch('/users?limit=3&query=(active=="true")');
  console.log(body);
}

main();
```

Unfortunately, the tedious wrapping-in-`main` boilerplate seems to be required by Node's inability to `await` at the top level. (If anyone can think of a way to avoid this, that doesn't involve explicit promise-chaining, I am all ears.)


## Author

Mike Taylor (mike@indexdata.com)


