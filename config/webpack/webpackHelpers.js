// Helper methods for Webpack configuration files
'use strict';

const path = require('path');

const helpers = {
  pathRegEx,
  removeHash
};

module.exports = helpers;

// Convert a Linux/OSX path expression inside a RegEx into a platform-specific expressions
function pathRegEx(regEx) {
  const sep = escapeStrRegEx(path.sep);

  if (typeof regEx === 'string') {
    return regEx.replace(/\//g, sep);
  }
  return new RegExp(regEx.source.replace(/\\\//g, sep));
}


function escapeStrRegEx(text) {
  return text.replace(/[-[\]/{}()*+?.,\\^$|#\s]/g, "\\$&");
}


function removeHash(parentObj, prop, regExMatcher) {
  let value = parentObj[prop];
  let matcher = regExMatcher || /\[(contentHash|hash).*?\]/;
  parentObj[prop] = value.replace(matcher, '');
}
