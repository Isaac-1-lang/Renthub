import React, { useState } from "react";

const PERKS_OPTIONS = ["wifi", "parking", "tv", "pets", "pool", "ac"];
const PROPERTY_TYPES = ["house", "apartment", "villa", "studio", "cottage"];

// Rwanda's main cities / districts
const RWANDA_CITIES = ["Kigali", "Musanze", "Rubavu", "Huye", "Muhanga", "Nyagatare", "Rusizi", "Kayonza"];

export default function SearchFilters({ onFilter }) {
  const [open, setOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [selectedPerks, setSelectedPerks] = useState([]);

  const togglePerk = (perk) =>
    setSelectedPerks((prev) =>
      prev.includes(perk) ? prev.filter((p) => p !== perk) : [...prev, perk]
    );

  const applyFilters = () => {
    onFilter({ minPrice, maxPrice, city, propertyType, perks: selectedPerks.join(",") });
    setOpen(false);
  };

  const clearFilters = () => {
    setMinPrice(""); setMaxPrice(""); setCity("");
    setPropertyType(""); setSelectedPerks([]);
    onFilter({});
    setOpen(false);
  };

  const activeCount = [minPrice, maxPrice, city, propertyType, ...selectedPerks].filter(Boolean).length;

  const btnBase = "px-3 py-1 rounded-full text-sm border capitalize transition-all";
  const btnActive = "bg-brand text-white border-brand";
  const btnInactive = "border-gray-300 text-gray-600 hover:border-brand";

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border-2 border-gray-300 rounded-full px-4 py-2 text-sm font-semibold hover:border-brand transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="bg-brand text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-12 left-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-5 w-[320px]">
          <h3 className="font-bold text-lg mb-4">Filter Properties</h3>

          {/* City — Rwanda districts */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-600 block mb-1">City / District</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {RWANDA_CITIES.map((c) => (
                <button key={c} type="button" onClick={() => setCity(city === c ? "" : c)}
                  className={`${btnBase} ${city === c ? btnActive : btnInactive} text-xs`}>
                  {c}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Or type a location..."
              value={city} onChange={(e) => setCity(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          {/* Price range in RWF */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-600 block mb-1">Price per night (RWF)</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand" />
              <input type="number" placeholder="Max" value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
          </div>

          {/* Property type */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-600 block mb-1">Property Type</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button key={type} type="button"
                  onClick={() => setPropertyType(propertyType === type ? "" : type)}
                  className={`${btnBase} ${propertyType === type ? btnActive : btnInactive}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-gray-600 block mb-1">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {PERKS_OPTIONS.map((perk) => (
                <button key={perk} type="button" onClick={() => togglePerk(perk)}
                  className={`${btnBase} ${selectedPerks.includes(perk) ? btnActive : btnInactive}`}>
                  {perk}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={applyFilters}
              className="flex-1 bg-brand text-white rounded-xl py-2 font-semibold text-sm hover:bg-brand-dark transition-all">
              Apply
            </button>
            <button onClick={clearFilters}
              className="flex-1 border border-gray-300 rounded-xl py-2 font-semibold text-sm hover:border-brand transition-all">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
