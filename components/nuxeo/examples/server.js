/* eslint import/no-extraneous-dependencies: 0 */
const express = require('express');
const path = require('path');

const app = express();

console.log(path.join(__dirname, 'dist/nuxeo.js'));
app.use('/nuxeo.js', express.static(path.join(__dirname, '../dist/nuxeo.js')));
app.use(express.static(__dirname));

const port = process.env.PORT || 8888;
app.listen(port);
/* eslint no-console: 0*/
console.log(`Server running at: http://localhost:${port}`);
