const jwt = require('jsonwebtoken')

const authorizeCustomer = (request, response, next) => {
    let token = null

    const authorization = request.get('authorization') 
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {    
        token = authorization.substring(7)  
    } else {
        return response.status(401).send()
    }
 
    const decodedToken = jwt.verify(token, process.env.SECRET)  
    if (!decodedToken.id) {    
        return response.status(401).send()  
    }

    // Add the customer_id to the request:
    request.body = {
        content: request.body,
        verifiedCustomerId: decodedToken.id
    }

    next()
}

const authorizeAdmin = (request, response, next) => {
    let token = null

    const authorization = request.get('authorization') 
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {    
        token = authorization.substring(7)  
    } else {
        return response.status(401).send()
    }
 
    const decodedToken = jwt.verify(token, process.env.SECRET)  
    if (!decodedToken.admin) {
        return response.status(401).send()  
    }

    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

module.exports = {
    authorizeCustomer,
    authorizeAdmin,
    unknownEndpoint
}