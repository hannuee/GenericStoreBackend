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

router.post('/', async (request, response) => {
  const categoryToAdd = request.body

  const categoryInsertResult = await database.query('INSERT INTO public.Category(category_id, name, description) VALUES($1, $2, $3) RETURNING id', [categoryToAdd.parentCategoryId, categoryToAdd.name, categoryToAdd.description])
  if(categoryInsertResult.rows.length !== 1) console.log('FAILinsert')
})

router.delete('/:id', async (request, response) => {
  categoryIdToDelete = request.params.id
  try {
    const result = await database.query('DELETE FROM public.Category WHERE id = $1', [request.params.id])
    console.log(result)
  } catch (err) {
    response.json(err)
  }
})

router.put('/newCategory', async (request, response) => {
  const categoryToModify = request.body

  const text = 'UPDATE public.Category SET category_id = $1 WHERE id = $2 RETURNING id'
  const values = [categoryToModify.parentCategoryId, categoryToModify.id]
  const categoryModificationResult = await database.query(text, values)
  if(categoryModificationResult.rows.length !== 1) console.log('FAILinsert')
})

module.exports = router