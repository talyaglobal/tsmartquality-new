import React from 'react';
import { MapPin } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationMapProps {
  locations: Location[];
  selectedLocation?: string;
  onLocationSelect?: (id: string) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({ locations, selectedLocation, onLocationSelect }) => {
  return (
    <div className="relative h-[400px] rounded-lg overflow-hidden bg-[var(--background-paper)]">
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg"
          alt="Location Map"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={40} className="mx-auto mb-2 text-[var(--primary-main)]" />
            <p className="text-[var(--text-secondary)]">Map integration coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;