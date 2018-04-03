'use strict';

var P = require('es6-promise');

// use the polyfill only if no `Promise` object exists
if (typeof Promise === 'undefined') {
  P.polyfill();
}

module.exports = Promise;