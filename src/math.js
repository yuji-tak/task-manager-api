const calcTip = (total, tipPercent) => total + (total * tipPercent)

const add = (a, b) => {
  return new Promise((reslove, reject) => {
    setTimeout(() => {
      if (a < 0 || b < 0) {
        return reject('Nums must be non-negative')
      }

      reslove(a + b)
    }, 1000)
  })
}

module.exports = {
  calcTip,
  add
}
