## Client Library for Nuxeo API

[![Jenkins](https://img.shields.io/jenkins/s/https/qa.nuxeo.org/jenkins/job/Client/job/nuxeo-js-client-master-vs-master.svg?style=flat-square)](https://qa.nuxeo.org/jenkins/job/Client/job/nuxeo-js-client-master-vs-maste/)
[![npm version](https://img.shields.io/npm/v/nuxeo.svg?style=flat-square)](https://www.npmjs.com/package/nuxeo)
[![npm downloads](https://img.shields.io/npm/dm/nuxeo.svg?style=flat-square)](https://www.npmjs.com/package/nuxeo)
[![Dependency Status](https://img.shields.io/david/nuxeo/nuxeo-js-client.svg?style=flat-square)](https://david-dm.org/nuxeo/nuxeo-js-client) [![devDependency Status](https://img.shields.io/david/dev/nuxeo/nuxeo-js-client.svg?style=flat-square)](https://david-dm.org/nuxeo/nuxeo-js-client#info=devDependencies)

The Nuxeo JavaScript Client is a JavaScript client library for the Nuxeo Automation and REST API. The library can work in a browser, or in Node.js, using the same API.

This is an on-going project, supported by Nuxeo.

## Nuxeo Platform Dependency

The JS Client is compliant with all Nuxeo versions as of LTS 2015.

## Getting Started

### Installation

#### Node.js Applications

After [installing](http://nodejs.org/#download) [Node.js](http://nodejs.org), use `npm` to install the `nuxeo` package:

    $ npm install nuxeo

##### Node.js v6 LTS (Boron)

```javascript
var Nuxeo = require('nuxeo');
var nuxeo = new Nuxeo({ ... });
```

##### Node.js v4 LTS (Argon)

```javascript
var Nuxeo = require('nuxeo/es5');
var nuxeo = new Nuxeo({ ... });
```

#### Bower Powered Applications

The `nuxeo` client can be also installed through bower:

    $ bower install nuxeo --save

When added to your page, `Nuxeo` is available as a global variable.

```javascript
var nuxeo = new Nuxeo({ ... });
```

#### Angular Applications

After adding `nuxeo` through Bower, you can easily create a service that will return a client:

```javascript
...
.service('nuxeo', function() {
  return new Nuxeo({
    baseURL: 'http://localhost:8080/nuxeo/',
    auth: {
      method: 'basic',
      username: 'Administrator',
      password: 'Administrator'
    }
  });
})
...
```

To notify Angular to update the UI when a Nuxeo promise has resolved, you can either wrap Nuxeo promises in `$q.when()`
or, the preferred way, configure the Promise library class to be `$q`.

```javascript
// wrap promises
...
$q.when(nuxeo.request('/path/').get()).then(function(res) {
  $scope.res = res;
});
// use $q as the Promise library class
...
.service('nuxeo', function($q) {
  Nuxeo.promiseLibrary($q);
  return new Nuxeo({
    baseURL: 'http://localhost:8080/nuxeo/',
    auth: {
      method: 'basic',
      username: 'Administrator',
      password: 'Administrator'
    }
  });
})
...
```

#### Angular v2 Applications

After adding `nuxeo` through `npm` to your application, you can use the Nuxeo client directly by requiring the `nuxeo` module:

```javascript
const Nuxeo = require('nuxeo');
...
const nuxeo = new Nuxeo({...});
...
```

`Nuxeo` works correctly with Angular v2 `ZoneAwarePromise` Promise library, so the component tree will be re-rendered when a `Promise` from `Nuxeo` will resolve.

#### React Applications

After adding `nuxeo` through `npm` to your application, to make it sure that it will work on most browsers
you must require `nuxeo` differently according to your build system.

If your build transpiles external libraries from ES6 to ES5:

```javascript
var Nuxeo = require('nuxeo');
```

If your build does not (such as [create-react-app](https://github.com/facebookincubator/create-react-app)):

```javascript
var Nuxeo = require('nuxeo/es5');
```

## Documentation

Check out the [API documentation](https://nuxeo.github.io/nuxeo-js-client/latest/).

## Examples

Some working examples using the Nuxeo JavaScript Client can be found [here](https://github.com/nuxeo/nuxeo-js-client/tree/master/examples).

## Deprecated APIs

__Base#timeout__ (since 3.6.0)

The `timeout` method available on the `Base` class is deprecated in favor of using directly the `httpTimeout` or `transactionTimeout` methods depending of what needs to be configured.

Note that the `httpTimeout` is in milliseconds while the `transactionTimeout` is in seconds, so guessing the `transactionTimeout` from a `timeout` is a bad idea, you better need to be explicit.

__Nuxeo#nuxeoVersion__ (since 3.5.0)

The `nuxeoVersion` property of a Nuxeo client instance is deprecated in favor of the `serverVersion` property that allows correct versions comparison.

The `Nuxeo.VERSIONS` object is also deprecated in favor of the `Nuxeo.SERVER_VERSIONS` object.

__Nuxeo#_http__ (since 3.3.0)

The "private" `_http` method is deprecated in favor of the "public" `http` method.

__Nuxeo#login__ (since 3.0.0)

The `login` method is deprecated in favor of the `connect` method.

## Quick Start

This quick start guide will show how to do basics operations using the client.

### Authentication

The authentication method to be used is defined when creating a client:

```javascript
var nuxeo = new Nuxeo({
  auth: {
    method: ...,
    ...
  }
});
```

The client supports different authentication methods matching the ones available on the Nuxeo Platform.

#### Basic Authentication

The simplest one allowing to authenticate with a `username` and `password`.

```javascript
var nuxeo = new Nuxeo({
  auth: {
    method: 'basic',
    username: 'Administrator',
    password: 'Administrator'
  }
});
```

#### Portal Authenticaton

If the [Portal Authentication](https://doc.nuxeo.com/nxdoc/using-sso-portals/) is configured on the Nuxeo Platform,
you can authenticate with the `portal` method.

```javascript
var nuxeo = new Nuxeo({
  auth: {
    method: 'portal',
    username: 'joe',
    secret: 'shared-secret-from-server'
  }
});
```

#### Token Authentication

To authenticate through a token from the Nuxeo Server:

```javascript
var nuxeo = new Nuxeo({
  auth: {
    method: 'token',
    token: 'a-token'
  }
});
```

There is a utility method `Nuxeo#requestAuthenticationToken` to retrieve a `token` from a Nuxeo Server using the configured authentication method.
For instance, a typical flow would be:

```javascript
var nuxeo = new Nuxeo({
  auth: {
    method: 'basic',
    username: 'Administrator',
    password: 'Administrator'
  }
});

nuxeo.requestAuthenticationToken('My App', deviceUID, deviceName, 'rw')
  .then(function(token) {
    nuxeo = new Nuxeo({
      auth: {
        method: 'token',
        token: token
      }
    });

    // do something with the new `nuxeo` client using token authentication
    // store the token, and next time you need to create a client, use it
  })
  .catch(function(err) {
    throw err;
  });
```

#### OAuth2 Authorization and Bearer Token Authentication

Since Nuxeo Platform 9.2, you can use OAuth2 authorization through the JS client.

For more information on OAuth2 server side, see [Using OAuth2](https://doc.nuxeo.com/nxdoc/using-oauth2/).

Assuming you already have an access token, you can configure the client:

```javascript
var nuxeo = new Nuxeo({
  auth: {
    method: 'bearerToken',
    token: access_token,
    clientId: 'my-app' // optional OAuth2 client ID to refresh the access token
  }
});
```

The `bearertoken` method supports the `token` being a simple string (an access token) or a full token object such as:

```javascript
{
  "access_token":"H8dXDdEW9U2jJnFDh6lJJ74AHRzCyG4D",
  "token_type":"bearer",
  "expires_in":3600,
  "refresh_token":"Amz8JlyglhGWDmYHMYS5EnTTFUFAwZLiHG4aqQDfkwUNunSMpTTSFUmvprX3WdSF"
}
```

If the `token` is a full token object (ie. with a `refresh_token` key) and a `clientId` is configured on the `auth` object, the client will try automatically to refresh the access token if it's expired.

##### OAuth2 Flow

A typical OAuth2 flow with the Nuxeo Platform would be:

__Retrieving Authorization Code__

Generate a "log in" link to be used in a browser, such as:

`http://localhost:8080/nuxeo/oauth2/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=REDIRECT_URI`

The user sees the login page then, after being logged in, the authorization prompt for the application.

If the user grants access, the Nuxeo Platform redirects the user back to the application:

`http://localhost:8000/authorize?code=AUTH_CODE`

__Retrieving Access Token__

The client exchanges the authorization code for an access token:

```
POST http://localhost:8080/nuxeo/oauth2/token
  grant_type=authorization_code
  code=AUTH_CODE
  redirect_uri=REDIRECT_URI
  client_id=CLIENT_ID
```

The Nuxeo Platform replies with an access token:

```javascript
{
  "access_token":"H8dXDdEW9U2jJnFDh6lJJ74AHRzCyG4D",
  "token_type":"bearer",
  "expires_in":3600,
  "refresh_token":"Amz8JlyglhGWDmYHMYS5EnTTFUFAwZLiHG4aqQDfkwUNunSMpTTSFUmvprX3WdSF"
}
```

There are some utility methods on the client to help you with this flow:

__Nuxeo.oauth2.getAuthorizationURL(baseURL, clientId[, params])__

Returns the OAuth2 authorization URL for the given `baseURL` and `clientId`.

```javascript
var authorizationURL = Nuxeo.oauth2.getAuthorizationURL('http://localhost:8080/nuxeo', 'my-app', {
  state: 'xyz',
  redirect_uri: 'http://localhost:8000/authorize',
});
console.log(authorizationURL); // http://localhost:8080/nuxeo/oauth2/authorize?client_id=my-app&response_type=code&state=xyz&redirect_uri=http://localhost:8000/authorize
```

__Nuxeo.oauth2.fetchAccessToken(baseURL, clientId, code[, params])__

Fetches an OAuth2 access token for the given `baseURL`, `clientId` and `code`.

```javascript
var code = ...
Nuxeo.oauth2.fetchAccessToken('http://localhost:8080/nuxeo', 'my-app', code, {
  redirect_uri: 'http://localhost:8000/authorize',
}).then(function(token) {
  // do something with the access token
  var nuxeo = new Nuxeo({
    auth: {
      method: 'bearerToken',
      token: token
    }
  });
});
```

__Nuxeo.oauth2.refreshAccessToken(baseURL, clientId, refreshToken[, params])__

Manually refresh an access token for the given `baseURL`, `clientId` and `refreshToken`.

```javascript
var refreshToken = ...
Nuxeo.oauth2.refreshAccessToken('http://localhost:8080/nuxeo', 'my-app', refreshToken)
  .then(function(token) {
    console.log(token); // refreshed access token
});
```

### Creating a Client

```javascript
var nuxeo = new Nuxeo({
  auth: {
    method: 'basic',
    username: 'Administrator',
    password: 'Administrator'
  }
});
```

To connect to a different Nuxeo Platform Instance, you can use the following:

```javascript
var nuxeo = new Nuxeo({
  baseURL: 'http://demo.nuxeo.com/nuxeo/',
  auth: {
    method: 'basic',
    username: 'Administrator',
    password: 'Administrator'
  }
});
```

### Promise Based Calls

All API calls made on the server return a Promise object.

```javascript
nuxeo.operation('Document.GetChildren')
  .input('/')
  .execute()
  .then(function(docs) {
    // work with docs
  })
  .catch(function(error) {
    // something went wrong
    throw error;
  });
```

When something went wrong, the `error` is an `Error` object with a `response` field containing the whole response.

### Connecting to a Nuxeo Server

After creating a Client, you can connect to a Nuxeo Server by using the `connect` method.
This method returns a `Promise` which is resolved with the connected client.

```javascript
var nuxeo = new Nuxeo({ ... });
nuxeo.connect()
  .then(function(client){
    // client.connected === true
    // client === nuxeo
    console.log('Connected OK!');
  })
  .catch(function(error) {
    // wrong credentials / auth method / ...
    throw error;
  });
```

#### Current User

The `connect` method fills the `user` property of the client. `user` is a full `User` object.

```javascript
var nuxeo = new Nuxeo({ ... });
nuxeo.connect()
  .then(function(client){
    // client.user.id === 'Administrator'
    console.log(client.user);
  })
  .catch(function(error) {
    // wrong credentials / auth method / ...
    throw error;
  });
```

#### Nuxeo Server version

The `connect` method fills the `serverVersion` property of the client.

```javascript
var nuxeo = new Nuxeo({ ... });
nuxeo.connect()
  .then(function(client){
    console.log(client.serverVersion); // '9.10'
  })
  .catch(function(error) {
    // wrong credentials / auth method / ...
    throw error;
  });
```

Some constants are available in the `Nuxeo` object for supported LTS versions:

```javascript
Nuxeo.SERVER_VERSIONS.LTS_2015; // for '7.10';
Nuxeo.SERVER_VERSIONS.LTS_2016; // for '8.10';
Nuxeo.SERVER_VERSIONS.LTS_2017; // for '9.10';
```

You can use them to easily make different calls according to the target version:

```javascript
...
if (nuxeo.serverVersion.lt(Nuxeo.SERVER_VERSIONS.LTS_2016)) {
  // do something on versions before LTS 2016
} else {
  // do something else
}
...
```

See the [ServerVersion](https://nuxeo.github.io/nuxeo-js-client/latest/ServerVersion.html) documentation.

Note that the `nuxeoVersion` property is deprecated but it is still filled with the Nuxeo Server version.

### Operation

`Operation` object allows you to execute an operation
(or operation chain).

See the [Operation](https://nuxeo.github.io/nuxeo-js-client/latest/Operation.html) documentation.

#### Samples

__Call an operation to create a new folder in the Root document__

```javascript
nuxeo.operation('Document.Create')
  .params({
    type: 'Folder',
    name: 'My Folder',
    properties: 'dc:title=My Folder \ndc:description=A Simple Folder'
  })
  .input('/')
  .execute()
  .then(function(doc) {
    console.log('Created ' + doc.title + ' folder');
  })
  .catch(function(error) {
    throw error;
  });
```

### Request

The `Request` object allows you to call the Nuxeo REST API.

See the [Request](https://nuxeo.github.io/nuxeo-js-client/latest/Request.html) documentation.

#### Samples

__Fetch the Administrator user__

```javascript
nuxeo.request('user/Administrator')
  .get()
  .then(function(user) {
    console.log(user);
  })
  .catch(function(error) {
    throw error;
  });
```

__Fetch the whole list of Natures__

```javascript
nuxeo.request('directory/nature')
  .get()
  .then(function(data) {
    console.log(JSON.stringify(data.entries, null, 2))
  })
  .catch(function(error) {
    throw error
  });
```

### Repository

The `Repository` object allows you to work with document.

See the [Repository](https://nuxeo.github.io/nuxeo-js-client/latest/Repository.html) documentation.

#### Samples

__Create a `Repository` object__

```javascript
var defaultRepository = nuxeo.repository(); // 'default' repository
...
var testRepository = nuxeo.repository('test'); // 'test' repository
...
```

__Fetch the Root document__

```javascript
nuxeo.repository().fetch('/')
  .then(function(doc) {
    console.log(doc);
  })
  .catch(function(error) {
    throw error;
  });
```

__Create a new folder__

```javascript
var newFolder = {
  'entity-type': 'document',
  name: 'a-folder',
  type: 'Folder',
  properties: {
    'dc:title': 'foo'
  }
};
nuxeo.repository()
  .create('/', newFolder)
  .then(function(doc) {
    console.log(doc);
  })
  .catch(function(error) {
    throw error;
  });
```

__Delete a document__

```javascript
nuxeo.repository()
  .delete('/a-folder')
  .then(function(res) {
    // res.status === 204
  });
```

### Document

`Repository` object returns and works with `Document` objects. `Document` objects exposes a simpler API
to work with a document.

See the [Document](https://nuxeo.github.io/nuxeo-js-client/latest/Document.html) documentation.

#### Samples

__Retrieve a `Document` object__

```javascript
nuxeo.repository()
  .fetch('/')
  .then(function(doc) {
    // doc instanceof Nuxeo.Document === true
  })
  .catch(function(error) {
    throw error;
  });
```

__Set a document property__

```javascript
doc.set({ 'dc:title': 'foo' });
```

__Get a document property__

```javascript
doc.get('dc:title');
```

__Save an updated document__

```javascript
nuxeo.repository()
  .fetch('/')
  .then(function(doc) {
    // doc.title !== 'foo'
    doc.set({ 'dc:title': 'foo' });
    return doc.save();
  })
  .then(function(doc) {
    // doc.title === 'foo'
  })
  .catch(function(error) {
    throw error;
  });
```

__Fetch the main Blob of a document__

```javascript
doc.fetchBlob()
  .then(function(res) {
    // in the browser, use res.blob() to work with the converted PDF
    // in Node.js, use res.body
  });
```

__Convert a document main Blob to PDF__

```javascript
doc.convert({ format: 'pdf' })
  .then(function(res) {
    // in the browser, use res.blob() to work with the converted PDF
    // in Node.js, use res.body
  });
```

__Fetch the 'thumbnail' rendition__

```javascript
doc.fetchRendition('thumbnail')
  .then(function(res) {
    // in the browser, use res.blob() to work with the rendition
    // in Node.js, use res.body
  });
```

__Start a workflow__

```javascript
doc.startWorkflow('SerialDocumentReview')
  .then(function(workflow) {
    // workflow instance of Nuxeo.Workflow
  });
```

__Complete a workflow task__

```javascript
workflow.fetchTasks()
  .then(function(tasks) {
    return tasks[0];
  })
  .then(function(tasks) {
    task.variable('participants', ['user:Administrator'])
      .variable('assignees', ['user:Administrator'])
      .variable('end_date', '2011-10-23T12:00:00.00Z');
    return task.complete('start_review', { comment: 'a comment' });
  })
  .then(function(task) {
    // task.state === 'ended'
  })
```

### BatchUpload

The `BatchUpload` object allows you to upload blobs to a Nuxeo Platform instance, and use them as operation input or
as document property value.

See the [BatchUpload](https://nuxeo.github.io/nuxeo-js-client/latest/BatchUpload.html) documentation.

#### Samples

__Create a Nuxeo.Blob to be uploaded__

```javascript
// on the browser, assuming you have a File object 'file'
var blob = new Nuxeo.Blob({ content: file });
// the name, mimeType and size will be extracted from the file object itself, you can still override them.
...
// on Node.js, assuming you have a Stream 'file'
var blob = new Nuxeo.Blob({ content: file, name: 'foo.txt', mimeType: 'plain/text', size: 10 })
```

__Upload a blob__

```javascript
nuxeo.batchUpload()
  .upload(blob)
  .then(function(res) {
    // res.blob instanceof Nuxeo.BatchBlob
    console.log(res.blob);
  })
  .catch(function(error) {
    throw error;
  });
```

__Attach an uploaded blob to a document__

```javascript
nuxeo.batchUpload()
  .upload(blob)
  .then(function(res) {
    return nuxeo.operation('Blob.AttachOnDocument')
      .param('document', '/a-file')
      .input(res.blob)
      .execute();
  })
  .then(function() {
    return nuxeo.repository().fetch('/a-file', { schemas: ['dublincore', 'file']});
  })
  .then(function(doc) {
    console.log(doc.get('file:content'));
  })
  .catch(function(error) {
    throw error;
  });
```

### Users

The `Users` object allows you to work with users.

See the [Users](https://nuxeo.github.io/nuxeo-js-client/latest/Users.html) and
[User](https://nuxeo.github.io/nuxeo-js-client/latest/User.html) documentation.

#### Samples

__Fetch an user__

```javascript
nuxeo.users()
  .fetch('Administrator')
  .then(function(user) {
    // user.id === 'Administrator'
  });
```

__Create a new user__

```javascript
var newUser = {
  properties: {
    username: 'leela',
    firstName: 'Leela',
    company: 'Futurama',
    email: 'leela@futurama.com'
  },
};
nuxeo.users()
  .create(newUser)
  .then(function(user) {
    // user.id === 'leela'
  });
```

__Delete an user__

```javascript
nuxeo.users()
  .delete('leela').then(function(res) {
    // res.status === 204
  });
```

### Groups

The `Groups` object allows you to work with groups.

See the [Groups](https://nuxeo.github.io/nuxeo-js-client/latest/Groups.html) and
[Group](https://nuxeo.github.io/nuxeo-js-client/latest/Group.html) documentation.

#### Samples

__Fetch a group__

```javascript
nuxeo.groups().fetch('administrators')
  .then(function(group) {
    // group.groupname === 'administrators'
  });
```

__Create a new group__

```javascript
var newGroup = {
  groupname: 'foo',
  grouplabel: 'Foo'
};
nuxeo.groups()
  .create(newGroup)
  .then(function(group) {
    // group.groupname === 'foo';
  });
```

__Delete a group__

```javascript
nuxeo.groups()
  .delete('foo').then(function(res) {
    // res.status === 204
  });
```

### Directory

The `Directory` object allows you to work with directories.

See the [Directory](https://nuxeo.github.io/nuxeo-js-client/latest/Directory.html) and
[DirectoryEntry](https://nuxeo.github.io/nuxeo-js-client/latest/DirectoryEntry.html) documentation.

#### Samples

__Fetch all entries of a directory__

```javascript
nuxeo.directory('nature')
  .fetchAll()
  .then(function(entries) {
    // entries instance of Array
  });
```

__Fetch a given directory entry__

```javascript
nuxeo.directory('nature')
  .fetch('article')
  .then(function(entry) {
    // entry.directoryName === 'nature'
    // entry.properties.id === 'article'
  });
```

__Create a new directory entry__

```javascript
var newEntry = {
  properties: {
    id: 'foo',
    label: 'Foo'
  },
};
nuxeo.directory('nature')
  .create(newEntry)
  .then(function(entry) {
    // entry.directoryName === 'nature'
    // entry.properties.id === 'foo'
  });
```

__Delete a directory entry__

```javascript
nuxeo.directory('nature')
 .delete('foo')
 .then(function(res) {
   // res.status === 204
 });
```

## Contributing

See our [contribution documentation](https://doc.nuxeo.com/x/VIZH).

### Requirements

* [Node.js](http://nodejs.org/#download)
* [gulp](http://gulpjs.com/)
* [Bower](http://bower.io/)
* [npm](https://www.npmjs.com/)

### Setup

Install [Node.js](http://nodejs.org/#download) and then use `npm` to install all the required
libraries:

    $ git clone https://github.com/nuxeo/nuxeo-js-client
    $ cd nuxeo-js-client
    $ npm install

### Test

A Nuxeo Platform instance needs to be running on `http://localhost:8080/nuxeo` for the tests to be run.

Tests can be launched on Node.js with:

    $ gulp test:node

For testing the browser client (tests are run on Firefox and Chrome by default):

    $ gulp test:browser

To run both Node.js and browser tests:

    $ gulp test


### Reporting Issues

You can follow the developments in the Nuxeo JS Client project of our JIRA bug tracker: [https://jira.nuxeo.com/browse/NXJS](https://jira.nuxeo.com/browse/NXJS).

You can report issues on [answers.nuxeo.com](http://answers.nuxeo.com).

## License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt) Copyright (c) Nuxeo SA


## About Nuxeo

Nuxeo dramatically improves how content-based applications are built, managed and deployed, making customers more agile, innovative and successful. Nuxeo provides a next generation, enterprise ready platform for building traditional and cutting-edge content oriented applications. Combining a powerful application development environment with SaaS-based tools and a modular architecture, the Nuxeo Platform and Products provide clear business value to some of the most recognizable brands including Verizon, Electronic Arts, Sharp, FICO, the U.S. Navy, and Boeing. Nuxeo is headquartered in New York and Paris. More information is available at [www.nuxeo.com](http://www.nuxeo.com/).
