const router = require('express').Router()
const database = require('../database')
const validate = require('../validators')

router.get('/', async (request, response) => {
  let results  
  try {
      results = await database.query('SELECT * FROM public.Order')
    } catch (error) {
      response.status(500).json({ error: 'Database error'})
    }
  response.json(results.rows)
})

router.get('/undispatched', async (request, response) => {
  let results
  try {
        results = await database.query('SELECT * FROM public.Order WHERE orderDispatched IS NULL')
    } catch (error) {
      response.status(500).json({ error: 'Database error'})
    }
  response.json(results.rows)
})

router.get('/undispatchedWithDetails', async (request, response) => {
  let results
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

    results = await database.query(textMain)
  } catch (error) {
    response.status(500).json({ error: 'Database error'})
  }
  response.json(results.rows)
})

router.get('/ofCustomer/:customer_id', async (request, response) => {
  const customerIdToGetOrders = { id: Number(request.params.customer_id)}
  if (!validate.id(customerIdToGetOrders)) return response.status(400).json({ error: 'Incorrect input'})
  
  let results
  try {
    results = await database.query('SELECT * FROM public.Order WHERE customer_id = $1', [customerIdToGetOrders.id])
  } catch (error) {
    response.status(500).json({ error: 'Database error'})
  }
  response.json(results.rows)
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
      response.status(500).json({ error: 'Database error'})
    }

    if(productInArray.rows.length !== 1) console.log('FAILlen')  // Product ID is ok if DB yields 1 result.

    const product = productInArray.rows[0]

    if(!product.available) console.log('PRODUCT NOT AVAILABLE') // Product must be available.

    const found = product.pricesandsizes.arr.find(element => {  // Item's priceAndSize details must match priceAndSize details in the DB.
       return element.price === item.priceAndSize.price && element.size === item.priceAndSize.size
    });
    if(found === undefined) console.log('FAIL')

    totalPriceOfOrder += item.priceAndSize.price * item.quantity

    if(item.quantity < 1) console.log('FAIL')  // Item's quantity must be 1 or more.
  }

  // Transaction setup:
  const client = await database.transactionConnection()
  if(client === undefined) console.log('FAIL')
  try {
    await client.query('BEGIN')

    // Add the Order to DB:
    const orderInsertResult = await client.query('INSERT INTO public.Order(customer_id , purchasePrice) VALUES($1, $2) RETURNING id', [1, totalPriceOfOrder])
    if(orderInsertResult.rows.length !== 1) console.log('FAILinsert')
    order_id = orderInsertResult.rows[0].id

    // Add the ProductOrders to DB:
    for(let item of itemsOfOrder){
      const text = 'INSERT INTO public.ProductOrder(product_id , order_id, priceAndSize, quantity ) VALUES($1, $2, $3, $4) RETURNING id'
      const values = [item.product_id, order_id, item.priceAndSize, item.quantity]
      const productOrderInsertResult = await client.query(text, values)
      if(productOrderInsertResult.rows.length !== 1) console.log('FAILinsert')
    }

    // Transaction tear down:
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    console.log('FAIL')
  } finally {
    client.release()
  }
})

router.put('/internalNotes', async (request, response) => {
  const orderToModify = request.body
  if (!validate.ordersPUTinternalNotes(orderToModify)) return response.status(400).json({ error: 'Incorrect input'})

  let orderModificationResult
  try {
    const text = 'UPDATE public.Order SET internalNotes = $1 WHERE id = $2 RETURNING id'
    const values = [orderToModify.internalNotes, orderToModify.id]
    orderModificationResult = await database.query(text, values)
  } catch (error) {
    response.status(500).json({ error: 'Database error'})
  }
  if(orderModificationResult.rows.length !== 1) console.log('FAILinsert')
})

router.put('/orderDispatced', async (request, response) => {
  const orderToModify = request.body
  if (!validate.ordersPUTorderDispatced(orderToModify)) return response.status(400).json({ error: 'Incorrect input'})

  let orderModificationResult
  try {
    const text = 'UPDATE public.Order SET orderDispatched = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id'
    const values = [orderToModify.id]
    orderModificationResult = await database.query(text, values)
  } catch (error) {
    response.status(500).json({ error: 'Database error'})
  }
  if(orderModificationResult.rows.length !== 1) console.log('FAILinsert')
})

module.exports = router