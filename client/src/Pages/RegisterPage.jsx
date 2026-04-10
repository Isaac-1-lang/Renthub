import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../Components/Spinner";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("guest");
  const [loading, setLoading] = useState(false);
  const confirmPasswordRef = useRef();
  const navigate = useNavigate();

  function handleRedirect(fallbackUrl) {
    const redirectUrl = sessionStorage.getItem("redirectUrl");
    if (redirectUrl) {
      sessionStorage.removeItem("redirectUrl");
      navigate(redirectUrl);
    } else {
      navigate(fallbackUrl);
    }
  }

  const registerUser = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords didn't match");
      confirmPasswordRef.current.focus();
      return;
    }
    try {
      setLoading(true);
      await axios.post("/user/register", { name, email: email.toLowerCase(), password, role });
      toast.success("Account created!");
      handleRedirect("/login");
    } catch (error) {
      if (error?.response?.data?.code === 11000)
        toast.info("Email already registered. Try logging in.");
      else
        toast.error("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-[90%] border py-2 px-3 my-2 rounded-2xl border-gray-300 xs:w-[400px] outline-none focus:border-brand";

  return (
    <div className="py-4 grow flex-col items-center">
      {loading ? <Spinner /> : (
        <>
          <h1 className="text-3xl text-center mb-2 font-bold">Create Account</h1>
          <p className="text-center text-gray-400 text-sm mb-5">Join RentHub Rwanda</p>

          {/* Role selector */}
          <div className="flex justify-center gap-4 mb-4">
            {[
              { value: "guest", label: "🧳 I'm a Guest", desc: "Browse and book properties" },
              { value: "landlord", label: "🏠 I'm a Landlord", desc: "List and manage properties" },
            ].map(({ value, label, desc }) => (
              <button key={value} type="button" onClick={() => setRole(value)}
                className={`px-5 py-3 rounded-2xl font-semibold border-2 transition-all text-sm flex flex-col items-center gap-0.5 ${
                  role === value
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand"
                }`}>
                <span>{label}</span>
                <span className={`text-xs font-normal ${role === value ? "text-blue-100" : "text-gray-400"}`}>
                  {desc}
                </span>
              </button>
            ))}
          </div>

          <form className="flex flex-col items-center justify-center" onSubmit={registerUser}>
            <input type="text" placeholder="Full name" className={inputCls}
              value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="email" placeholder="your@email.com" className={inputCls}
              value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className={inputCls}
              value={password} onChange={(e) => setPassword(e.target.value)} required />
            <input type="password" placeholder="Confirm password"
              className={`${inputCls} ${password.length === 0 ? "cursor-not-allowed opacity-60" : ""}`}
              value={confirmPassword} disabled={password.length === 0}
              onChange={(e) => setConfirmPassword(e.target.value)}
              ref={confirmPasswordRef} required />

            <button className="bg-brand p-2 text-white rounded-2xl mt-2 hover:bg-brand-dark hover:scale-95 transition-all w-[90%] xs:max-w-[400px] font-semibold">
              Register as {role === "landlord" ? "Landlord" : "Guest"}
            </button>
            <div className="text-center mt-2 text-sm">
              Already a member?{" "}
              <Link to="/login" className="text-brand underline font-medium">Login</Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default RegisterPage;
