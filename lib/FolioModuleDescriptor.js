class FolioModuleDescriptor {
  constructor(type, filename) {
    console.log(`making FolioModuleDescriptor with type=${type}, filename=${filename}`);
  }

  id() {
    return '12345';
  }
}

export default FolioModuleDescriptor;
