'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var extend = require('extend');

/**
 * The `BatchBlob` class wraps a blob uploaded through a {@link BatchUpload} to be used
 * in an {@link Operation} input or as a property value on a {@link Document}.
 */

var BatchBlob = function BatchBlob() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, BatchBlob);

  this['upload-batch'] = data.batchId;
  this['upload-fileId'] = '' + data.index;
  delete data.batchId;
  delete data.index;
  extend(this, data);
};

module.exports = BatchBlob;