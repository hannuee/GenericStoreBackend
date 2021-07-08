const router = require('express').Router()
const database = require('../database')

router.get('/', async (request, response) => {
  try {
    const results = await database.query('SELECT * FROM public.Category')
    response.json(results.rows)
  } catch (err) {
    response.json(err)
  }
})

module.exports = router