var app = require('app')
var ipc = require('ipc')
var BrowserWindow = require('browser-window')
var mainWindow
var args = process.argv.slice(2)

app.on('window-all-closed', function () {
  app.quit()
})

app.on('ready', function () {
  mainWindow = new BrowserWindow({ width: 800, height: 600 })
  mainWindow.loadUrl('file://' + __dirname + '/index.html')

  mainWindow.webContents.on('did-finish-load', function () {
    mainWindow.webContents.send('args', args)
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
})
