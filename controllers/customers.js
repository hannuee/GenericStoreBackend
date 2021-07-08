const router = require('express').Router()
const database = require('../database')

router.get('/', async (request, response) => {
    try {
      const results = await database.query('SELECT * FROM public.Customer')
      response.json(results.rows)
    } catch (err) {
      response.json(err)
    }
  })

router.get('/:email', async (request, response) => {
  try {
    const results = await database.query('SELECT * FROM public.Customer WHERE email = $1', [request.params.email])
    response.json(results.rows)
  } catch (err) {
    response.json(err)
  }
})

module.exports = router