const router = require('express').Router()
const database = require('../database')
const validate = require('../validators')

router.get('/', async (request, response) => {
  let results
  try {
    results = await database.query('SELECT * FROM public.Category')
  } catch (error) {
    response.status(500).json({ error: 'Database error'})
  }
  response.json(results.rows)
})

router.post('/', async (request, response) => {
  const categoryToAdd = request.body
  if (!validate.categoriesPOST(categoryToAdd)) return response.status(400).json({ error: 'Incorrect input'})

  let categoryInsertResult 
  try {
    categoryInsertResult = await database.query('INSERT INTO public.Category(category_id, name, description) VALUES($1, $2, $3) RETURNING id', [categoryToAdd.parentCategoryId, categoryToAdd.name, categoryToAdd.description])
  } catch (error) {
    response.status(500).json({ error: 'Database error'})
  }
  if(categoryInsertResult.rows.length !== 1) console.log('FAILinsert')
})

router.delete('/:id', async (request, response) => {
  const categoryIdToDelete = { id: Number(request.params.id)}
  if (!validate.id(categoryIdToDelete)) return response.status(400).json({ error: 'Incorrect input'})

  let result
  try {
    result = await database.query('DELETE FROM public.Category WHERE id = $1', [categoryIdToDelete.id])
    console.log(result)
  } catch (err) {
    response.json(err)
  }
})

router.put('/newCategory', async (request, response) => {
  const categoryToModify = request.body
  if (!validate.categoriesPUTnewCategory(categoryToModify)) return response.status(400).json({ error: 'Incorrect input'})

  let categoryModificationResult
  try {
    const text = 'UPDATE public.Category SET category_id = $1 WHERE id = $2 RETURNING id'
    const values = [categoryToModify.parentCategoryId, categoryToModify.id]
    categoryModificationResult = await database.query(text, values)
  } catch (error) {
    response.status(500).json({ error: 'Database error'})
  }
  if(categoryModificationResult.rows.length !== 1) console.log('FAILinsert')
})

module.exports = router