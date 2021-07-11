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

router.post('/', async (request, response) => {
  const productToAdd = request.body

  const text = 'INSERT INTO public.Product(category_id, name, description, pricesAndSizes, available) VALUES($1, $2, $3, $4, $5) RETURNING id'
  const values = [productToAdd.parentCategoryId, productToAdd.name, productToAdd.description, { arr: productToAdd.pricesAndSizes}, productToAdd.available]
  const productInsertResult = await database.query(text, values)
  if(productInsertResult.rows.length !== 1) console.log('FAILinsert')
})

router.put('/available', async (request, response) => {
  const productToModify = request.body

  const text = 'UPDATE public.Product SET available = $1 WHERE id = $2 RETURNING id'
  const values = [productToModify.available, productToModify.id]
  const productModificationResult = await database.query(text, values)
  if(productModificationResult.rows.length !== 1) console.log('FAILinsert')
})

router.put('/newCategory', async (request, response) => {
  const productToModify = request.body

  const text = 'UPDATE public.Product SET category_id = $1 WHERE id = $2 RETURNING id'
  const values = [productToModify.parentCategoryId, productToModify.id]
  const productModificationResult = await database.query(text, values)
  if(productModificationResult.rows.length !== 1) console.log('FAILinsert')
})

router.put('/pricesAndSizes', async (request, response) => {
  const productToModify = request.body
  
  const text = 'UPDATE public.Product SET pricesAndSizes = $1 WHERE id = $2 RETURNING id'
  const values = [{ arr: productToModify.pricesAndSizes}, productToModify.id]
  const productModificationResult = await database.query(text, values)
  if(productModificationResult.rows.length !== 1) console.log('FAILinsert')
})

module.exports = router