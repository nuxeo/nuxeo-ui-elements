'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var extend = require('extend');
var Base = require('../base');
var join = require('../deps/utils/join');

var TASK_PATH = 'task';

/**
 * The `Task` class wraps a task.
 *
 * **Cannot directly be instantiated**
 */

var Task = function (_Base) {
  _inherits(Task, _Base);

  /**
   * Creates a `Task`.
   * @param {object} task - The initial task object. This Task object will be extended with task properties.
   * @param {object} opts - The configuration options.
   * @param {string} opts.nuxeo - The {@link Nuxeo} object linked to this task.
   * @param {string} [opts.documentId] - The attached document id of this workflow, if any.
   */
  function Task(task, opts) {
    _classCallCheck(this, Task);

    var _this = _possibleConstructorReturn(this, (Task.__proto__ || Object.getPrototypeOf(Task)).call(this, opts));

    _this._nuxeo = opts.nuxeo;
    _this._documentId = opts.documentId;
    extend(true, _this, task);
    return _this;
  }

  /**
   * Sets a task variable.
   * @param {string} name - The name of the variable.
   * @param {string} value - The value of the variable.
   * @returns {Task} The task itself.
   */


  _createClass(Task, [{
    key: 'variable',
    value: function variable(name, value) {
      this.variables[name] = value;
      return this;
    }

    /**
     * Completes the task.
     * @param {string} action - The action name to complete the task.
     * @param {object} [taskOpts] - Configuration options for the task completion.
     * @param {string} [taskOpts.variables] - Optional variables to override the existing ones.
     * @param {string} [taskOpts.comment] - Optional comment.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A promise object resolved with the completed task.
     */

  }, {
    key: 'complete',
    value: function complete(action) {
      var taskOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var variables = taskOpts.variables || this.variables;
      opts.body = {
        variables: variables,
        'entity-type': 'task',
        id: this.id,
        comment: taskOpts.comment
      };
      var options = this._computeOptions(opts);
      var path = join(TASK_PATH, this.id, action);
      return this._nuxeo.request(path).put(options);
    }

    /**
     * Reassigns the task to the given actors.
     * @param {string} actors - Actors to reassign the task.
     * @param {object} [taskOpts] - Configuration options for the task reassignment.
     * @param {string} [taskOpts.comment] - Optional comment.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A promise object resolved with nothing.
     */

  }, {
    key: 'reassign',
    value: function reassign(actors) {
      var taskOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var options = this._computeOptions(opts);
      var path = join(TASK_PATH, this.id, 'reassign');
      return this._nuxeo.request(path).queryParams({
        actors: actors,
        comment: taskOpts.comment
      }).put(options);
    }

    /**
     * Delegates the task to the given actors.
     * @param {string} actors - Actors to delegate the task.
     * @param {object} [taskOpts] - Configuration options for the task delegation.
     * @param {string} [taskOpts.comment] - Optional comment.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A promise object resolved with nothing.
     */

  }, {
    key: 'delegate',
    value: function delegate(actors) {
      var taskOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var options = this._computeOptions(opts);
      var path = join(TASK_PATH, this.id, 'delegate');
      return this._nuxeo.request(path).queryParams({
        delegatedActors: actors,
        comment: taskOpts.comment
      }).put(options);
    }
  }]);

  return Task;
}(Base);

module.exports = Task;