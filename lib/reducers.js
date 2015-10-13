var extend = require('xtend')
var formatter = require('data-format')()

var reducers = {
  args: function (state, action) {
    return extend(state, { args: action.args })
  },
  format: function (state, action) {
    var formatted = formatter.format(action.data)
    return extend(state, {
      data: formatted.data,
      properties: formatted.properties,
      geojson: {
        features: formatter.toGeoJSON(formatted, { convertToNames: false })
      }
    })
  },
  set_view: function (state, action) {
    return extend(state, { view: action.view })
  }
}

module.exports = function (state, action) {
  if (action.type.indexOf('@@redux') > -1) return state
  return reducers[action.type](state, action)
}
