const supertest = require('supertest')
const app = require('../app')
const database = require('../database')

const api = supertest(app)

beforeAll(async () => {
    await database.initializeDatabaseWithTestData()
});

test('ordersGET-endpoint returns all orders', async () => {
    const response = await api
    .get('/api/orders')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(3)
    expect(response.body.find(product => product.customerinstructions === 'Tilaus joka on jo toimitettu.'))
    .toBeDefined();
})

test('ordersGETundispatched-endpoint returns all undispatched orders', async () => {
    const response = await api
    .get('/api/orders/undispatched')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(2)
    expect(response.body.find(product => product.customerinstructions === 'Tilaus joka on jo toimitettu.'))
    .toBeUndefined();
})  

test('ordersGETundispatchedWithDetails-endpoint returns all undispatched orders, with product details', async () => {
    const response = await api
    .get('/api/orders/undispatchedWithDetails')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(2)
})

afterAll(async () => {
    await database.endPool()
})