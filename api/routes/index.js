import express from "express";
const router = express.Router();
import userController from "../controllers/userController.js";
import placeController from "../controllers/placeController.js";
import bookingController from "../controllers/bookingController.js";
import { Place } from "../models/Place.js";

router.use('/user', userController);
router.use('/place', placeController);
router.use('/booking', bookingController);

// ── GET /places — public, supports search + filters ──────────────────────────
router.get('/places', async (req, res) => {
    try {
        const { page = 1, limit = 8, query, minPrice, maxPrice, city, perks, propertyType } = req.query;
        let filter = {};

        if (query) {
            const regex = new RegExp(query, "i");
            filter.$or = [{ title: regex }, { address: regex }, { city: regex }];
        }
        if (city) filter.city = new RegExp(city, "i");
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (propertyType) filter.propertyType = propertyType;
        if (perks) {
            const perkList = perks.split(',').map(p => p.trim());
            filter.perks = { $all: perkList };
        }

        const places = await Place.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json(places);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
