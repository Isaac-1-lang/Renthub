import { useEffect, useState, useRef, useContext } from "react";
import Perks from "../Components/Perks";
import PhotosUploader from "../Components/PhotosUploader";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../Context/userContext";
import { formatRWF } from "../utils/currency";

const PROPERTY_TYPES = ["house", "apartment", "villa", "studio", "cottage"];

const InputHeading = ({ text }) => (
  <label className="font-semibold text-xl block mt-4 mb-0.5">{text}</label>
);
const InputDesc = ({ text }) => (
  <p className="text-gray-500 text-sm mb-1">{text}</p>
);

const AddPlacePage = () => {
  const { id } = useParams();
  const { isLandlord } = useContext(UserContext);
  const [redirect, setRedirect] = useState(false);
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Rwanda");
  const [propertyType, setPropertyType] = useState("house");
  const [photoLink, setPhotoLink] = useState("");
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState("");
  const descRef = useRef();

  if (!isLandlord) return <Navigate to="/account" />;

  useEffect(() => {
    if (id) {
      axios.get(`/place/${id}`).then(({ data }) => {
        setTitle(data.title);
        setAddress(data.address);
        setCity(data.city || "");
        setCountry(data.country || "Rwanda");
        setPropertyType(data.propertyType || "house");
        setDescription(data.description);
        setAddedPhotos(data.photos);
        setPerks(data.perks);
        setExtraInfo(data.extraInfo);
        setMaxGuests(data.maxGuests);
        setPrice(data.price);
      });
    }
  }, [id]);

  const addNewPlace = async (e) => {
    e.preventDefault();
    if (addedPhotos.length < 3) { toast.info("Upload at least 3 photos"); return; }
    if (description.split(" ").length <= 50) {
      descRef.current.focus();
      toast.info("Description should be at least 50 words");
      return;
    }
    try {
      const payload = { title, address, city, country, propertyType, addedPhotos, description, perks, extraInfo, maxGuests, price };
      if (id) {
        await axios.put("/place", { id, ...payload });
        toast.success("Place updated!");
      } else {
        await axios.post("/place", payload);
        toast.success("Place added!");
      }
      setRedirect(true);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  if (redirect) return <Navigate to="/account/places" />;

  const inputCls = "w-full rounded-xl py-2 px-4 border border-gray-300 mb-3 outline-none focus:border-brand";

  return (
    <form onSubmit={addNewPlace} className="px-2 md:px-8 pb-8">
      <h2 className="text-2xl font-bold mb-4 mt-2">{id ? "Edit Place" : "Add New Place"}</h2>

      <InputHeading text="Title" />
      <InputDesc text="Short and catchy title for your listing" />
      <input type="text" placeholder="e.g. Cozy Villa in Kigali" className={inputCls}
        value={title} onChange={(e) => setTitle(e.target.value)} required />

      <InputHeading text="Property Type" />
      <InputDesc text="What kind of property is this?" />
      <div className="flex flex-wrap gap-2 mb-3">
        {PROPERTY_TYPES.map((type) => (
          <button key={type} type="button" onClick={() => setPropertyType(type)}
            className={`px-4 py-1.5 rounded-full border capitalize text-sm font-medium transition-all ${
              propertyType === type ? "bg-brand text-white border-brand" : "border-gray-300 hover:border-brand"
            }`}>
            {type}
          </button>
        ))}
      </div>

      <InputHeading text="Location" />
      <InputDesc text="Full address, city and country" />
      <input type="text" placeholder="Street address e.g. KG 123 St, Kigali" className={inputCls}
        value={address} onChange={(e) => setAddress(e.target.value)} required />
      <div className="flex gap-3">
        <input type="text" placeholder="City / District e.g. Kigali" className={inputCls + " flex-1"}
          value={city} onChange={(e) => setCity(e.target.value)} required />
        <input type="text" placeholder="Country" className={inputCls + " flex-1"}
          value={country} onChange={(e) => setCountry(e.target.value)} required />
      </div>

      <InputHeading text="Photos" />
      <InputDesc text="Add at least 3 photos for better visibility" />
      <PhotosUploader photoLink={photoLink} setPhotoLink={setPhotoLink}
        addedPhotos={addedPhotos} setAddedPhotos={setAddedPhotos} />

      <InputHeading text="Description" />
      <InputDesc text="Describe your place (at least 50 words)" />
      <textarea rows={5} className={inputCls} ref={descRef}
        value={description} onChange={(e) => setDescription(e.target.value)} required />

      <InputHeading text="Perks & Amenities" />
      <InputDesc text="Select all that apply" />
      <Perks perks={perks} setPerks={setPerks} />

      <InputHeading text="Extra Info" />
      <InputDesc text="House rules, check-in instructions, etc. (optional)" />
      <textarea rows={4} className={inputCls}
        value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)} />

      <div className="flex flex-col gap-3 mt-2 md:flex-row">
        <div className="flex-1">
          <InputHeading text="Max Guests" />
          <InputDesc text="Maximum guests at one time" />
          <input type="number" min={1} className={inputCls}
            value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} required />
        </div>
        <div className="flex-1">
          <InputHeading text="Price per Night (RWF)" />
          <InputDesc text="Set a fair nightly rate in Rwandan Francs" />
          <input type="number" min={1} className={inputCls}
            value={price} onChange={(e) => setPrice(e.target.value)} required />
          {price && (
            <p className="text-xs text-gray-400 -mt-2">
              Guest pays {formatRWF(Math.round(price * 1.18))} / night incl. 18% VAT
            </p>
          )}
        </div>
      </div>

      <button type="submit"
        className="bg-brand w-full rounded-2xl text-white py-3 font-semibold text-lg mt-5 hover:bg-brand-dark hover:scale-95 transition-all">
        {id ? "Update Place" : "Save Place"}
      </button>
    </form>
  );
};

export default AddPlacePage;
