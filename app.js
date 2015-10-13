var fs = require('fs')
var os = require('os')
var path = require('path')
var ipc = require('ipc')
var mkdirp = require('mkdirp')
var request = require('xhr')
var h = require('virtual-dom/h')
var DataEditor = require('data-editor')

var createStore = require('redux').createStore
var minimist = require('minimist')

var views = {
  grid: require('data-grid')(),
  map: require('data-map')({
    zoom: 16,
    center: [47.621958, -122.33636],
    accessToken: 'pk.eyJ1Ijoic2V0aHZpbmNlbnQiLCJhIjoiSXZZXzZnUSJ9.Nr_zKa-4Ztcmc1Ypl0k5nw'
  })
}

var store = createStore(require('./lib/reducers'), {
  view: 'grid',
  properties: {},
  data: []
})

store.subscribe(function () {
  var state = store.getState()
  render(state)
})

views.map.addEventListener('load', function (node) {
  console.log('map load', store.getState())
  render(store.getState())
})

views.grid.addEventListener('click', function (e, row, key, value) {})
views.grid.addEventListener('focus', function (e, row, key, value) {})
views.grid.addEventListener('blur', function (e, row, key, value) {})
views.grid.addEventListener('input', function (e, row, key, value) {})

ipc.on('args', function (args) {
  store.dispatch({
    type: 'args',
    args: minimist(args)
  })
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
      store.dispatch({
        type: 'format',
        data: res
      })
    })
  })
}

function getData (callback) {
  var state = store.getState()
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
  console.log('render', state)
  if (state) {
    var view = views[state.view].render(state)
    var ui = createUI(state)
    editor.render([ui, h('div.view-wrapper', [view])], state)
  }
}

function createUI (state) {
  var viewButtons = []
  Object.keys(views).forEach(function (key) {
    viewButtons.push(h('button#.view-choice', {
      onclick: function (e) {
        e.preventDefault()
        if (state.view !== key) {
          store.dispatch({
            type: 'set_view',
            view: key
          })
        }
      }
    }, key))
  })

  return h('div.editor-ui', [
    h('div.editor-header', viewButtons)
  ])
}
