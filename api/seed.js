import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Place } from "./models/Place.js";

// ── Real Unsplash photo sets per property type ────────────────────────────────
const PHOTOS = {
  villa: [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  ],
  house: [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80",
  ],
  apartment: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  ],
  studio: [
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
  ],
  cottage: [
    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80",
    "https://images.unsplash.com/photo-1506974210756-8e1b8985d348?w=800&q=80",
  ],
};

// ── 50 Rwanda properties ──────────────────────────────────────────────────────
const PROPERTIES = [
  // ── Kigali ──────────────────────────────────────────────────────────────────
  { title: "Luxury Villa in Kigali Heights", city: "Kigali", address: "KG 15 Ave, Kiyovu, Kigali", type: "villa",   price: 85000,  guests: 8,  perks: ["wifi","parking","pool","ac","tv"] },
  { title: "Modern Apartment in Nyarutarama", city: "Kigali", address: "KG 9 Ave, Nyarutarama, Kigali", type: "apartment", price: 45000, guests: 4, perks: ["wifi","ac","tv","parking"] },
  { title: "Cozy Studio near Kigali Convention Centre", city: "Kigali", address: "KN 3 Rd, Kimihurura, Kigali", type: "studio", price: 22000, guests: 2, perks: ["wifi","ac","tv"] },
  { title: "Executive House in Gacuriro", city: "Kigali", address: "KG 200 St, Gacuriro, Kigali", type: "house", price: 60000, guests: 6, perks: ["wifi","parking","ac","tv","pets"] },
  { title: "Penthouse Suite in Remera", city: "Kigali", address: "KG 11 Ave, Remera, Kigali", type: "apartment", price: 70000, guests: 5, perks: ["wifi","ac","tv","pool"] },
  { title: "Garden Villa in Kibagabaga", city: "Kigali", address: "KG 7 Ave, Kibagabaga, Kigali", type: "villa", price: 95000, guests: 10, perks: ["wifi","parking","pool","ac","tv","pets"] },
  { title: "Affordable Studio in Kimironko", city: "Kigali", address: "KG 18 St, Kimironko, Kigali", type: "studio", price: 18000, guests: 2, perks: ["wifi","tv"] },
  { title: "Family Home in Kacyiru", city: "Kigali", address: "KG 5 Ave, Kacyiru, Kigali", type: "house", price: 55000, guests: 7, perks: ["wifi","parking","ac","tv"] },
  { title: "Hillside Apartment in Kiyovu", city: "Kigali", address: "KN 1 Rd, Kiyovu, Kigali", type: "apartment", price: 38000, guests: 3, perks: ["wifi","ac","tv"] },
  { title: "Boutique Villa with City View", city: "Kigali", address: "KG 22 Ave, Nyamirambo, Kigali", type: "villa", price: 110000, guests: 12, perks: ["wifi","parking","pool","ac","tv","private"] },
  { title: "Smart Studio in Gasabo", city: "Kigali", address: "KG 33 St, Gasabo, Kigali", type: "studio", price: 20000, guests: 2, perks: ["wifi","ac"] },
  { title: "Spacious House in Kanombe", city: "Kigali", address: "KK 15 Ave, Kanombe, Kigali", type: "house", price: 48000, guests: 6, perks: ["wifi","parking","tv","pets"] },

  // ── Musanze ──────────────────────────────────────────────────────────────────
  { title: "Volcano View Villa in Musanze", city: "Musanze", address: "Muhoza Sector, Musanze", type: "villa", price: 75000, guests: 8, perks: ["wifi","parking","tv","ac"] },
  { title: "Gorilla Trekker's Cottage", city: "Musanze", address: "Kinigi Sector, Musanze", type: "cottage", price: 35000, guests: 4, perks: ["wifi","parking","tv","pets"] },
  { title: "Mountain Retreat House", city: "Musanze", address: "Cyuve Sector, Musanze", type: "house", price: 42000, guests: 6, perks: ["wifi","parking","tv"] },
  { title: "Cozy Cottage near Volcanoes NP", city: "Musanze", address: "Gataraga Sector, Musanze", type: "cottage", price: 28000, guests: 3, perks: ["wifi","tv","pets"] },
  { title: "Eco Lodge Studio in Musanze", city: "Musanze", address: "Muhoza Sector, Musanze", type: "studio", price: 19000, guests: 2, perks: ["wifi","tv"] },
  { title: "Luxury Chalet with Volcano Views", city: "Musanze", address: "Kinigi Sector, Musanze", type: "villa", price: 88000, guests: 9, perks: ["wifi","parking","pool","tv","ac"] },

  // ── Rubavu (Gisenyi) ─────────────────────────────────────────────────────────
  { title: "Lakeside Villa on Lake Kivu", city: "Rubavu", address: "Gisenyi Beach Rd, Rubavu", type: "villa", price: 92000, guests: 10, perks: ["wifi","parking","pool","ac","tv"] },
  { title: "Beach Cottage in Gisenyi", city: "Rubavu", address: "Rubavu Sector, Rubavu", type: "cottage", price: 32000, guests: 4, perks: ["wifi","tv","parking","pets"] },
  { title: "Lake View Apartment", city: "Rubavu", address: "Nyamyumba Sector, Rubavu", type: "apartment", price: 40000, guests: 4, perks: ["wifi","ac","tv"] },
  { title: "Sunset House on Lake Kivu", city: "Rubavu", address: "Gisenyi, Rubavu", type: "house", price: 58000, guests: 7, perks: ["wifi","parking","tv","ac"] },
  { title: "Waterfront Studio in Rubavu", city: "Rubavu", address: "Rubavu Beach, Rubavu", type: "studio", price: 24000, guests: 2, perks: ["wifi","tv","ac"] },

  // ── Huye (Butare) ────────────────────────────────────────────────────────────
  { title: "University Town House in Huye", city: "Huye", address: "Ngoma Sector, Huye", type: "house", price: 30000, guests: 5, perks: ["wifi","parking","tv"] },
  { title: "Cultural Heritage Cottage", city: "Huye", address: "Tumba Sector, Huye", type: "cottage", price: 25000, guests: 3, perks: ["wifi","tv","pets"] },
  { title: "Modern Apartment near NUR", city: "Huye", address: "Huye Town, Huye", type: "apartment", price: 28000, guests: 3, perks: ["wifi","ac","tv"] },
  { title: "Quiet Studio in Butare", city: "Huye", address: "Ngoma Sector, Huye", type: "studio", price: 16000, guests: 2, perks: ["wifi","tv"] },

  // ── Muhanga (Gitarama) ───────────────────────────────────────────────────────
  { title: "Central Rwanda Family Villa", city: "Muhanga", address: "Gitarama Town, Muhanga", type: "villa", price: 65000, guests: 8, perks: ["wifi","parking","pool","tv","ac"] },
  { title: "Hillside House in Muhanga", city: "Muhanga", address: "Shyogwe Sector, Muhanga", type: "house", price: 35000, guests: 5, perks: ["wifi","parking","tv"] },
  { title: "Traveller's Studio in Gitarama", city: "Muhanga", address: "Muhanga Town, Muhanga", type: "studio", price: 17000, guests: 2, perks: ["wifi","tv"] },

  // ── Nyagatare ────────────────────────────────────────────────────────────────
  { title: "Savanna View Villa in Nyagatare", city: "Nyagatare", address: "Nyagatare Town, Nyagatare", type: "villa", price: 72000, guests: 9, perks: ["wifi","parking","pool","ac","tv"] },
  { title: "Eastern Province House", city: "Nyagatare", address: "Karangazi Sector, Nyagatare", type: "house", price: 33000, guests: 5, perks: ["wifi","parking","tv","pets"] },
  { title: "Budget Cottage in Nyagatare", city: "Nyagatare", address: "Nyagatare Sector, Nyagatare", type: "cottage", price: 20000, guests: 3, perks: ["wifi","tv"] },

  // ── Rusizi (Cyangugu) ────────────────────────────────────────────────────────
  { title: "Border Town Villa in Rusizi", city: "Rusizi", address: "Kamembe Sector, Rusizi", type: "villa", price: 68000, guests: 8, perks: ["wifi","parking","pool","ac","tv"] },
  { title: "Lake Kivu Cottage in Rusizi", city: "Rusizi", address: "Cyangugu, Rusizi", type: "cottage", price: 29000, guests: 4, perks: ["wifi","tv","parking","pets"] },
  { title: "Riverside Apartment in Rusizi", city: "Rusizi", address: "Rusizi Town, Rusizi", type: "apartment", price: 32000, guests: 3, perks: ["wifi","ac","tv"] },

  // ── Kayonza ──────────────────────────────────────────────────────────────────
  { title: "Akagera Gateway House", city: "Kayonza", address: "Kayonza Town, Kayonza", type: "house", price: 38000, guests: 6, perks: ["wifi","parking","tv","pets"] },
  { title: "Safari Cottage near Akagera NP", city: "Kayonza", address: "Rwinkwavu Sector, Kayonza", type: "cottage", price: 45000, guests: 4, perks: ["wifi","parking","tv","pets"] },
  { title: "Eco Studio in Kayonza", city: "Kayonza", address: "Kayonza Sector, Kayonza", type: "studio", price: 18000, guests: 2, perks: ["wifi","tv"] },

  // ── More Kigali premium ──────────────────────────────────────────────────────
  { title: "Sky Loft in Kigali CBD", city: "Kigali", address: "KN 5 Rd, CBD, Kigali", type: "apartment", price: 80000, guests: 4, perks: ["wifi","ac","tv","pool","private"] },
  { title: "Diplomat's Residence in Kiyovu", city: "Kigali", address: "KN 2 Ave, Kiyovu, Kigali", type: "villa", price: 130000, guests: 14, perks: ["wifi","parking","pool","ac","tv","private","pets"] },
  { title: "Compact Studio in Gikondo", city: "Kigali", address: "KK 19 Ave, Gikondo, Kigali", type: "studio", price: 15000, guests: 2, perks: ["wifi","tv"] },
  { title: "Modern Townhouse in Kibagabaga", city: "Kigali", address: "KG 12 St, Kibagabaga, Kigali", type: "house", price: 52000, guests: 6, perks: ["wifi","parking","ac","tv"] },
  { title: "Rooftop Apartment in Kimihurura", city: "Kigali", address: "KG 9 Ave, Kimihurura, Kigali", type: "apartment", price: 62000, guests: 5, perks: ["wifi","ac","tv","pool"] },
  { title: "Green Villa in Nyarutarama", city: "Kigali", address: "KG 6 Ave, Nyarutarama, Kigali", type: "villa", price: 105000, guests: 11, perks: ["wifi","parking","pool","ac","tv","pets"] },
  { title: "Budget House in Gisozi", city: "Kigali", address: "KG 44 St, Gisozi, Kigali", type: "house", price: 27000, guests: 4, perks: ["wifi","parking","tv"] },
  { title: "Luxury Studio in Kacyiru", city: "Kigali", address: "KG 3 Ave, Kacyiru, Kigali", type: "studio", price: 26000, guests: 2, perks: ["wifi","ac","tv"] },
  { title: "Panoramic Villa in Rebero", city: "Kigali", address: "KK 30 Ave, Rebero, Kigali", type: "villa", price: 98000, guests: 10, perks: ["wifi","parking","pool","ac","tv","private"] },
  { title: "Charming Cottage in Nyamata", city: "Kigali", address: "Nyamata Sector, Bugesera", type: "cottage", price: 23000, guests: 3, perks: ["wifi","tv","pets","parking"] },
  { title: "Twin Peaks Villa in Kigali", city: "Kigali", address: "KG 55 Ave, Kibagabaga, Kigali", type: "villa", price: 115000, guests: 12, perks: ["wifi","parking","pool","ac","tv","private"] },
];

