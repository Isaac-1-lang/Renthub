import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    place : { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Place' },
    user  : { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    checkIn  : { type: String, required: true },
    checkOut : { type: String, required: true },
    name     : { type: String, required: true },
    phone    : { type: String, required: true },
    price      : { type: Number, required: true },   // base price
    taxAmount  : { type: Number, default: 0 },        // 18% VAT
    totalPrice : { type: Number, required: true },    // price + tax

    numberOfGuests : { type: Number, required: true },

    // landlord accept / reject
    status : {
        type    : String,
        enum    : ['pending', 'accepted', 'rejected'],
        default : 'pending',
    },

    // payment
    paymentStatus : {
        type    : String,
        enum    : ['unpaid', 'paid'],
        default : 'unpaid',
    },
    paymentId : { type: String, default: null }, // dummy stripe payment intent id
}, { timestamps: true });

export const Booking = mongoose.model('Booking', bookingSchema);
