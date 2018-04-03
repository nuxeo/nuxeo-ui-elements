'use strict';

var Nuxeo = require('./nuxeo');
var Base = require('./base');
var Operation = require('./operation');
var Request = require('./request');
var Repository = require('./repository');
var Document = require('./document');
var BatchUpload = require('./upload/batch');
var Blob = require('./blob');
var BatchBlob = require('./upload/blob');
var Users = require('./user/users');
var User = require('./user/user');
var Groups = require('./group/groups');
var Group = require('./group/group');
var Directory = require('./directory/directory');
var DirectoryEntry = require('./directory/entry');
var Workflows = require('./workflow/workflows');
var Workflow = require('./workflow/workflow');
var Task = require('./workflow/task');
var constants = require('./deps/constants');
var Promise = require('./deps/promise');

var _require = require('./auth/auth'),
    basicAuthenticator = _require.basicAuthenticator,
    tokenAuthenticator = _require.tokenAuthenticator,
    bearerTokenAuthenticator = _require.bearerTokenAuthenticator,
    portalAuthenticator = _require.portalAuthenticator;

var _require2 = require('./unmarshallers/unmarshallers'),
    documentUnmarshaller = _require2.documentUnmarshaller,
    documentsUnmarshaller = _require2.documentsUnmarshaller,
    workflowUnmarshaller = _require2.workflowUnmarshaller,
    workflowsUnmarshaller = _require2.workflowsUnmarshaller,
    taskUnmarshaller = _require2.taskUnmarshaller,
    tasksUnmarshaller = _require2.tasksUnmarshaller,
    directoryEntryUnmarshaller = _require2.directoryEntryUnmarshaller,
    directoryEntriesUnmarshaller = _require2.directoryEntriesUnmarshaller,
    userUnmarshaller = _require2.userUnmarshaller,
    groupUnmarshaller = _require2.groupUnmarshaller;

var NuxeoVersions = require('./nuxeo-versions');

var _require3 = require('./server-version'),
    SERVER_VERSIONS = _require3.SERVER_VERSIONS;

var oauth2 = require('./auth/oauth2');

var pkg = require('../package.json');

Nuxeo.Base = Base;
Nuxeo.Operation = Operation;
Nuxeo.Request = Request;
Nuxeo.Repository = Repository;
Nuxeo.Document = Document;
Nuxeo.BatchUpload = BatchUpload;
Nuxeo.Blob = Blob;
Nuxeo.BatchBlob = BatchBlob;
Nuxeo.Users = Users;
Nuxeo.User = User;
Nuxeo.Groups = Groups;
Nuxeo.Group = Group;
Nuxeo.Directory = Directory;
Nuxeo.DirectoryEntry = DirectoryEntry;
Nuxeo.Workflows = Workflows;
Nuxeo.Workflow = Workflow;
Nuxeo.Task = Task;
Nuxeo.constants = constants;
Nuxeo.version = pkg.version;

// expose Nuxeo versions
Nuxeo.VERSIONS = NuxeoVersions;
// expose Nuxeo Server versions
Nuxeo.SERVER_VERSIONS = SERVER_VERSIONS;

Nuxeo.oauth2 = oauth2;

Nuxeo.promiseLibrary(Promise);

// register default authenticators
Nuxeo.registerAuthenticator('basic', basicAuthenticator);
Nuxeo.registerAuthenticator('token', tokenAuthenticator);
Nuxeo.registerAuthenticator('bearerToken', bearerTokenAuthenticator);
Nuxeo.registerAuthenticator('portal', portalAuthenticator);

// register default unmarshallers
Nuxeo.registerUnmarshaller('document', documentUnmarshaller);
Nuxeo.registerUnmarshaller('documents', documentsUnmarshaller);
Nuxeo.registerUnmarshaller('workflow', workflowUnmarshaller);
Nuxeo.registerUnmarshaller('workflows', workflowsUnmarshaller);
Nuxeo.registerUnmarshaller('task', taskUnmarshaller);
Nuxeo.registerUnmarshaller('tasks', tasksUnmarshaller);
Nuxeo.registerUnmarshaller('directoryEntry', directoryEntryUnmarshaller);
Nuxeo.registerUnmarshaller('directoryEntries', directoryEntriesUnmarshaller);
Nuxeo.registerUnmarshaller('user', userUnmarshaller);
Nuxeo.registerUnmarshaller('group', groupUnmarshaller);
// make the WorkflowsUnmarshaller work for Nuxeo 7.10
Nuxeo.registerUnmarshaller('worflows', workflowsUnmarshaller);

module.exports = Nuxeo;