import Logger from 'categorical-logger';
import FolioSession from './FolioSession.js';


class FolioService {
  // PRIVATE
  constructor(url) {
    this.url = url;
    this.logger = new Logger(process.env.LOGGING_CATEGORIES || process.env.LOGCAT);
  }

  log(...args) {
    return this.logger.log(...args);
  }

  async login(tenant, username, password) {
    const session = new FolioSession(this, tenant, username, password);
    await session.login();
    return session;
  }
}


export default FolioService;
