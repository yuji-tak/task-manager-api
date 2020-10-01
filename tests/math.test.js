const { calcTip, add } = require('../src/math')

test('msg', () => {
  const total = calcTip(10, .3)

  expect(total).toBe(13)

})

test('msg Async', (done) => {
  setTimeout(() => {
    expect(2).toBe(2)
    done()
  }, 1000)
})

test('should add two nums', (done) => {
  add(2, 3).then((sum) => {
    expect(sum).toBe(5)
    done()
  })
})

test('should add two nums async/await', async () => {
  const sum = await add(10, 22)
  expect(sum).toBe(32)
})
