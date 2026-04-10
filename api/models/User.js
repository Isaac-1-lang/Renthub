import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : String,
    email : {
        type : String,
        unique : true,
    },
    password : String,
    role : {
        type : String,
        enum : ['guest', 'landlord'],
        default : 'guest',
    },
    bookings : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : 'Bookings',
    },
    bookedPlaces : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : 'Place',
    }
})

export const User = mongoose.model('User',userSchema);
