import { useEffect, useState } from "react";
import axios from "../api/axios";

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(url);
        setData(res.data);
        setError(false);
      } catch (err) {
        setError("Error connecting to server. Please try again later.");
        console.error("Fetch error:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [url]);

  const reFetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(url);
      setData(res.data);
      setError(false);
    } catch (err) {
      setError("Error connecting to server. Please try again later.");
      console.error("ReFetch error:", err);
    }
    setLoading(false);
  };

  return { data, loading, error, reFetch };
};

export default useFetch;
