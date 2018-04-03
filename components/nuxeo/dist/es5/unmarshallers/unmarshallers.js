'use strict';

var Document = require('../document');
var Workflow = require('../workflow/workflow');
var Task = require('../workflow/task');
var User = require('../user/user');
var Group = require('../group/group');
var DirectoryEntry = require('../directory/entry');

var unmarshallers = {};

var Unmarshallers = {
  registerUnmarshaller: function registerUnmarshaller(entityType, unmarshaller) {
    unmarshallers[entityType] = unmarshaller;
  },

  unmarshall: function unmarshall(json, options) {
    var entityType = json['entity-type'];
    var unmarshaller = unmarshallers[entityType];
    return unmarshaller && unmarshaller(json, options) || json;
  }
};

// default unmarshallers

var documentUnmarshaller = function documentUnmarshaller(json, options) {
  return new Document(json, options);
};

var documentsUnmarshaller = function documentsUnmarshaller(json, options) {
  var entries = json.entries;

  var docs = entries.map(function (doc) {
    return new Document(doc, options);
  });
  json.entries = docs;
  return json;
};

var workflowUnmarshaller = function workflowUnmarshaller(json, options) {
  return new Workflow(json, options);
};

var workflowsUnmarshaller = function workflowsUnmarshaller(json, options) {
  var entries = json.entries;

  var workflows = entries.map(function (workflow) {
    return new Workflow(workflow, options);
  });
  json.entries = workflows;
  return json;
};

var taskUnmarshaller = function taskUnmarshaller(json, options) {
  return new Task(json, options);
};

var tasksUnmarshaller = function tasksUnmarshaller(json, options) {
  var entries = json.entries;

  var tasks = entries.map(function (task) {
    return new Task(task, options);
  });
  json.entries = tasks;
  return json;
};

var directoryEntryUnmarshaller = function directoryEntryUnmarshaller(json, options) {
  return new DirectoryEntry(json, options);
};

var directoryEntriesUnmarshaller = function directoryEntriesUnmarshaller(json, options) {
  var entries = json.entries;

  var directoryEntries = entries.map(function (directoryEntry) {
    return new DirectoryEntry(directoryEntry, options);
  });
  json.entries = directoryEntries;
  return json;
};

var userUnmarshaller = function userUnmarshaller(json, options) {
  return new User(json, options);
};

var groupUnmarshaller = function groupUnmarshaller(json, options) {
  return new Group(json, options);
};

Unmarshallers.documentUnmarshaller = documentUnmarshaller;
Unmarshallers.documentsUnmarshaller = documentsUnmarshaller;
Unmarshallers.workflowUnmarshaller = workflowUnmarshaller;
Unmarshallers.workflowsUnmarshaller = workflowsUnmarshaller;
Unmarshallers.taskUnmarshaller = taskUnmarshaller;
Unmarshallers.tasksUnmarshaller = tasksUnmarshaller;
Unmarshallers.directoryEntryUnmarshaller = directoryEntryUnmarshaller;
Unmarshallers.directoryEntriesUnmarshaller = directoryEntriesUnmarshaller;
Unmarshallers.userUnmarshaller = userUnmarshaller;
Unmarshallers.groupUnmarshaller = groupUnmarshaller;

module.exports = Unmarshallers;