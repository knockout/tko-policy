//
// Test task
//
const fs = require('fs')
const path = require('path')

const _ = require('lodash')
const karma = require('karma')
const nodeResolve = require('rollup-plugin-node-resolve');
const nodeDirect = require('rollup-plugin-node-direct');
const commonjs = require('rollup-plugin-commonjs')
const babel = require('./rollup-babel')

const gulp = global.__tko_gulp
const SPEC_DIR = path.join(process.cwd(), 'spec')


function test(extra_config, done) {
    var options = Object.assign({}, config.karma, extra_config)

    options.files = options.files || [
      { pattern: "src/*.js", included: false, watched: true },
      { pattern: "spec/*.js" },
    ]

    options.preprocessors = options.preprocessors || {
      'src/**/*.js': ['rollup'],
      'spec/**/*.js': ['rollup'],
    }

    options.rollupPreprocessor = {
      format: 'iife',
      moduleName: "tko-tests",
      plugins: [
        commonjs(),
        nodeDirect({
          paths: [ 'work', '..' ],
          verbose: process.argv.includes('--debug')
        }),
        nodeResolve({ jsnext: true, }),
        babel.plugin(babel.options),
      ],
      sourceMap: process.argv.includes('--sourcemap') ? 'inline': false,
    }

    if (process.argv.indexOf('--debug') >= 0) {
      options.logLevel = 'DEBUG'
    }

    options.resolve = options.resolve || {}
    options.resolve.root = SPEC_DIR

    if (process.argv.indexOf("--once") >= 0) { options.singleRun = true; }
    if (process.argv.indexOf("--watch") >= 0) { options.singleRun = false; }

    new karma.Server(options, done)
      .on('browser_error', function(browser, error) {
          console.log(browser.name.cyan, " 🚨  Error:".red, error)
      })
      .on('run_complete', function(browsers, results) {
          console.log(" 🏁  Run complete.".green)
      })
      .start()
}

gulp.task('test', 'Run Karma tests', function (done) {
  var runner = process.argv.indexOf('--chrome') >= 0 ? 'Chrome' : "PhantomJS"

  test({browsers: [runner]}, done)
}, {
  options: {
    'once': 'Run the test once, then quit.',
    'watch': 'Watch for changes, re-testing on change.',
    'debug': 'Print task debugging.',
    'chrome': 'Use Chrome test runner',
    'sourcemap': 'Enable sourcemap generation'
  }
})
