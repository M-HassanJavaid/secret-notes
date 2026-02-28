import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    
    id: {
        type: String,
        required: true
    },

    url:{
        type: String,
        required:true
    }

} , {_id: false})

const noteSchema = new mongoose.Schema({

    user: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    title: {
        type: String,
        minLength: 5,
        maxLength: 50,
        required: true
    },

    text:{
        type: String,
        minLength: 10,
        maxLength: 1500,
        required: true
    },

    image: {
        type: imageSchema,
        default: null
    }
});

const Note = mongoose.model('Note' , noteSchema , 'notes');
export default Note;