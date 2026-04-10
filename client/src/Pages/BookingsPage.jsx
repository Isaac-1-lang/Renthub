import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import BookingDates from "../Components/BookingDates";
import NoBookings from "../Components/NoBookings";
import Spinner from "../Components/Spinner";
import Image from "../Components/Image";
import { formatRWF } from "../utils/currency";

const STATUS_STYLES = {
  pending:  { cls: "bg-yellow-100 text-yellow-700", label: "⏳ Pending approval" },
  accepted: { cls: "bg-green-100 text-green-700",   label: "✅ Confirmed" },
  rejected: { cls: "bg-red-100 text-red-600",       label: "❌ Declined" },
};

const PAYMENT_STYLES = {
  paid:   "bg-green-50 text-green-600",
  unpaid: "bg-gray-100 text-gray-500",
};

const BookingsPage = () => {
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    axios.get("/booking/account")
      .then(({ data }) => setBookings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col items-center w-full px-2 gap-4">
      {bookings && bookings.length > 0 ? (
        bookings.map(booking => {
          const statusInfo = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
          return (
            <div key={booking._id}
              className="w-full max-w-[650px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Link to={`/place/${booking.place._id}`} className="flex gap-3">
                <div className="w-36 sm:w-48 h-32 shrink-0">
                  <Image src={booking.place.photos[0]} alt="booking"
                    className="h-full w-full object-cover" />
                </div>
                <div className="py-3 pr-3 flex-1 min-w-0">
                  <h2 className="font-semibold text-sm sm:text-base leading-tight truncate">
                    {booking.place.title}
                  </h2>
                  <BookingDates booking={booking}
                    className="mt-1 text-gray-500 text-xs sm:text-sm" />
                  <div className="mt-1">
                    <span className="font-bold text-brand text-sm">
                      {formatRWF(booking.totalPrice || booking.price)}
                    </span>
                    {booking.taxAmount > 0 && (
                      <span className="text-xs text-gray-400 ml-1">
                        incl. {formatRWF(booking.taxAmount)} VAT
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Status bar */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.cls}`}>
                  {statusInfo.label}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${PAYMENT_STYLES[booking.paymentStatus || "unpaid"]}`}>
                  {booking.paymentStatus === "paid" ? "💳 Paid" : "Unpaid"}
                </span>
              </div>

              {/* Rejection message */}
              {booking.status === "rejected" && (
                <div className="px-3 py-2 bg-red-50 text-xs text-red-500 border-t border-red-100">
                  Your booking was declined by the landlord. You may book another property.
                </div>
              )}
            </div>
          );
        })
      ) : (
        <NoBookings />
      )}
    </div>
  );
};

export default BookingsPage;
