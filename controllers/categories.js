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

  const categoryInsertResult = await database.query('INSERT INTO public.Category(category_id, name) VALUES($1, $2) RETURNING id', [categoryToAdd.parentCategoryId, categoryToAdd.name])
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

module.exports = router