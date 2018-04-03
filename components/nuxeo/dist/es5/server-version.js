'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SERVER_VERSION_PATTERN = /(\d+)\.(\d+)(?:-HF(\d+))?/;

/**
 * The `ServerVersion` class represents a Nuxeo Server version.
 *
 * It handles major, minor and hotfix version.
 *
 * Limitations:
 *   - Ignore the `-SNAPSHOT` and `-IXXXXXXXX_XXXX` suffixes when parsing the server version
 *   - '9.10-SNAPSHOT' is considered equals to '9.10'
 *   - '9.10-20180101_1212' is considered equals to '9.10'
 */

var ServerVersion = function () {
  function ServerVersion(version) {
    _classCallCheck(this, ServerVersion);

    var match = version.match(SERVER_VERSION_PATTERN);
    if (!match) {
      throw new Error('Unknown Nuxeo Server version: ' + version);
    }

    this.major = parseInt(match[1], 10);
    this.minor = parseInt(match[2], 10);
    this.hotfix = parseInt(match[3], 10) || -1;
    this.version = version;
  }

  _createClass(ServerVersion, [{
    key: 'eq',


    /**
     * Returns whether this version is equal to the `version` param.
     *
     * @param {string|ServerVersion} version - The other version.
     */
    value: function eq(version) {
      var other = ServerVersion.create(version);
      return this.major === other.major && this.minor === other.minor && this.hotfix === other.hotfix;
    }

    /**
     * Returns whether this version is greater than the `version` param.
     *
     * @param {string|ServerVersion} version - The other version.
     */

  }, {
    key: 'gt',
    value: function gt(version) {
      var other = ServerVersion.create(version);
      return this.major > other.major || this.major === other.major && this.minor > other.minor || this.major === other.major && this.minor === other.minor && this.hotfix > other.hotfix;
    }

    /**
     * Returns whether this version is lesser than the `version` param.
     *
     * @param {string|ServerVersion} version - The other version.
     */

  }, {
    key: 'lt',
    value: function lt(version) {
      var other = ServerVersion.create(version);
      return this.major < other.major || this.major === other.major && this.minor < other.minor || this.major === other.major && this.minor === other.minor && this.hotfix < other.hotfix;
    }

    /**
     * Returns whether this version is greater than or equal to the `version` param.
     *
     * @param {string|ServerVersion} version - The other version.
     */

  }, {
    key: 'gte',
    value: function gte(version) {
      var other = ServerVersion.create(version);
      return this.eq(other) || this.gt(other);
    }

    /**
     * Returns whether this version is lesser than or equal to the `version` param.
     *
     * @param {string|ServerVersion} version - The other version.
     */

  }, {
    key: 'lte',
    value: function lte(version) {
      var other = ServerVersion.create(version);
      return this.eq(other) || this.lt(other);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.version;
    }
  }], [{
    key: 'create',
    value: function create(version) {
      return typeof version === 'string' ? new ServerVersion(version) : version;
    }
  }]);

  return ServerVersion;
}();

var LTS_2015 = new ServerVersion('7.10');
var LTS_2016 = new ServerVersion('8.10');
var LTS_2017 = new ServerVersion('9.10');

ServerVersion.LTS_2015 = LTS_2015;
ServerVersion.LTS_2016 = LTS_2016;
ServerVersion.LTS_2017 = LTS_2017;
ServerVersion.SERVER_VERSIONS = { LTS_2015: LTS_2015, LTS_2016: LTS_2016, LTS_2017: LTS_2017 };

module.exports = ServerVersion;