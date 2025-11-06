const express = require('express')
const blogServer = express()
const port = 3000
const postsRouter = require('./routers/posts.js') 
const tagsRouter = require('./routers/tags.js')
const serverError = require('./middlewares/serverError.js')
const notFoundErr = require('./middlewares/notFoundErr.js')

// Listen
blogServer.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})

// Middleware per far leggere formato json a Express
blogServer.use(express.json())

// Elementi Statici
blogServer.use(express.static('public'))


//Home
blogServer.get('/', (req, res) => {
    res.send('Benevenuto nel server del mio blog')
})

//ROUTES FOR POSTS
blogServer.use('/api/posts', postsRouter)
blogServer.use('/api/tags', tagsRouter)

//Error Handler (500)
blogServer.use(serverError)

//Error Handler(404-EndPoint)
blogServer.use(notFoundErr)