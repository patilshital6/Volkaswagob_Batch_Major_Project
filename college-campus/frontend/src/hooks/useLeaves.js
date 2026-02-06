import { useEffect, useState } from "react";

export const useLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      const res = await fetch("/api/leaves");
      const data = await res.json();
      setLeaves(data.leaves || []);
      setLoading(false);
    };

    fetchLeaves();
  }, []);

  return { leaves, loading };
};
