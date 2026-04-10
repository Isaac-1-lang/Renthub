import React, { useRef, useState } from "react";
import Image from "./Image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// ── Direct browser → Cloudinary unsigned upload ───────────────────────────────
// 1. Go to https://console.cloudinary.com → Settings → Upload → Upload presets
// 2. Create a preset, set Signing Mode = "Unsigned", note the preset name
// 3. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in client/.env
const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const uploadFileToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "homestays-rwanda");

  const { data } = await axios.post(CLOUDINARY_URL, formData, {
    // do NOT send cookies / auth headers to Cloudinary
    withCredentials: false,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.secure_url;
};

const uploadLinkToCloudinary = async (imgLink) => {
  const formData = new FormData();
  formData.append("file", imgLink);          // Cloudinary accepts a URL as "file"
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "homestays-rwanda");

  const { data } = await axios.post(CLOUDINARY_URL, formData, {
    withCredentials: false,
  });
  return data.secure_url;
};

// ─────────────────────────────────────────────────────────────────────────────

const PhotosUploader = ({ photoLink, setPhotoLink, addedPhotos, setAddedPhotos }) => {
  const inputRef = useRef();
  const fileInputRef = useRef();
  const [isUploading, setIsUploading] = useState(false);

  const addPhotoByLink = async (e) => {
    e.preventDefault();
    if (!photoLink.trim()) {
      inputRef.current.focus();
      toast.warning("Paste an image URL first");
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadLinkToCloudinary(photoLink.trim());
      setAddedPhotos((prev) => [...prev, url]);
      setPhotoLink("");
      toast.success("Photo added!");
    } catch (err) {
      console.error("Link upload error:", err?.response?.data || err.message);
      toast.error("Could not add photo from that link");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setIsUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadFileToCloudinary));
      setAddedPhotos((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} photo${urls.length > 1 ? "s" : ""} uploaded!`);
    } catch (err) {
      console.error("File upload error:", err?.response?.data || err.message);
      toast.error("Upload failed — check your Cloudinary preset in client/.env");
    } finally {
      setIsUploading(false);
      // reset so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (ev, url) => {
    ev.preventDefault();
    setAddedPhotos(addedPhotos.filter((p) => p !== url));
  };

  const setAsMain = (ev, url) => {
    ev.preventDefault();
    setAddedPhotos([url, ...addedPhotos.filter((p) => p !== url)]);
  };

  return (
    <>
      {/* Link upload row */}
      <div className="flex gap-3 mb-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Paste an image URL (https://...jpg)"
          className="flex-1 rounded-xl py-2 px-4 border border-gray-300 outline-none focus:border-brand text-sm"
          value={photoLink}
          onChange={(e) => setPhotoLink(e.target.value)}
        />
        <button
          type="button"
          onClick={addPhotoByLink}
          disabled={isUploading}
          className={`bg-brand text-white px-4 h-10 rounded-xl font-semibold text-sm whitespace-nowrap transition-all
            ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-brand-dark"}`}
        >
          {isUploading ? "Uploading…" : "Add URL"}
        </button>
      </div>

      {/* Photo grid */}
      <div className="mt-2 mb-4 gap-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {addedPhotos.map((url) => (
          <div key={url} className="h-32 relative rounded-xl overflow-hidden bg-gray-200">
            <Image src={url} alt="uploaded" className="w-full h-full object-cover rounded-xl" />

            {/* Remove */}
            <button type="button"
              className="absolute right-1 top-1 bg-black/60 p-1 rounded-lg"
              onClick={(ev) => removePhoto(ev, url)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth="1.5" stroke="white" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>

            {/* Set as main */}
            <button type="button"
              className="absolute left-1 top-1 bg-black/60 p-1 rounded-lg"
              onClick={(ev) => setAsMain(ev, url)}>
              <svg xmlns="http://www.w3.org/2000/svg"
                fill={url === addedPhotos[0] ? "#2563EB" : "white"}
                viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </button>

            {url === addedPhotos[0] && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                Main
              </span>
            )}
          </div>
        ))}

        {/* File upload tile */}
        <label className="h-32 cursor-pointer flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-brand hover:text-brand transition-all">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="loader" />
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-xs font-medium">Upload</span>
            </>
          )}
        </label>
      </div>

      {addedPhotos.length > 0 && (
        <p className="text-xs text-gray-400 mb-3">
          {addedPhotos.length} photo{addedPhotos.length > 1 ? "s" : ""} added · click ★ to set main photo
        </p>
      )}
    </>
  );
};

export default PhotosUploader;
