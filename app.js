var fs = require('fs')
var ipc = require('ipc')
var request = require('xhr')
var h = require('virtual-dom/h')
var DataEditor = require('data-editor')
var createStore = require('redux').createStore
var minimist = require('minimist')
var createUI = require('./lib/ui')

var appEl = document.getElementById('app')
var editor = DataEditor(appEl, {})

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
  render(store.getState())
})

views.grid.addEventListener('click', function (e, row, key, value) {})
views.grid.addEventListener('focus', function (e, row, key, value) {})
views.grid.addEventListener('blur', function (e, row, key, value) {})
views.grid.addEventListener('input', function (e, row, key, value) {})

ipc.on('args', function (args) {
  store.dispatch({ type: 'args', args: minimist(args) })
  getData(function (err, data) {
    if (err) console.log(err)
    store.dispatch({ type: 'format', data: data })
    render(store.getState())
  })
})

function getData (callback) {
  var state = store.getState()

  if (state.args._[0]) {
    fs.readFile(state.args._[0], 'utf8', function (err, data) {
      returnData(err, data)
    })
  } else if (state.args.url) {
    request(state.args.url, function (err, res, data) {
      returnData(err, data)
    })
  }

  function returnData (err, data) {
    if (err) return callback(err)
    data = JSON.parse(data)
    callback(null, data)
  }
}

function render (state) {
  var view = views[state.view].render(state)
  var ui = createUI(state, views)
  editor.render([ui, h('div.view-wrapper', [view])], state)
}

render(store.getState())
