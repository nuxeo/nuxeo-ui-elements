'use strict';

/* eslint no-undef: 0 */
var globalObject = typeof self === 'undefined' ? global : self;
module.exports = globalObject.fetch.bind(globalObject);