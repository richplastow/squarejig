!function () { 'use strict'

const NAME     = 'LitVue Make'
    , VERSION  = '1.0.0'
    , HOMEPAGE = 'http://litvue.richplastow.com/'

    , BYLINE   = `\n\n\n\n//\\\\//\\\\ built by ${NAME} ${VERSION}`
                       + ` //\\\\//\\\\ ${HOMEPAGE} //\\\\//\\\\\n`
    , HELP =
`
${NAME} ${VERSION}
${'='.repeat( (NAME+VERSION).length+1 )}

This Node.js script reads all .coffee.md and .litcoffee files from ‘src/’, and
builds the distribution files in ‘dist/’ (.css, .js and .vue).

Installation
------------
You’ll need Uglify, Traceur, Pug, CoffeeScript and Stylus installed globally:
$ npm i -g uglify-js traceur pug coffee-script stylus

If you haven’t done it already, you should set up the \`lvmake\` alias:
$ node build/litvue-alias.js

@TODO create build/litvue-alias.js

Basic Usage
-----------
$ cd /path/to/your/project/   # A project directory in standard Oopish format
$ lvmake --version            # Show the current ${NAME} version
$ lvmake                      # Build all distribution files in ‘dist/’

Build Process
-------------
1.  Delete the current contents of ‘dist/’
2.  Process each .coffee.md or .litcoffee file in ‘src/’, in turn
3.  Place any markdown indented with 4+ spaces in a \`\`\`coffee block
4.  Parse out \`\`\`html blocks, parse out and transpile \`\`\`pug blocks
5.  Parse out \`\`\`js blocks, parse out and transpile \`\`\`coffee blocks
6.  Parse out \`\`\`css blocks, parse out and transpile \`\`\`stylus blocks
7.  Concatenate html and transpiled pug inside '<template>...</template>' tags
8.  Concatenate js and transpiled coffee inside '<script>...</script>' tags
9.  Concatenate css and transpiled stylus inside '<style>...</style>' tags
10. Concatenate the three tags to a file in 'dist/' with the same filename, but
    extension '.vue'
11. Create a file in 'dist/' with lowercase-hyphenated-filename and extension
    '.css', and fill it with the contents of the '<style>' tags.
12. Create a file in 'dist/' with lowercase-hyphenated-filename and extension
    '.js', and use the HTML and ES6 JavaScript to make a Vue component suitable
    for simple loading with <script> tags.
13. Convert the '.js' file to '.es5.js' and save in 'dist/'
14. Minify the '.es5.js' to '.es5.min.js' and save in 'dist/'

Options
-------
-h  --help      Show this help message
-v  --version   Show the current ${NAME} version

This script belongs to ${HOMEPAGE}`


//// Validate the environment.
const nodePath   = process.argv.shift()
const scriptPath = process.argv.shift()
if ( '/build/litvue-make.js' !== scriptPath.slice(-21) )
    return console.warn('Unexpected environment!')
if ( ( process.cwd() !== scriptPath.slice(0,-21) ) )
    return console.warn('Unexpected CWD, try:\n  $ cd /path/to/your/project/')
if ('function' !== typeof require)
    return console.warn('Use Node.js instead:\n  $ node build/litvue-make.js')


//// Deal with command-line options.
let opt
while ( opt = process.argv.shift() ) {
    if ('-h' === opt || '--help'    === opt) return console.log(HELP)
    if ('-v' === opt || '--version' === opt) return console.log(VERSION)
}




//// SETUP


//// Load library functionality.
const fs = require('fs')
    , uglify = tidyUglifyWarnings( require('uglify-js') )
    , traceur = require('traceur/src/node/api.js')
    , pug = require('pug')
    , coffee = require('coffee-script')
    , stylus = require('stylus')




//// BUILD


//// 1.  Delete the current contents of ‘dist/’
fs.readdirSync('dist').forEach( name => {
    if ('.' != name[0]) fs.unlinkSync('dist/' + name)
})


//// 2.  Process each .coffee.md or .litcoffee file in ‘src/’, in turn
fs.readdirSync('src').forEach( name => {
    if (! /\.coffee\.md$|\.litcoffee$/.test(name) ) return

    //// 3.  Place any markdown indented with 4+ spaces in a \`\`\`coffee block
    let inBlock = false
      , inIndent = false
      , indentStarts = []
      , indentEnds = []
      , lines = (fs.readFileSync('src/' + name)+'').split('\n')
    lines.forEach( (line, i) => {
        if (! /^    /.test(line) && inIndent ) {
            indentEnds.push(i)
            inIndent = false
        }
        if ( /^```\s*$/.test(line) ) {
            inBlock = false
        } else if ( /^```(html|pug|jade|js|coffee|css|stylus)\s*$/.test(line) ) {
            inBlock = true
        } else if (/^    /.test(line) && ! inBlock) {
            lines[i] = line.substr(4)
            if (! inIndent) {
                indentStarts.push(i)
                inIndent = true
            }
        }
    })
    indentStarts.forEach( (indentStart, j) => {
        lines.splice(indentStart   + j*2    , 0, '```coffee')
        lines.splice(indentEnds[j] + j*2 + 1, 0, '```')
    })

    //// 4.  Parse out \`\`\`html blocks, parse out and transpile \`\`\`pug blocks
    //// 5.  Parse out \`\`\`js blocks, parse out and transpile \`\`\`coffee blocks
    //// 6.  Parse out \`\`\`css blocks, parse out and transpile \`\`\`stylus blocks
    let match
      , html = []
      , js = []
      , css = []
      , block = []
      , currLang = 'markdown'
    lines.forEach( (line, i) => {
        if ( /^```\s*$/.test(line) ) {
            block = block.join('\n')
            switch (currLang) {
                case 'html':
                    html.push( block ); break
                case 'pug':
                case 'jade':
                    html.push( pug.render(block) ); break
                case 'js':
                    js.push( '`\n' + block.replace(/`/g, '\\`') + '\n`\n' ); break
                case 'coffee':
                    js.push( block ); break
                case 'css':
                    css.push( block ); break
                case 'stylus':
                    css.push( stylus.render(block) ); break
            }
            currLang = 'markdown'
            block = []
        } else if ( match = line.match(/^```(html|pug|jade|js|coffee|css|stylus)\s*$/) ) {
            currLang = match[1]
        } else if ('markdown' !== currLang) {
            block.push(line)
        }
    })
    js = coffee.compile( js.join('\n\n') )


    //// 7.  Concatenate html and transpiled pug inside '<template>...</template>' tags
    const htmlTagged =
        '<template>\n'
      + html.join('\n')
      + '\n</template>\n\n'

    //// 8.  Concatenate js and transpiled coffee inside '<script>...</script>' tags
    const jsTagged =
        '<script>\n'
      + js
      + '\n</script>\n\n'

    //// 9.  Concatenate css and transpiled stylus inside '<style>...</style>' tags
    const cssTagged =
        '<style>\n'
      + css.join('\n')
      + '\n</style>\n'


    //// 10. Concatenate the three tags to a file in 'dist/' with the same filename, but
    ////     extension '.vue'
    let basename = name.match(/^(.+)(\.coffee\.md|\.litcoffee)$/)[1]
    fs.writeFileSync('dist/' + basename + '.vue', htmlTagged + jsTagged + cssTagged)

    //// 11. Create a file in 'dist/' with lowercase-hyphenated-filename and extension
    ////     '.css', and fill it with the contents of the '<style>' tags.
    basename = basename[0].toLowerCase() + basename.substr(1)
    basename = basename.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`)
    fs.writeFileSync( 'dist/' + basename + '.css', css.join('\n') )

    //// 12. Create a file in 'dist/' with lowercase-hyphenated-filename and extension
    ////     '.js', and use the HTML and ES6 JavaScript to make a Vue component suitable
    ////     for simple loading with <script> tags.
    js = wrapForVue( basename, js, html.join('\n') )
    fs.writeFileSync( 'dist/' + basename + '.js', js )

    //// 13. Convert the '.js' file to '.es5.js' and save in 'dist/'
    const es5 = traceur.compile( js, { blockBinding:true } )
    fs.writeFileSync( 'dist/' + basename + '.es5.js', es5 )

    //// 14. Minify the '.es5.js' to '.es5.min.js' and save in 'dist/'
    const min = uglify.minify( es5, minConfig('dist/' + basename + '.es5.min.js') )
    fs.writeFileSync( 'dist/' + basename + '.es5.min.js', min.code )

})




//// UTILITY


////
function wrapForVue (basename, js, html) {
    js = js.replace(
/\(function\(\) {/gm,
`
(function() {
  var module = { exports:{} }
`).replace(
/}\)\.call\(this\);/gm,
`  module.exports.template = \`
${html.replace(/`/g, "\`")}
\`

  Vue.component('${basename}', module.exports)

}).call(this);
`)
    return js
}


//// Hack Uglify, to avoid warnings we don’t care about.
function tidyUglifyWarnings (uglify) {
    var origWarn = uglify.AST_Node.warn
    uglify.AST_Node.warn = function(txt, props) {
        if (! (
            'Dropping unused variable {name} [{file}:{line},{col}]' === txt
            && ( // 'WARN: Dropping unused variable HOMEPAGE [...]', etc
                'NAME'     === props.name
             || 'VERSION'  === props.name
             || 'HOMEPAGE' === props.name
            )
        ) ) origWarn(txt, props)
    }
    return uglify
}


//// Generate a configuration object for Uglify.
function minConfig(outFileName) {
    return {
        fromString:  true
      , outFileName: outFileName
      , warnings:    true
      , output: { max_line_len:64 } // easier on the eye - but 500 would be safe
      , compress: {
            dead_code:   true
          , global_defs: { DEBUG:false }
        }
    }
}


}()
