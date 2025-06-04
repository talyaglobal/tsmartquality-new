import React from 'react'
import { MapPin } from 'lucide-react'

interface Location {
  id: string
  name: string
  code: string
  latitude: number
  longitude: number
  type: string
}

interface LocationMapProps {
  locations: Location[]
  selectedLocation?: string
  onLocationSelect?: (id: string) => void
}

const LocationMap: React.FC<LocationMapProps> = ({ locations, selectedLocation, onLocationSelect }) => {
  React.useEffect(() => {
    // Load Google Maps script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    script.async = true
    script.defer = true
    script.onload = initMap
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const initMap = () => {
    if (typeof google === 'undefined') return

    const mapElement = document.getElementById('warehouse-map')
    if (!mapElement) return

    const map = new google.maps.Map(mapElement, {
      center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
      zoom: 4
    })

    // Add markers for each location
    locations.forEach(location => {
      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map,
        title: location.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#7367F0',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      })

      marker.addListener('click', () => {
        onLocationSelect?.(location.id)
      })
    })
  }

  return (
    <div className="relative h-[600px] rounded-lg overflow-hidden">
      <div id="warehouse-map" className="absolute inset-0" />
      
      {/* Fallback content while map loads */}
      <div className="absolute inset-0 flex items-center justify-center bg-[var(--background-paper)]">
        <div className="text-center">
          <MapPin size={40} className="mx-auto mb-2 text-[var(--primary-main)]" />
          <p className="text-[var(--text-secondary)]">Loading map...</p>
        </div>
      </div>
    </div>
  )
}

export default LocationMap