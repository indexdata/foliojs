import fs from 'fs';


// Must perform the same conversion as stripes-cli/lib/cli/generate-module-descriptor.js
function package2md(packageJson, isStrict) {
  const stripes = packageJson.stripes || {};
  const moduleDescriptor = {
    id: `${packageJson.name.replace(/^@/, '').replace('/', '_')}-${packageJson.version}`,
    name: packageJson.description,
    permissionSets: stripes.permissionSets || [],
  };
  if (isStrict) {
    const interfaces = stripes.okapiInterfaces || [];
    moduleDescriptor.requires = Object.keys(interfaces).map(key => ({ id: key, version: interfaces[key] }));
    const optional = stripes.optionalOkapiInterfaces || [];
    moduleDescriptor.optional = Object.keys(optional).map(key => ({ id: key, version: optional[key] }));
  }
  return moduleDescriptor;
}


class FolioModuleDescriptor {
  // PRIVATE
  constructor(filename, type) {
    if (!type) {
      // eslint-disable-next-line no-param-reassign
      type = (filename === 'package.json' || filename.endsWith('/package.json')) ? 'package' : 'md';
    }
    if (type !== 'md' && type !== 'package') {
      throw new Error(`FolioModuleDescriptor: bad type "${type}" (should be "md" or "package")`);
    }

    this.type = type;
    this.filename = filename;
    this.text = fs.readFileSync(filename, { encoding: 'utf-8' });
    const json = JSON.parse(this.text);
    if (type === 'md') {
      this.json = json;
    } else {
      this.json = package2md(json, true);
    }
    this.name = this.json.id.replace(/(.*)-.*/, '$1');
    this.version = this.json.id.replace(/.*-/, '');
  }

  getName() {
    return this.name;
  }

  getVersion() {
    return this.version;
  }

  getId() {
    return this.json.id;
  }

  getJson() {
    return this.json;
  }

  incrementVersion() {
    const majorMinor = this.version.replace(/(.*)\..*/, '$1');
    const patchLevel = this.version.replace(/.*\./, '');
    this.version = `${majorMinor}.${Number(patchLevel) + 1}`;
    this.json.id = `${this.name}-${this.version}`;
  }

  permissionNames() {
    return (this.json.permissionSets || []).map(perm => perm.permissionName);
  }
}


export default FolioModuleDescriptor;