const DESCRIPTIONS = {
  villa:     (title, city) => `${title} is a stunning luxury villa nestled in the heart of ${city}, Rwanda. This beautifully designed property offers spacious living areas, premium furnishings, and breathtaking views of the surrounding landscape. Perfect for families or groups seeking a premium Rwandan experience, the villa combines modern comfort with authentic African charm. Enjoy the lush gardens, entertain guests in the open-plan living space, and wake up to the sounds of nature every morning. The property is conveniently located near local restaurants, markets, and cultural attractions, making it an ideal base for exploring everything ${city} has to offer. Our dedicated team ensures your stay is seamless from check-in to check-out.`,
  house:     (title, city) => `Welcome to ${title}, a warm and welcoming family home located in a peaceful neighbourhood in ${city}, Rwanda. This well-maintained property features comfortable bedrooms, a fully equipped kitchen, and a lovely outdoor space perfect for relaxing after a day of exploring. The home is thoughtfully furnished with local crafts and modern amenities to ensure a comfortable stay. Situated within easy reach of local transport links, shops, and restaurants, this house is ideal for both short and extended stays. Whether you are visiting for business or leisure, you will feel right at home in this charming Rwandan residence.`,
  apartment: (title, city) => `${title} is a stylish and contemporary apartment located in one of ${city}'s most sought-after neighbourhoods. The apartment features an open-plan layout with modern furnishings, a fully equipped kitchen, and a comfortable living area. Large windows flood the space with natural light and offer lovely views of the city. The building offers secure access and is conveniently located near public transport, restaurants, and shopping centres. Ideal for couples, solo travellers, or business visitors, this apartment provides everything you need for a comfortable and enjoyable stay in Rwanda.`,
  studio:    (title, city) => `${title} is a smart and efficiently designed studio apartment in ${city}, Rwanda. Perfect for solo travellers or couples, this compact space makes excellent use of every square metre with a comfortable sleeping area, a well-equipped kitchenette, and a modern bathroom. The studio is located in a vibrant neighbourhood with easy access to local cafes, markets, and transport links. Whether you are in ${city} for a short business trip or a longer leisure stay, this studio offers great value and all the essentials for a comfortable visit to Rwanda.`,
  cottage:   (title, city) => `Escape to ${title}, a charming and rustic cottage set in the beautiful surroundings of ${city}, Rwanda. This cosy retreat offers a peaceful and authentic Rwandan experience, surrounded by lush greenery and fresh mountain air. The cottage features comfortable bedrooms, a traditional kitchen, and a lovely outdoor terrace where you can enjoy your morning coffee while taking in the stunning scenery. Ideal for nature lovers, hikers, and those seeking a quiet getaway, the cottage is within easy reach of local attractions and natural wonders. Experience the warmth of Rwandan hospitality in this delightful countryside retreat.`,
};

