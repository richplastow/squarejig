#Squarejig

```pug
div(class="squarejig") Working? {{ vue_works }}
```

    module.exports =
      data: () ->
        {
          vue_works: 'Yep'
        }

```stylus
div
    width 100px
    height 100px
    background #ccf

```
