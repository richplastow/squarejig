<template>
<div class="squarejig">{{ vue_works }}</div>
</template>

<script>
module.exports = {
    data: function () {
        return {
            vue_works: 'Yep'
        }
    }
}
</script>

<style scoped>
div {
    width: 100px;
    height: 100px;
    background: #ccf;
}
</style>
