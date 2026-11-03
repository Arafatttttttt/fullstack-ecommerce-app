import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

const MapPicker = ({ latitude, longitude, onLocationSelect, onClose }: MapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([latitude, longitude], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Fix for default marker icon (Leaflet issue with webpack/vite)
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = defaultIcon;

    // Add draggable marker
    const marker = L.marker([latitude, longitude], {
      draggable: true,
    }).addTo(map);

    marker.bindPopup('Drag me to select your location').openPopup();

    // Handle marker drag
    marker.on('dragend', (e) => {
      const position = marker.getLatLng();
      onLocationSelect(position.lat, position.lng);
    });

    // Handle map click to move marker
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      marker.openPopup();
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Cleanup
    return () => {
      map.remove();
    };
  }, [latitude, longitude, onLocationSelect]);

  const handleConfirm = () => {
    if (markerRef.current) {
      const position = markerRef.current.getLatLng();
      onLocationSelect(position.lat, position.lng);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Select Your Location</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-[400px] mb-4 rounded-lg overflow-hidden border border-gray-300">
          <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-amazon-orange text-white rounded-md hover:bg-orange-600 transition font-medium"
          >
            Confirm Location
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-2">
          Drag the marker or click on the map to select your exact location
        </p>
      </div>
    </div>
  );
};

export default MapPicker;
