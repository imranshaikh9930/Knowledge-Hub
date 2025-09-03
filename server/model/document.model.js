const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        index:'text'
    },
    content:{
        type:String,
        required:true,
        index:'text'
    },tags:{
        type:[String],
        default:[]
    },summary:{
        type:String,
        default:""
    },
    embedding: { type: [Number], default: [] }
    ,createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true});


module.exports = mongoose.model("Document",documentSchema);
