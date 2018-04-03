'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Base = require('./base');
var join = require('./deps/utils/join');

var _require = require('./server-version'),
    LTS_2016 = _require.LTS_2016;

function computePath(ref) {
  return join(ref.indexOf('/') === 0 ? 'path' : 'id', ref);
}

/**
 * The `Repository` class allows to work with documents on a Nuxeo Platform instance.
 *
 * **Cannot directly be instantiated**
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
 * nuxeo.repository('default')
 *   .fetch('/default-domain')
 *   .then(function(res) {
 *     // res.uid !== null
 *     // res.type === 'Domain'
 *   })
 *   .catch(function(error) {
 *     throw new Error(error);
 *   });
 */

var Repository = function (_Base) {
  _inherits(Repository, _Base);

  /**
   * Creates a Repository.
   * @param {object} opts - The configuration options.
   * @param {string} opts.nuxeo - The {@link Nuxeo} object linked to this repository.
   */
  function Repository() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Repository);

    var _this = _possibleConstructorReturn(this, (Repository.__proto__ || Object.getPrototypeOf(Repository)).call(this, opts));

    _this._nuxeo = opts.nuxeo;
    return _this;
  }

  /**
   * Fetches a document given a document ref.
   * @param {string} ref - The document ref. A path if starting with '/', otherwise and id.
   * @param {object} [opts] - Options overriding the ones from this object.
   * @returns {Promise} A Promise object resolved with the {@link Document}.
   */


  _createClass(Repository, [{
    key: 'fetch',
    value: function fetch(ref) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var options = this._computeOptions(opts);
      var path = computePath(ref);
      options.repository = this;
      return this._nuxeo.request(path).get(options);
    }

    /**
     * Creates a document.
     * @param {string} parentRef - The parent document ref. A path if starting with '/', otherwise and id.
     * @param {object} doc - The document to be created.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A Promise object resolved with the created {@link Document}.
     */

  }, {
    key: 'create',
    value: function create(parentRef, doc) {
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      opts.body = {
        'entity-type': 'document',
        type: doc.type,
        name: doc.name,
        properties: doc.properties
      };
      var options = this._computeOptions(opts);
      var path = computePath(parentRef);
      options.repository = this;
      return this._nuxeo.request(path).post(options);
    }

    /**
     * Updates a document. Assumes that the doc object has an uid field.
     * @param {object} doc - The document to be updated.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A Promise object resolved with the updated {@link Document}.
     */

  }, {
    key: 'update',
    value: function update(doc) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      opts.body = {
        'entity-type': 'document',
        uid: doc.uid,
        properties: doc.properties
      };
      var options = this._computeOptions(opts);
      var path = join('id', doc.uid);
      options.repository = this;
      return this._nuxeo.request(path).put(options);
    }

    /**
     * Deletes a document given a document ref.
     * @param {string} ref - The document ref. A path if starting with '/', otherwise and id.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A Promise object resolved with the result of the DELETE request.
     */

  }, {
    key: 'delete',
    value: function _delete(ref) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var options = this._computeOptions(opts);
      var path = computePath(ref);
      return this._nuxeo.request(path).delete(options);
    }

    /**
     * Performs a query returning documents.
     * Named parameters can be set in the `queryOpts` object, such as
     * { query: ..., customParam1: 'foo', anotherParam: 'bar'}
     * @param {object} queryOpts - The query options.
     * @param {string} queryOpts.query - The query to execute. `query` or `pageProvider` must be set.
     * @param {string} queryOpts.pageProvider - The page provider name to execute. `query` or `pageProvider` must be set.
     * @param {array} [queryOpts.queryParams] - Ordered parameters for the query or page provider.
     * @param {number} [queryOpts.pageSize=0] - The number of results per page.
     * @param {number} [queryOpts.currentPageIndex=0] - The current page index.
     * @param {number} [queryOpts.maxResults] - The expected max results.
     * @param {string} [queryOpts.sortBy] - The sort by info.
     * @param {string} [queryOpts.sortOrder] - The sort order info.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A Promise object resolved with the response where the entries are replaced
     *                    with Document objetcs.
     */

  }, {
    key: 'query',
    value: function query(queryOpts) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var options = this._computeOptions(opts);
      var path = this._computeQueryPath(queryOpts);
      options.repository = this;
      return this._nuxeo.request(path).queryParams(queryOpts).get(options);
    }
  }, {
    key: '_computeQueryPath',
    value: function _computeQueryPath(queryOpts) {
      var serverVersion = this._nuxeo.serverVersion;
      var isSearchEndPoint = serverVersion && serverVersion.gte(LTS_2016);
      var path = isSearchEndPoint ? join('search', queryOpts.query ? 'lang/NXQL' : 'pp/' + queryOpts.pageProvider, 'execute') : join('query', queryOpts.query ? 'NXQL' : queryOpts.pageProvider);
      return path;
    }
  }]);

  return Repository;
}(Base);

module.exports = Repository;