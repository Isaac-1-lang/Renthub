import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';

// All images are now Cloudinary URLs (https://). If somehow a relative path
// slips through, we render nothing rather than a broken localhost URL.
const Image = ({ src, className, alt, ...rest }) => {
  const safeSrc = src && src.startsWith("https://") ? src : null;
  if (!safeSrc) return <div className={className + " bg-gray-200"} />;
  return (
    <LazyLoadImage
      className={className}
      src={safeSrc}
      alt={alt || ""}
      effect="opacity"
      width="100%"
      height="100%"
      {...rest}
    />
  );
};

export default Image;
