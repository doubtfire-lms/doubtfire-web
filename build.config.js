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
  temp_scss_file: 'tmp.scss',

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
      src: ['build/src/app/api/api-url.js', 'build/src/app/config/external-name/external-name.js'],
      options: {
        inline: true
      }
    }
  },

  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks. `js` is all project javascript, sass tests. `ctpl` contains
   * our reusable components' (`src/common`) template HTML files, while
   * `atpl` contains the same, but for our app's code. `html` is just our
   * main HTML file, `sass` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   */
  app_files: {
    js: [
      'src/**/*.js',
      '!src/**/*.spec.js',
      '!src/assets/**/*.js'
    ],
    jsunit: [
      'src/**/*.spec.js'
    ],

    coffee: [
      'src/**/*.coffee',
      '!src/**/*.spec.coffee',
      '!src/**/*.old.coffee'
    ],
    coffeeunit: [
      'src/**/*.spec.coffee'
    ],

    atpl: [
      'src/app/**/*.tpl.html'
    ],
    ctpl: [
      'src/common/**/*.tpl.html'
    ],

    html: [
      'src/index.html'
    ],

    scss: [
      // Do not modify the order
      'src/styles/mixins/**/*.scss',
      'src/styles/common/**/*.scss',
      'src/styles/modules/**/*.scss',
      'src/app/**/*.scss'
    ]
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`vendor/`) that we need to place into the build
   * process somewhere. While the `app_files` property ensures all
   * standardized files are collected for compilation, it is the user's job
   * to ensure non-standardized (i.e. vendor-related) files are handled
   * appropriately in `vendor_files`.
   *
   * The `vendor_files.compile` holds files that will compile JavaScript
   * or SCSS files into compile vendor files into `doubtfire.{js,css}`.
   * These files are to be automatically concatenated and minified with
   * our project source files.
   *
   * Anything insider `vendor_files.copy` will copy files into the `assets/`
   * directory under the same directory structure (i.e., under `vendor/.../`)
   */
  vendor_files: {
    compile: {
      js: [
        "node_modules/angular/angular.js",
        "node_modules/angular-cookies/angular-cookies.js",
        "node_modules/angular-local-storage/dist/angular-local-storage.js",
        "node_modules/angular-resource/angular-resource.js",
        "node_modules/angular-ui-bootstrap/ui-bootstrap-tpls.js",
        "node_modules/@uirouter/angularjs/release/angular-ui-router.js",
        "node_modules/d3/d3.js",
        "node_modules/lodash/lodash.js",
        "node_modules/underscore.string/dist/underscore.string.min.js",
        "node_modules/moment/moment.js",
        "node_modules/nvd3/build/nv.d3.js",
        "node_modules/angular-nvd3/dist/angular-nvd3.js",
        "node_modules/angular-file-upload/angular-file-upload.js",
        "node_modules/ng-file-upload/dist/ng-file-upload-all.min.js",
        "node_modules/es5-shim/es5-shim.js",
        "node_modules/angular-sanitize/angular-sanitize.js",
        "node_modules/ng-csv/build/ng-csv.js",
        "node_modules/angular-xeditable/dist/js/xeditable.js",
        "node_modules/angular-filter/dist/angular-filter.js",
        "node_modules/codemirror/lib/codemirror.js",
        "node_modules/codemirror/addon/display/placeholder.js",
        "node_modules/codemirror/mode/markdown/markdown.js",
        "node_modules/angular-ui-codemirror/src/ui-codemirror.js",
        "node_modules/showdown/dist/showdown.js",
        "node_modules/angular-markdown-filter/markdown.js",
        "node_modules/angulartics/dist/angulartics.min.js",
        "node_modules/angulartics-google-analytics/lib/angulartics-google-analytics.js",
        "node_modules/angular-md5/angular-md5.js",
        'node_modules/jquery/jquery.js',
        'node_modules/angular-charts/dist/angular-charts.js',
        'node_modules/flashular/bin/flashular.js',
        'node_modules/ngprogress/ngProgress.js',
        'node_modules/angular-ui-select/dist/select.js',

      ],
      jsmap: [
        'node_modules/showdown/dist/showdown.js.map'
      ],
      scss: [
        'node_modules/bootstrap-sass/**/_bootstrap.scss',
        'node_modules/font-awesome/**/font-awesome.scss'
      ],
    },
    copy: {
      js: [

      ],
      jsmap: [
        'node_modules/showdown/dist/showdown.js.map'
      ],
      css: [
        "node_modules/nvd3/build/nv.d3.css",
        "node_modules/angular-xeditable/dist/css/xeditable.css",
        "node_modules/codemirror/lib/codemirror.css",
        "node_modules/codemirror/theme/xq-light.css"
      ]
    }
  }
};
