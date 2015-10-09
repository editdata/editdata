var fs = require('fs')
var os = require('os')
var path = require('path')
var ipc = require('ipc')
var mkdirp = require('mkdirp')
var levelup = require('levelup')
var leveldown = require('leveldown')
var request = require('xhr')
var h = require('virtual-dom/h')
var DataEditor = require('data-editor')
var formatter = require('data-format')()
var db = window.db = levelup(__dirname + '/db', { db: leveldown })

var views = {
  grid: require('data-grid')(),
  map: require('data-editor/map')({
    zoom: 16,
    center: [47.621958, -122.33636],
    accessToken: 'pk.eyJ1Ijoic2V0aHZpbmNlbnQiLCJhIjoiSXZZXzZnUSJ9.Nr_zKa-4Ztcmc1Ypl0k5nw'
  })
}

views.map.addEventListener('load', function (node) {
  render(state)
})

views.grid.addEventListener('click', function (e, row, key, value) {})
views.grid.addEventListener('focus', function (e, row, key, value) {})
views.grid.addEventListener('blur', function (e, row, key, value) {})
views.grid.addEventListener('input', function (e, row, key, value) {})

var state = window.state = {
  view: 'grid',
  properties: {},
  data: []
}

ipc.on('args', function (args) {
  state.args = require('minimist')(args)
  console.log(state.args)
  ready()
})

var appEl = document.getElementById('app')
var editor = DataEditor(appEl, {})

function ready () {
  var dir = path.join(os.homedir(), '.editdata')
  mkdirp(dir, function (err) {
    if (err) console.log(err)

    getData(function (err, res) {
      if (err) console.log(err)
      var formatted = formatter.format(res)
      state.data = formatted.data
      state.properties = formatted.properties
      state.geojson = {
        features: formatter.toGeoJSON(formatted, { convertToNames: false })
      }
      render(state)
    })
  })
}

function getData (callback) {
  if (state.args._[0]) {
    fs.readFile(state.args._[0], 'utf8', function (err, data) {
      if (err) return callback(err)
      callback(null, JSON.parse(data))
    })
  } else if (state.args.url) {
    request(state.args.url, function (err, res, body) {
      if (err) return callback(err)
      callback(null, JSON.parse(body))
    })
  }
}

function render (state) {
  var view = views[state.view].render(state)
  editor.render([ui, h('div.view-wrapper', [view])], state)
}

var viewButtons = []
Object.keys(views).forEach(function (key) {
  viewButtons.push(h('button#.view-choice', {
    onclick: function (e) {
      e.preventDefault()
      if (state.view !== key) {
        state.view = key
        render(state)
      }
    }
  }, key))
})

var ui = h('div.editor-ui', [
  h('div.editor-header', viewButtons)
])
