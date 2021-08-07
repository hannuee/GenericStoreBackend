const Ajv = require("ajv")
const ajv = new Ajv()


// HTTP Request parameter validators:

const validateRequestParameterID = (request, response, next) => {  // Main validator middleware
  const IdInObject = { id: Number(request.params.id)}

  if (!IdInObject.id || !idValidator(IdInObject)) return response.status(400).json({ error: 'Incorrect input'})

  next()
}

const idValidator = ajv.compile({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1}
  },
  required: ["id"],
  additionalProperties: false
})


// HTTP Request body validators:

const validateRequestBody = (request, response, next) => {  // Main validator middleware
  const validate = ajv.getSchema(request.method + request.baseUrl + request.path)

  if (!validate) return response.status(500).send()  // Validator missing for the route!
  if (!validate(request.body)) return response.status(400).json({ error: 'Incorrect input'})

  next()
}

ajv.addSchema({
  type: "object",
  properties: {
      parentCategoryId: {type: "integer", minimum: 1, nullable: true},
      name: {type: "string", minLength: 1},
      description: {type: "string", nullable: true}
  },
  required: ["parentCategoryId", "name", "description"],
  additionalProperties: false
},
'POST/api/categories/')
ajv.getSchema('POST/api/categories/')  // Triggers pre-compilation.

ajv.addSchema({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1},
      parentCategoryId: {type: "integer", minimum: 1, nullable: true}
  },
  required: ["id", "parentCategoryId"],
  additionalProperties: false
}, 
'PUT/api/categories/newCategory')
ajv.getSchema('PUT/api/categories/newCategory')  // Triggers pre-compilation.

ajv.addSchema({
  type: "object",
  properties: {
      name: {type: "string", minLength: 1},
      address: {type: "string", minLength: 1},
      mobile: {type: "string", minLength: 1},
      email: {type: "string", minLength: 5},
      password: {type: "string", minLength: 12}
  },
  required: ["name", "address", "mobile", "email", "password"],
  additionalProperties: false
}, 
'POST/api/customers/')
ajv.getSchema('POST/api/customers/')  // Triggers pre-compilation.

ajv.addSchema({
  type: "object",
  properties: {
      email: {type: "string", minLength: 5},
      password: {type: "string", minLength: 12}
  },
  required: ["email", "password"],
  additionalProperties: false
}, 
'POST/api/customers/login')
ajv.getSchema('POST/api/customers/login')  // Triggers pre-compilation.

ajv.addSchema({
  type: "array", minItems: 1, items: {
    type: "object",
    properties: {
      product_id: {type: "integer", minimum: 1},
      priceAndSize: {
        type: "object", 
        properties: {
          price: {type: "integer", minimum: 0},
          size: {type: "string"}
          },
        required: ["price", "size"],
        additionalProperties: false
      },
      quantity: {type: "integer", minimum: 1},
    },
    required: ["product_id", "priceAndSize", "quantity"],
    additionalProperties: false}
}, 
'POST/api/orders/')
ajv.getSchema('POST/api/orders/')  // Triggers pre-compilation.

ajv.addSchema({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1},
      internalNotes: {type: "string", minLength: 1}
  },
  required: ["id", "internalNotes"],
  additionalProperties: false
}, 
'PUT/api/orders/internalNotes')
ajv.getSchema('PUT/api/orders/internalNotes')  // Triggers pre-compilation.

ajv.addSchema({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1}
  },
  required: ["id"],
  additionalProperties: false
}, 
'PUT/api/orders/orderDispatced')
ajv.getSchema('PUT/api/orders/orderDispatced')  // Triggers pre-compilation.

ajv.addSchema({
  type: "object",
  properties: {
      parentCategoryId: {type: "integer", minimum: 1, nullable: true},
      name: {type: "string", minLength: 1},
      description: {type: "string", nullable: true},
      pricesAndSizes: {type: "array", items: { 
        type: "object", 
        properties: {
          price: {type: "integer", minimum: 0},
          size: {type: "string"}
          },
        required: ["price", "size"],
        additionalProperties: false
        }
      },
      available: {type: "boolean"}
  },
  required: ["parentCategoryId", "name", "description", "pricesAndSizes", "available"],
  additionalProperties: false
}, 
'POST/api/products/')
ajv.getSchema('POST/api/products/')  // Triggers pre-compilation.

ajv.addSchema({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1},
      available: {type: "boolean"}
  },
  required: ["id", "available"],
  additionalProperties: false
}, 
'PUT/api/products/available')
ajv.getSchema('PUT/api/products/available')  // Triggers pre-compilation.

ajv.addSchema({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1},
      parentCategoryId: {type: "integer", minimum: 1, nullable: true}
  },
  required: ["id", "parentCategoryId"],
  additionalProperties: false
}, 
'PUT/api/products/newCategory')
ajv.getSchema('PUT/api/products/newCategory')  // Triggers pre-compilation.

ajv.addSchema({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1},
      pricesAndSizes: {type: "array", items: { 
        type: "object", 
        properties: {
          price: {type: "integer", minimum: 0},
          size: {type: "string"}
          },
        required: ["price", "size"],
        additionalProperties: false
        }
      }
  },
  required: ["id", "pricesAndSizes"],
  additionalProperties: false
}, 
'PUT/api/products/pricesAndSizes')
ajv.getSchema('PUT/api/products/pricesAndSizes')  // Triggers pre-compilation.

module.exports = {validateRequestParameterID, validateRequestBody}