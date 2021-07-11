const router = require('express').Router()
const database = require('../database')
const bcrypt = require('bcrypt')

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

router.post('/', async (request, response) => {
  const customerToAdd = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(customerToAdd.password, saltRounds)

  const text = 'INSERT INTO public.Customer(name, address, mobile, email, passwordHash) VALUES($1, $2, $3, $4, $5) RETURNING id'
  const values = [customerToAdd.name, customerToAdd.address, customerToAdd.mobile, customerToAdd.email, passwordHash]
  const customerInsertResult = await database.query(text, values)
  if(customerInsertResult.rows.length !== 1) console.log('FAILinsert')
})

module.exports = router