
(function() {
  var module = { exports:{} }

  module.exports = {
    data: function() {
      return {
        vue_works: 'Yep'
      };
    }
  };

  module.exports.template = `
<div class="squarejig">Working? {{ vue_works }}</div>
`

  Vue.component('squarejig', module.exports)

}).call(this);

