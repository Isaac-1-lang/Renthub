import { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../Context/userContext";
import Spinner from "../Components/Spinner";
import Image from "../Components/Image";
import { formatRWF } from "../utils/currency";

const StatCard = ({ label, value, sub, icon }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div className="bg-brand-light text-brand rounded-xl p-3 text-2xl shrink-0">{icon}</div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const BookingRow = ({ booking }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-200">
      <Image src={booking.place?.photos?.[0]} alt="" className="w-full h-full object-cover" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm truncate">{booking.place?.title}</p>
      <p className="text-xs text-gray-500">{booking.user?.name} · {booking.checkIn} → {booking.checkOut}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="font-bold text-sm text-brand">{formatRWF(booking.totalPrice)}</p>
      <p className="text-xs text-gray-400">{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? "s" : ""}</p>
    </div>
  </div>
);

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

export default function LandlordDashboard() {
  const { user, isLandlord } = useContext(UserContext);
  const [places, setPlaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user) return <Navigate to="/login" />;
  if (!isLandlord) return <Navigate to="/account" />;

  useEffect(() => {
    Promise.all([axios.get("/place/account"), axios.get("/booking/landlord")])
      .then(([p, b]) => { setPlaces(p.data); setBookings(b.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const totalRevenue = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
  const totalVat = bookings.reduce((s, b) => s + (b.taxAmount || 0), 0);
  const occupiedIds = new Set(bookings.map((b) => b.place?._id?.toString()));
  const occupancyRate = places.length ? Math.round((occupiedIds.size / places.length) * 100) : 0;
  const recentBookings = [...bookings].reverse().slice(0, 6);
  const pendingCount = bookings.filter(b => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 min-h-screen py-6 px-4 gap-1 shrink-0">
          <div className="flex items-center gap-2 px-2 mb-5">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white text-sm font-bold">H</div>
            <div>
              <p className="font-bold text-sm leading-none">HomeStays</p>
              <p className="text-xs text-gray-400">Rwanda</p>
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Menu</p>
          {[
            { label: "Overview",      icon: "🏠", to: "/dashboard" },
            { label: "My Properties", icon: "🏢", to: "/account/places" },
            { label: "Bookings",      icon: "📅", to: "/dashboard/bookings", badge: pendingCount },
            { label: "Profile",       icon: "👤", to: "/account" },
          ].map((item) => (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-light hover:text-brand transition-all">
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="mt-auto">
            <Link to="/" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-brand transition-all">
              ← Back to listings
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Good {getGreeting()},{" "}
              <span className="text-brand">{user.name?.split(" ")[0]}!</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's your property overview — Rwanda.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Properties" value={places.length} icon="🏠" />
            <StatCard label="Total Bookings" value={bookings.length}
              sub={pendingCount > 0 ? `${pendingCount} pending review` : "all reviewed"}
              icon="📅" />
            <StatCard label="Occupancy Rate" value={`${occupancyRate}%`}
              sub="of your properties booked" icon="📊" />
            <StatCard label="Total Revenue" value={formatRWF(totalRevenue)}
              sub={`incl. ${formatRWF(totalVat)} VAT`} icon="💰" />
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Properties */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">My Properties</h2>
                <Link to="/account/places/new" className="text-sm text-brand font-semibold hover:underline">
                  + Add new
                </Link>
              </div>
              {places.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No properties yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {places.slice(0, 5).map((place) => (
                    <div key={place._id} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                        <Image src={place.photos?.[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{place.title}</p>
                        <p className="text-xs text-gray-500 truncate">{place.city || place.address}</p>
                        <p className="text-xs text-brand font-medium">{formatRWF(place.price)} / night</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 text-xs">
                        <Link to={`/place/${place._id}`} className="text-brand hover:underline">View</Link>
                        <Link to={`/account/places/${place._id}`} className="text-gray-500 hover:underline">Edit</Link>
                      </div>
                    </div>
                  ))}
                  {places.length > 5 && (
                    <Link to="/account/places" className="text-sm text-brand font-semibold text-center hover:underline">
                      View all {places.length} properties →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Recent Bookings</h2>
                <Link to="/dashboard/bookings" className="text-sm text-brand font-semibold hover:underline">
                  View all
                </Link>
              </div>
              {recentBookings.length === 0
                ? <p className="text-gray-400 text-sm text-center py-6">No bookings yet.</p>
                : recentBookings.map((b) => <BookingRow key={b._id} booking={b} />)
              }
            </div>
          </div>

          {/* Revenue breakdown */}
          {bookings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-6">
              <h2 className="font-bold text-lg mb-4">Revenue Breakdown</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-xs mb-1">Base Revenue</p>
                  <p className="font-bold text-lg">{formatRWF(totalRevenue - totalVat)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-xs mb-1">VAT Collected (18%)</p>
                  <p className="font-bold text-lg text-blue-400">{formatRWF(totalVat)}</p>
                </div>
                <div className="bg-brand-light rounded-xl p-4">
                  <p className="text-gray-500 text-xs mb-1">Total Collected</p>
                  <p className="font-bold text-lg text-brand">{formatRWF(totalRevenue)}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
