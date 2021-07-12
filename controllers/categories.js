const router = require('express').Router()
const database = require('../database')
const validate = require('../validators')

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
  if (!validate.categoriesPOST(categoryToAdd)) return response.status(400).send()

  const categoryInsertResult = await database.query('INSERT INTO public.Category(category_id, name, description) VALUES($1, $2, $3) RETURNING id', [categoryToAdd.parentCategoryId, categoryToAdd.name, categoryToAdd.description])
  if(categoryInsertResult.rows.length !== 1) console.log('FAILinsert')
})

router.delete('/:id', async (request, response) => {
  const categoryIdToDelete = { id: Number(request.params.id)}
  if (!validate.id(categoryIdToDelete)) return response.status(400).send()

  try {
    const result = await database.query('DELETE FROM public.Category WHERE id = $1', [categoryIdToDelete.id])
    console.log(result)
  } catch (err) {
    response.json(err)
  }
})

router.put('/newCategory', async (request, response) => {
  const categoryToModify = request.body
  if (!validate.categoriesPUTnewCategory(categoryToModify)) return response.status(400).send()

  const text = 'UPDATE public.Category SET category_id = $1 WHERE id = $2 RETURNING id'
  const values = [categoryToModify.parentCategoryId, categoryToModify.id]
  const categoryModificationResult = await database.query(text, values)
  if(categoryModificationResult.rows.length !== 1) console.log('FAILinsert')
})

module.exports = router