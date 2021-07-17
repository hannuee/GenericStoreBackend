const Ajv = require("ajv")
const ajv = new Ajv()

const id = ajv.compile({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1}
  },
  required: ["id"],
  additionalProperties: false
})

const categoriesPOST = ajv.compile({
    type: "object",
    properties: {
        parentCategoryId: {type: "integer", minimum: 1, nullable: true},
        name: {type: "string", minLength: 1},
        description: {type: "string", nullable: true}
    },
    required: ["parentCategoryId", "name", "description"],
    additionalProperties: false
})

const categoriesPUTnewCategory = ajv.compile({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1},
      parentCategoryId: {type: "integer", minimum: 1, nullable: true}
  },
  required: ["id", "parentCategoryId"],
  additionalProperties: false
})

const customersPOST = ajv.compile({
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
})

const customersPOSTlogin = ajv.compile({
  type: "object",
  properties: {
      email: {type: "string", minLength: 5},
      password: {type: "string", minLength: 12}
  },
  required: ["email", "password"],
  additionalProperties: false
})

const customersGETwithEmail = ajv.compile({
  type: "object",
  properties: {
      email: {type: "string", minLength: 5}
  },
  required: ["email"],
  additionalProperties: false
})

const ordersPOST = ajv.compile({
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
})

const ordersPUTinternalNotes = ajv.compile({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1},
      internalNotes: {type: "string", minLength: 1}
  },
  required: ["id", "internalNotes"],
  additionalProperties: false
})

const ordersPUTorderDispatced = ajv.compile({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1}
  },
  required: ["id"],
  additionalProperties: false
})

const productsPOST = ajv.compile({
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
})

const productsPUTavailable = ajv.compile({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1},
      available: {type: "boolean"}
  },
  required: ["id", "available"],
  additionalProperties: false
})

const productsPUTnewCategory = ajv.compile({
  type: "object",
  properties: {
      id: {type: "integer", minimum: 1},
      parentCategoryId: {type: "integer", minimum: 1, nullable: true}
  },
  required: ["id", "parentCategoryId"],
  additionalProperties: false
})

const productsPUTpricesAndSizes = ajv.compile({
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
})

module.exports = {id, categoriesPOST, categoriesPUTnewCategory, customersPOST, 
  customersGETwithEmail, ordersPUTinternalNotes, ordersPUTorderDispatced, 
  productsPUTavailable, productsPUTnewCategory, productsPUTpricesAndSizes,
  productsPOST, ordersPOST, customersPOSTlogin}