## Installation


Just add and install via npm

```bash
$> npm install node-patternlibrary --save
```

or manually add 
```js
  "node-patternlibrary": "^0.0.1"
```
to your `package.json` file and run 
```js
$> npm update
```


## Gulp usage

You can setup **Patternlibrary** in a gulp task.    
See the ['options' documentation page](options_docs.md) to see all options available.

```js
var gulp = require('gulp');
var Patternlibrary = require('node-patternlibrary');

/** @var Patternlibrary */
var $PL = null;

// initialize Patternlibrary task
gulp.task('patternlibrary:init', function (done) {
    
    // initialize Patternlibrary
    if (null == $PL) {
        $PL = Patternlibrary({
            verbose  : true,
            dest     : 'dist/pl/',
            basepath : '/pl',
            partials : 'src/partials/'
        });
    }
    
    // finish task
    done();
    
});

// run Patternlibrary generation
gulp.task('patternlibrary:run', function (done) {
    
    // generate Patternlibrary pages
    if ($PL != null) {
        // ...go, go $PL ! 
        $PL.run();
    }

    // finish task
    done();
    
});

// refresh patternlibrary dist files and data
gulp.task('patternlibrary:refresh', function (done) {
    Patternlibrary.refresh();
    done();
});

// preparations, clear dist-dir, 
gulp.task('patternlibrary:prepare',
    gulp.series(
        'clean:patternlibrary-dist',
        'copy:patternlibrary'
    )
);

// main 'patternlibrary' task
gulp.task('patternlibrary',
    gulp.series(
        'patternlibrary:prepare',
        'patternlibrary:init',
        'patternlibrary:run'
    )
);
```

Note that **Patternlibrary** loads the partials/patterns and data files once on first run, 
also meta-data is gather from all the pattern templates.

Whenever these files change, call the `Patternlibrary.refresh()` method to get it up to date.    
You can easily do this inside a call to `gulp.watch()`:

```js
gulp.watch(['./src/partials/**/*'], ['patternlibrary:refresh']);
```


## Standalone module usage

**Patternlibrary** is also usable as a standalone node module to integrate into your project. 

```js
var Patternlibrary = require('node-patternlibrary');

// initialize Patternlibrary
/** @var Patternlibrary */
var $PL = Patternlibrary({
    verbose  : true,
    dest     : patternlibraryDestination,
    basepath : '/pl',
    partials : 'src/partials/'
});

// run Patternlibrary generation
$PL.run();    
```

See the [API documentation page](api_docs.md) for a full overview of available methods.



## CLI

You can (_**currently not yet**_) use **Patternlibrary** via the CLI.

```bash
THIS IS SUBJECT TO CHANGE!  D O   N O T   U S E  ! ! !

Usage: patternlibrary --partials=[partialsdir] --dist=[destdir] [other options...]

Options:
  --dist     (required) path to the folder compiled pages should get sent to
  --partials            path to root folder for partials
  ...

Example: patternlibrary --partials=src/partials --dist=dist/pl/ ...
```




## Development

If you like to contribute to/experiment with **Patternlibrary**, checkout the repo...
```bash
$> git clone https://gitlab.bjoernbartels.earth/js/patternlibrary node-patternlibrary
$> cd node-patternlibrary
$> npm install
```

...just add the local repo to your `package.json` file...
```js
  "node-patternlibrary": "file:../path/to/node-patternlibrary"
```

...and link the repo to your project via npm
```bash
$> cd projectname
    
$> npm link ../path/to/node-patternlibrary 
```

### Bleeding edge

If you like to try the to the minute up-to-date progress you can add one of the source repositories directly to your `package.json` file.

-  from our [GitLab](https://gitlab.bjoernbartels.earth/js/patternlibrary):
   `"node-patternlibrary": "git+https://gitlab.bjoernbartels.earth/js/patternlibrary.git"`
-  from [GitHub](https://github.com/bb-drummer/node-patternlibrary):
   `"node-patternlibrary": "git+https://github.com/bb-drummer/node-patternlibrary.git"`


### Testing

Simply, use `npm test` to run **Patternlibrary** tests.
