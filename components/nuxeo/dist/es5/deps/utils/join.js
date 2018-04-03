'use strict';

function join() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var joined = args.join('/');
  return joined.replace(/(^\/+)|([^:])\/\/+/g, '$2/');
}

module.exports = join;