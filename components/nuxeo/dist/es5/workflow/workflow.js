'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var extend = require('extend');
var Base = require('../base');
var join = require('../deps/utils/join');

var WORKFLOW_PATH = 'workflow';

/**
 * The `Workflow` class wraps a workflow.
 *
 * **Cannot directly be instantiated**
 */

var Workflow = function (_Base) {
  _inherits(Workflow, _Base);

  /**
   * Creates a `Workflow`.
   * @param {object} workflow - The initial workflow object. This User object will be extended with workflow properties.
   * @param {object} opts - The configuration options.
   * @param {string} opts.nuxeo - The {@link Nuxeo} object linked to this workflow.
   * @param {string} [opts.documentId] - The attached document id of this workflow, if any.
   */
  function Workflow(workflow, opts) {
    _classCallCheck(this, Workflow);

    var _this = _possibleConstructorReturn(this, (Workflow.__proto__ || Object.getPrototypeOf(Workflow)).call(this, opts));

    _this._nuxeo = opts.nuxeo;
    _this._documentId = opts.documentId;
    extend(true, _this, workflow);
    return _this;
  }

  /**
   * Fetches the tasks of this workflow.
   * @param {object} [opts] - Options overriding the ones from this object.
   * @returns {Promise} A promise object resolved with the tasks.
   */


  _createClass(Workflow, [{
    key: 'fetchTasks',
    value: function fetchTasks() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var options = this._computeOptions(opts);
      options.documentId = this.uid;
      return this._buildTasksRequest().get(options);
    }

    /**
     * Fetches this workflow graph.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A promise object resolved with the workflow graph.
     */

  }, {
    key: 'fetchGraph',
    value: function fetchGraph() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var options = this._computeOptions(opts);
      var path = join(WORKFLOW_PATH, this.id, 'graph');
      return this._nuxeo.request(path).get(options);
    }

    /**
     * Builds the correct `Request` object depending of whether this workflow is attached to a document or not.
     * @returns {Request} A request object.
     */

  }, {
    key: '_buildTasksRequest',
    value: function _buildTasksRequest() {
      if (this._documentId) {
        var path = join('id', this._documentId, '@workflow', this.id, 'task');
        return this._nuxeo.request(path);
      }
      return this._nuxeo.request('task').queryParams({
        workflowInstanceId: this.id
      });
    }
  }]);

  return Workflow;
}(Base);

module.exports = Workflow;