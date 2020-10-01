const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

// Body-Parser & router
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// listen
app.listen(port, () => {
  console.log('Server is up on port:' + port)
})
