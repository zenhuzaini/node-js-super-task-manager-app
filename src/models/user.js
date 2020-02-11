const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Task = require('./task')

const userSchema = mongoose.Schema({
    name: { //set property below as validation
        type: String,
        required: true,
        trim: true, // fungsinya adalah ketika user ketik "     zen" maka yg kesimpan "     zen", jadi pakai trim biar jadi "zen"
        tolowercase: true //https://mongoosejs.com/docs/schematypes.html
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.length < this.minlength) { //it can be only using minlength there
                throw Error('the password must be 7 characters or more')
            } else if (value.toLowerCase().includes("password")) {
                throw Error(`The password must not be "Password"`)
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true, //valiadions : .... https://mongoosejs.com/docs/schematypes.html
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        validate(value) { //custum validation .. name of function must be validate
            if (value < 0) {
                throw new Error('age must be a positive number')
            }
        }
    },
    tokens: [{ //it will be an array, because it will save the token
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

//make the virtual to get information from task model
//to show iformation tasks from refferenced user
userSchema.virtual('mytasks', { //name of virtual is tasks
    ref: 'Task',
    localField: '_id', //id of the task
    foreignField: 'owner' //foreign key in the task model
})

//HASH PASSWORD
// create middleware before code is saved
// pre(name of event (save, u cannot change th even name otherwise it's not executed), stanadrt function (not arrow because standart will use .this))
userSchema.pre('save', async function (next) { //argument next
    const theuser = this

    if (theuser.isModified('password')) {
        theuser.password = await bcrypt.hash(theuser.password, 8) //round to 8, faster and strong
    }

    next() //to next to the next operation
})

//INSTANCE METHOD userschema.method
//method can only be accessed by instances 
//jadi di route kan ada const user = async User.Findbycre... jadi instance itu yang "const user itu!"
userSchema.methods.generateAuthToken = async function () {
    const user = this
    //{payload, must be uniqe}, 'key secreteCanbeAnything'
    const token = jwt.sign({ _id: user._id.toString() }, 'zensecret')
    user.tokens = user.tokens.concat({ token: token })
    await user.save()
    return token
}

//to hide credential information 
userSchema.methods.getPublicInformation = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

//OR we make it to toJSON 
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//MODEL METHOD userschema.static
//we separate our schema because we can make a lot of things
//we can do
//CREATE find bycredentials, bisa bermacam2 nama
//Static can be accesssed by model, jaid namanya model method
userSchema.statics.FindByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('unable to login !, user cannot be found')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    console.log(isMatch)
    if (!isMatch) {
        throw new Error('unable to login!')
    }

    return user
}

//delete task if user is deleted
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User