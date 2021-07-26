const router = require('express').Router()
const database = require('../database')
const {validateRequestParameterID, validateRequestBody} = require('../utils/validators')

router.get('/', async (request, response) => {
  let queryResult  
  try {
    queryResult = await database.query('SELECT * FROM public.Product')
    } catch (error) {
      return response.status(500).json({ error: 'Database error'})
    }
    return response.json(queryResult.rows)
})

router.get('/available', async (request, response) => {
  let queryResult  
  try {
    queryResult = await database.query('SELECT * FROM public.Product WHERE available = TRUE')
    } catch (error) {
      return response.status(500).json({ error: 'Database error'})
    }
    return response.json(queryResult.rows)
})

router.get('/ofCategory/:id', validateRequestParameterID, async (request, response) => {
  const categoryIdToGetCategories = { id: Number(request.params.id)}

  let queryResult
  try {
    queryResult = await database.query('SELECT * FROM public.Product WHERE category_id = $1', [categoryIdToGetCategories.id])
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }
  return response.json(queryResult.rows)
})

router.get('/availableOfCategory/:id', validateRequestParameterID, async (request, response) => {
  const categoryIdToGetCategories = { id: Number(request.params.id)}

  let queryResult
  try {
    queryResult = await database.query('SELECT * FROM public.Product WHERE available = TRUE AND category_id = $1', [categoryIdToGetCategories.id])
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }
  return response.json(queryResult.rows)
})

router.post('/', validateRequestBody, async (request, response) => {
  const productToAdd = request.body

  let queryResult
  try {
    const text = 'INSERT INTO public.Product(category_id, name, description, pricesAndSizes, available) VALUES($1, $2, $3, $4, $5) RETURNING *'
    const values = [productToAdd.parentCategoryId, productToAdd.name, productToAdd.description, JSON.stringify(productToAdd.pricesAndSizes), productToAdd.available]
    queryResult = await database.query(text, values)
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.json(queryResult.rows[0])
})

router.put('/available', validateRequestBody, async (request, response) => {
  const productToModify = request.body

  let queryResult
  try {
    const text = 'UPDATE public.Product SET available = $1 WHERE id = $2 RETURNING *'
    const values = [productToModify.available, productToModify.id]
    queryResult = await database.query(text, values)
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.json(queryResult.rows[0])
})

router.put('/newCategory', validateRequestBody, async (request, response) => {
  const productToModify = request.body

  let queryResult
  try {
    const text = 'UPDATE public.Product SET category_id = $1 WHERE id = $2 RETURNING *'
    const values = [productToModify.parentCategoryId, productToModify.id]
    queryResult = await database.query(text, values)
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }
  
  return response.json(queryResult.rows[0])
})

router.put('/pricesAndSizes', validateRequestBody, async (request, response) => {
  const productToModify = request.body
  
  let queryResult
  try {
    const text = 'UPDATE public.Product SET pricesAndSizes = $1 WHERE id = $2 RETURNING *'
    const values = [JSON.stringify(productToModify.pricesAndSizes), productToModify.id]
    queryResult = await database.query(text, values)
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.json(queryResult.rows[0])
})

module.exports = router