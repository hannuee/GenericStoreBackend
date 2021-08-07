const router = require('express').Router()
const database = require('../database')
const {validateRequestParameterID, validateRequestBody} = require('../utils/validators')
const { authorizeCustomer } = require('../utils/middleware')

router.get('/details/:id', validateRequestParameterID, async (request, response) => {
  const orderId = Number(request.params.id)

  let queryResult
  try {
    const columns =
      'public.Order.id, public.Order.customer_id, public.Customer.name AS customer_name, public.Customer.address, public.Customer.mobile, public.Customer.email, ' +
      'public.Order.orderReceived, public.Order.orderDispatched, public.Order.purchaseprice, ' +
      'public.Order.customerinstructions, public.Order.internalnotes, ' +
      'public.ProductOrder.priceAndSize, public.ProductOrder.quantity, ' +
      'public.Product.name'
    const joinCondition =
      'public.Order.id = public.ProductOrder.order_id AND public.ProductOrder.product_id = public.Product.id AND public.Order.customer_id = public.Customer.id'

    const textMain =
      'SELECT ' + columns + ' FROM public.Order, public.ProductOrder, public.Product, public.Customer WHERE public.Order.id = $1 AND '
      + joinCondition

      queryResult = await database.query(textMain, [orderId])
      if(queryResult.rows.length < 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  let rowMap = new Map()
  for(let row of queryResult.rows){
    if(rowMap.has(row.id)) {
      const rowFromMap = rowMap.get(row.id)
      rowFromMap.orderDetails.push({
        priceandsize: row.priceandsize,
        quantity: row.quantity,
        name: row.name
      })
    } else {
      rowMap.set(row.id, {
        id: row.id,
        customer_id: row.customer_id,
        name: row.customer_name,
        address: row.address,
        mobile: row.mobile,
        email: row.email,
        orderreceived: row.orderreceived,
        orderdispatched: row.orderdispatched,
        purchaseprice: row.purchaseprice,
        customerinstructions: row.customerinstructions,
        internalnotes: row.internalnotes,
        orderDetails: [{
          priceandsize: row.priceandsize,
          quantity: row.quantity,
          name: row.name
        }]
      })
    }
  }

  const formattedResult = []
  for(let row of rowMap.values()){
    formattedResult.push(row)
  }

  return response.json(formattedResult[0])
})

router.get('/', async (request, response) => {
  let queryResult
  try {
    queryResult = await database.query('SELECT * FROM public.Order')
    } catch (error) {
      return response.status(500).json({ error: 'Database error'})
    }
  return response.json(queryResult.rows)
})

router.get('/dispatched', async (request, response) => {
  let queryResult
  try {
    queryResult = await database.query('SELECT * FROM public.Order WHERE orderDispatched IS NOT NULL')
    } catch (error) {
      return response.status(500).json({ error: 'Database error'})
    }
  return response.json(queryResult.rows)
})

router.get('/undispatchedWithDetails', async (request, response) => {
  let queryResult
  try {
    const columns =
      'public.Order.id, public.Order.customer_id, public.Customer.name AS customer_name, public.Customer.address, public.Customer.mobile, public.Customer.email, ' +
      'public.Order.orderReceived, public.Order.orderDispatched, public.Order.purchaseprice, ' +
      'public.Order.customerinstructions, public.Order.internalnotes, ' +
      'public.ProductOrder.priceAndSize, public.ProductOrder.quantity, ' +
      'public.Product.name'
    const joinCondition =
      'public.Order.id = public.ProductOrder.order_id AND public.ProductOrder.product_id = public.Product.id AND public.Order.customer_id = public.Customer.id'

    const textMain =
      'SELECT ' + columns + ' FROM public.Order, public.ProductOrder, public.Product, public.Customer WHERE public.Order.orderDispatched IS NULL AND '
      + joinCondition

      queryResult = await database.query(textMain)
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  let rowMap = new Map()
  for(let row of queryResult.rows){
    if(rowMap.has(row.id)) {
      const rowFromMap = rowMap.get(row.id)
      rowFromMap.orderDetails.push({
        priceandsize: row.priceandsize,
        quantity: row.quantity,
        name: row.name
      })
    } else {
      rowMap.set(row.id, {
        id: row.id,
        customer_id: row.customer_id,
        name: row.customer_name,
        address: row.address,
        mobile: row.mobile,
        email: row.email,
        orderreceived: row.orderreceived,
        orderdispatched: row.orderdispatched,
        purchaseprice: row.purchaseprice,
        customerinstructions: row.customerinstructions,
        internalnotes: row.internalnotes,
        orderDetails: [{
          priceandsize: row.priceandsize,
          quantity: row.quantity,
          name: row.name
        }]
      })
    }
  }

  const formattedResult = []
  for(let row of rowMap.values()){
    formattedResult.push(row)
  }

  return response.json(formattedResult)
})

router.get('/ofCustomerWithDetails', authorizeCustomer, async (request, response) => {
  const customerIdToGetOrders = { id: request.body.verifiedCustomerId }  // Authorization middleware adds customer_id to the request body

  let queryResult
  try {
    const columns =
      'public.Order.id, public.Order.customer_id, public.Order.orderReceived, public.Order.orderDispatched, public.Order.purchaseprice, ' +
      'public.Order.customerinstructions, ' +
      'public.ProductOrder.priceAndSize, public.ProductOrder.quantity, ' +
      'public.Product.name'
    const joinCondition =
      'public.Order.id = public.ProductOrder.order_id AND public.ProductOrder.product_id = public.Product.id'

    const textMain =
      'SELECT ' + columns + ' FROM public.Order, public.ProductOrder, public.Product WHERE public.Order.customer_id = $1 AND '
      + joinCondition

      queryResult = await database.query(textMain, [customerIdToGetOrders.id])
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  let rowMap = new Map()
  for(let row of queryResult.rows){
    if(rowMap.has(row.id)) {
      const rowFromMap = rowMap.get(row.id)
      rowFromMap.orderDetails.push({
        priceandsize: row.priceandsize,
        quantity: row.quantity,
        name: row.name
      })
    } else {
      rowMap.set(row.id, {
        id: row.id,
        customer_id: row.customer_id,
        orderreceived: row.orderreceived,
        orderdispatched: row.orderdispatched,
        purchaseprice: row.purchaseprice,
        customerinstructions: row.customerinstructions,
        orderDetails: [{
          priceandsize: row.priceandsize,
          quantity: row.quantity,
          name: row.name
        }]
      })
    }
  }

  const formattedResult = []
  for(let row of rowMap.values()){
    formattedResult.push(row)
  }

  return response.json(formattedResult)
})

router.post('/', validateRequestBody, authorizeCustomer, async (request, response) => {
  const itemsOfOrder = request.body.content
  const verifiedCustomerId = request.body.verifiedCustomerId // Authorization middleware adds customer_id to the request body

  let totalPriceOfOrder = 0

  // Loop to check that every item of the order is appropriate:
  for(let item of itemsOfOrder){
    // Try to get the product corresponding to the item from the database:
    let queryResult
    try {
      queryResult = await database.query('SELECT * FROM public.Product WHERE id = $1', [item.product_id])
    } catch (error) {
      return response.status(500).json({ error: 'Database error'})
    }

    // Product ID is ok if DB yields 1 result.
    if(queryResult.rows.length !== 1) return response.status(400).json({ error: 'Product not found from database'})

    const product = queryResult.rows[0]

    // Product must be available.
    if(!product.available) return response.status(400).json({ error: 'Product not available'})

    // Item's priceAndSize details must match priceAndSize details in the DB.
    const found = product.pricesandsizes.find(element => {
       return element.price === item.priceAndSize.price && element.size === item.priceAndSize.size
    });
    if(found === undefined) return response.status(400).json({ error: 'Product information incorrect'})

    // Item's quantity must be 1 or more.
    if(item.quantity < 1) return response.status(400).json({ error: 'Product information incorrect'})

    totalPriceOfOrder += item.priceAndSize.price * item.quantity
  }

  // Transaction setup:
  const client = await database.transactionConnection()
  if(client === undefined) return response.status(500).json({ error: 'Database error'})
  try {
    await client.query('BEGIN')

    // Add the Order to DB:
    const orderInsertResult = await client.query('INSERT INTO public.Order(customer_id , purchasePrice) VALUES($1, $2) RETURNING id', [verifiedCustomerId, totalPriceOfOrder])
    if(orderInsertResult.rows.length !== 1) throw 'error'
    order_id = orderInsertResult.rows[0].id

    // Add the ProductOrders to DB:
    for(let item of itemsOfOrder){
      const text = 'INSERT INTO public.ProductOrder(product_id , order_id, priceAndSize, quantity ) VALUES($1, $2, $3, $4) RETURNING id'
      const values = [item.product_id, order_id, item.priceAndSize, item.quantity]
      const productOrderInsertResult = await client.query(text, values)
      if(productOrderInsertResult.rows.length !== 1) throw 'error'
    }

    // Transaction tear down:
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    client.release()
    return response.status(500).json({ error: 'Database error'})
  }
  client.release()

  return response.status(200).send()
})

router.put('/internalNotes', validateRequestBody, async (request, response) => {
  const orderToModify = request.body

  let queryResult
  try {
    const text = 'UPDATE public.Order SET internalNotes = $1 WHERE id = $2 RETURNING *'
    const values = [orderToModify.internalNotes, orderToModify.id]
    queryResult = await database.query(text, values)
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.json(queryResult.rows[0])
})

router.put('/orderDispatced', validateRequestBody, async (request, response) => {
  const orderToModify = request.body

  let queryResult
  try {
    const text = 'UPDATE public.Order SET orderDispatched = CURRENT_TIMESTAMP WHERE id = $1 AND orderDispatched IS NULL RETURNING *'
    const values = [orderToModify.id]
    queryResult = await database.query(text, values)
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.json(queryResult.rows[0])
})

module.exports = router
