const mongoose = require('mongoose')
const validator = require('validator')

const taskSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
        validate(value) {
            if (value.includes('fck')) {
                throw Error('must not contain bad words')
            }
        }
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, //must be object ID
        required: true,
        ref: 'User' //it's the name of the model
    },
},

    {
        timestamps: true
    }
)

const Task = mongoose.model('Task', taskSchema)

module.exports = Task