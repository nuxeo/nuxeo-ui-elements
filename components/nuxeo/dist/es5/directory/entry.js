'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var extend = require('extend');
var Base = require('../base');

/**
 * The `DirectoryEntry` class wraps a directory entry.
 *
 * **Cannot directly be instantiated**
 */

var DirectoryEntry = function (_Base) {
  _inherits(DirectoryEntry, _Base);

  /**
   * Creates a DirectoryEntry.
   * @param {object} entry - The initial entry object.
   *                         This DirectoryEntry object will be extended with entry properties.
   * @param {object} opts - The configuration options.
   * @param {string} opts.directory - The {@link Directory} object linked to this entry.
   */
  function DirectoryEntry(entry, opts) {
    _classCallCheck(this, DirectoryEntry);

    var _this = _possibleConstructorReturn(this, (DirectoryEntry.__proto__ || Object.getPrototypeOf(DirectoryEntry)).call(this, opts));

    _this._directory = opts.directory;
    _this.properties = {};
    _this._dirtyProperties = {
      id: entry.properties.id
    };
    extend(true, _this, entry);
    return _this;
  }

  /**
   * Sets entry properties.
   * @param {object} properties - The properties to set.
   * @returns {DirectoryEntry}
   *
   * @example
   * entry.set({
   *   'label': 'new label',
   *   'ordering': 50,
   * });
   */


  _createClass(DirectoryEntry, [{
    key: 'set',
    value: function set(properties) {
      this._dirtyProperties = extend(true, {}, this._dirtyProperties, properties);
      return this;
    }

    /**
     * Gets an entry property.
     * @param {string} propertyName - The property name, such as 'label', 'ordering', ...
     * @returns {DirectoryEntry}
     */

  }, {
    key: 'get',
    value: function get(propertyName) {
      return this._dirtyProperties[propertyName] || this.properties[propertyName];
    }

    /**
     * Saves the entry. It updates only the 'dirty properties' set through the {@link DirectoryEntry#set} method.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A promise object resolved with the updated entry.
     */

  }, {
    key: 'save',
    value: function save() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var options = this._computeOptions(opts);
      return this._directory.update({
        properties: this._dirtyProperties
      }, options);
    }
  }]);

  return DirectoryEntry;
}(Base);

module.exports = DirectoryEntry;