const router = require('express').Router()
const database = require('../database')
const validate = require('../validators')

router.get('/', async (request, response) => {
  let results  
  try {
      results = await database.query('SELECT * FROM public.Product')
    } catch (error) {
      return response.status(500).json({ error: 'Database error'})
    }
    return response.json(results.rows)
  })

router.get('/ofCategory/:id', async (request, response) => {
  const categoryIdToGetCategories = { id: Number(request.params.id)}
  if (!validate.id(categoryIdToGetCategories)) return response.status(400).json({ error: 'Incorrect input'})

  let results
  try {
    results = await database.query('SELECT * FROM public.Product WHERE category_id = $1', [categoryIdToGetCategories.id])
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }
  return response.json(results.rows)
})

router.post('/', async (request, response) => {
  const productToAdd = request.body
  if (!validate.productsPOST(productToAdd)) return response.status(400).json({ error: 'Incorrect input'})

  let productInsertResult
  try {
    const text = 'INSERT INTO public.Product(category_id, name, description, pricesAndSizes, available) VALUES($1, $2, $3, $4, $5) RETURNING id'
    const values = [productToAdd.parentCategoryId, productToAdd.name, productToAdd.description, { arr: productToAdd.pricesAndSizes}, productToAdd.available]
    productInsertResult = await database.query(text, values)
    if(productInsertResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.status(200).send()
})

router.put('/available', async (request, response) => {
  const productToModify = request.body
  if (!validate.productsPUTavailable(productToModify)) return response.status(400).json({ error: 'Incorrect input'})

  let productModificationResult
  try {
    const text = 'UPDATE public.Product SET available = $1 WHERE id = $2 RETURNING id'
    const values = [productToModify.available, productToModify.id]
    productModificationResult = await database.query(text, values)
    if(productModificationResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.status(200).send()
})

router.put('/newCategory', async (request, response) => {
  const productToModify = request.body
  if (!validate.productsPUTnewCategory(productToModify)) return response.status(400).json({ error: 'Incorrect input'})

  let productModificationResult
  try {
    const text = 'UPDATE public.Product SET category_id = $1 WHERE id = $2 RETURNING id'
    const values = [productToModify.parentCategoryId, productToModify.id]
    productModificationResult = await database.query(text, values)
    if(productModificationResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }
  
  return response.status(200).send()
})

router.put('/pricesAndSizes', async (request, response) => {
  const productToModify = request.body
  if (!validate.productsPUTpricesAndSizes(productToModify)) return response.status(400).json({ error: 'Incorrect input'})
  
  let productModificationResult
  try {
    const text = 'UPDATE public.Product SET pricesAndSizes = $1 WHERE id = $2 RETURNING id'
    const values = [{ arr: productToModify.pricesAndSizes}, productToModify.id]
    productModificationResult = await database.query(text, values)
    if(productModificationResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.status(200).send()
})

module.exports = router