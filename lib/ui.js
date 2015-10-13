var h = require('virtual-dom/h')

module.exports = function createUI (state, views) {
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
