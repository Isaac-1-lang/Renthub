import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../Context/userContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../Components/Spinner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(UserContext);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post("/user/login", { email, password });
      setUser(data);
      handleRedirect("/");
    } catch (e) {
      if (e.response?.status === 422)
        toast.error("Wrong password.");
      else if (e.response?.status === 404)
        toast.info("Email not found. Please register first.");
      else
        toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-[90%] border py-2 px-3 my-2 rounded-2xl border-gray-300 xs:w-[400px] outline-none focus:border-brand";

  return (
    <div className="mt-5 pt-6 grow flex-col items-center">
      {loading ? <Spinner /> : (
        <>
          <h1 className="text-3xl text-center mb-1 font-bold">Welcome back</h1>
          <p className="text-center text-gray-400 text-sm mb-5">Sign in to RentHub Rwanda</p>
          <form className="flex flex-col items-center justify-center" onSubmit={handleLogin}>
            <input type="email" placeholder="your@email.com" className={inputCls}
              value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className={inputCls}
              value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button className="bg-brand p-2 w-[90%] text-white rounded-2xl mt-2 hover:bg-brand-dark hover:scale-95 font-semibold transition-all xs:w-[400px]">
              Login
            </button>
            <div className="text-center mt-2 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-brand underline font-medium">Register now</Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default LoginPage;
