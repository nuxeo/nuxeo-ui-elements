'use strict';

var depth = {
  ROOT: 'root',
  CHILDREN: 'children',
  MAX: 'max'
};

var enricher = {
  document: {
    ACLS: 'acls',
    BREADCRUMB: 'breadcrumb',
    CHILDREN: 'children',
    DOCUMENT_URL: 'documentURL',
    PERMISSIONS: 'permissions',
    PREVIEW: 'preview'
  }
};

module.exports = {
  depth: depth,
  enricher: enricher
};