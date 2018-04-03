"use strict";

function flatten(list) {
  return list.reduce(function (a, b) {
    return a.concat(Array.isArray(b) ? flatten(b) : b);
  }, []);
}

module.exports = flatten;