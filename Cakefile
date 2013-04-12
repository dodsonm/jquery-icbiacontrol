#!/usr/bin/env coffee

path = require 'path'
shelljs = require 'shelljs'
{find, rm, cp, mv} = require 'shelljs'
pkgmeta = require './package'
{quote} = require 'shell-quote'
child_process = require 'child_process'


NODE_MODULES = path.join __dirname, 'node_modules/'
NODE_BIN_DIR = "#{NODE_MODULES}.bin/"
APP_DIR = './app/'
APP_BUILT_DIR = './app-built/'


exec = (cmd, args) ->
  shelljs.exec quote([cmd, args...])

spawn = (args...) ->
  proc = child_process.spawn args...
  proc.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  proc.stdout.on 'data', (data) ->
    console.log data.toString()


task 'build', "build the #{pkgmeta.name} static assets", (opts) ->
  rm '-rf', APP_BUILT_DIR
  cp '-r', APP_DIR, APP_BUILT_DIR
  staticDir = "#{APP_BUILT_DIR}static/"

  console.log 'Compiling Sass files...'
  exec 'bundle', ['exec', 'compass', 'compile',
    '--trace'
    '--sass-dir', "#{staticDir}sass/"
    '--css-dir', "#{staticDir}sass/"
    '--images-dir', "#{staticDir}images/"
    '--force'
  ]


task 'watch', "compile the #{pkgmeta.name} static assets as they change", ->
  staticDir = "#{APP_DIR}static/"
  spawn 'bundle', ['exec', 'compass', 'watch',
    '--require', 'compass',
    '--sass-dir', "#{staticDir}sass/"
    '--css-dir', "#{staticDir}sass/"
    '--images-dir', "#{staticDir}images/"
  ]
