'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var extend = require('extend');
var Base = require('./base');
var join = require('./deps/utils/join');
var encodePath = require('./deps/utils/encodePath');
var Blob = require('./blob');
var BatchBlob = require('./upload/blob');
var BatchUpload = require('./upload/batch');
var Document = require('./document');
var FormData = require('./deps/form-data');

var isDocument = function isDocument(obj) {
  return obj instanceof Document || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj['entity-type'] === 'document';
};

/**
 * The `Operation` class allows to execute an operation on a Nuxeo Platform instance.
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
 * nuxeo.operation('Document.GetChild')
 *   .input('/default-domain')
 *   .params({
 *     name: 'workspaces',
 *   })
 *   .execute()
 *   .then(function(res) {
 *     // res.uid !== null
 *     // res.title === 'Workspaces'
 *   })
 *   .catch(function(error) {
 *     throw new Error(error);
 *   });
 */

var Operation = function (_Base) {
  _inherits(Operation, _Base);

  /**
   * Creates an Operation.
   * @param {string} opts - The configuration options.
   * @param {string} opts.nuxeo - The {@link Nuxeo} object linked to this `Operation` object.
   * @param {string} opts.id - The ID of the operation.
   * @param {string} opts.url - The automation URL.
   */
  function Operation(opts) {
    _classCallCheck(this, Operation);

    var options = extend(true, {}, opts);

    var _this = _possibleConstructorReturn(this, (Operation.__proto__ || Object.getPrototypeOf(Operation)).call(this, options));

    _this._nuxeo = options.nuxeo;
    _this._id = options.id;
    _this._url = options.url;
    _this._automationParams = {
      params: {},
      context: {},
      input: undefined
    };
    return _this;
  }

  /**
   * Adds an operation param.
   * @param {string} name - The param name.
   * @param {string} value - The param value.
   * @returns {Operation} The operation itself.
   */


  _createClass(Operation, [{
    key: 'param',
    value: function param(name, value) {
      this._automationParams.params[name] = value;
      return this;
    }

    /**
     * Adds operation params. The given params are merged with the existing ones if any.
     * @param {object} params - The params to be merge with the existing ones.
     * @returns {Operation} The operation itself.
     */

  }, {
    key: 'params',
    value: function params(_params) {
      this._automationParams.params = extend(true, {}, this._automationParams.params, _params);
      return this;
    }

    /**
     * Sets this operation context.
     * @param {object} context - The operation context.
     * @returns {Operation} The operation itself.
     */

  }, {
    key: 'context',
    value: function context(_context) {
      this._automationParams.context = _context;
      return this;
    }

    /**
     * Sets this operation input.
     * @param {string|Array|Blob|BatchBlob|BatchUpload} input - The operation input.
     * @returns {Operation} The operation itself.
     */

  }, {
    key: 'input',
    value: function input(_input) {
      this._automationParams.input = _input;
      return this;
    }

    /**
     * Executes this operation.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A Promise object resolved with the result of the Operation.
     */

  }, {
    key: 'execute',
    value: function execute() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      opts.headers = opts.headers || {};
      opts.headers['Content-Type'] = this._computeContentTypeHeader(this._automationParams.input);
      var options = this._computeOptions(opts);
      var finalOptions = {
        method: 'POST',
        url: this._computeRequestURL(),
        body: this._computeRequestBody()
      };
      finalOptions = extend(true, finalOptions, options);
      return this._nuxeo.http(finalOptions);
    }
  }, {
    key: '_computeContentTypeHeader',
    value: function _computeContentTypeHeader(input) {
      var contentType = 'application/json+nxrequest';
      if (this._isMultipartInput(input)) {
        contentType = 'multipart/form-data';
      } else if (this._isBatchInput(input)) {
        contentType = 'application/json';
      }
      return contentType;
    }
  }, {
    key: '_computeRequestURL',
    value: function _computeRequestURL() {
      var input = this._automationParams.input;
      if (input instanceof BatchBlob) {
        return join(this._nuxeo._restURL, 'upload', input['upload-batch'], input['upload-fileId'], 'execute', this._id);
      } else if (input instanceof BatchUpload) {
        return join(this._nuxeo._restURL, 'upload', input._batchId, 'execute', this._id);
      }

      return join(this._url, encodePath(this._id));
    }
  }, {
    key: '_computeRequestBody',
    value: function _computeRequestBody() {
      var input = this._automationParams.input;
      if (this._isBatchInput(input)) {
        // no input needed
        var body = extend(true, {}, this._automationParams);
        body.input = undefined;
        return body;
      }

      if (input instanceof Array) {
        if (input.length > 0) {
          var first = input[0];
          if (isDocument(first)) {
            // assume document list
            var docs = input.map(function (doc) {
              return doc.uid;
            });
            this._automationParams.input = 'docs:' + docs.join(',');
            return this._automationParams;
          } else if (typeof first === 'string') {
            // assume ref list
            this._automationParams.input = 'docs:' + input.join(',');
            return this._automationParams;
          } else if (first instanceof Blob) {
            // blob list => multipart
            var automationParams = {
              params: this._automationParams.params,
              context: this._automationParams.context
            };
            var form = new FormData();
            form.append('params', JSON.stringify(automationParams));

            var inputIndex = 0;
            // eslint-disable-next-line prefer-const
            for (var _iterator = input, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
              var _ref;

              if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
              } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
              }

              var blob = _ref;

              form.append('input#' + inputIndex, blob.content, blob.name);
              inputIndex += 1;
            }
            return form;
          }
        }
      } else if (isDocument(input)) {
        this._automationParams.input = input.uid;
        return this._automationParams;
      } else if (input instanceof Blob) {
        var _automationParams = {
          params: this._automationParams.params,
          context: this._automationParams.context
        };
        var _form = new FormData();
        _form.append('params', JSON.stringify(_automationParams));
        _form.append('input', input.content, input.name);
        return _form;
      }
      return this._automationParams;
    }
  }, {
    key: '_isMultipartInput',
    value: function _isMultipartInput(input) {
      if (input instanceof Array) {
        if (input.length > 0) {
          var first = input[0];
          if (first instanceof Blob) {
            return true;
          }
        }
      } else if (input instanceof Blob) {
        return true;
      }
      return false;
    }
  }, {
    key: '_isBatchInput',
    value: function _isBatchInput(input) {
      return input instanceof BatchUpload || input instanceof BatchBlob;
    }
  }]);

  return Operation;
}(Base);

module.exports = Operation;