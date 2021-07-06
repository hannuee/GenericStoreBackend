const router = require('express').Router()

router.get('/', (request, response) => {
  const hello = {
      word1: "Hello",
      word2: "World!"
  }

  response.json(hello)
})

module.exports = router