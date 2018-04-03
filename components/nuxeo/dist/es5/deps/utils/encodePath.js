'use strict';

function encodePath(path) {
  var encodedPath = encodeURIComponent(path);
  // put back '/' character
  encodedPath = encodedPath.replace(/%2F/g, '/');
  // put back '@' character, needed for web adapters for instance...
  encodedPath = encodedPath.replace(/%40/g, '@');

  return encodedPath;
}

module.exports = encodePath;