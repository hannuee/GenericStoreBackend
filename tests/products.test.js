const supertest = require('supertest')
const app = require('../app')
const database = require('../database')

const api = supertest(app)

beforeAll(async () => {
    await database.initializeDatabaseWithTestData()
});

test('productsGET-endpoint returns all products, also unavailable ones', async () => {
    const response = await api
    .get('/api/products')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(3)
    expect(response.body.find(product => product.name === 'Nissan Micra')).toBeDefined();
}) 

test('productsGETofCategory-endpoint returns all products of a given category, also unavailable ones', async () => {
    const response = await api
    .get('/api/products/ofCategory/1')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(2)
    expect(response.body.find(product => product.name === 'Nissan Micra')).toBeDefined();
}) 

test('productsGETavailableOfCategory-endpoint returns all available products of a given category', async () => {
    const response = await api
    .get('/api/products/availableOfCategory/1')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(1)
    expect(response.body.find(product => product.name === 'Nissan Micra')).toBeUndefined();
}) 

afterAll(async () => {
    await database.endPool()
})