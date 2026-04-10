import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays, parse, format } from "date-fns";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/userContext";
import DatePickerRange from "./DatePicker";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CancelBookingsWidget from "./CancelBookingsWidget";
import Input from "react-phone-number-input/input";
import 'react-phone-number-input/style.css';
import emailjs from "@emailjs/browser";
import { formatRWF } from "../utils/currency";
import PaymentModal from "./PaymentModal";

const VAT_RATE = 0.18;

const formattedDate = (date) =>
  format(parse(date.toString(), "dd/MM/yyyy", new Date()), "dd/MM/yyyy");

export default function BookingWidget({ place }) {
  const [checkIn, setCheckIn]               = useState("");
  const [checkOut, setCheckOut]             = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName]                     = useState("");
  const [phone, setPhone]                   = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [showPayment, setShowPayment]       = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) setName(user.name);
    if (user) {
      axios.get(`/booking/${place._id}`)
        .then(({ data }) => setBookingDetails(data || null))
        .catch(() => {});
    }
  }, [user, place]);

  useEffect(() => emailjs.init("LO_eOCMgdi9cKdqm0"), []);

  let numberOfNights = 0;
  if (checkIn && checkOut) {
    const d1 = parse(checkIn.toString(), "dd/MM/yyyy", new Date());
    const d2 = parse(checkOut.toString(), "dd/MM/yyyy", new Date());
    numberOfNights = differenceInCalendarDays(d2, d1) + 1;
  }

  const basePrice  = numberOfNights * place.price;
  const vatAmount  = parseFloat((basePrice * VAT_RATE).toFixed(2));
  const totalPrice = parseFloat((basePrice + vatAmount).toFixed(2));

  // called when user clicks "Book this place" — validates then opens payment modal
  function handleBookClick() {
    if (!user) {
      toast.warning("Login is required for booking");
      sessionStorage.setItem("redirectUrl", `/place/${place._id}`);
      navigate("/login");
      return;
    }
    if (user._id == place.owner || user.id == place.owner)
      return toast.error("You cannot book your own hosted place");
    if (numberOfGuests > place.maxGuests)
      return toast.error(`Maximum ${place.maxGuests} guests allowed`);
    if (!checkIn || !checkOut)
      return toast.error("Please select check-in and check-out dates");
    if (!name.trim())
      return toast.error("Full name is required");
    if (!phone)
      return toast.error("Phone number is required");

    setShowPayment(true);
  }

  // called after dummy payment succeeds
  async function onPaymentSuccess(paymentId) {
    setShowPayment(false);
    try {
      const { data: booking } = await axios.post("/booking", {
        checkIn: formattedDate(checkIn),
        checkOut: formattedDate(checkOut),
        numberOfGuests, name, phone,
        place: place._id,
        price: basePrice,
        paymentId,
      });
      await axios.put("/user/bookings", { bookingId: booking._id, bookedPlace: place._id });
      await axios.put(`/place/${place._id}`, {
        checkIn: formattedDate(checkIn),
        checkOut: formattedDate(checkOut),
      });
      toast.success("Booking request sent! Awaiting landlord approval.");
      navigate("/account/bookings");
      // fire-and-forget emails
      sendMailToVisitor().catch(() => {});
      sendMailToHost().catch(() => {});
    } catch (err) {
      toast.error("Booking failed. Please try again.");
      console.error(err.message);
    }
  }

  async function sendMailToHost() {
    const { data } = await axios.get(`/user/details/${place.owner}`);
    await emailjs.send("RentHub", "template_host", {
      toName: data.name, toEmail: data.email,
      subject: "New Booking Request",
      message: `"${place.title}" has a new booking request for ${checkIn} → ${checkOut} by ${user.name}. Please review and accept or reject it from your dashboard.`,
      gratitudeMessage: "Thank you for hosting with HomeStays Rwanda.",
    });
  }

  async function sendMailToVisitor() {
    await emailjs.send("RentHub", "template_visitor", {
      subject: "Booking Request Received", toName: name, toEmail: user.email,
      propertyName: place.title, checkIn, checkOut, numberOfGuests,
      message: `Your booking request for "${place.title}" has been received and is pending landlord approval. Total: ${formatRWF(totalPrice)} (incl. 18% VAT).`,
      paymentMessage: "Payment has been processed. You will be notified once the landlord confirms.",
    });
  }

  const inputCls = "py-1.5 px-3 outline-none border rounded-lg border-gray-300 text-sm focus:border-brand w-full";

  return (
    <>
      {showPayment && (
        <PaymentModal
          totalPrice={totalPrice}
          onSuccess={onPaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      {bookingDetails ? (
        <CancelBookingsWidget
          placeId={place._id}
          bookingDetails={bookingDetails}
          setBookingDetails={setBookingDetails}
          placeTitle={place.title}
          placeOwner={place.owner}
        />
      ) : (
        <div className="bg-white shadow py-4 px-4 rounded-2xl flex flex-col gap-3 min-w-[280px]">
          {/* Price */}
          <div className="text-center">
            <span className="text-2xl font-bold text-brand">{formatRWF(place.price)}</span>
            <span className="text-gray-500 text-sm"> / night</span>
          </div>

          {/* Dates + guests */}
          <div className="border rounded-xl overflow-hidden">
            <div className="flex justify-center py-2 px-1">
              <DatePickerRange
                setCheckIn={setCheckIn}
                setCheckOut={setCheckOut}
                disabledDates={place.bookedDates}
              />
            </div>
            <div className="p-3 border-t flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Number of guests</label>
              <input type="number" min={1} max={place.maxGuests}
                value={numberOfGuests} className={inputCls}
                onChange={(ev) => setNumberOfGuests(ev.target.value)} />
              <p className="text-xs text-gray-400">Max {place.maxGuests} guests</p>
            </div>
          </div>

          {/* Guest details */}
          <div className="border rounded-xl p-3 flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Your details</p>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Full name</label>
              <input type="text" value={name} placeholder="Enter your full name"
                className={inputCls} onChange={(ev) => setName(ev.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Phone number</label>
              <Input defaultCountry="RW" placeholder="+250 7XX XXX XXX"
                value={phone} onChange={setPhone} className={inputCls} />
              <p className="text-xs text-gray-400">We'll contact you on this number</p>
            </div>
          </div>

          {/* VAT breakdown */}
          {numberOfNights > 0 && (
            <div className="bg-brand-light rounded-xl p-3 text-sm flex flex-col gap-1.5">
              <div className="flex justify-between text-gray-600">
                <span>{formatRWF(place.price)} × {numberOfNights} night{numberOfNights > 1 ? "s" : ""}</span>
                <span>{formatRWF(basePrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT (18%)</span>
                <span>{formatRWF(vatAmount)}</span>
              </div>
              <div className="border-t border-blue-200 pt-1.5 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-brand">{formatRWF(totalPrice)}</span>
              </div>
            </div>
          )}

          <button onClick={handleBookClick}
            className="w-full py-3 bg-brand text-white font-semibold rounded-2xl hover:bg-brand-dark transition-all hover:scale-105">
            {numberOfNights > 0 ? `Pay & Request — ${formatRWF(totalPrice)}` : "Book this place"}
          </button>

          {(!checkIn || !checkOut) && (
            <p className="text-center text-brand text-xs italic">
              Select dates above to see the total price
            </p>
          )}
        </div>
      )}
    </>
  );
}
