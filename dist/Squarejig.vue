<template>
<div class="squarejig">Working? {{ vue_works }}</div>
</template>

<script>
(function() {
  module.exports = {
    data: function() {
      return {
        vue_works: 'Yep'
      };
    }
  };

}).call(this);

</script>

<style>
div {
  width: 100px;
  height: 100px;
  background: #ccf;
}

</style>
