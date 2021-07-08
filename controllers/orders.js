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

module.exports = router