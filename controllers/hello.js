const router = require('express').Router()
const database = require('../database')

router.get('/', async (request, response) => {
  try {
    const text = 'SELECT * FROM public.Testtable WHERE randomColumn = $1'
    const values = ['StrictCondition']
    const results = await database.query(text, values)
    return response.json(results.rows[0])
  } catch (err) {
    console.log("ERROR")
  }

  const errorMessage = { error: "ERROR" }
  response.json(errorMessage)
})

module.exports = router