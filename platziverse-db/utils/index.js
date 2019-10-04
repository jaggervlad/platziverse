'use strict'

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

function sortBy (property) {
  return (a, b) => {
    const aProp = a[property]
    const bProp = b[property]

    if (aProp < bProp) {
      return -1
    } else if (aProp > bProp) {
      return 1
    } else {
      return 0
    }
  }
}

module.exports = {
  extend,
  sortBy
}
