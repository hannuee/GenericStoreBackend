require('dotenv').config()
const router = require('express').Router()
const database = require('../database')
const validate = require('../validators')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.get('/', async (request, response) => {
  let results  
  try {
      results = await database.query('SELECT * FROM public.Customer')
    } catch (error) {
      response.status(500).json({ error: 'Database error'})
    }
  response.json(results.rows)
})

router.get('/:email', async (request, response) => {
  const customerToFind = { email: request.params.email}
  if (!validate.customersGETwithEmail(customerToFind)) return response.status(400).json({ error: 'Incorrect input'})

  let results
  try {
    results = await database.query('SELECT * FROM public.Customer WHERE email = $1', [customerToFind.email])
  } catch (err) {
    response.json(err)
  }
  response.json(results.rows)
})

// Add new user
router.post('/', async (request, response) => {
  const customerToAdd = request.body
  if (!validate.customersPOST(customerToAdd)) return response.status(400).json({ error: 'Incorrect input'})

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(customerToAdd.password, saltRounds)

  let customerInsertResult
  try {
    const text = 'INSERT INTO public.Customer(name, address, mobile, email, passwordHash) VALUES($1, $2, $3, $4, $5) RETURNING id'
    const values = [customerToAdd.name, customerToAdd.address, customerToAdd.mobile, customerToAdd.email, passwordHash]
    customerInsertResult = await database.query(text, values)
  } catch (error) {
    response.status(500).json({ error: 'Database error'})
  }
  if(customerInsertResult.rows.length !== 1) console.log('FAILinsert')
})

// Login
router.post('/login', async (request, response) => {
  const customerToLogin = request.body
  if (!validate.customersPOSTlogin(customerToLogin)) return response.status(400).json({ error: 'Incorrect input'})

  let customerSearchResultRAW
  try {
    customerSearchResultRAW = await database.query('SELECT * FROM public.Customer WHERE email = $1', [customerToLogin.email])
  } catch (error) {
    response.status(500).json({ error: 'Database error'})
  }
  if(customerSearchResultRAW.rows.length !== 1) console.log('FAILsearch')
  const customerSearchResult = customerSearchResultRAW.rows[0]

  console.log(customerSearchResult)
  const passwordCorrect = await bcrypt.compare(customerToLogin.password, customerSearchResult.passwordhash)
  if(!passwordCorrect) console.log('FAILpassword')

  const token = jwt.sign(
    {
      name: customerSearchResult.name,
      id: customerSearchResult.id
    },
    process.env.SECRET, { expiresIn: "6h" })
  
  response.status(200).send({ token, name: customerSearchResult.name })
})

module.exports = router