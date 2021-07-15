const router = require('express').Router()
const database = require('../database')
const validate = require('../validators')

router.get('/', async (request, response) => {
  let queryResult  
  try {
    queryResult = await database.query('SELECT * FROM public.Order')
    } catch (error) {
      return response.status(500).json({ error: 'Database error'})
    }
  return response.json(queryResult.rows)
})

router.get('/undispatched', async (request, response) => {
  let queryResult
  try {
    queryResult = await database.query('SELECT * FROM public.Order WHERE orderDispatched IS NULL')
    } catch (error) {
      return response.status(500).json({ error: 'Database error'})
    }
  return response.json(queryResult.rows)
})

router.get('/undispatchedWithDetails', async (request, response) => {
  let queryResult
  try {
    const columns = 
      'public.Order.id, public.Order.customer_id, public.Order.orderReceived, public.Order.purchaseprice, ' +
      'public.Order.customerinstructions, public.Order.internalnotes, ' +
      'public.ProductOrder.priceAndSize, public.ProductOrder.quantity, ' +
      'public.Product.name'
    const joinCondition =  
      'public.Order.id = public.ProductOrder.order_id AND public.ProductOrder.product_id = public.Product.id'
      
    const textMain = 
      'SELECT ' + columns + ' FROM public.Order, public.ProductOrder, public.Product WHERE public.Order.orderDispatched IS NULL AND ' 
      + joinCondition + ' ORDER BY public.Order.id ASC'

      queryResult = await database.query(textMain)
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }
  return response.json(queryResult.rows)
})

router.get('/ofCustomer/:customer_id', async (request, response) => {
  const customerIdToGetOrders = { id: Number(request.params.customer_id)}
  if (!validate.id(customerIdToGetOrders)) return response.status(400).json({ error: 'Incorrect input'})
  
  let queryResult
  try {
    queryResult = await database.query('SELECT * FROM public.Order WHERE customer_id = $1', [customerIdToGetOrders.id])
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }
  return response.json(queryResult.rows)
})

router.post('/', async (request, response) => {
  const itemsOfOrder = request.body
  if (!validate.ordersPOST(itemsOfOrder)) return response.status(400).json({ error: 'Incorrect input'})

  let totalPriceOfOrder = 0

  // Loop to check that every item of the order is appropriate:
  for(let item of itemsOfOrder){
    // Try to get the product corresponding to the item from the database:
    let productInArray
    try {
      productInArray = await database.query('SELECT * FROM public.Product WHERE id = $1', [item.product_id])
    } catch (error) {
      return response.status(500).json({ error: 'Database error'})
    }

    // Product ID is ok if DB yields 1 result.
    if(productInArray.rows.length !== 1) return response.status(400).json({ error: 'Product not found from database'})

    const product = productInArray.rows[0]

    // Product must be available.
    if(!product.available) return response.status(400).json({ error: 'Product not available'})

    // Item's priceAndSize details must match priceAndSize details in the DB.
    const found = product.pricesandsizes.arr.find(element => {
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
    const orderInsertResult = await client.query('INSERT INTO public.Order(customer_id , purchasePrice) VALUES($1, $2) RETURNING id', [1, totalPriceOfOrder])
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
})

router.put('/internalNotes', async (request, response) => {
  const orderToModify = request.body
  if (!validate.ordersPUTinternalNotes(orderToModify)) return response.status(400).json({ error: 'Incorrect input'})

  let queryResult
  try {
    const text = 'UPDATE public.Order SET internalNotes = $1 WHERE id = $2 RETURNING id'
    const values = [orderToModify.internalNotes, orderToModify.id]
    queryResult = await database.query(text, values)
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.status(200).send()
})

router.put('/orderDispatced', async (request, response) => {
  const orderToModify = request.body
  if (!validate.ordersPUTorderDispatced(orderToModify)) return response.status(400).json({ error: 'Incorrect input'})

  let queryResult
  try {
    const text = 'UPDATE public.Order SET orderDispatched = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id'
    const values = [orderToModify.id]
    queryResult = await database.query(text, values)
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.status(200).send()
})

module.exports = router