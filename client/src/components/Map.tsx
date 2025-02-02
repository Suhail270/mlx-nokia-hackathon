import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertType } from '@/types/alerts';

interface MapProps {
  alerts: AlertType[];
  onAlertSelect: (alert: AlertType) => void;
  midpoint?: [number, number];
  centerOffset?: number; // New optional prop for vertical offset in pixels
}

const Map = ({ alerts, onAlertSelect, midpoint, centerOffset = 0 }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Initialize the map only once
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Use the provided midpoint if available, otherwise fallback to default
    const initialCenter = midpoint ? midpoint : [40.7128, -74.006];
    mapInstance.current = L.map(mapContainer.current).setView(initialCenter, 9);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        // Clear all markers before removing the map
        Object.values(markersRef.current).forEach((marker) => marker.remove());
        markersRef.current = {};

        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []); // run only once on mount

  // Update the map view if the midpoint (or offset) changes
  useEffect(() => {
    if (mapInstance.current && midpoint) {
      // Convert the midpoint to pixel coordinates
      const containerPoint = mapInstance.current.latLngToContainerPoint(midpoint);
      // Instead of subtracting, add the offset to move the center down.
      const adjustedPoint = L.point(containerPoint.x, containerPoint.y + centerOffset);
      // Convert back to geographical coordinates
      const adjustedLatLng = mapInstance.current.containerPointToLatLng(adjustedPoint);
      mapInstance.current.setView(adjustedLatLng, mapInstance.current.getZoom());
    }
  }, [midpoint, centerOffset]);
  

  // Update markers whenever alerts or onAlertSelect changes
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add new markers
    alerts.forEach((alert) => {
      const iconHtml = (() => {
        switch (alert.type) {
          case 'fire' :
            return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                    </svg>`;
          case 'نار' :
            return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                    </svg>`;
          case 'assault':
            return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-siren"><path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 12v6"/></svg>`;
          
          case 'يتعدى':
            return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-siren"><path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 12v6"/></svg>`;
  
  

          default:
            return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>`;
        }
      })();

      const icon = L.divIcon({
        html: `<div style="
      width: 36px;
      height: 36px;
      background-color: ${alert.type === 'fire' || alert.type === 'نار' ? 'rgba(255, 0, 0, 0.7)' 
        : 'rgba(255, 115, 0, 0.7)'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      ${iconHtml}
    </div>`, //<div class="alert-marker alert-marker-${alert.type}">${iconHtml}</div>
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([alert.latitude, alert.longitude], { icon })
        .addTo(mapInstance.current!)
        .on('click', () => onAlertSelect(alert));

      markersRef.current[alert.id] = marker;
    });
  }, [alerts, onAlertSelect]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border z-0">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;
