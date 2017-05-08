# (Panini) Pattern-library

A super simple flat file pattern-library generator for use with Gulp. It compiles a series of HTML **patterns** using an **atomic desing pattern**. These pages can also include HTML **partials**, external Handlebars **helpers**, or external **data** as JSON or YAML.

Panini isn't a full-fledged static site generator&mdash;rather, it solves the very specific problem of assembling flat files from common elements, using a templating language.



## Installation

For now, just add 
```bash

    "patternlibrary": "file:../../js/patternlibrary"

```
to your **package.json** file.

Once this might be ready, install via npm
```bash
npm install patternlibrary --save-dev
```



## Usage

Feed the pattern-library a stream of HTML files, and get the compiled patterns and a frontend out the other end.

```js
var gulp = require('gulp');
var patternlibrary = require('patternlibrary');

gulp.task('default', function() {
  gulp.src('partials/patterns/**/*.html')
    .pipe(patternlibrary(
      dest: 'build/pattern-library/',
      verbose: true,
      dirs : {
        atoms     : 'atoms/',
        molecules : 'molecules/',
        organisms : 'organisms/',
        templates : 'tempates/'
      },
      panini: {
        root      : 'pages/',
        layouts   : 'layouts/',
        partials  : 'partials/',
        helpers   : 'helpers/',
        data      : 'data/'
      }
    }))
    .pipe(gulp.dest('build'));
});
```

Note that the pattern-library loads layouts, partials, helpers, and data files once on first run, also meta-data is gather from all pattern templates. Whenever these files change, call `patternlibrary.refresh()` to get it up to date. You can easily do this inside a call to `gulp.watch()`:

```js
gulp.watch(['./src/{layouts,partials,helpers,data}/**/*'], [patternlibrary.refresh]);
```



## Options

### `dest`

**Type:** `String`

Set destination path. **mandatory**

### `verbose`

**Type:** `Boolean`

Create verbose console output. Default: false

### `dirs`

**Type:** `Object`

Set the pattern specific source-paths. **mandatory**

```js
{
  atoms     : 'atoms/',
  molecules : 'molecules/',
  organisms : 'organisms/',
  templates : 'tempates/'
}
```

### `panini`

**Type:** `Object`

Set panini options. **mandatory**

```js
{
  root      : 'pages/',
  layouts   : 'layouts/',
  partials  : 'partials/',
  helpers   : 'helpers/',
  data      : 'data/'
}
```





## CLI

You can (currently not yet) use the pattern-library via the CLI.

```
Usage: patternlibrary --layouts=[layoutdir] --root=[rootdir] --dest=[destdir] [other options]

Options:
  --layouts  (required) path to a folder containing layouts
  --root     (required) path to the root folder all pages live in
  --dest     (required) path to the folder compiled pages should get sent to
  --partials            path to root folder for partials
  --helpers             path to folder for additional helpers
  --data                path to folder for additional data

Example: patternlibrary --root=src/pages --layouts=src/layouts --partials=src/partials --data=src/data --output=dist 'src/pages/**/*.html'
```



## Local Development

```bash
git clone https://gitlab.bjoernbartels.earth/js/patternlibrary
cd panini
npm install
```

Use `npm test` to run tests.
