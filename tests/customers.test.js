const supertest = require('supertest')
const app = require('../app')
const database = require('../database')

const api = supertest(app)

beforeAll(async () => {
    await database.initializeDatabaseWithTestData()
});

test('customersGET-endpoint returns all customers with limited information', async () => {
    const response = await api
    .get('/api/customers')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(2)
    const customer = response.body.find(customer => customer.name === 'Emma' && customer.id === 1)
    expect(customer).toBeDefined()
    const customerMissingInfo = response.body.find(customer => customer.address === 'Finland')
    expect(customerMissingInfo).toBeUndefined()
})

test('customersGET-endpoint with id returns one customer with all information, but no passwordHash', async () => {
    const response = await api
    .get('/api/customers/1')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const customer = response.body
    expect(customer.id).toBe(1)
    expect(customer.name).toBe('Emma')
    expect(customer.address).toBe('Finland')
    expect(customer.mobile).toBe('050 1234567')
    expect(customer.email).toBe('emma@suomi.fi')
    expect(customer.passwordHash).toBeUndefined()
})



afterAll(async () => {
    await database.endPool()
})