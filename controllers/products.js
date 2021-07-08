const router = require('express').Router()
const database = require('../database')

router.get('/', async (request, response) => {
    try {
      const results = await database.query('SELECT * FROM public.Product')
      response.json(results.rows)
    } catch (err) {
      response.json(err)
    }
  })

router.get('/ofCategory/:id', async (request, response) => {
  try {
    const results = await database.query('SELECT * FROM public.Product WHERE category_id = $1', [request.params.id])
    response.json(results.rows)
  } catch (err) {
    response.json(err)
  }
})

module.exports = router