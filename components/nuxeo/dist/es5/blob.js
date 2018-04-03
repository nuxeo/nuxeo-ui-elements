"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The `Blob` class represents an abstraction over a blob to be used in the APIs.
 *
 * @example
 * // in the browser, assuming you have a File object from an input for instance
 * var blob = new Nuxeo.Blob({ content: file });
 * // in node
 * var file = fs.createReadStream(filePath);
 * var stats = fs.statSync(filePath);
 * var blob = new Nuxeo.Blob({
 *    content: file,
 *    name: path.basename(filePath1),
 *    mimeType: 'text/plain',
 *    size: stats.size,
 *  });
 */
var Blob =
/*
 * Creates a Blob.
 * @param {string} opts.content - The content of the Blob. Could be a File or Blob object in the browser.
 * @param {string} [opts.name] - The name of the Blob. It overrides the one from content.name.
 * @param {string} [opts.mimeType] - The mime-type of the Blob. It overrides the one from content.type.
 * @param {string} [opts.size] - The size of the Blob. It overrides the one from content.size.
 */
function Blob(opts) {
  _classCallCheck(this, Blob);

  this.content = opts.content;
  this.name = opts.name || this.content.name;
  this.mimeType = opts.mimeType || this.content.type;
  this.size = opts.size || this.content.size;
};

module.exports = Blob;