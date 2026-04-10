import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link, useOutletContext } from "react-router-dom";
import Image from "../Components/Image";
import 'react-loading-skeleton/dist/skeleton.css';
import SkeletonLoader from "../Components/IndexSkeleton";
import "../utils/skeletonBox.css";
import SearchFilters from "../Components/SearchFilters";
import { formatRWF } from "../utils/currency";

const debounce = (func, delay = 500) => {
  let timeoutId;
  return function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

const IndexPage = () => {
  const [allPlaces, setAllPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [allFetched, setAllFetched] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const { searchInput } = useOutletContext();

  const fetchPlaces = async (currentPage) => {
    try {
      setLoadingMore(true);
      const { data } = await axios.get(`/places?page=${currentPage}`);
      if (data.length === 0) setAllFetched(true);
      setAllPlaces((prev) => [...prev, ...data]);
    } catch (err) {
      console.error("Error fetching places:", err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchSearchResults = async (query, filters = {}) => {
    try {
      setLoading(true);
      setIsSearching(true);
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.city) params.set("city", filters.city);
      if (filters.propertyType) params.set("propertyType", filters.propertyType);
      if (filters.perks) params.set("perks", filters.perks);
      const { data } = await axios.get(`/places?${params.toString()}`);
      setFilteredPlaces(data);
    } catch (err) {
      console.error("Error searching places:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query, filters) => fetchSearchResults(query, filters), 500), []
  );

  useEffect(() => {
    const hasFilters = Object.values(activeFilters).some(Boolean);
    if (searchInput.trim().length > 2 || hasFilters) {
      debouncedSearch(searchInput, activeFilters);
    } else {
      setIsSearching(false);
    }
  }, [searchInput, activeFilters]);

  useEffect(() => {
    if (!isSearching && !allFetched) fetchPlaces(page);
  }, [page]);

  const handleScroll = useCallback(() => {
    if (!loadingMore && !isSearching &&
      window.scrollY + window.innerHeight >= document.body.scrollHeight / 2) {
      setPage((prev) => prev + 1);
    }
  }, [loadingMore, isSearching]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleFilter = (filters) => {
    setActiveFilters(filters);
    if (!Object.values(filters).some(Boolean) && !searchInput.trim()) {
      setIsSearching(false);
    }
  };

  const currentList = isSearching ? filteredPlaces : allPlaces;

  return (
    <>
      {/* Filter bar */}
      <div className="flex justify-center px-4 pt-3 pb-1">
        <SearchFilters onFilter={handleFilter} />
      </div>

      <div className="grid grid-cols-1 justify-items-center py-4 px-3 gap-y-8
        sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-3 lg:gap-x-6
        xl:grid-cols-4 2xl:grid-cols-5 mt-3">
        {loading
          ? Array(8).fill().map((_, i) => <SkeletonLoader key={i} />)
          : currentList?.map((place) => (
            <Link to={`/place/${place._id}`} key={place._id}
              className="w-full max-w-[420px] sm:max-w-[470px] group">
              <div className="bg-gray-200 mb-2 rounded-xl flex h-[220px] xs:h-[250px] sm:h-[280px] shadow-md overflow-hidden">
                <Image
                  className="rounded-xl h-full w-full group-hover:scale-105 transition-all duration-300 ease-in-out"
                  src={place.photos?.[0]}
                  alt="place-main-photo"
                />
              </div>
              <h2 className="font-bold">{place.city || place.address}</h2>
              <h3 className="text-sm text-gray-500">
                {place.title.length > 44 ? `${place.title.substr(0, 44)}...` : place.title}
              </h3>
              <div className="font-semibold text-sm mt-0.5 flex items-baseline gap-1">
                <span className="font-bold text-base text-brand">{formatRWF(place.price)}</span>
                <span className="text-gray-500 font-normal">/ night</span>
                <span className="text-gray-400 font-normal text-xs">+ 18% VAT</span>
              </div>
              {place.propertyType && (
                <span className="text-xs capitalize text-gray-400">{place.propertyType}</span>
              )}
            </Link>
          ))}

        {!isSearching && loadingMore && (
          <div className="col-span-full flex justify-center py-4">
            <SkeletonLoader />
          </div>
        )}
      </div>

      {currentList.length === 0 && !loading && (
        <p className="text-xl text-brand font-semibold text-center mx-auto w-[90%] max-w-[600px] mt-8">
          No properties found. Try adjusting your search or filters.
        </p>
      )}
    </>
  );
};

export default IndexPage;
