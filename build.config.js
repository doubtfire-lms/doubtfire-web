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
        'vendor/jquery/jquery.js',
        'vendor/angular/angular.js',
        'vendor/angular-cookies/angular-cookies.js',
        'vendor/angular-local-storage/angular-local-storage.js',
        'vendor/angular-resource/angular-resource.js',
        'vendor/angular-bootstrap/ui-bootstrap-tpls.js',
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
        'vendor/angular-sanitize/angular-sanitize.js',
        'vendor/ng-csv/build/ng-csv.js',
        'vendor/angular-xeditable/dist/js/xeditable.js',
        'vendor/angular-filter/dist/angular-filter.js',
        'vendor/codemirror/lib/codemirror.js',
        'vendor/codemirror/addon/display/placeholder.js',
        'vendor/codemirror/mode/markdown/markdown.js',
        'vendor/angular-ui-codemirror/ui-codemirror.js',
        'vendor/showdown/dist/showdown.js',
        'vendor/angular-markdown-filter/markdown.js',
        'vendor/angular-ui-select/dist/select.js',
        'vendor/angulartics/dist/angulartics.min.js',
        'vendor/angulartics-google-analytics/lib/angulartics-google-analytics.js',
        'vendor/angular-md5/angular-md5.js',
        'node_modules/@uirouter/angular-hybrid/lib/angular-hybrid.js'
      ],
      jsmap: [
        'vendor/showdown/dist/showdown.js.map'
      ],
      scss: [
        'vendor/bootstrap-sass/**/_bootstrap.scss',
        'vendor/font-awesome/**/font-awesome.scss'
      ],
    },
    copy: {
      js: [

      ],
      jsmap: [
        'vendor/showdown/dist/showdown.js.map'
      ],
      css: [
        "vendor/nvd3/build/nv.d3.css",
        "vendor/angular-xeditable/dist/css/xeditable.css",
        "vendor/codemirror/lib/codemirror.css",
        "vendor/codemirror/theme/xq-light.css"
      ]
    }
  }
};
