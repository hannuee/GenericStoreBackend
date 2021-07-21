require('dotenv').config()
const router = require('express').Router()
const database = require('../database')
const {validateRequestParameterID, validateRequestBody} = require('../validators')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.get('/', async (request, response) => {
  let queryResult  
  try {
    queryResult = await database.query('SELECT id, name FROM public.Customer')
    } catch (error) {
      return response.status(500).json({ error: 'Database error'})
    }
  return response.json(queryResult.rows)
})

router.get('/:id', validateRequestParameterID, async (request, response) => {
  const customerId = Number(request.params.id)

  let queryResult
  try {
    queryResult = await database.query('SELECT id, name, address, mobile, email FROM public.Customer WHERE id = $1', [customerId])
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }
  return response.json(queryResult.rows[0])
})

// Add new user
router.post('/', validateRequestBody, async (request, response) => {
  const customerToAdd = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(customerToAdd.password, saltRounds)

  let queryResult
  try {
    const text = 'INSERT INTO public.Customer(name, address, mobile, email, passwordHash) VALUES($1, $2, $3, $4, $5) RETURNING id'
    const values = [customerToAdd.name, customerToAdd.address, customerToAdd.mobile, customerToAdd.email, passwordHash]
    queryResult = await database.query(text, values)
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.status(200).send()
})

// Login
router.post('/login', validateRequestBody, async (request, response) => {
  const customerToLogin = request.body

  let queryResult
  try {
    queryResult = await database.query('SELECT * FROM public.Customer WHERE email = $1', [customerToLogin.email])
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }
  if(queryResult.rows.length !== 1) return response.status(401).json({ error: 'Incorrect email or password'})
  const customer = queryResult.rows[0]

  const passwordCorrect = await bcrypt.compare(customerToLogin.password, customer.passwordhash)
  if(!passwordCorrect) return response.status(401).json({ error: 'Incorrect email or password'})

  const token = jwt.sign(
    {
      name: customer.name,
      id: customer.id
    },
    process.env.SECRET, { expiresIn: "6h" })
  
  return response.status(200).send({ token, name: customer.name })
})

module.exports = router