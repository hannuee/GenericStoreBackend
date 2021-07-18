const config = require('../utils/config')
const { Pool } = require('pg')

const pool = new Pool({
    connectionString: config.DATABASE_URL
})

const destructDatabaseStatements = [
  'DROP TABLE public.ProductOrder',
  'DROP TABLE public.Order',
  'DROP TABLE public.Customer',
  'DROP TABLE public.Product',
  'DROP TABLE public.Category'
]

const buildDatabaseStatements = [
  'CREATE TABLE public.Category (' +
    'id SERIAL PRIMARY KEY,' +
    'category_id INTEGER DEFAULT NULL REFERENCES public.Category(id) ON DELETE RESTRICT,' +
    'name TEXT,' +
    'description TEXT DEFAULT NULL,' +
    'picture JSON DEFAULT NULL)',
  
  'CREATE TABLE public.Product (' +
    'id SERIAL PRIMARY KEY,' +
    'category_id INTEGER REFERENCES public.Category(id) ON DELETE RESTRICT,' +
    'name TEXT,' +
    'description TEXT DEFAULT NULL,' +
    'pricesAndSizes JSON,' +
    'available BOOLEAN NOT NULL,' +
    'added TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,' +
    'picture JSON DEFAULT NULL)',

  'CREATE TABLE public.Customer (' +
    'id SERIAL PRIMARY KEY,' +
    'name TEXT,' +
    'address TEXT,' +
    'mobile TEXT,' +
    'email TEXT UNIQUE,' +
    'passwordHash TEXT)',

  'CREATE TABLE public.Order (' +
    'id SERIAL PRIMARY KEY,' +
    'customer_id INTEGER REFERENCES public.Customer(id) ON DELETE RESTRICT,' +
    'orderReceived TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,' +
    'orderDispatched TIMESTAMPTZ DEFAULT NULL,' +
    'purchasePrice INTEGER NOT NULL,' +
    'customerInstructions TEXT DEFAULT NULL,' +
    'internalNotes TEXT DEFAULT NULL)',

  'CREATE TABLE public.ProductOrder (' +
    'id SERIAL PRIMARY KEY,' +
    'product_id INTEGER REFERENCES public.Product(id) ON DELETE RESTRICT,' +
    'order_id INTEGER REFERENCES public.Order(id) ON DELETE CASCADE,' +
    'priceAndSize JSON,' +
    'quantity INTEGER)'
]

const testDataInsertStatements = [
  'INSERT INTO public.Category (name, description) VALUES (\'Nissan\', \'Cars made by Nissan.\')',
  'INSERT INTO public.Category (name, description) VALUES (\'Toyota\', \'Cars made by Toyota.\')',
  'INSERT INTO public.Category (name, category_id, description) VALUES (\'SUVs\', 2, \'SUVs made by Toyota.\')',

  'INSERT INTO public.Product (category_id, name, description, pricesAndSizes, available)' +
  'VALUES (1, \'Nissan Leaf\', \'An electric car.\', \'[{\"price\": 3800000, \"size": \"5 seater\"}]\', TRUE)',
  'INSERT INTO public.Product (category_id, name, description, pricesAndSizes, available)' +
  'VALUES (1, \'Nissan Micra\', \'A small car.\', \'[{\"price\": 1800000, \"size": \"5 seater\"}]\', FALSE)',
  'INSERT INTO public.Product (category_id, name, description, pricesAndSizes, available)' +
  'VALUES (3, \'Toyota Landcruiser\', \'An SUV.\', \'[{\"price\": 8000000, \"size": \"5 seater\"}, {\"price\": 12000000, \"size\": \"7 seater\"}]\', TRUE)',

  'INSERT INTO public.Customer (name, address, mobile, email, passwordHash)' +
  'VALUES (\'Emma\', \'Finland\', \'050 1234567\', \'emma@suomi.fi\', \'emmansalasana\')',
  'INSERT INTO public.Customer (name, address, mobile, email, passwordHash)' +
  'VALUES (\'Matti\', \'Finland\', \'040 1234567\', \'matti@suomi.fi\', \'matinsalasana\')',

  'INSERT INTO public.Order (customer_id, purchasePrice, customerInstructions)' +
  'VALUES (1, 8000000, \'Toimitus iltapäivällä.\')',
  'INSERT INTO public.Order (customer_id, purchasePrice, customerInstructions)' +
  'VALUES (2, 19600000, \'Toimitus aamulla.\')',
  'INSERT INTO public.Order (customer_id, orderDispatched, purchasePrice, customerInstructions)' +
  'VALUES (2, CURRENT_TIMESTAMP, 0, \'Tilaus joka on jo toimitettu.\')',

  'INSERT INTO public.ProductOrder (product_id, order_id, priceAndSize, quantity)' +
  'VALUES (3, 1, \'{\"price\": 8000000, \"size\": \"5 seater\"}\', 1)',
  'INSERT INTO public.ProductOrder (product_id, order_id, priceAndSize, quantity)' +
  'VALUES (1, 2, \'{\"price\": 3800000, \"size\": \"5 seater\"}\', 2)',
  'INSERT INTO public.ProductOrder (product_id, order_id, priceAndSize, quantity)' +
  'VALUES (3, 2, \'{\"price\": 12000000, \"size\": \"7 seater\"}\', 1)'
]

const clearDatabaseIfNotEmpty = async () => {
  const countResult = await pool.query('SELECT count(*) FROM pg_stat_user_tables WHERE schemaname = \'public\'')
  if(countResult.rows[0].count === 0) return

  for(let statement of destructDatabaseStatements){
    await pool.query(statement)
  }
}

const initializeDatabaseWithTestData = async () => {
  for(let statement of buildDatabaseStatements){
    await pool.query(statement)
  }
  for(let statement of testDataInsertStatements){
    await pool.query(statement)
  }
}

module.exports = {
    async query(text, params) {
      const res = await pool.query(text, params)
      return res
    },
    async transactionConnection() {
      return pool.connect()
    },
    async endPool() {
      await pool.end()
    },
    clearDatabaseIfNotEmpty,
    initializeDatabaseWithTestData
}