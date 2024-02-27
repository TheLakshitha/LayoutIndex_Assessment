require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const locationRoutes = require('./routes/locations')


const app = express()

//middleware
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

//routes
app.use('/api/locations',locationRoutes)

//Connect to DB

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT,() => {
            console.log('connected to DB and listening on port',process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })




