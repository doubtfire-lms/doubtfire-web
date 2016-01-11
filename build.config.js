/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
  /**
   * The `build_dir` folder is where our projects are compiled during
   * development and the `compile_dir` folder is where our app resides once it's
   * completely built.
   */
  build_dir: 'build',
  compile_dir: 'bin',
  api_dir: '../doubtfire-api',

  /**
   * This controls which files need preprocessing. This allows us to have
   * compile-time changes. For now this is just the environment but in the future
   * it might be more complex. Even though it's called preprocessing, I feel like
   * it might be a good idea to try and keep it on the build directory to ensure it's
   * as unobtrusive as possible, and not confuse which files to compile/overwrite
   * actual source code.
   */
  preprocess: {
    api: {
      src: ['build/src/app/api/api.js'],
      options: {
	inline: true
      }
    }
  },

  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks. `js` is all project javascript, less tests. `ctpl` contains
   * our reusable components' (`src/common`) template HTML files, while
   * `atpl` contains the same, but for our app's code. `html` is just our
   * main HTML file, `less` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   */
  app_files: {
    js: [ 'src/**/*.js', '!src/**/*.spec.js' ],
    jsunit: [ 'src/**/*.spec.js' ],

    coffee: [ 'src/**/*.coffee', '!src/**/*.spec.coffee' ],

    coffeeunit: [ 'src/**/*.spec.coffee' ],

    atpl: [ 'src/app/**/*.tpl.html' ],
    ctpl: [ 'src/common/**/*.tpl.html' ],

    html: [ 'src/index.html' ],
    less: 'src/less/main.less'
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`vendor/`) that we need to place into the build
   * process somewhere. While the `app_files` property ensures all
   * standardized files are collected for compilation, it is the user's job
   * to ensure non-standardized (i.e. vendor-related) files are handled
   * appropriately in `vendor_files.js`.
   *
   * The `vendor_files.js` property holds files to be automatically
   * concatenated and minified with our project source files.
   *
   * The `vendor_files.css` property holds any CSS files to be automatically
   * included in our app.
   */
  vendor_files: {
    js: [
      'vendor/jquery/jquery.js',
      'vendor/angular/angular.js',
      'vendor/angular-cookies/angular-cookies.js',
      'vendor/angular-local-storage/angular-local-storage.js',
      'vendor/angular-resource/angular-resource.js',
      'vendor/angular-bootstrap/ui-bootstrap-tpls.js',
      'vendor/angular-ui-router/release/angular-ui-router.js',
      'vendor/d3/d3.js',
      'vendor/angular-charts/dist/angular-charts.js',
      'vendor/flashular/bin/flashular.js',
      'vendor/ngprogress/ngProgress.js',
      'vendor/lodash/lodash.js',
      'vendor/underscore.string/dist/underscore.string.min.js',
      'vendor/momentjs/moment.js',
      'vendor/d3/d3.js',
      'vendor/nvd3/build/nv.d3.js',
      'vendor/angular-nvd3/dist/angular-nvd3.js',
      'vendor/angular-file-upload/angular-file-upload.js',
      'vendor/ng-file-upload/ng-file-upload-all.min.js',
      'vendor/es5-shim/es5-shim.js',
      'vendor/angular-pdf/dist/angular-pdf.js',
      'vendor/pdfjs-bower/dist/compatibility.js',
      'vendor/pdfjs-bower/dist/pdf.js',
      'vendor/pdfjs-bower/dist/pdf.worker.js',
      'vendor/angular-sanitize/angular-sanitize.js',
      'vendor/ng-csv/build/ng-csv.js',
      'vendor/angular-xeditable/dist/js/xeditable.js',
      'vendor/angular-filter/dist/angular-filter.js',
      'vendor/codemirror/lib/codemirror.js',
      'vendor/codemirror/addon/display/placeholder.js',
      'vendor/codemirror/mode/markdown/markdown.js',
      'vendor/angular-ui-codemirror/ui-codemirror.js',
      'vendor/showdown/dist/showdown.js',
      'vendor/showdown/dist/showdown.js.map',
      'vendor/angular-markdown-filter/markdown.js',
      'vendor/angular-ui-select/dist/select.js'
    ],
    css: [
    ]
  },

  vendor_copy_files: {
    js: [
      'vendor/pdfjs-bower/dist/compatibility.js',
      'vendor/pdfjs-bower/dist/pdf.js',
      'vendor/pdfjs-bower/dist/pdf.worker.js'
    ]
  }
};