const EXTRA_INFO = {
  villa:     "Check-in from 14:00, check-out by 11:00. A security deposit of RWF 50,000 is required on arrival. No smoking inside the property. Parties and events require prior approval. A dedicated housekeeper is available on request.",
  house:     "Check-in from 13:00, check-out by 10:00. Please respect quiet hours between 22:00 and 07:00. Pets are welcome with prior notice. Parking available in the compound. Please leave the property in the same condition as found.",
  apartment: "Check-in from 14:00, check-out by 11:00. No smoking on the premises. The building has 24-hour security. Please do not disturb other residents. Luggage storage available on request.",
  studio:    "Check-in from 12:00, check-out by 10:00. No smoking. Ideal for 1-2 guests. Please keep noise to a minimum after 21:00. Self check-in available with prior arrangement.",
  cottage:   "Check-in from 15:00, check-out by 11:00. Pets welcome. Please bring warm clothing as evenings can be cool. Firewood is provided. No loud music after 21:00. Enjoy the outdoor braai area.",
};

// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("✅ Connected to MongoDB");

  // 1. Upsert the landlord user
  const salt = bcrypt.genSaltSync(10);
  let owner = await User.findOne({ email: "quipio2026@gmail.com" });
  if (!owner) {
    owner = await User.create({
      name: "HomeStays Rwanda",
      email: "quipio2026@gmail.com",
      password: bcrypt.hashSync("12345678", salt),
      role: "landlord",
    });
    console.log("✅ Landlord user created");
  } else {
    // make sure role is landlord
    owner.role = "landlord";
    owner.password = bcrypt.hashSync("12345678", salt);
    await owner.save();
    console.log("✅ Landlord user updated");
  }

  // 2. Remove existing places owned by this user so we start fresh
  await Place.deleteMany({ owner: owner._id });
  console.log("🗑  Cleared existing places for this owner");

  // 3. Insert all 50 properties
  const docs = PROPERTIES.map((p) => ({
    owner: owner._id,
    title: p.title,
    address: p.address,
    city: p.city,
    country: "Rwanda",
    propertyType: p.type,
    photos: PHOTOS[p.type],
    description: DESCRIPTIONS[p.type](p.title, p.city),
    perks: p.perks,
    extraInfo: EXTRA_INFO[p.type],
    maxGuests: p.guests,
    price: p.price,
    bookedDates: [],
  }));

  await Place.insertMany(docs);
  console.log(`✅ Inserted ${docs.length} properties`);

  await mongoose.disconnect();
  console.log("✅ Done — disconnected from MongoDB");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
