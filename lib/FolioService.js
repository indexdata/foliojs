import FolioSession from './FolioSession.js';


class FolioService {
  constructor(url) {
    this.url = url;
  }

  async login(tenant, username, password) {
    const session = new FolioSession(this, tenant, username, password);
    await session.login();
    return session;
  }
}


export default FolioService;
