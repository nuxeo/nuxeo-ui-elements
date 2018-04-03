'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var extend = require('extend');
var Base = require('../base');
var join = require('../deps/utils/join');
var flatten = require('../deps/utils/flatten');
var Queue = require('promise-queue');
var BatchBlob = require('./blob');

var DEFAULT_OPTS = {
  concurrency: 5
};

/**
 * The **BatchUpload** class allows to upload {@link Blob} objets to a Nuxeo Platform instance
 * using the batch upload API.
 *
 * It creates and maintains a batch id from the Nuxeo Platform instance.
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
 * var batch = nuxeo.batchUpload();
 * var nuxeoBlob = new Nuxeo.Blob(...);
 * batch.upload(nuxeoBlob)
 *   .then(function(res) {
 *     // res.blob instanceof BatchBlob === true
 *   })
 *   .catch(function(error) {
 *     throw new Error(error);
 *   });
 */

var BatchUpload = function (_Base) {
  _inherits(BatchUpload, _Base);

  /**
   * Creates a BatchUpload.
   * @param {object} opts - The configuration options.
   * @param {string} opts.nuxeo - The {@link Nuxeo} object linked to this BatchUpload object.
   * @param {Number} [opts.concurrency=5] - Number of concurrent uploads.
   */
  function BatchUpload() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, BatchUpload);

    var options = extend(true, {}, DEFAULT_OPTS, opts);

    var _this = _possibleConstructorReturn(this, (BatchUpload.__proto__ || Object.getPrototypeOf(BatchUpload)).call(this, options));

    _this._url = join(options.url, 'upload/');
    _this._nuxeo = options.nuxeo;
    _this._uploadIndex = 0;
    Queue.configure(_this._nuxeo.Promise);
    _this._queue = new Queue(options.concurrency, Infinity);
    _this._batchIdPromise = null;
    _this._batchId = null;
    _this._promises = [];
    return _this;
  }

  /**
   * Upload one or more blobs.
   * @param {...Blob} blobs - Blobs to be uploaded.
   * @returns {Promise} A Promise object resolved when all blobs are uploaded.
   *
   * @example
   * ...
   * nuxeoBatch.upload(blob1, blob2, blob3)
   *   .then(function(res) {
   *     // res.batch === nuxeoBatch
   *     // res.blobs[0] is the BatchBlob object related to blob1
   *     // res.blobs[1] is the BatchBlob object related to blob2
   *     // res.blobs[2] is the BatchBlob object related to blob3
   *   })
   *   .catch(function(error) {
   *     throw new Error(error);
   *   });
   */


  _createClass(BatchUpload, [{
    key: 'upload',
    value: function upload() {
      var _this2 = this;

      for (var _len = arguments.length, blobs = Array(_len), _key = 0; _key < _len; _key++) {
        blobs[_key] = arguments[_key];
      }

      var allBlobs = flatten(blobs);
      var promises = allBlobs.map(function (blob) {
        var promise = _this2._queue.add(_this2._upload.bind(_this2, blob));
        _this2._promises.push(promise);
        return promise;
      });
      if (promises.length === 1) {
        return promises[0];
      }

      var Promise = this._nuxeo.Promise;
      return Promise.all(promises).then(function (batchBlobs) {
        return {
          blobs: batchBlobs.map(function (batchBlob) {
            return batchBlob.blob;
          }),
          batch: _this2
        };
      });
    }
  }, {
    key: '_upload',
    value: function _upload(blob) {
      var _this3 = this;

      if (!this._batchIdPromise) {
        this._batchIdPromise = this._fetchBatchId();
      }

      var uploadIndex = this._uploadIndex;
      this._uploadIndex += 1;
      return this._batchIdPromise.then(function () {
        var opts = {
          json: false,
          method: 'POST',
          url: join(_this3._url, _this3._batchId, uploadIndex),
          body: blob.content,
          headers: {
            'Cache-Control': 'no-cache',
            'X-File-Name': encodeURIComponent(blob.name),
            'X-File-Size': blob.size,
            'X-File-Type': blob.mimeType,
            'Content-Length': blob.size
          }
        };
        var options = _this3._computeOptions(opts);
        return _this3._nuxeo.http(options);
      }).then(function (res) {
        res.batchId = _this3._batchId;
        res.index = uploadIndex;
        return {
          blob: new BatchBlob(res),
          batch: _this3
        };
      });
    }
  }, {
    key: '_fetchBatchId',
    value: function _fetchBatchId() {
      var _this4 = this;

      var opts = {
        method: 'POST',
        url: this._url
      };

      var Promise = this._nuxeo.Promise;
      if (this._batchId) {
        return Promise.resolve(this);
      }
      var options = this._computeOptions(opts);
      return this._nuxeo.http(options).then(function (res) {
        _this4._batchId = res.batchId;
        return _this4;
      });
    }

    /**
     * Wait for all the current uploads to be finished. Note that it won't wait for uploads added after done() being call.
     * If an uploaded is added, you should call again done().
     * The {@link BatchUpload#isFinished} method can be used to know if the batch is finished.
     * @returns {Promise} A Promise object resolved when all the current uploads are finished.
     *
     * @example
     * ...
     * nuxeoBatch.upload(blob1, blob2, blob3);
     * nuxeoBatch.done()
     *   .then(function(res) {
     *     // res.batch === nuxeoBatch
     *     // res.blobs[0] is the BatchBlob object related to blob1
     *     // res.blobs[1] is the BatchBlob object related to blob2
     *     // res.blobs[2] is the BatchBlob object related to blob3
     *   })
     *   .catch(function(error) {
     *     throw new Error(error);
     *   });
     */

  }, {
    key: 'done',
    value: function done() {
      var _this5 = this;

      var Promise = this._nuxeo.Promise;
      return Promise.all(this._promises).then(function (batchBlobs) {
        return {
          blobs: batchBlobs.map(function (batchBlob) {
            return batchBlob.blob;
          }),
          batch: _this5
        };
      });
    }

    /**
     * Returns whether the BatchUpload is finished, ie. has uploads running, or not.
     * @returns {Boolean} true if the BatchUpload is finished, false otherwise.
     */

  }, {
    key: 'isFinished',
    value: function isFinished() {
      return this._queue.getQueueLength() === 0 && this._queue.getPendingLength() === 0;
    }

    /**
     * Cancels a BatchUpload.
     * @returns {Promise} A Promise object resolved with the BatchUpload itself.
     */

  }, {
    key: 'cancel',
    value: function cancel(opts) {
      var _this6 = this;

      var Promise = this._nuxeo.Promise;
      if (!this._batchIdPromise) {
        return Promise.resolve(this);
      }

      var path = join('upload', this._batchId);
      return this._batchIdPromise.then(function () {
        var options = _this6._computeOptions(opts);
        return _this6._nuxeo.request(path).delete(options);
      }).then(function () {
        _this6._batchIdPromise = null;
        _this6._batchId = null;
        return _this6;
      });
    }

    /**
     * Fetches a blob at a given index from the batch.
     * @returns {Promise} A Promise object resolved with the BatchUpload itself and the BatchBlob.
     */

  }, {
    key: 'fetchBlob',
    value: function fetchBlob(index) {
      var _this7 = this;

      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var Promise = this._nuxeo.Promise;
      if (!this._batchId) {
        return Promise.reject(new Error('No \'batchId\' set'));
      }

      var options = {
        method: 'GET',
        url: join(this._url, this._batchId, index)
      };
      options = extend(true, options, opts);
      options = this._computeOptions(options);
      return this._nuxeo.http(options).then(function (res) {
        res.batchId = _this7._batchId;
        res.index = index;
        return {
          batch: _this7,
          blob: new BatchBlob(res)
        };
      });
    }

    /**
     * Removes a blob at a given index from the batch.
     * @returns {Promise} A Promise object resolved with the result of the DELETE request.
     */

  }, {
    key: 'removeBlob',
    value: function removeBlob(index) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var Promise = this._nuxeo.Promise;
      if (!this._batchId) {
        return Promise.reject(new Error('No \'batchId\' set'));
      }

      var options = {
        method: 'DELETE',
        url: join(this._url, this._batchId, index)
      };
      options = extend(true, options, opts);
      options = this._computeOptions(options);
      return this._nuxeo.http(options);
    }

    /**
     * Fetches the blobs from the batch.
     * @returns {Promise} A Promise object resolved with the BatchUpload itself and the BatchBlobs.
     */

  }, {
    key: 'fetchBlobs',
    value: function fetchBlobs() {
      var _this8 = this;

      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var Promise = this._nuxeo.Promise;
      if (!this._batchId) {
        return Promise.reject(new Error('No \'batchId\' set'));
      }

      var options = {
        method: 'GET',
        url: join(this._url, this._batchId)
      };
      options = extend(true, options, opts);
      options = this._computeOptions(options);
      return this._nuxeo.http(options).then(function (blobs) {
        var batchBlobs = blobs.map(function (blob, index) {
          blob.batchId = _this8._batchId;
          blob.index = index;
          return new BatchBlob(blob);
        });
        return {
          batch: _this8,
          blobs: batchBlobs
        };
      });
    }
  }]);

  return BatchUpload;
}(Base);

module.exports = BatchUpload;