import express from "express";
const router = express.Router();
import { Booking } from "../models/Booking.js";
import { Place }   from "../models/Place.js";
import { isLoggedIn } from "../middlewares/userAuth.js";

const TAX_RATE = 0.18;

// ── POST /booking — guest creates a booking (pending + unpaid) ────────────────
router.post('/', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.id;
        const { place, checkIn, checkOut, numberOfGuests, name, phone, price, paymentId } = req.body;
        const taxAmount  = parseFloat((price * TAX_RATE).toFixed(2));
        const totalPrice = parseFloat((price + taxAmount).toFixed(2));
        const booking = await Booking.create({
            user: userId, place, checkIn, checkOut,
            numberOfGuests, name, phone,
            price, taxAmount, totalPrice,
            status: 'pending',
            paymentStatus: paymentId ? 'paid' : 'unpaid',
            paymentId: paymentId || null,
        });
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /booking/account — guest: my bookings ─────────────────────────────────
router.get('/account', isLoggedIn, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('place')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /booking/landlord — landlord: all bookings for my properties ──────────
router.get('/landlord', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.find()
            .populate({ path: 'place', match: { owner: userId } })
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings.filter(b => b.place !== null));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /booking/:id/status — landlord accepts or rejects ──────────────────
router.patch('/:id/status', isLoggedIn, async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' | 'rejected'
        if (!['accepted', 'rejected'].includes(status))
            return res.status(400).json({ error: 'Invalid status' });

        const booking = await Booking.findById(req.params.id).populate('place');
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        // verify the requester owns the place
        if (booking.place.owner.toString() !== req.user.id)
            return res.status(403).json({ error: 'Forbidden' });

        booking.status = status;

        // if rejected, free up the booked dates on the place
        if (status === 'rejected') {
            await Place.updateOne(
                { _id: booking.place._id },
                { $pull: { bookedDates: { $in: [] } } } // dates already stored; just mark rejected
            );
        }

        await booking.save();
        res.status(200).json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /booking/:placeId — guest: check if already booked this place ─────────
router.get('/:placeId', isLoggedIn, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            user: req.user.id,
            place: req.params.placeId,
            status: { $ne: 'rejected' },
        });
        res.status(200).json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /booking — guest cancels ──────────────────────────────────────────
router.delete('/', isLoggedIn, async (req, res) => {
    try {
        const { bookingId } = req.body;
        await Booking.findByIdAndDelete(bookingId);
        res.status(200).json('Booking cancelled');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
