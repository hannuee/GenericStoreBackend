const express = require('express')
const cors = require('cors')
const helloRouter = require('./controllers/hello')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/hello', helloRouter)

module.exports = app