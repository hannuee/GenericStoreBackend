require('dotenv').config()
const router = require('express').Router()
const database = require('../database')
const validate = require('../validators')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.get('/', async (request, response) => {
    try {
      const results = await database.query('SELECT * FROM public.Customer')
      response.json(results.rows)
    } catch (err) {
      response.json(err)
    }
  })

router.get('/:email', async (request, response) => {
  const customerToFind = { email: request.params.email}
  if (!validate.customersGETwithEmail(customerToFind)) return response.status(400).send()

  try {
    const results = await database.query('SELECT * FROM public.Customer WHERE email = $1', [customerToFind.email])
    response.json(results.rows)
  } catch (err) {
    response.json(err)
  }
})

// Add new user
router.post('/', async (request, response) => {
  const customerToAdd = request.body
  if (!validate.customersPOST(customerToAdd)) return response.status(400).send()

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(customerToAdd.password, saltRounds)

  const text = 'INSERT INTO public.Customer(name, address, mobile, email, passwordHash) VALUES($1, $2, $3, $4, $5) RETURNING id'
  const values = [customerToAdd.name, customerToAdd.address, customerToAdd.mobile, customerToAdd.email, passwordHash]
  const customerInsertResult = await database.query(text, values)
  if(customerInsertResult.rows.length !== 1) console.log('FAILinsert')
})

// Login
router.post('/login', async (request, response) => {
  const customerToLogin = request.body
  if (!validate.customersPOSTlogin(customerToLogin)) return response.status(400).send()

  const customerSearchResultRAW = await database.query('SELECT * FROM public.Customer WHERE email = $1', [customerToLogin.email])
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