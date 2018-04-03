'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var extend = require('extend');
var Base = require('./base');
var ServerVersion = require('./server-version');
var Operation = require('./operation');
var Request = require('./request');
var Repository = require('./repository');
var BatchUpload = require('./upload/batch');
var Users = require('./user/users');
var Groups = require('./group/groups');
var Directory = require('./directory/directory');
var Workflows = require('./workflow/workflows');
var join = require('./deps/utils/join');
var Promise = require('./deps/promise');
var qs = require('querystring');
var FormData = require('./deps/form-data');
var Authentication = require('./auth/auth');
var Unmarshallers = require('./unmarshallers/unmarshallers');
var doFetch = require('./deps/fetch');

var API_PATH_V1 = 'api/v1/';
var AUTOMATION = 'automation/';

var DEFAULT_OPTS = {
  baseURL: 'http://localhost:8080/nuxeo/',
  apiPath: API_PATH_V1,
  promiseLibrary: null,
  auth: null
};

/**
 * The `Nuxeo` class allows using the REST API of a Nuxeo Platform instance.
 * @extends Base
 *
 * @example
 * var Nuxeo = require('nuxeo')
 * var nuxeo = new Nuxeo({
 *  baseURL: 'http://localhost:8080/nuxeo',
 *  auth: {
 *    method: 'basic',
 *    username: 'Administrator',
 *    password: 'Administrator'
 *  }
 * });
 * nuxeo.request('path/')
 *   .get()
 *   .then(function(doc) {
 *     // doc.uid !== null
 *   });
 */

