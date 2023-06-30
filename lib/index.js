import FolioService from './FolioService.js';
import FolioModuleDescriptor from './FolioModuleDescriptor.js';


// XXX document
async function defaultSetup() {
  const missing = [];
  ['URL', 'TENANT', 'USER', 'PW'].forEach(varName => {
    if (!process.env[`OKAPI_${varName}`]) missing.push(varName);
  });

  if (missing.length) {
    throw new Error(`defaultSetup: missing environment variables: ${missing.map(x => `OKAPI_${x}`).join(', ')}`);
  }

  const service = new FolioService(process.env.OKAPI_URL);
  const session = await service.login(process.env.OKAPI_TENANT, process.env.OKAPI_USER, process.env.OKAPI_PW);
  return [service, session];
}


const Folio = {
  service: (url) => new FolioService(url),
  defaultSetup,
  parseModuleDescriptor: (filename, type) => new FolioModuleDescriptor(filename, type),
};


export default Folio;
