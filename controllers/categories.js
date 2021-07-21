const router = require('express').Router()
const database = require('../database')
const {validateRequestParameterID, validateRequestBody} = require('../utils/validators')

router.get('/', async (request, response) => {
  let queryResult
  try {
    queryResult = await database.query('SELECT * FROM public.Category')
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }
  return response.json(queryResult.rows)
})

router.post('/', validateRequestBody, async (request, response) => {
  const categoryToAdd = request.body

  let queryResult 
  try {
    queryResult = await database.query('INSERT INTO public.Category(category_id, name, description) VALUES($1, $2, $3) RETURNING id', [categoryToAdd.parentCategoryId, categoryToAdd.name, categoryToAdd.description])
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.status(200).send()
})

router.delete('/:id', validateRequestParameterID, async (request, response) => {
  const categoryIdToDelete = { id: Number(request.params.id)}

  let queryResult
  try {
    queryResult = await database.query('DELETE FROM public.Category WHERE id = $1 RETURNING id', [categoryIdToDelete.id])
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.status(200).send()
})

router.put('/newCategory', validateRequestBody, async (request, response) => {
  const categoryToModify = request.body

  let queryResult
  try {
    const text = 'UPDATE public.Category SET category_id = $1 WHERE id = $2 RETURNING id'
    const values = [categoryToModify.parentCategoryId, categoryToModify.id]
    queryResult = await database.query(text, values)
    if(queryResult.rows.length !== 1) throw 'error'
  } catch (error) {
    return response.status(500).json({ error: 'Database error'})
  }

  return response.status(200).send()
})

module.exports = router