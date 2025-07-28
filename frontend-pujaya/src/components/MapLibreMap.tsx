import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreMapProps {
  lng: number;
  lat: number;
  zoom: number;
  style?: React.CSSProperties;
  userLocation?: { lat: number; lng: number } | null;
  radius: number;
  onMapMove?: (center: { lat: number; lng: number }) => void;
  onUserLocation?: (location: { lat: number; lng: number }) => void;
  // Nuevo: callback para click en el mapa
  onClick?: (lngLat: { lng: number; lat: number }) => void;
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

function createGeoJSONCircle(
  center: [number, number],
  radiusInKm: number,
  points = 64
): GeoJSON.Feature {
  const coords = [];
  const distanceX = radiusInKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]);
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
    properties: {},
  };
}

const MapLibreMap: React.FC<MapLibreMapProps> = ({
  lng,
  lat,
  zoom,
  style,
  userLocation,
  radius,
  onMapMove,
  onUserLocation,
  onClick, // nuevo
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  // El centro y zoom solo se inicializan una vez
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat, lng });

  // Solo crear el mapa una vez al montar
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!MAPTILER_KEY) {
      console.error('MapTiler API key is missing');
      return;
    }
    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
        center: [lng, lat],
        zoom: zoom,
      });
      mapRef.current.on('moveend', () => {
        const center = mapRef.current!.getCenter();
        setMapCenter({ lat: center.lat, lng: center.lng });
        if (onMapMove) onMapMove({ lat: center.lat, lng: center.lng });
      });
    }
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, zoom, onMapMove]); // Agregadas dependencias

  // El círculo sigue el centro local del mapa
  useEffect(() => {
    if (!mapRef.current) return;
    function updateCircle() {
      const map = mapRef.current;
      if (!map || typeof map.getSource !== 'function') return;
      if (!mapCenter || !radius) {
        if (map.getSource('circle')) {
          if (typeof map.getLayer === 'function' && map.getLayer('circle-layer'))
            map.removeLayer('circle-layer');
          if (typeof map.getLayer === 'function' && map.getLayer('circle-outline'))
            map.removeLayer('circle-outline');
          map.removeSource('circle');
        }
        return;
      }
      const geojson: GeoJSON.Feature = createGeoJSONCircle([mapCenter.lng, mapCenter.lat], radius);
      if (map.getSource('circle')) {
        (map.getSource('circle') as maplibregl.GeoJSONSource).setData(geojson);
      } else if (typeof map.addSource === 'function' && typeof map.addLayer === 'function') {
        map.addSource('circle', {
          type: 'geojson',
          data: geojson,
        });
        map.addLayer({
          id: 'circle-layer',
          type: 'fill',
          source: 'circle',
          paint: {
            'fill-color': '#1e40af',
            'fill-opacity': 0.2,
          },
        });
        map.addLayer({
          id: 'circle-outline',
          type: 'line',
          source: 'circle',
          paint: {
            'line-color': '#1e40af',
            'line-width': 2,
          },
        });
      }
    }
    if (typeof mapRef.current?.isStyleLoaded === 'function' && mapRef.current.isStyleLoaded()) {
      updateCircle();
    } else if (typeof mapRef.current?.once === 'function') {
      mapRef.current.once('style.load', updateCircle);
    }
    // Clean up
    return () => {
      const map = mapRef.current;
      if (!map || typeof map.getSource !== 'function') return;
      if (map.getSource('circle')) {
        if (typeof map.getLayer === 'function' && map.getLayer('circle-layer'))
          map.removeLayer('circle-layer');
        if (typeof map.getLayer === 'function' && map.getLayer('circle-outline'))
          map.removeLayer('circle-outline');
        map.removeSource('circle');
      }
    };
  }, [mapCenter, radius]);

  // Show user location marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (userLocation) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = new maplibregl.Marker({ color: '#1976d2' })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(mapRef.current);
      } else {
        userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    };
  }, [userLocation]);

  // Manejar click en el mapa para seleccionar ubicación
  useEffect(() => {
    if (!mapRef.current || !onClick) return;
    const map = mapRef.current;
    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const lngLat = e.lngLat;
      onClick({ lng: lngLat.lng, lat: lngLat.lat });
    };
    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [onClick]);

  // Button to center on user location y obtenerla si es necesario
  const handleCenterUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14 });
      if (onUserLocation) onUserLocation(userLocation);
    } else if (navigator.geolocation && onUserLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (mapRef.current) {
            mapRef.current.flyTo({ center: [coords.lng, coords.lat], zoom: 14 });
          }
          onUserLocation(coords);
        },
        () => {
          // Opcional: podrías mostrar un error si falla
        }
      );
    }
  };

  return (
    <div style={{ position: 'relative', ...style }}>
      <div ref={mapContainer} style={{ width: '100%', height: '390px', borderRadius: '12px' }} />
      {/* My location button */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 10,
        }}
      >
        <button
          onClick={handleCenterUser}
          style={{
            background: '#fff',
            border: '1px solid #1976d2',
            color: '#1976d2',
            borderRadius: 6,
            padding: 8,
            cursor: 'pointer',
            fontWeight: 600,
          }}
          title="Go to my location"
        >
          📍 My location
        </button>
      </div>
    </div>
  );
};

export default MapLibreMap;
