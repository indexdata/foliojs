import nodeFetch from 'node-fetch';
import fetchCookie from 'fetch-cookie';
import { fetchToCurl } from 'fetch-to-curl';
import HTTPError from './HTTPError.js';

const fetch = fetchCookie(nodeFetch);


// PRIVATE
function mergeArrays(a1, a2) {
  const register = {};
  a1.forEach(key => { register[key] = true; });

  const res = [...a1];
  a2.forEach(entry => {
    if (!register[entry]) {
      res.push(entry);
      register[entry] = true;
    }
  });

  return res;
}


class FolioSession {
  // PRIVATE
  constructor(service, tenant, username, password) {
    this.service = service;
    this.tenant = tenant;
    this.username = username;
    this.password = password;
    this.oldStyle = false; // Whether old-style (X-Okapi-Token) authentication is in use
    this.timeoutId = undefined;
  }

  close() {
    clearTimeout(this.timeoutId);
  }

  log(...args) {
    return this.service.log(...args);
  }

  async folioFetch(path, baseOptions) {
    const url = `${this.service.url}${path.startsWith('/') ? '' : '/'}${path}`;

    const options = { ...baseOptions };
    options.headers = baseOptions?.headers || {};
    options.headers['X-Okapi-Tenant'] = this.tenant;
    if (this.token) {
      options.headers['X-Okapi-Token'] = this.token;
    } else {
      options.credentials = 'include';
    }
    if (options.json) {
      options.headers['Content-type'] = 'application/json';
      options.body = JSON.stringify(options.json);
      delete options.json;
    }
    if (options.body && !options.method) options.method = 'POST';
    this.log('curl', fetchToCurl(url, options));

    const res = await fetch(url, options);
    this.log('status', `${res.status} ${res.statusText} (${res.headers.get('Content-Type')})`);
    const text = await res.text();
    this.log('response', text);

    if (!res.ok) {
      throw new HTTPError(res, options.method || 'GET', text);
    }

    if (!text) return undefined;
    const json = JSON.parse(text);
    if (path === 'authn/login') {
      // Hack to get the authentication token out to the `login` method
      json.okapiToken = res.headers.get('x-okapi-token');
    } else if (path === 'authn/login-with-expiry') {
      // Hack to get the session token out to the `login` method
      const cookieString = res.headers.get('set-cookie');
      const sessionCookie = cookieString.replace(/.*folioAccessToken=(.*?);.*/, '$1');
      json.sessionCookie = sessionCookie;
    }

    return json;
  }

  // PRIVATE
  async login() {
    this.log('op', `login(user=${this.username}, password ********)`);

    const tryOldAuthentication = async () => {
      this.oldStyle = true;
      const json = await this.folioFetch('authn/login', {
        json: { tenant: this.tenant, username: this.username, password: this.password },
      });
      this.token = json.okapiToken;
    }

    if (process.env.FOLIOJS_OLD_AUTH) {
      this.log('auth', 'trying old-style authentication');
      await tryOldAuthentication();
      return;
    }

    try {
      this.log('auth', 'trying new-style authentication with expiry');
      const json = await this.folioFetch('authn/login-with-expiry', {
        json: { tenant: this.tenant, username: this.username, password: this.password },
      });
      const then = Date.parse(json.accessTokenExpiration);
      const now = Date.now();
      const ttl = then - now;
      const fst = process.env.FOLIOJS_SESSION_TIMEOUT;
      const timeout = fst ? fst * 1000 : ttl / 2;
      this.timeoutId = setTimeout(() => this.login(), timeout);
      this.sessionCookie = json.sessionCookie;
    } catch (err) {
      if (err.status !== 404) throw err;
      this.log('auth', 'new-style authentication failed; trying old-style');
      await tryOldAuthentication();
    }
  }

  async postModule(md) {
    this.log('op', `postModule(${md.getId()})`);
    return this.folioFetch('_/proxy/modules', { json: md.getJson() });
  }

  async modulesEnabled(tenant) {
    this.log('op', `modulesEnabled(${tenant})`);
    return this.folioFetch(`_/proxy/tenants/${tenant}/modules`);
  }

  async disable(tenant, mdOrId) {
    const moduleId = (typeof mdOrId === 'string') ? mdOrId : mdOrId.getId();
    this.log('op', `disable(tenant=${tenant}, moduleId=${moduleId})`);
    return this.folioFetch(`_/proxy/tenants/${tenant}/modules/${moduleId}`, { method: 'DELETE' });
  }

  async enable(tenant, mdOrId) {
    const moduleId = (typeof mdOrId === 'string') ? mdOrId : mdOrId.getId();
    this.log('op', `enable(tenant=${tenant}, moduleId=${moduleId})`);
    return this.folioFetch(`_/proxy/tenants/${tenant}/modules`, { json: { id: moduleId } });
  }

  async addPermsToUser(targetUser, perms) {
    this.log('op', `findUser(${targetUser})`);
    const users = await this.folioFetch(`users?query=username=="${targetUser}"`);
    if (users.totalRecords < 1) {
      throw new Error(`addPermsToUser(${targetUser}): no such user`);
    }
    const user = users.users[0];
    const userId = user.id;

    this.log('op', `findPermissionsUser(${userId})`);
    const permsUser = await this.folioFetch(`/perms/users/${userId}?indexField=userId`);

    permsUser.permissions = mergeArrays(permsUser.permissions, perms);
    this.log('op', `addPermsToUser(${targetUser}, ${JSON.stringify(perms)})`);
    return this.folioFetch(`/perms/users/${permsUser.id}`, {
      method: 'PUT',
      json: permsUser,
    });
  }

  getToken() {
    return this.token;
  }

  getSessionCookie() {
    return this.sessionCookie;
  }
}


export default FolioSession;
