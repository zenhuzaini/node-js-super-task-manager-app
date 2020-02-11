const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '') //name header is Authorization
        //remove Bearer word by replace 
        // console.log(token)

        //f=verify token
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
        console.log(decode)
        console.log(decode._id)
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })

        if (!user) {
            throw new Error('user cannot be found!') //it will go to cath!
        }

        //assign the user value to req.user to get the user value,
        req.user = user
        req.token = token
        next()


    } catch (error) {
        res.status(401).send({ error: 'please login authenticate!' })
    }
}

module.exports = auth