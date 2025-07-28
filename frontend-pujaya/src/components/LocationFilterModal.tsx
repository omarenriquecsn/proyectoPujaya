import React, { useEffect, useState } from 'react';
import MapLibreMap from './MapLibreMap';

interface LocationFilterModalProps {
  open: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  onApplyLocation: (location: { lat: number; lng: number }, radius: number) => void;
  initialRadius?: number;
}

const LocationFilterModal: React.FC<LocationFilterModalProps> = ({
  open,
  onClose,
  userLocation,
  onApplyLocation,
  initialRadius = 10,
}) => {
  const [radius, setRadius] = useState(initialRadius);
  // Solo usar el centro inicial una vez al abrir el modal
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    userLocation || { lat: -34.6037, lng: -58.3816 }
  );
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (open) {
      setMapCenter(userLocation || { lat: -34.6037, lng: -58.3816 });
      setZoom(13);
    }
  }, [open, userLocation]);

  const handleMapMove = (center: { lat: number; lng: number }) => {
    setMapCenter(center);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
      <div
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl relative flex flex-col items-center"
        style={{ minHeight: 520 }}
      >
        <MapLibreMap
          lng={mapCenter.lng}
          lat={mapCenter.lat}
          zoom={zoom}
          style={{ width: '100%', height: 390, borderRadius: '12px' }}
          userLocation={userLocation}
          onMapMove={handleMapMove}
          radius={radius}
        />
        <div
          style={{
            width: '100%',
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <label style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>Radius (km):</label>
          <input
            type="range"
            min={1}
            max={100}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ width: 100 }}
          />
          <span style={{ marginLeft: 6, fontWeight: 600, color: '#1e40af' }}>{radius}</span>
          <button
            onClick={() => onApplyLocation(mapCenter, radius)}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontWeight: 600,
              marginLeft: 10,
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#fff',
              color: '#888',
              border: '1px solid #ccc',
              borderRadius: 6,
              padding: '8px 12px',
              marginLeft: 8,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationFilterModal;
