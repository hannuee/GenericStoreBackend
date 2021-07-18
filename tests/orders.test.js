const supertest = require('supertest')
const app = require('../app')
const database = require('../database')

const api = supertest(app)

beforeAll(async () => {
    await database.clearDatabaseIfNotEmpty()
    await database.initializeDatabaseWithTestData()
});

test('ordersGETdetails-endpoint returns the order asked, with product details', async () => {
    const response = await api
    .get('/api/orders/details/2')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const orderToInspect = response.body

    expect(orderToInspect.id).toBe(2)
    expect(orderToInspect.purchaseprice).toBe(19600000)
    expect(orderToInspect.orderDetails).toHaveLength(2)

    const productDetails1 = orderToInspect.orderDetails.find(detail => detail.quantity === 2 && detail.name === 'Nissan Leaf')
    const productDetails2 = orderToInspect.orderDetails.find(detail => detail.quantity === 1 && detail.name === 'Toyota Landcruiser')
    expect(productDetails1).toBeDefined()
    expect(productDetails2).toBeDefined();
})

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
    // Should not have internalNotes:
    expect(orderToInspect.internalnotes).toBeUndefined()
})

describe('ordersPOST-endpoint', () => {

    test('adds new order succesfully, with 2 items, of which anotherone has quantity 2', async () => {
        const newOrder = 
            [
                {
                    product_id: 1,
                    priceAndSize: {price: 3800000, size: "5 seater"},
                    quantity: 2
                },
                {
                    product_id: 3,
                    priceAndSize: {price: 12000000, size: "7 seater"},
                    quantity: 1
                }
            ]
        
        const response = await api
        .post('/api/orders/')
        .send(newOrder)
        .expect(200)

        // Let's make another HTTP request to verify that the pervious one was succesful:
        const response2 = await api
        .get('/api/orders/ofCustomerWithDetails/1')
        .expect(200)
        .expect('Content-Type', /application\/json/)

        expect(response2.body).toHaveLength(2)

        const orderToInspect = response2.body.find(order => order.id === 4 && order.orderDetails.length === 2)
        expect(orderToInspect).toBeDefined();
        expect(orderToInspect.purchaseprice).toBe(2*3800000 + 12000000)

        const productDetails1 = orderToInspect.orderDetails.find(detail => detail.quantity === 2 && detail.name === 'Nissan Leaf')
        const productDetails2 = orderToInspect.orderDetails.find(detail => detail.quantity === 1 && detail.name === 'Toyota Landcruiser')
        expect(productDetails1).toBeDefined()
        expect(productDetails2).toBeDefined()
    })

    test('adds new order succesfully, with 1 item', async () => {
        const newOrder = 
            [
                {
                    product_id: 1,
                    priceAndSize: {price: 3800000, size: "5 seater"},
                    quantity: 1
                }
            ]
        
        const response = await api
        .post('/api/orders/')
        .send(newOrder)
        .expect(200)

        // Let's make another HTTP request to verify that the pervious one was succesful:
        const response2 = await api
        .get('/api/orders/ofCustomerWithDetails/1')
        .expect(200)
        .expect('Content-Type', /application\/json/)

        expect(response2.body).toHaveLength(3)

        const orderToInspect = response2.body.find(order => order.id === 5 && order.orderDetails.length === 1)
        expect(orderToInspect).toBeDefined();
        expect(orderToInspect.purchaseprice).toBe(3800000)

        expect(orderToInspect.orderDetails[0].quantity).toBe(1)
        expect(orderToInspect.orderDetails[0].name).toBe('Nissan Leaf')
    })
})

test('ordersPUTinternalNotes-endpoint modifies internalNotes of an order', async () => {
    const newInternalNotes = {
        id: 2,
        internalNotes: "Varokaa vihaista lokkia asiakkaan pihalla!"
    }
    
    const response = await api
    .put('/api/orders/internalNotes')
    .send(newInternalNotes)
    .expect(200)

    // Let's make another HTTP request to verify that the pervious one was succesful:
    const response2 = await api
    .get('/api/orders/details/2')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const orderToInspect = response2.body
    expect(orderToInspect.id).toBe(2)
    expect(orderToInspect.internalnotes).toBe('Varokaa vihaista lokkia asiakkaan pihalla!')
})

test('ordersPUTorderDispatced-endpoint modifies orderDispatced of an order to current time', async () => {
    const orderIdInObject = {
        id: 2
    }
    
    const response = await api
    .put('/api/orders/orderDispatced')
    .send(orderIdInObject)
    .expect(200)

    // Let's make another HTTP request to verify that the pervious one was succesful:
    const response2 = await api
    .get('/api/orders/details/2')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const orderToInspect = response2.body
    expect(orderToInspect.id).toBe(2)
    expect(orderToInspect.orderdispatched).toBeDefined()
    expect(orderToInspect.orderdispatched).not.toBeNull()
})


afterAll(async () => {
    await database.endPool()
})