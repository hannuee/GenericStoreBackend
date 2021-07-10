const router = require('express').Router()
const database = require('../database')

router.get('/', async (request, response) => {
    try {
      const results = await database.query('SELECT * FROM public.Order')
      response.json(results.rows)
    } catch (err) {
      response.json(err)
    }
})

router.get('/undispatched', async (request, response) => {
    try {
        const results = await database.query('SELECT * FROM public.Order WHERE orderDispatched IS NULL')
        response.json(results.rows)
    } catch (err) {
        response.json(err)
    }
})

router.get('/ofCustomer/:customer_id', async (request, response) => {
  try {
    const results = await database.query('SELECT * FROM public.Order WHERE customer_id = $1', [request.params.customer_id])
    response.json(results.rows)
  } catch (err) {
    response.json(err)
  }
})

router.post('/', async (request, response) => {
  const itemsOfOrder = request.body

  let totalPriceOfOrder = 0

  // Loop to check that every item of the order is appropriate:
  for(let item of itemsOfOrder){
    // Try to get the product corresponding to the item from the database:
    const productInArray = await database.query('SELECT * FROM public.Product WHERE id = $1', [item.product_id])

    if(productInArray.rows.length !== 1) console.log('FAILlen')  // Product ID is ok if DB yields 1 result.

    const product = productInArray.rows[0]

    if(!product.available) console.log('PRODUCT NOT AVAILABLE') // Product must be available.

    const found = product.pricesandsizes.find(element => {  // Item's priceAndSize details must match priceAndSize details in the DB.
       return element.price === item.priceAndSize.price && element.size === item.priceAndSize.size
    });
    if(found === undefined) console.log('FAIL')

    totalPriceOfOrder += item.priceAndSize.price

    if(item.quantity < 1) console.log('FAIL')  // Item's quantity must be 1 or more.
  }

  // Add the Order to DB:
  const orderInsertResult = await database.query('INSERT INTO public.Order(customer_id , purchasePrice) VALUES($1, $2) RETURNING id', [1, totalPriceOfOrder])
  if(orderInsertResult.rows.length !== 1) console.log('FAILinsert')
  order_id = orderInsertResult.rows[0].id

  // Add the ProductOrders to DB:
  for(let item of itemsOfOrder){
    const text = 'INSERT INTO public.ProductOrder(product_id , order_id, priceAndSize, quantity ) VALUES($1, $2, $3, $4) RETURNING id'
    const values = [item.product_id, order_id, item.priceAndSize, item.quantity]
    const productOrderInsertResult = await database.query(text, values)
    if(productOrderInsertResult.rows.length !== 1) console.log('FAILinsert')
  }
})

module.exports = router