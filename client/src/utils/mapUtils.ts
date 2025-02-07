// src/utils/mapUtils.ts

import L from 'leaflet';
import 'leaflet-routing-machine';

// 1) Random point within a certain radius
export function getRandomLatLngWithinRadius(
  lat: number,
  lng: number,
  radiusMeters: number
): [number, number] {
  // Earth’s approximate radius in meters
  const earthRadius = 6378137;
  
  const randomDistance = Math.random() * radiusMeters; 
  const randomBearing = Math.random() * 2 * Math.PI; 

  // Convert lat/lng to radians
  const latRad = lat * (Math.PI / 180);
  const lngRad = lng * (Math.PI / 180);

  // Convert distance to degrees on the sphere
  const distInDegrees = randomDistance / earthRadius;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(distInDegrees) +
      Math.cos(latRad) * Math.sin(distInDegrees) * Math.cos(randomBearing)
  );

  const newLngRad =
    lngRad +
    Math.atan2(
      Math.sin(randomBearing) * Math.sin(distInDegrees) * Math.cos(latRad),
      Math.cos(distInDegrees) - Math.sin(latRad) * Math.sin(newLatRad)
    );

  // Convert back to degrees
  const newLat = newLatRad * (180 / Math.PI);
  const newLng = newLngRad * (180 / Math.PI);

  return [newLat, newLng];
}

// 2) Get on-road route using Leaflet Routing Machine (OSRM)
export async function getRouteOnRoad(
  startLatLng: [number, number],
  endLatLng: [number, number]
): Promise<L.LatLngExpression[]> {
  return new Promise((resolve, reject) => {
    L.Routing.control({
      waypoints: [
        L.latLng(startLatLng[0], startLatLng[1]),
        L.latLng(endLatLng[0], endLatLng[1])
      ],
      lineOptions: { addWaypoints: false },
      createMarker: () => null, // remove default route markers
      show: false,
      router: new L.Routing.OSRMv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      })
    })
      .on('routesfound', (e: any) => {
        const route = e.routes[0];
        // route.coordinates => an array of { lat, lng } along the route
        const coordinates = route.coordinates;
        resolve(coordinates);
      })
      .on('routingerror', (err: any) => reject(err))
      .route();
  });
}

// 3) Animate a marker along a polyline route
export function animateMarkerAlongRoute(
  marker: L.Marker,
  routeCoords: L.LatLngExpression[],
  durationMs: number = 2000
) {
  let index = 0;
  const total = routeCoords.length;
  const intervalTime = durationMs / total;

  const interval = setInterval(() => {
    if (index >= total) {
      clearInterval(interval);
    } else {
      marker.setLatLng(routeCoords[index]);
      index++;
    }
  }, intervalTime);
}
