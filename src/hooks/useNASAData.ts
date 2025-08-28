import { useState, useEffect } from 'react';

const API_KEY = "tqtaC6HSgjMbHaEbgpU8tI5xxT3mIDoYEU4vab56";

interface APODData {
  title: string;
  explanation: string;
  url: string;
  media_type: 'image' | 'video';
  date: string;
  copyright?: string;
  thumbnail_url?: string;
}

interface MarsRoverPhoto {
  id: number;
  img_src: string;
  earth_date: string;
  camera: {
    name: string;
    full_name: string;
  };
}

interface NearEarthObject {
  name: string;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    miss_distance: {
      kilometers: string;
    };
  }>;
}

export const useAPOD = (date?: string) => {
  const [data, setData] = useState<APODData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        setLoading(true);
        const url = date 
          ? `https://api.nasa.gov/planetary/apod?date=${date}&api_key=${API_KEY}`
          : `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch APOD');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAPOD();
  }, [date]);

  return { data, loading, error };
};

export const useMarsRoverPhotos = () => {
  const [photos, setPhotos] = useState<MarsRoverPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(
          `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=${API_KEY}`
        );
        if (!response.ok) throw new Error('Failed to fetch Mars photos');
        const result = await response.json();
        setPhotos(result.photos.slice(0, 12)); // Limit to 12 photos
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return { photos, loading, error };
};

export const useNearEarthObjects = () => {
  const [objects, setObjects] = useState<NearEarthObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNEOs = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`
        );
        if (!response.ok) throw new Error('Failed to fetch NEO data');
        const result = await response.json();
        const todayObjects = result.near_earth_objects[today] || [];
        setObjects(todayObjects.slice(0, 6)); // Limit to 6 objects
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchNEOs();
  }, []);

  return { objects, loading, error };
};