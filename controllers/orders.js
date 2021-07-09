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

//router.post('/', async (request, response) => {
  //const itemsOfOrder = request.body
  // itemsOfOrder.length
  // itemsOfOrder[0]
  // itemsOfOrder[0].product_id
  //for(let item of itemsOfOrder){
  //  const product = await database.query('SELECT * FROM public.Product WHERE id = $1', [item.product_id])
  //}

//})

module.exports = router