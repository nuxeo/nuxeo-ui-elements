'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var extend = require('extend');
var Base = require('../base');

/**
 * The `User` class wraps an user.
 *
 * **Cannot directly be instantiated**
 */

var User = function (_Base) {
  _inherits(User, _Base);

  /**
   * Creates a User.
   * @param {object} user - The initial user object. This User object will be extended with user properties.
   * @param {object} opts - The configuration options.
   * @param {string} opts.users - The {@link Users} object linked to this user.
   */
  function User(user, opts) {
    _classCallCheck(this, User);

    var _this = _possibleConstructorReturn(this, (User.__proto__ || Object.getPrototypeOf(User)).call(this, opts));

    _this._users = opts.users;
    _this.properties = {};
    _this._dirtyProperties = {};
    extend(true, _this, user);
    return _this;
  }

  /**
   * Sets user properties.
   * @param {object} properties - The properties to set.
   * @returns {User}
   *
   * @example
   * user.set({
   *   firstName: 'new first name',
   *   company: 'new company',
   * });
   */


  _createClass(User, [{
    key: 'set',
    value: function set(properties) {
      this._dirtyProperties = extend(true, {}, this._dirtyProperties, properties);
      return this;
    }

    /**
     * Gets a user property.
     * @param {string} propertyName - The property name, such as 'fistName', 'email', ...
     * @returns {User}
     */

  }, {
    key: 'get',
    value: function get(propertyName) {
      return this._dirtyProperties[propertyName] || this.properties[propertyName];
    }

    /**
     * Saves the user. It updates only the 'dirty properties' set through the {@link User#set} method.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A promise object resolved with the updated user.
     */

  }, {
    key: 'save',
    value: function save() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var options = this._computeOptions(opts);
      return this._users.update({
        id: this.id,
        properties: this._dirtyProperties
      }, options);
    }
  }]);

  return User;
}(Base);

module.exports = User;