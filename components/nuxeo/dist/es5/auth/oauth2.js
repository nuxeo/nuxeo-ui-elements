'use strict';

var extend = require('extend');
var qs = require('querystring');

var doFetch = require('../deps/fetch');
var Promise = require('../deps/promise');

var _fetchAccessToken = function _fetchAccessToken(baseURL, body) {
  var url = baseURL.endsWith('/') ? baseURL : baseURL + '/';
  return new Promise(function (resolve, reject) {
    return doFetch(url + '/oauth2/token', {
      method: 'POST',
      body: qs.stringify(body),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(function (res) {
      return res.json();
    }).then(function (token) {
      if (token.error) {
        return reject(token.error);
      }
      return resolve(token);
    }).catch(function (e) {
      return reject(e);
    });
  });
};

var oauth2 = {

  /**
   * Returns the OAuth2 authorization URL.
   * @param {string} [baseURL] - Base URL of the Nuxeo Platform.
   * @param {string} [clientId] - The OAuth2 client id.
   * @param {object} [opts] - Optional query parameters such as `state`, `redirect_uri`.
   * @returns {string}
   */
  getAuthorizationURL: function getAuthorizationURL(baseURL, clientId) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!baseURL) {
      throw new Error('Missing `baseURL` argument');
    }
    if (!clientId) {
      throw new Error('Missing `clientId` argument');
    }

    var queryParams = extend(true, { client_id: clientId, response_type: 'code' }, params);
    var url = baseURL.endsWith('/') ? baseURL : baseURL + '/';
    return url + 'oauth2/authorize?' + qs.stringify(queryParams);
  },

  /**
   * Fetches an OAuth2 access token.
   * @param {string} [baseURL] - Base URL of the Nuxeo Platform.
   * @param {string} [clientId] - The OAuth2 client id.
   * @param {string} [code] - An authorization code.
   * @param {object} [params] - Optional parameters such as `redirect_uri`.
   * @returns {string}
   */
  fetchAccessToken: function fetchAccessToken(baseURL, clientId, code) {
    var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (!baseURL) {
      throw new Error('Missing `baseURL` argument');
    }
    if (!clientId) {
      throw new Error('Missing `clientId` argument');
    }
    if (!code) {
      throw new Error('Missing `code` argument');
    }

    var defaultParams = { code: code, grant_type: 'authorization_code', client_id: clientId };
    var body = extend(true, defaultParams, params);
    return _fetchAccessToken(baseURL, body);
  },

  /**
   * Refreshes an OAuth2 access token.
   * @param {string} [baseURL] - Base URL of the Nuxeo Platform.
   * @param {string} [clientId] - The OAuth2 client id.
   * @param {string} [refreshToken] - A refresh token.
   * @param {object} [params] - Optional parameters.
   * @returns {string}
   */
  refreshAccessToken: function refreshAccessToken(baseURL, clientId, refreshToken) {
    var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (!baseURL) {
      throw new Error('Missing `baseURL` argument');
    }
    if (!clientId) {
      throw new Error('Missing `clientId` argument');
    }
    if (!refreshToken) {
      throw new Error('Missing `refreshToken` argument');
    }

    var defaultParams = { refresh_token: refreshToken, grant_type: 'refresh_token', client_id: clientId };
    var body = extend(true, defaultParams, params);
    return _fetchAccessToken(baseURL, body);
  }
};

module.exports = oauth2;