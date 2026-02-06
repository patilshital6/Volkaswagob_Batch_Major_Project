import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/students/${user.id}`);

        if (!response.ok) throw new Error("Failed to fetch profile details");

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  return { profile, loading, error };
};