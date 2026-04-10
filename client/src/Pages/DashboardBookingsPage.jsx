import { useContext, useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../Context/userContext";
import Spinner from "../Components/Spinner";
import Image from "../Components/Image";
import { formatRWF } from "../utils/currency";
import { toast } from "react-toastify";

const STATUS_STYLES = {
  pending:  "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const PAYMENT_STYLES = {
  paid:   "bg-green-50 text-green-600",
  unpaid: "bg-gray-100 text-gray-500",
};

export default function DashboardBookingsPage() {
  const { user, isLandlord } = useContext(UserContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all"); // all | pending | accepted | rejected

  if (!user) return <Navigate to="/login" />;
  if (!isLandlord) return <Navigate to="/account" />;

  const fetchBookings = () => {
    axios.get("/booking/landlord")
      .then(({ data }) => setBookings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (bookingId, status) => {
    try {
      await axios.patch(`/booking/${bookingId}/status`, { status });
      setBookings(prev =>
        prev.map(b => b._id === bookingId ? { ...b, status } : b)
      );
      toast.success(`Booking ${status}`);
    } catch (err) {
      toast.error("Failed to update booking");
      console.error(err.message);
    }
  };

  if (loading) return <Spinner />;

  const displayed = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const counts = {
    all:      bookings.length,
    pending:  bookings.filter(b => b.status === "pending").length,
    accepted: bookings.filter(b => b.status === "accepted").length,
    rejected: bookings.filter(b => b.status === "rejected").length,
  };

  const totalRevenue = bookings.filter(b => b.status === "accepted")
    .reduce((s, b) => s + (b.totalPrice || 0), 0);
  const totalVat = bookings.filter(b => b.status === "accepted")
    .reduce((s, b) => s + (b.taxAmount || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-brand hover:underline text-sm">← Dashboard</Link>
        <h1 className="text-2xl font-bold">Booking Requests</h1>
        {counts.pending > 0 && (
          <span className="bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {counts.pending} pending
          </span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",    value: counts.all,      color: "bg-white" },
          { label: "Pending",  value: counts.pending,  color: "bg-yellow-50" },
          { label: "Accepted", value: counts.accepted, color: "bg-green-50" },
          { label: "Rejected", value: counts.rejected, color: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 shadow-sm border border-gray-100 text-center`}>
            <p className="text-gray-500 text-xs">{s.label}</p>
            <p className="font-bold text-xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue (accepted only) */}
      {totalRevenue > 0 && (
        <div className="bg-brand-light rounded-2xl p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Confirmed Revenue</p>
            <p className="font-bold text-xl text-brand">{formatRWF(totalRevenue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">VAT (18%)</p>
            <p className="font-semibold text-blue-400">{formatRWF(totalVat)}</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "pending", "accepted", "rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all border
              ${filter === f ? "bg-brand text-white border-brand" : "bg-white border-gray-200 text-gray-600 hover:border-brand"}`}>
            {f} {counts[f] > 0 && <span className="ml-1 opacity-70">({counts[f]})</span>}
          </button>
        ))}
      </div>

      {/* Booking list */}
      {displayed.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No bookings in this category.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((booking) => (
            <div key={booking._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
              {/* Photo */}
              <div className="w-full sm:w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                <Image src={booking.place?.photos?.[0]} alt="" className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="font-semibold truncate">{booking.place?.title}</p>
                  <div className="flex gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[booking.status]}`}>
                      {booking.status}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${PAYMENT_STYLES[booking.paymentStatus]}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">{booking.user?.name}</span>
                  {booking.user?.email && <span className="ml-1 text-gray-400 text-xs">({booking.user.email})</span>}
                </p>
                <p className="text-sm text-gray-500">
                  📅 {booking.checkIn} → {booking.checkOut} · 👥 {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? "s" : ""}
                </p>
                {booking.phone && (
                  <p className="text-xs text-gray-400">📞 {booking.phone}</p>
                )}

                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-brand">{formatRWF(booking.totalPrice)}</span>
                    <span className="text-xs text-gray-400 ml-1">incl. {formatRWF(booking.taxAmount)} VAT</span>
                  </div>

                  {/* Action buttons — only for pending */}
                  {booking.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(booking._id, "accepted")}
                        className="flex items-center gap-1 px-4 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                          strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(booking._id, "rejected")}
                        className="flex items-center gap-1 px-4 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                          strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  )}

                  {booking.status === "accepted" && (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Confirmed
                    </span>
                  )}

                  {booking.status === "rejected" && (
                    <span className="text-xs text-red-500 font-semibold">Declined</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
