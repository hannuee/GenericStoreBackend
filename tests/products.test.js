const supertest = require('supertest')
const app = require('../app')
const database = require('../database')

const api = supertest(app)

beforeAll(async () => {
    await database.initializeDatabaseWithTestData()
});

test('products are returned as json', async () => {
    const response = await api
    .get('/api/products')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(3)
})

afterAll(async () => {
    await database.endPool()
})