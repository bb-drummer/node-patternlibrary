# Pattern-library

A super simple flat file pattern-library generator for use with Gulp. It compiles a series of HTML **patterns** structred as in an **atomic desing pattern**. These patterns can also include HTML **partials**, external Handlebars **helpers**, or external **data** as JSON or YAML.




## Installation

For now, just add 
```bash

    "patternlibrary": "git+https://gitlab.bjoernbartels.earth/js/patternlibrary.git"

```
to your `package.json` file.


During pattern-library development, just link the (local) repo to your project via npm
```bash

	$> cd projectname
	
    $> npm link ../path/to/patternlibrary

```







Once the stable release has arrived, install via npm
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
THIS IS SUBJECT TO CHANGE!  D O   N O T   U S E  ! ! !

Usage: patternlibrary --layouts=[layoutdir] --root=[rootdir] --dest=[destdir] [other options]

Options:
  --layouts  (required) path to a folder containing layouts
  --root     (required) path to the root folder all pages live in
  --dest     (required) path to the folder compiled pages should get sent to
  --partials            path to root folder for partials
  --helpers             path to folder for additional helpers
  --data                path to folder for additional data
  ...

Example: patternlibrary --root=src/pages --layouts=src/layouts --partials=src/partials --data=src/data --output=dist ...
```



## Local Development

```bash
git clone https://gitlab.bjoernbartels.earth/js/patternlibrary
cd panini
npm install
```

Use `npm test` to run tests.
