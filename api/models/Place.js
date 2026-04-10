import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
    owner : {type:mongoose.Schema.Types.ObjectId, ref:'User'},
    title : String,
    address : String,
    city : String,
    country : String,
    photos : [String],
    description : String,
    perks : [String],
    extraInfo : String,
    maxGuests : Number,
    price : Number,
    propertyType : { type: String, default: 'house' }, // house, apartment, villa, etc.
    bookedDates : [String],
})

export const Place = mongoose.model('Place',placeSchema);

