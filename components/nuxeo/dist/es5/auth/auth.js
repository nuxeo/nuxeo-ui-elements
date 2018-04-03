'use strict';

var md5 = require('md5');
var Random = require('random-js');
var extend = require('extend');

var _require = require('../deps/utils/base64'),
    btoa = _require.btoa;

var Promise = require('../deps/promise');
var oauth2 = require('../auth/oauth2');

var DEFAULT_AUTHENTICATOR = {
  computeAuthenticationHeaders: function computeAuthenticationHeaders() {},
  authenticateURL: function authenticateURL(url) {
    return url;
  },
  canRefreshAuthentication: function canRefreshAuthentication() {
    return false;
  },
  refreshAuthentication: function refreshAuthentication(baseURL, auth) {
    return new Promise(function (resolve) {
      return resolve(auth);
    });
  }
};

var authenticators = {};

var Authentication = {
  registerAuthenticator: function registerAuthenticator(method, authenticator) {
    var auth = extend(true, {}, DEFAULT_AUTHENTICATOR, authenticator);
    authenticators[method] = auth;
  },

  computeAuthenticationHeaders: function computeAuthenticationHeaders(auth) {
    if (auth) {
      var authenticator = authenticators[auth.method];
      if (authenticator) {
        return authenticator.computeAuthenticationHeaders(auth);
      }
    }
    return {};
  },

  authenticateURL: function authenticateURL(url, auth) {
    if (auth) {
      var authenticator = authenticators[auth.method];
      if (authenticator) {
        return authenticator.authenticateURL(url, auth);
      }
    }
    return url;
  },

  canRefreshAuthentication: function canRefreshAuthentication(auth) {
    if (auth) {
      var authenticator = authenticators[auth.method];
      if (authenticator) {
        return authenticator.canRefreshAuthentication();
      }
    }
    return false;
  },

  refreshAuthentication: function refreshAuthentication(baseURL, auth) {
    if (auth) {
      var authenticator = authenticators[auth.method];
      if (authenticator) {
        return authenticator.refreshAuthentication(baseURL, auth);
      }
    }
    return new Promise(function (resolve) {
      return resolve(auth);
    });
  }
};

// default authenticators
var basicAuthenticator = {
  computeAuthenticationHeaders: function computeAuthenticationHeaders(auth) {
    var headers = {};
    if (auth.username && auth.password) {
      var base64 = btoa(auth.username + ':' + auth.password);
      var authorization = 'Basic ' + base64;
      headers.Authorization = authorization;
    }
    return headers;
  },

  authenticateURL: function authenticateURL(url, auth) {
    if (auth.username && auth.password) {
      return url.replace('://', '://' + auth.username + ':' + auth.password + '@');
    }
    return url;
  }
};

var tokenAuthenticator = {
  computeAuthenticationHeaders: function computeAuthenticationHeaders(auth) {
    var headers = {};
    if (auth.token) {
      headers['X-Authentication-Token'] = auth.token;
    }
    return headers;
  },

  authenticateURL: function authenticateURL(url, auth) {
    if (auth.token) {
      return '' + url + (url.indexOf('?') === -1 ? '?' : '&') + 'token=' + auth.token;
    }
    return url;
  }
};

var bearerTokenAuthenticator = {
  computeAuthenticationHeaders: function computeAuthenticationHeaders(auth) {
    var headers = {};
    if (auth.token) {
      var accessToken = auth.token.access_token || auth.token;
      headers.Authorization = 'Bearer ' + accessToken;
    }
    return headers;
  },

  authenticateURL: function authenticateURL(url, auth) {
    if (auth.token) {
      var accessToken = auth.token.access_token || auth.token;
      return '' + url + (url.indexOf('?') === -1 ? '?' : '&') + 'access_token=' + accessToken;
    }
    return url;
  },

  canRefreshAuthentication: function canRefreshAuthentication() {
    return true;
  },

  refreshAuthentication: function refreshAuthentication(baseURL, auth) {
    return new Promise(function (resolve, reject) {
      if (!auth.token.refresh_token || !auth.clientId) {
        return resolve(auth);
      }

      return oauth2.refreshAccessToken(baseURL, auth.clientId, auth.token.refresh_token).then(function (token) {
        var refreshedAuth = extend(true, {}, auth, { token: token });
        return resolve(refreshedAuth);
      }).catch(function (e) {
        return reject(e);
      });
    });
  }
};

var random = Random.engines.mt19937().autoSeed();

var portalAuthenticator = {
  computeAuthenticationHeaders: function computeAuthenticationHeaders(auth) {
    var headers = {};
    if (auth.secret && auth.username) {
      var date = new Date();
      var randomData = random();

      var clearToken = [date.getTime(), randomData, auth.secret, auth.username].join(':');
      var base64hashedToken = btoa(md5(clearToken, { asBytes: true }));
      headers.NX_RD = randomData;
      headers.NX_TS = date.getTime();
      headers.NX_TOKEN = base64hashedToken;
      headers.NX_USER = auth.username;
    }
    return headers;
  }
};

Authentication.basicAuthenticator = basicAuthenticator;
Authentication.tokenAuthenticator = tokenAuthenticator;
Authentication.bearerTokenAuthenticator = bearerTokenAuthenticator;
Authentication.portalAuthenticator = portalAuthenticator;

module.exports = Authentication;