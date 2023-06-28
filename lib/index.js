import FolioService from './FolioService.js';
import FolioModuleDescriptor from './FolioModuleDescriptor.js';


const Folio = {
  service: (url) => new FolioService(url),
  parseModuleDescriptor: (type, filename) => new FolioModuleDescriptor(type, filename),
};


export default Folio;
