import { useState } from "react";
import { formatRWF } from "../utils/currency";

// Dummy Stripe-style payment modal
// In production replace with real @stripe/react-stripe-js Elements
export default function PaymentModal({ totalPrice, onSuccess, onClose }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry]         = useState("");
  const [cvc, setCvc]               = useState("");
  const [name, setName]             = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState("");

  // format card number as groups of 4
  const handleCard = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
  };

  // format expiry MM/YY
  const handleExpiry = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    setExpiry(digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits);
  };

  const validate = () => {
    if (cardNumber.replace(/\s/g, "").length < 16) return "Enter a valid 16-digit card number";
    if (expiry.length < 5) return "Enter a valid expiry date (MM/YY)";
    if (cvc.length < 3)    return "Enter a valid CVC";
    if (!name.trim())      return "Enter the cardholder name";
    return null;
  };

  const handlePay = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setProcessing(true);
    // simulate a 1.5s network call
    await new Promise(r => setTimeout(r, 1500));
    // generate a fake payment intent id
    const fakePaymentId = "pi_" + Math.random().toString(36).slice(2, 18).toUpperCase();
    setProcessing(false);
    onSuccess(fakePaymentId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {/* Stripe-style logo */}
            <div className="bg-[#635BFF] text-white text-xs font-bold px-2 py-1 rounded">stripe</div>
            <span className="text-sm text-gray-500">Secure payment</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Amount */}
        <div className="bg-brand-light rounded-xl p-4 mb-5 text-center">
          <p className="text-xs text-gray-500 mb-1">Amount due</p>
          <p className="text-2xl font-bold text-brand">{formatRWF(totalPrice)}</p>
          <p className="text-xs text-gray-400 mt-0.5">incl. 18% VAT</p>
        </div>

        {/* Card form */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Cardholder name</label>
            <input type="text" placeholder="John Doe"
              value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Card number</label>
            <div className="relative">
              <input type="text" placeholder="1234 5678 9012 3456"
                value={cardNumber} onChange={e => handleCard(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand pr-16" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <div className="w-6 h-4 bg-red-500 rounded-sm opacity-80" />
                <div className="w-6 h-4 bg-yellow-400 rounded-sm opacity-80 -ml-2" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Expiry</label>
              <input type="text" placeholder="MM/YY"
                value={expiry} onChange={e => handleExpiry(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600 block mb-1">CVC</label>
              <input type="text" placeholder="123" maxLength={4}
                value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button onClick={handlePay} disabled={processing}
            className={`w-full py-3 rounded-2xl font-semibold text-white transition-all mt-1
              ${processing ? "bg-gray-400 cursor-not-allowed" : "bg-brand hover:bg-brand-dark hover:scale-105"}`}>
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Processing…
              </span>
            ) : `Pay ${formatRWF(totalPrice)}`}
          </button>

          <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Secured by Stripe · Demo mode
          </p>
        </div>
      </div>
    </div>
  );
}
