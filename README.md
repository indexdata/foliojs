# @indexdata/folio

Copyright (C) 2023 Index Data Aps.

This software is distributed under the terms of the Apache License, Version 2.0. See the file "[LICENSE](LICENSE)" for more information.


## Overview

This is a simple Node library to allow the creation of scripts that manipulate instances of [the FOLIO library services platform](https://www.folio.org/). Proper documentation will follow when the API settles down, but [a very simple program](bin/folio-fetch-users.js) might read as follows:
```
import FOLIO from '@indexdata/folio';
const service = FOLIO.service('https://folio-snapshot-okapi.dev.folio.org');
const session1 = await service.login('diku', 'diku_admin', 'admin');
const body = await session1.folioFetch('/users?limit=3&query=(active=="true")');
console.log(body);
```


## Author

Mike Taylor (mike@indexdata.com)


