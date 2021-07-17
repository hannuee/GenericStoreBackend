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
    expect(response.body.find(order => order.customerinstructions === 'Tilaus joka on jo toimitettu.'))
    .toBeDefined();
})

test('ordersGETundispatched-endpoint returns all undispatched orders', async () => {
    const response = await api
    .get('/api/orders/undispatched')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(2)
    expect(response.body.find(order => order.customerinstructions === 'Tilaus joka on jo toimitettu.'))
    .toBeUndefined();
})

test('ordersGETundispatchedWithDetails-endpoint returns all undispatched orders, with product details', async () => {
    const response = await api
    .get('/api/orders/undispatchedWithDetails')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(2)

    const orderToInspect = response.body.find(order => order.id === 2 && order.orderDetails.length === 2)
    expect(orderToInspect).toBeDefined();

    const productDetails1 = orderToInspect.orderDetails.find(detail => detail.quantity === 2 && detail.name === 'Nissan Leaf')
    const productDetails2 = orderToInspect.orderDetails.find(detail => detail.quantity === 1 && detail.name === 'Toyota Landcruiser')
    expect(productDetails1).toBeDefined()
    expect(productDetails2).toBeDefined();
})

test('ordersGETofCustomerWithDetails-endpoint returns all orders of a given customer, with product details', async () => {
    const response = await api
    .get('/api/orders/ofCustomerWithDetails/1')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(1)

    const orderToInspect = response.body.find(order => order.customer_id === 1 && order.orderDetails.length === 1)
    expect(orderToInspect).toBeDefined()
})

afterAll(async () => {
    await database.endPool()
})