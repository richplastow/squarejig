"use strict";
(function() {
  var module = {exports: {}};
  module.exports = {data: function() {
      return {vue_works: 'Yep'};
    }};
  module.exports.template = "\n<div class=\"squarejig\">Working? {{ vue_works }}</div>\n";
  Vue.component('squarejig', module.exports);
}).call((void 0));
//# sourceURL=<compile-source>
