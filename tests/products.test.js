const supertest = require('supertest')
const app = require('../app')
const database = require('../database')

const api = supertest(app)

let adminsToken

beforeAll(async () => {
    await database.clearDatabaseIfNotEmpty()
    await database.initializeDatabaseWithTestData()

    // Admin login:
    const adminLoginInfo = {
        email: "admin@suo.mi",
        password: "adminin Pitkä! salasana"
    }

    const responseAdmin = await api
        .post('/api/customers/login')
        .send(adminLoginInfo)
        .expect(200)

    const admin = responseAdmin.body
    expect(admin.token.length > 20).toBe(true)
    expect(admin.admin).toBe(true)

    // Save the token:
    adminsToken = admin.token
});

test('productsGET-endpoint returns all products, also unavailable ones', async () => {
    const response = await api
    .get('/api/products')
    .set('authorization', 'Bearer ' + adminsToken)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(3)
    expect(response.body.find(product => product.name === 'Nissan Micra')).toBeDefined();
}) 

test('productsGETavailable-endpoint returns all available products', async () => {
    const response = await api
    .get('/api/products/available')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(2)
    expect(response.body.find(product => product.name === 'Nissan Micra')).toBeUndefined();
}) 

test('productsGETofCategory-endpoint returns all products of a given category, also unavailable ones', async () => {
    const response = await api
    .get('/api/products/ofCategory/1')
    .set('authorization', 'Bearer ' + adminsToken)
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

test('productsPOST-endpoint adds new product succesfully', async () => {
    const newCar = {
        parentCategoryId: 2,
        name: "Toyota Yaris GR",
        description: "Small sports car",
        pricesAndSizes: [ { price: 4800000, size: "" } ],
        available: true
    }
    
    const response = await api
    .post('/api/products/')
    .set('authorization', 'Bearer ' + adminsToken)
    .send(newCar)
    .expect(200)

    // Let's make another HTTP request to verify that the pervious one was succesful:
    const response2 = await api
    .get('/api/products/ofCategory/2')
    .set('authorization', 'Bearer ' + adminsToken)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response2.body).toHaveLength(1)
    expect(response2.body.find(product => product.name === 'Toyota Yaris GR')).toBeDefined()
})

test('productsPUTavailable-endpoint modifies availability status of a product', async () => {
    const newStatus = {
        id: 2,
        available: true
    }
    
    const response = await api
    .put('/api/products/available')
    .set('authorization', 'Bearer ' + adminsToken)
    .send(newStatus)
    .expect(200)

    // Let's make another HTTP request to verify that the pervious one was succesful:
    const response2 = await api
    .get('/api/products/availableOfCategory/1')
    .set('authorization', 'Bearer ' + adminsToken)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response2.body).toHaveLength(2)
    expect(response2.body.find(product => product.name === 'Nissan Micra' && product.available)).toBeDefined()
})

test('productsPUTnewCategory-endpoint modifies parent category of a product', async () => {
    const newCategory = {
        id: 3,
        parentCategoryId: 2
    }
    
    const response = await api
    .put('/api/products/newCategory')
    .set('authorization', 'Bearer ' + adminsToken)
    .send(newCategory)
    .expect(200)

    // Let's make another HTTP request to verify that the pervious one was succesful:
    const response2 = await api
    .get('/api/products/OfCategory/2')
    .set('authorization', 'Bearer ' + adminsToken)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response2.body).toHaveLength(2)
    expect(response2.body.find(product => product.name === 'Toyota Landcruiser')).toBeDefined()
})

test('productsPUTpricesAndSizes-endpoint modifies pricesAndSizes info of a product', async () => {
    const newPricesAndSizes = {
        id: 1,
        pricesAndSizes: [ { price: 3500000, size: "5 seater" } ]
    }
    
    const response = await api
    .put('/api/products/pricesAndSizes')
    .set('authorization', 'Bearer ' + adminsToken)
    .send(newPricesAndSizes)
    .expect(200)

    // Let's make another HTTP request to verify that the pervious one was succesful:
    const response2 = await api
    .get('/api/products/OfCategory/1')
    .set('authorization', 'Bearer ' + adminsToken)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response2.body).toHaveLength(2)
    expect(response2.body.find(product => product.name === 'Nissan Leaf' && product.pricesandsizes[0].price === 3500000))
    .toBeDefined()
})

afterAll(async () => {
    await database.clearDatabaseIfNotEmpty()
    await database.initializeDatabaseWithTestData()
    await database.endPool()
})