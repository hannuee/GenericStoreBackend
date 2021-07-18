const supertest = require('supertest')
const app = require('../app')
const database = require('../database')
const config = require('../utils/config')

const api = supertest(app)

beforeAll(async () => {
    if(config.TESTING_DB_NOT_EMPTY) await database.clearDatabase()
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

test('customersPOST-endpoint adds a new customer succesfully', async () => {
    const newCustomer = {
        name: "Sanna",
        address: "Helsinki",
        mobile: "045 1234567",
        email: "sanna@hel.fi",
        password: "Super Uber passu"
    }
    
    const response = await api
    .post('/api/customers/')
    .send(newCustomer)
    .expect(200)

    // Let's make another HTTP request to verify that the pervious one was succesful:
    const response2 = await api
    .get('/api/customers/3')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const customer = response2.body
    expect(customer.id).toBe(3)
    expect(customer.name).toBe('Sanna')
    expect(customer.address).toBe('Helsinki')
    expect(customer.mobile).toBe('045 1234567')
    expect(customer.email).toBe('sanna@hel.fi')
    expect(customer.passwordHash).toBeUndefined()
})

test('customersPOSTlogin-endpoint logs in a customer succesfully', async () => {
    const customerLoginInfo = {
        email: "sanna@hel.fi",
        password: "Super Uber passu"
    }
    
    const response = await api
    .post('/api/customers/login')
    .send(customerLoginInfo)
    .expect(200)

    const customer = response.body
    expect(customer.token.length > 20).toBe(true)
    expect(customer.name).toBe('Sanna')
})

afterAll(async () => {
    await database.endPool()
})