var Nuxeo = function (_Base) {
  _inherits(Nuxeo, _Base);

  /**
   * Creates a new Nuxeo instance.
   * @param {object} [opts] - The configuration options.
   * @param {string} [opts.baseURL=http://localhost:8080/nuxeo/] - Base URL of the Nuxeo Platform.
   * @param {string} [opts.apiPath=api/v1] - The API path.
   * @param {object} [opts.auth] - The authentication configuration.
   */
  function Nuxeo() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Nuxeo);

    var options = extend(true, {}, DEFAULT_OPTS, opts);

    var _this = _possibleConstructorReturn(this, (Nuxeo.__proto__ || Object.getPrototypeOf(Nuxeo)).call(this, options));

    _this._baseURL = options.baseURL;
    _this._restURL = join(_this._baseURL, options.apiPath);
    _this._automationURL = join(_this._restURL, AUTOMATION);
    _this._auth = options.auth;
    _this._authenticationRefreshedListeners = [];
    _this.connected = false;
    _this.Promise = Nuxeo.Promise || Promise;
    _this._activeRequests = 0;
    return _this;
  }

  /**
   * Connects to the Nuxeo Platform instance using the configured authentication.
   *
   * This method fills the `user` property with the current user
   * and the `serverVersion` property with the Nuxeo Server version.
   * @param {object} [opts] - Options overriding the ones from this object.
   * @returns {Promise} A promise resolved with the connected client.
   */


  _createClass(Nuxeo, [{
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var finalOptions = {
        method: 'GET',
        url: join(this._baseURL, 'json/cmis')
      };
      finalOptions = extend(true, finalOptions, opts);
      finalOptions = this._computeOptions(finalOptions);
      return this.http(finalOptions).then(function (res) {
        if (res && res.default && res.default.productVersion) {
          _this2.serverVersion = new ServerVersion(res.default.productVersion);
          _this2.nuxeoVersion = res.default.productVersion;
        }
        // log the user
        finalOptions.method = 'POST';
        finalOptions.url = join(_this2._automationURL, 'login');
        return _this2.http(finalOptions);
      }).then(function (res) {
        return _this2.users({ enrichers: { user: ['userprofile'] } }).fetch(res.username);
      }).then(function (user) {
        _this2.user = user;
        _this2.connected = true;
        return _this2;
      });
    }

    /**
     * Connects to the Nuxeo Platform instance using the configured authentication.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A promise resolved with the logged in user.
     * @deprecated since version 3.0, use {#connect} instead.
     */

  }, {
    key: 'login',
    value: function login() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.connect(opts);
    }

    /**
     * Does a http request.
     *
     * To be used when doing any call on Nuxeo Platform.
     */

  }, {
    key: 'http',
    value: function http() {
      var _this3 = this;

      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var options = this._computeFetchOptions(opts);
      return new this.Promise(function (resolve, reject) {
        _this3._activeRequests += 1;

        var fetchOptions = {
          method: options.method,
          headers: options.headers,
          body: options.body
        };
        if (!_this3._auth) {
          fetchOptions.credentials = 'include';
        }

        doFetch(options.url, fetchOptions).then(function (res) {
          _this3._activeRequests -= 1;
          if (res.status === 401 && !opts.refreshedAuthentication && Authentication.canRefreshAuthentication(_this3._auth)) {
            // try re-authenticate
            opts.refreshedAuthentication = true;
            return Authentication.refreshAuthentication(_this3._baseURL, _this3._auth).then(function (refreshedAuth) {
              _this3._auth = refreshedAuth;
              _this3._notifyAuthenticationRefreshed(refreshedAuth);
              return resolve(_this3.http(opts));
            }).catch(function () {
              var error = new Error(res.statusText);
              error.response = res;
              return reject(error);
            });
          }

          if (!/^2/.test('' + res.status)) {
            var error = new Error(res.statusText);
            error.response = res;
            return reject(error);
          }

          if (options.resolveWithFullResponse || res.status === 204) {
            return resolve(res);
          }

          var contentType = res.headers.get('content-type');
          if (contentType && contentType.indexOf('application/json') === 0) {
            options.nuxeo = _this3;
            return resolve(res.json().then(function (json) {
              return Unmarshallers.unmarshall(json, options, res);
            }));
          }
          return resolve(res);
        }).catch(function (error) {
          _this3._activeRequests -= 1;
          return reject(error);
        });
      });
    }

    /**
     * Does a http request.
     *
     * To be used when doing any call on Nuxeo Platform.
     * @deprecated since version 3.3, use {#http} instead.
     */

  }, {
    key: '_http',
    value: function _http() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.http(opts);
    }
  }, {
    key: '_computeFetchOptions',
    value: function _computeFetchOptions(opts) {
      var options = {
        method: 'GET',
        headers: {},
        json: true,
        timeout: 30000,
        cache: false,
        resolveWithFullResponse: false
      };
      options = extend(true, {}, options, opts);
      var authenticationHeaders = Authentication.computeAuthenticationHeaders(this._auth);
      options.headers = extend(options.headers, authenticationHeaders);

      if (options.schemas && options.schemas.length > 0) {
        options.headers.properties = options.schemas.join(',');
      }
      if (opts.repositoryName !== undefined) {
        options.headers.Repository = options.repositoryName;
      }

      if (opts.enrichers) {
        Object.keys(opts.enrichers).forEach(function (key) {
          options.headers['enrichers-' + key] = options.enrichers[key].join(',');
        });
      }

      if (opts.fetchProperties) {
        Object.keys(opts.fetchProperties).forEach(function (key) {
          options.headers['fetch-' + key] = options.fetchProperties[key].join(',');
        });
      }

      if (opts.translateProperties) {
        Object.keys(opts.translateProperties).forEach(function (key) {
          options.headers['translate-' + key] = options.translateProperties[key].join(',');
        });
      }

      if (options.depth) {
        options.headers.depth = options.depth;
      }

      var _computeTimeouts2 = this._computeTimeouts(options),
          httpTimeout = _computeTimeouts2.httpTimeout,
          transactionTimeout = _computeTimeouts2.transactionTimeout;

      if (transactionTimeout) {
        options.headers['Nuxeo-Transaction-Timeout'] = transactionTimeout;
      }
      options.timeout = httpTimeout;

      if (options.json) {
        options.headers.Accept = 'application/json';
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
        // do not stringify FormData
        if (_typeof(options.body) === 'object' && !(options.body instanceof FormData)) {
          options.body = JSON.stringify(options.body);
        }
      }

      if (options.method === 'GET') {
        delete options.headers['Content-Type'];
      }

      if (options.queryParams && Object.keys(options.queryParams).length > 0) {
        options.url += options.url.indexOf('?') === -1 ? '?' : '';
        options.url += qs.stringify(options.queryParams);
      }
      return options;
    }
  }, {
    key: '_computeTimeouts',
    value: function _computeTimeouts(options) {
      var transactionTimeout = options.transactionTimeout || options.timeout;
      var httpTimeout = options.httpTimeout;
      if (!httpTimeout && transactionTimeout) {
        // make the http timeout a bit longer than the transaction timeout
        httpTimeout = 5 + transactionTimeout;
      }
      return { httpTimeout: httpTimeout, transactionTimeout: transactionTimeout };
    }

    /**
     * Creates a new {@link Operation} object.
     * @param {string} id - The operation ID.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Operation}
     */

  }, {
    key: 'operation',
    value: function operation(id) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var finalOptions = {
        id: id,
        nuxeo: this,
        url: this._automationURL
      };
      finalOptions = extend(true, finalOptions, opts);
      finalOptions = this._computeOptions(finalOptions);
      return new Operation(finalOptions);
    }

    /**
     * Creates a new {@link Request} object.
     * @param {string} path - The request default path.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Request}
     */

  }, {
    key: 'request',
    value: function request(path) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var finalOptions = {
        path: path,
        nuxeo: this,
        url: this._restURL
      };
      finalOptions = extend(true, finalOptions, opts);
      finalOptions = this._computeOptions(finalOptions);
      return new Request(finalOptions);
    }

    /**
     * Creates a new {@link Repository} object.
     * @param {string} name - The repository name. Default to the Nuxeo's repository name.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Repository}
     */

  }, {
    key: 'repository',
    value: function repository() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var repositoryName = name;
      var options = opts;
      if ((typeof repositoryName === 'undefined' ? 'undefined' : _typeof(repositoryName)) === 'object') {
        options = repositoryName;
        repositoryName = null;
      }

      var finalOptions = {
        nuxeo: this
      };
      if (repositoryName) {
        finalOptions.repositoryName = repositoryName;
      }
      finalOptions = extend(true, finalOptions, options);
      finalOptions = this._computeOptions(finalOptions);
      return new Repository(finalOptions);
    }

    /**
     * Creates a new {@link BatchUpload} object.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {BatchUpload}
     */

  }, {
    key: 'batchUpload',
    value: function batchUpload() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var finalOptions = {
        nuxeo: this,
        url: this._restURL
      };
      finalOptions = extend(true, finalOptions, opts);
      finalOptions = this._computeOptions(finalOptions);
      return new BatchUpload(finalOptions);
    }

    /**
     * Creates a new {@link Users} object to manage users.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Users}
     */

  }, {
    key: 'users',
    value: function users() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var finalOptions = {
        nuxeo: this
      };
      finalOptions = extend(true, finalOptions, opts);
      finalOptions = this._computeOptions(finalOptions);
      return new Users(finalOptions);
    }

    /**
     * Creates a new {@link Groups} object to manage groups.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Groups}
     */

  }, {
    key: 'groups',
    value: function groups() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var finalOptions = {
        nuxeo: this
      };
      finalOptions = extend(true, finalOptions, opts);
      finalOptions = this._computeOptions(finalOptions);
      return new Groups(finalOptions);
    }

    /**
     * Creates a new {@link Directory} object.
     * @param {string} name - The directory name.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Directory}
     */

  }, {
    key: 'directory',
    value: function directory(name) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var finalOptions = {
        directoryName: name,
        nuxeo: this
      };
      finalOptions = extend(true, finalOptions, opts);
      finalOptions = this._computeOptions(finalOptions);
      return new Directory(finalOptions);
    }

    /**
     * Creates a new {@link Workflows} object.
     * @param {string} name - The repository name. Default to the Nuxeo's repository name.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Workflows}
     */

  }, {
    key: 'workflows',
    value: function workflows() {
      var repositoryName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._repositoryName;
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var finalOptions = {
        repositoryName: repositoryName,
        nuxeo: this
      };
      finalOptions = extend(true, finalOptions, opts);
      finalOptions = this._computeOptions(finalOptions);
      return new Workflows(finalOptions);
    }
  }, {
    key: 'requestAuthenticationToken',
    value: function requestAuthenticationToken(applicationName, deviceId, deviceDescription, permission) {
      var opts = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      var finalOptions = {
        method: 'GET',
        url: join(this._baseURL, 'authentication', 'token'),
        queryParams: {
          applicationName: applicationName,
          deviceId: deviceId,
          deviceDescription: deviceDescription,
          permission: permission
        }
      };
      finalOptions = extend(true, finalOptions, opts);
      finalOptions = this._computeOptions(finalOptions);
      return this.http(finalOptions).then(function (res) {
        return res.text();
      });
    }
  }, {
    key: 'computeAuthenticationHeaders',
    value: function computeAuthenticationHeaders() {
      return Authentication.computeAuthenticationHeaders(this._auth);
    }
  }, {
    key: 'authenticateURL',
    value: function authenticateURL(url) {
      return Authentication.authenticateURL(url, this._auth);
    }
  }, {
    key: 'onAuthenticationRefreshed',
    value: function onAuthenticationRefreshed(listener) {
      this._authenticationRefreshedListeners.push(listener);
    }
  }, {
    key: '_notifyAuthenticationRefreshed',
    value: function _notifyAuthenticationRefreshed(refreshedAuthentication) {
      var _this4 = this;

      this._authenticationRefreshedListeners.forEach(function (listener) {
        return listener.call(_this4, refreshedAuthentication);
      });
    }
  }]);

  return Nuxeo;
}(Base);

/**
 * Sets the Promise library class to use.
 */


Nuxeo.promiseLibrary = function (promiseLibrary) {
  Nuxeo.Promise = promiseLibrary;
};

/**
 * Registers an Authenticator for a given authentication method.
 */
Nuxeo.registerAuthenticator = function (method, authenticator) {
  Authentication.registerAuthenticator(method, authenticator);
};

/**
 * Registers an Unmarshaller for a given entity type.
 */
Nuxeo.registerUnmarshaller = function (entityType, unmarshaller) {
  Unmarshallers.registerUnmarshaller(entityType, unmarshaller);
};

module.exports = Nuxeo;