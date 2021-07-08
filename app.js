const express = require('express')
const cors = require('cors')
const categoriesRouter = require('./controllers/categories')
const productsRouter = require('./controllers/products')
const customersRouter = require('./controllers/customers')
const ordersRouter = require('./controllers/orders')
const { unknownEndpoint } = require('./utils/middleware')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/categories', categoriesRouter)
app.use('/api/products', productsRouter)
app.use('/api/customers', customersRouter)
app.use('/api/orders', ordersRouter)

app.use(unknownEndpoint)

module.exports = app