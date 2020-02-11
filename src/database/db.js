const mongoose = require('mongoose')
const url = process.env.DATABASE_ADDRESS
//pwd atlas 123456789zen
mongoose.set('runValidators', true)

//connect to db
mongoose.connect(url, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true })
    .then(() => console.log('database connected'))
    .catch('ohh nooo its not connected')
