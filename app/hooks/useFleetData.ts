import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/services/api';

interface FleetData {
  vehicles: any[];
  drivers: any[];
  trips: any[];
  stats: any;
}

export const useFleetData = () => {
  const [data, setData] = useState<FleetData>({
    vehicles: [],
    drivers: [],
    trips: [],
    stats: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vehiclesRes, tripsRes, statsRes] = await Promise.all([
        apiClient.getVehicles(),
        apiClient.getTrips(),
        apiClient.getDashboardStats(),
      ]);

      setData({
        vehicles: vehiclesRes.data.data || [],
        drivers: [], // Will be populated separately
        trips: tripsRes.data.data || [],
        stats: statsRes.data.data,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return { ...data, loading, error, refetch: fetchData };
};
