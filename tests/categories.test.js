const supertest = require('supertest')
const app = require('../app')
const database = require('../database')
const config = require('../utils/config')

const api = supertest(app)

beforeAll(async () => {
    if(config.TESTING_DB_NOT_EMPTY) await database.clearDatabase()
    await database.initializeDatabaseWithTestData()
});

test('categoriesGET-endpoint returns all categories', async () => {
    const response = await api
    .get('/api/categories')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(3)
    const category1 = response.body.find(category => category.name === 'SUVs' && category.category_id === 2)
    expect(category1).toBeDefined();
    const category2 = response.body.find(category => category.name === 'Nissan' && category.category_id === null)
    expect(category2).toBeDefined();
})

test('categoriesPOST-endpoint adds new category succesfully', async () => {
    const newCar = {
        parentCategoryId: 1,
        name: "SUVs",
        description: "SUVs made by Nissan."
    }
    
    const response = await api
    .post('/api/categories/')
    .send(newCar)
    .expect(200)

    // Let's make another HTTP request to verify that the pervious one was succesful:
    const response2 = await api
    .get('/api/categories')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response2.body).toHaveLength(4)
    const category1 = response2.body.find(category => 
        category.name === 'SUVs' && category.category_id === 1 && category.description === 'SUVs made by Nissan.')
    expect(category1).toBeDefined();
})

test('categoriesDELETE-endpoint deletes a category succesfully', async () => {
    const response = await api
    .delete('/api/categories/4')
    .send()
    .expect(200)

    // Let's make another HTTP request to verify that the pervious one was succesful:
    const response2 = await api
    .get('/api/categories')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response2.body).toHaveLength(3)
    const category1 = response2.body.find(category => 
        category.name === 'SUVs' && category.category_id === 1 && category.description === 'SUVs made by Nissan.')
    expect(category1).toBeUndefined();
})

test('categoriesPUTnewCategory-endpoint modifies parent category of a category', async () => {
    const newCategory = {
        id: 3,
        parentCategoryId: 1
    }
    
    const response = await api
    .put('/api/categories/newCategory')
    .send(newCategory)
    .expect(200)

    // Let's make another HTTP request to verify that the pervious one was succesful:
    const response2 = await api
    .get('/api/categories')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response2.body).toHaveLength(3)
    const category1 = response2.body.find(category => 
        category.name === 'SUVs' && category.category_id === 1 && category.description === 'SUVs made by Toyota.')
    expect(category1).toBeDefined();
})

afterAll(async () => {
    await database.endPool()
})