// import React, { useEffect, useRef } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { AlertType, PoliceType, AmbulanceType, DroneType, FirefighterType } from '@/types/alerts';
// import { UserRoundX } from 'lucide-react';


// interface MapProps {
//   alerts: AlertType[];
//   onAlertSelect: (alert: AlertType) => void;
//   midpoint?: [number, number];
//   centerOffset?: number; // New optional prop for vertical offset in pixels
//   policeZones?: PoliceType[];
//   ambulanceZones?: AmbulanceType[];
//   firefighterZones?: FirefighterType[];
//   droneZone?: DroneType[];
// }

// const Map = ({ alerts, policeZones, ambulanceZones, firefighterZones, droneZone, onAlertSelect, midpoint, centerOffset = 0 }: MapProps) => {
//   const mapContainer = useRef<HTMLDivElement>(null);
//   const mapInstance = useRef<L.Map | null>(null);
//   const markersRef = useRef<{ [key: string]: L.Marker }>({});
//   const policeMarkersRef = useRef<{ [key: string]: L.Marker }>({});
//   const ambulanceMarkersRef = useRef<{ [key: string]: L.Marker }>({});
//   const ffMarkersRef = useRef<{ [key: string]: L.Marker }>({});
//   const droneMarkersRef = useRef<{ [key: string]: L.Marker }>({});

//   // Initialize the map only once
//   useEffect(() => {
//     if (!mapContainer.current || mapInstance.current) return;

//     // Use the provided midpoint if available, otherwise fallback to default
//     const initialCenter = midpoint ? midpoint : [40.7128, -74.006];
//     mapInstance.current = L.map(mapContainer.current).setView(initialCenter, 9);

//     // Add OpenStreetMap tiles
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution:
//         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     }).addTo(mapInstance.current);

//     return () => {
//       if (mapInstance.current) {
//         // Clear all markers before removing the map
//         Object.values(markersRef.current).forEach((marker) => marker.remove());
//         markersRef.current = {};

//         mapInstance.current.remove();
//         mapInstance.current = null;
//       }
//     };
//   }, []); // run only once on mount

//   // Update the map view if the midpoint (or offset) changes
//   useEffect(() => {
//     if (mapInstance.current && midpoint) {
//       // Convert the midpoint to pixel coordinates
//       const containerPoint = mapInstance.current.latLngToContainerPoint(midpoint);
//       // Instead of subtracting, add the offset to move the center down.
//       const adjustedPoint = L.point(containerPoint.x, containerPoint.y + centerOffset);
//       // Convert back to geographical coordinates
//       const adjustedLatLng = mapInstance.current.containerPointToLatLng(adjustedPoint);
//       mapInstance.current.setView(adjustedLatLng, mapInstance.current.getZoom());
//     }
//   }, [midpoint, centerOffset]);
  

//   // Update markers whenever alerts or onAlertSelect changes
//   useEffect(() => {
//     if (!mapInstance.current) return;

//     // Clear existing markers
//     Object.values(markersRef.current).forEach((marker) => marker.remove());
//     markersRef.current = {};

//     // Add new markers
//     alerts.forEach((alert) => {
//       const iconHtml = (() => {
//         switch (alert.type) {
//           case 'fire':
//             return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
//                     </svg>`;
//           case 'assault':
//             // return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" strokeLinecap="round" strokeLinejoin="round">
//             //           <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
//             //           <circle cx="9" cy="7" r="4"/>
//             //           <line x1="17" y1="8" x2="23" y2="14"/>
//             //           <line x1="23" y1="8" x2="17" y2="14"/>
//             //         </svg>`;

//             return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round-x"><path d="M2 21a8 8 0 0 1 11.873-7"/><circle cx="10" cy="8" r="5"/><path d="m17 17 5 5"/><path d="m22 17-5 5"/></svg>`;


//           default:
//             return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
//                       <circle cx="12" cy="10" r="3"/>
//                     </svg>`;
//         }
//       })();

//       const icon = L.divIcon({
//         html: `<div style="
//       width: 36px;
//       height: 36px;
//       background-color: ${alert.type === 'fire' ? 'rgba(255, 0, 0, 0.7)' 
//         : alert.type === 'assault' ? 'rgba(255, 115, 0, 0.7)' 
//         : 'rgba(0, 0, 255, 0.7)'};
//       border-radius: 50%;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//     ">
//       ${iconHtml}
//     </div>`, //<div class="alert-marker alert-marker-${alert.type}">${iconHtml}</div>
//         className: '',
//         iconSize: [24, 24],
//         iconAnchor: [12, 12]
//       });

//       const marker = L.marker([alert.latitude, alert.longitude], { icon })
//         .addTo(mapInstance.current!)
//         .on('click', () => onAlertSelect(alert));

//       markersRef.current[alert.id] = marker;
//     });
//   }, [alerts, onAlertSelect]);


//   // markers for police
//   useEffect(() => {
//     if (!mapInstance.current || !policeZones) return;

//     // Clear existing police markers
//     Object.values(policeMarkersRef.current).forEach((marker) => marker.remove());
//     policeMarkersRef.current = {};

//     // Create police markers
//     policeZones.forEach((police) => {
//       console.log('Police Zones:', policeZones);
//       const policeIcon = L.divIcon({
//         html: `<div style="
//           width: 36px;
//           height: 36px;
//           background-color: rgba(0, 0, 255, 0.7);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         ">
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-siren"><path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 12v6"/></svg>
//         </div>`,
//         className: '',
//         iconSize: [24, 24],
//         iconAnchor: [12, 12]
//       });

//       const marker = L.marker([police.startZoneLat, police.startZoneLong], { icon: policeIcon })
//         .addTo(mapInstance.current!);

//       policeMarkersRef.current[police.id] = marker;
//     });

//     return () => {
//       Object.values(policeMarkersRef.current).forEach((marker) => marker.remove());
//       policeMarkersRef.current = {};
//     };
//   }, [policeZones]);


//   // Markers for ambulance
//   useEffect(() => {
//     if (!mapInstance.current || !ambulanceZones) return;

//     // Clear existing police markers
//     Object.values(ambulanceMarkersRef.current).forEach((marker) => marker.remove());
//     ambulanceMarkersRef.current = {};

//     // Create police markers
//     ambulanceZones.forEach((ambulance) => {
//       const ambulanceIcon = L.divIcon({
//         html: `<div style="
//           width: 36px;
//           height: 36px;
//           background-color: rgba(255, 42, 42, 0.8);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         ">
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ambulance"><path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><path d="M8 8v4"/><path d="M9 18h6"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
//         </div>`,
//         className: '',
//         iconSize: [24, 24],
//         iconAnchor: [12, 12]
//       });

//       const marker = L.marker([ambulance.startZoneLat, ambulance.startZoneLong], { icon: ambulanceIcon })
//         .addTo(mapInstance.current!);

//       ambulanceMarkersRef.current[ambulance.id] = marker;
//     });

//     // Cleanup
//     return () => {
//       Object.values(ambulanceMarkersRef.current).forEach((marker) => marker.remove());
//       ambulanceMarkersRef.current = {};
//     };
//   }, [ambulanceZones]);

//   // Markers for firefighter
//   useEffect(() => {
//     if (!mapInstance.current || !firefighterZones) return;

//     // Clear existing police markers
//     Object.values(ffMarkersRef.current).forEach((marker) => marker.remove());
//     ffMarkersRef.current = {};

//     // Create police markers
//     firefighterZones.forEach((firefighter) => {
//       const firefighterIcon = L.divIcon({
//         html: `<div style="
//           width: 36px;
//           height: 36px;
//           background-color: rgba(255, 239, 42, 0.8);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         ">
//         <svg height="16" width="16" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#ffffff;} </style> <g> <path class="st0" d="M446.508,448.852c0.026-20.516-7.08-37.622-17.544-51.117c-10.477-13.534-24.142-23.612-37.596-31.143 c-9.602-5.356-19.099-9.419-27.408-12.449h72.659l-4.442-9.98c0,0-0.143-0.346-0.444-1.046c-0.313-0.699-0.757-1.737-1.332-3.102 c-1.15-2.73-2.822-6.735-4.833-11.79c-4.036-10.138-9.498-24.507-15.154-41.424c-10.843-32.339-22.299-73.991-26.126-112.75h6.152 c5.212,0,10.033-3.122,11.901-7.995c0-0.066,0-0.066,0.066-0.131c0.47-1.365,0.744-2.86,0.744-4.232c0-3.507-1.542-6.956-4.35-9.36 l-23.214-19.569c-1.607-54.023-41.071-98.694-93.505-110.072v-2.6c0-11.058-9.229-20.026-20.666-20.092h-5.415h-5.415 c-11.436,0.066-20.666,9.034-20.666,20.092v2.6c-52.436,11.378-91.9,56.049-93.508,110.072l-23.207,19.569 c-2.808,2.404-4.35,5.852-4.35,9.36c0,1.372,0.268,2.868,0.738,4.232c0.065,0.066,0.065,0.066,0.065,0.131 c1.875,4.872,6.688,7.995,11.908,7.995h6.152c-3.834,38.759-15.29,80.411-26.126,112.75c-5.656,16.917-11.117,31.286-15.153,41.424 c-2.019,5.055-3.684,9.059-4.834,11.79c-0.574,1.365-1.025,2.403-1.332,3.102c-0.3,0.699-0.451,1.039-0.451,1.039l-4.435,9.987 h72.652c-8.302,3.03-17.806,7.093-27.407,12.449c-13.456,7.531-27.12,17.609-37.59,31.143 c-10.463,13.495-17.576,30.601-17.55,51.117c0,5.271,0.49,10.764,1.457,16.473h-0.026c0,0.157,0.046,0.268,0.078,0.398 c0.014,0.072,0.02,0.15,0.033,0.229h0.013c0.007,0,0.007,0.013,0.007,0.013c0.34,2.149,1.208,3.84,2.142,5.337 c2.142,2.991,4.886,5.264,8.426,7.544c6.087,3.9,14.585,7.806,25.421,11.568C135.544,501.667,189.32,512,256.002,512 c66.682,0,120.461-10.333,152.962-21.587c10.83-3.762,19.334-7.668,25.421-11.568c3.54-2.279,6.284-4.553,8.426-7.544 c0.928-1.496,1.802-3.188,2.142-5.33v-0.019h0.014c0.013-0.079,0.026-0.157,0.039-0.229c0.026-0.13,0.078-0.242,0.078-0.398h-0.026 C446.025,459.616,446.508,454.123,446.508,448.852z M79.496,464.345h-0.066l-4.749,0.392h-0.359l6.238-1.032L79.496,464.345z M80.632,463.698H80.58l0.078-0.013L80.632,463.698z M120.992,480.968c-1.946-0.569-3.946-1.13-5.781-1.672 c-9.896-3.115-17.923-6.238-23.743-9.164c-4.01-2.019-6.956-3.906-8.628-5.33c-0.719-0.569-1.169-1.072-1.313-1.339 c-0.902-5.147-1.32-10.006-1.32-14.612c0.026-17.328,5.774-31.052,14.605-42.534c7.126-9.255,16.414-16.878,26.179-23.096V480.968z M396.411,291.229c7.106,21.215,13.873,38.452,18.041,48.616h-44.808c-15.18-26.976-23.854-60.895-28.465-91.202 c-4.834-31.646-5.448-59.275-5.448-70.999c0-1.496,0.014-2.639,0.026-3.592H369.5C373.379,214.932,385.28,257.917,396.411,291.229z M390.44,161.758v0.588h-0.536L390.44,161.758z M121.567,162.346v-0.588l0.536,0.588H121.567z M123.774,162.346l27.29-23.018 v-3.253c0-1.294,0-2.593,0.13-3.834v-0.026h46.172v-20.398h-43.286c9.562-37.962,41.065-67.538,80.719-75.474 c0.007,0,0.013-0.007,0.02-0.007v23.05h9.366V34.71l0.451-0.059V20.092c0-3.181,2.672-5.722,5.95-5.787h5.415h5.415 c3.279,0.065,5.95,2.606,5.95,5.787v14.559l0.451,0.059v24.676h9.367v-23.05c0.006,0,0.013,0.007,0.019,0.007 c39.654,7.936,71.16,37.512,80.722,75.474h-43.289v20.398h46.176v0.026c0.131,1.241,0.131,2.541,0.131,3.834v3.253l27.289,23.018 H256.002H123.774z M142.357,339.844H97.549c4.174-10.164,10.94-27.4,18.041-48.616c11.136-33.312,23.03-76.296,26.917-117.178 h33.742c0.007,0.954,0.02,2.097,0.02,3.592c0,11.724-0.608,39.354-5.447,70.999C166.211,278.95,157.543,312.869,142.357,339.844z M153.134,350.582c6.539-10.966,11.901-22.88,16.349-35.146l-0.928,32.371c-3.998,0.986-9.824,2.606-16.747,4.99L153.134,350.582z M248.713,497.63c-36.114-0.424-68.054-3.958-94.278-8.87v-24.762h94.278V497.63z M248.713,426.096h-94.278v-58.994 c5.303-1.901,10.085-3.37,13.834-4.416c2.822-0.784,5.089-1.332,6.63-1.685c0.771-0.177,1.359-0.301,1.751-0.386l0.424-0.085 l0.098-0.02l5.774-1.104l1.078-37.773h37.211l-0.177-0.19h27.656V426.096z M210.208,309.733l-0.032-0.039 c-5.37-5.762-10.908-10.732-15.65-17.382c-4.729-6.642-8.883-14.957-11.247-27.838l-0.262,0.046 c0.869-4.657,1.666-9.262,2.358-13.776c4.99-32.658,5.604-60.895,5.611-73.103c0-1.464-0.013-2.606-0.02-3.592h65.036h65.036 c-0.006,0.986-0.019,2.129-0.019,3.592c0.007,12.208,0.621,40.444,5.611,73.103c0.692,4.513,1.489,9.118,2.358,13.776l-0.261-0.046 c-2.365,12.881-6.518,21.196-11.248,27.838c-4.742,6.65-10.281,11.62-15.65,17.382l-0.033,0.039h-45.794H210.208z M358.435,488.61 c-26.385,4.99-58.645,8.589-95.144,9.02v-33.632h95.144V488.61z M358.435,426.096h-95.144V321.444h27.655l-0.176,0.19h37.211 l1.078,37.773l5.771,1.104l0.104,0.02l0.418,0.085c0.392,0.085,0.98,0.209,1.75,0.386c1.542,0.352,3.814,0.901,6.636,1.685 c3.958,1.091,9.04,2.665,14.696,4.716V426.096z M343.451,347.806l-0.927-32.371c4.441,12.266,9.81,24.18,16.342,35.146l1.332,2.215 C353.275,350.412,347.449,348.793,343.451,347.806z M429.161,464.802c-1.672,1.424-4.612,3.311-8.622,5.33 c-5.826,2.926-13.847,6.048-23.749,9.164c-1.554,0.464-3.279,0.94-4.911,1.424v-96.963c9.445,6.114,18.393,13.573,25.316,22.56 c8.831,11.482,14.579,25.206,14.605,42.534c0,4.605-0.418,9.465-1.32,14.612C430.336,463.731,429.879,464.234,429.161,464.802z M431.368,463.698l-0.027-0.013l0.079,0.013H431.368z M437.325,464.737l-4.756-0.392h-0.065l-1.058-0.64l6.231,1.032H437.325z"></path> <path class="st0" d="M261.084,119.308c1.266-1.235,2.07-2.926,2.07-4.879s-0.804-3.644-2.07-4.944 c-1.339-1.228-3.077-2.012-5.082-2.012c-2.005,0-3.743,0.784-5.082,2.012c-1.267,1.3-2.07,2.991-2.07,4.944s0.803,3.644,2.07,4.879 c1.339,1.294,3.077,2.012,5.082,2.012C258.007,121.32,259.745,120.602,261.084,119.308z"></path> <path class="st0" d="M272.115,149.994c9.837,0,18.929-5.134,23.88-13.462c4.951-8.256,4.951-18.524,0-26.845L279.94,82.632 c-4.944-8.25-14.043-13.39-23.938-13.39c-9.896,0-18.994,5.14-23.939,13.39l-16.055,27.054c-4.951,8.322-4.951,18.589,0,26.845 c4.951,8.328,14.043,13.462,23.88,13.462h16.114H272.115z M234.134,114.429c0-5.852,2.475-11.247,6.355-15.016 c3.945-3.834,9.497-6.244,15.513-6.244c6.016,0,11.568,2.411,15.513,6.244c3.879,3.769,6.355,9.164,6.355,15.016 c0,5.852-2.476,11.182-6.355,15.023c-3.946,3.828-9.498,6.238-15.513,6.238c-6.016,0-11.568-2.41-15.513-6.238 C236.609,125.611,234.134,120.281,234.134,114.429z"></path> </g> </g></svg>        </div>`,
//         className: '',
//         iconSize: [24, 24],
//         iconAnchor: [12, 12]
//       });

//       const marker = L.marker([firefighter.startZoneLat, firefighter.startZoneLong], { icon: firefighterIcon })
//         .addTo(mapInstance.current!);

//       ambulanceMarkersRef.current[firefighter.id] = marker;
//     });

//     // Cleanup
//     return () => {
//       Object.values(ffMarkersRef.current).forEach((marker) => marker.remove());
//       ffMarkersRef.current = {};
//     };
//   }, [firefighterZones]);

//   // Markers for drone
//   useEffect(() => {
//     if (!mapInstance.current || !droneZone) return;

//     // Clear existing police markers
//     Object.values(droneMarkersRef.current).forEach((marker) => marker.remove());
//     droneMarkersRef.current = {};

//     // Create police markers
//     droneZone.forEach((drone) => {
//       const droneIcon = L.divIcon({
//         html: `<div style="
//           width: 36px;
//           height: 36px;
//           background-color: rgba(255, 42, 254, 0.8);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         ">
//           <svg fill="#ffffff" height="16" width="16" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M244.646,117.342c-0.134-0.712-0.356-1.414-0.634-2.081c-0.278-0.679-0.623-1.325-1.024-1.926 c-0.4-0.612-0.867-1.18-1.38-1.692c-0.512-0.512-1.08-0.979-1.692-1.38c-0.601-0.401-1.247-0.746-1.926-1.024 c-0.668-0.278-1.368-0.501-2.08-0.634c-3.606-0.735-7.457,0.456-10.041,3.039c-0.512,0.512-0.979,1.08-1.38,1.692 c-0.412,0.601-0.746,1.247-1.024,1.926c-0.278,0.668-0.501,1.369-0.633,2.081c-0.146,0.712-0.223,1.447-0.223,2.17 c0,2.927,1.19,5.799,3.261,7.869c2.071,2.07,4.942,3.261,7.869,3.261c0.722,0,1.458-0.078,2.17-0.223 c0.712-0.134,1.414-0.356,2.08-0.634c0.679-0.278,1.325-0.623,1.926-1.024c0.612-0.401,1.18-0.868,1.692-1.38 c0.513-0.512,0.981-1.08,1.38-1.692c0.401-0.601,0.746-1.247,1.024-1.914c0.278-0.679,0.501-1.38,0.634-2.093 c0.145-0.712,0.223-1.447,0.223-2.17S244.791,118.054,244.646,117.342z"></path> </g> </g> <g> <g> <path d="M500.87,166.817v-55.652c0-6.147-4.984-11.13-11.13-11.13h-11.13V55.512h22.261c6.146,0,11.13-4.983,11.13-11.13 s-4.984-11.13-11.13-11.13h-22.261v-11.13c0-6.147-4.984-11.13-11.13-11.13s-11.13,4.983-11.13,11.13v11.13h-22.261 c-6.146,0-11.13,4.983-11.13,11.13s4.984,11.13,11.13,11.13h22.261v44.522h-11.13c-6.146,0-11.13,4.983-11.13,11.13v55.652 h-14.238l-4.107-12.321c-9.195-27.581-34.904-46.113-63.978-46.113h-84.262c-6.146,0-11.13,4.983-11.13,11.13 s4.984,11.13,11.13,11.13h84.262c19.476,0,36.7,12.414,42.86,30.891l4.522,13.57c2.786,8.358,10.577,13.973,19.387,13.973h26.684 h44.522v22.261h-72.933c-6.849,0-13.205,3.403-17.002,9.099c-8.399,12.597-22.451,20.118-37.591,20.118h-17.17 c-5.025,0-9.427,3.367-10.742,8.218l-9.795,36.118c-5.782,21.326-24.702,36.472-46.568,37.666h-43.878 c-21.866-1.194-40.784-16.341-46.568-37.667l-9.795-36.118c-1.316-4.85-5.718-8.218-10.742-8.218h-17.169 c-7.576,0-14.88-1.884-21.34-5.345c-0.114-0.068-0.228-0.134-0.345-0.198c-6.301-3.447-11.786-8.395-15.905-14.573 c-3.798-5.699-10.154-9.101-17.003-9.101H22.261v-22.261h44.522h26.685c8.81,0,16.601-5.615,19.386-13.972l4.525-13.571 c6.158-18.478,23.383-30.891,42.859-30.891h40.111c6.146,0,11.13-4.983,11.13-11.13s-4.984-11.13-11.13-11.13h-40.111 c-29.074,0-54.784,18.531-63.977,46.112l-4.108,12.323H77.913v-55.652c0-6.147-4.984-11.13-11.13-11.13h-11.13V55.512h22.261 c6.146,0,11.13-4.983,11.13-11.13s-4.984-11.13-11.13-11.13H55.652v-11.13c0-6.147-4.984-11.13-11.13-11.13 c-6.146,0-11.13,4.983-11.13,11.13v11.13H11.13C4.984,33.252,0,38.235,0,44.382s4.984,11.13,11.13,11.13h22.261v44.522h-11.13 c-6.146,0-11.13,4.983-11.13,11.13v55.652C4.984,166.817,0,171.8,0,177.947v44.522c0,6.147,4.984,11.13,11.13,11.13h83.094 c4.221,6.138,9.355,11.439,15.15,15.78l-19.748,58.577c-0.386,1.146-0.583,2.346-0.583,3.556v178.087 c0,6.147,4.984,11.13,11.13,11.13c6.146,0,11.13-4.983,11.13-11.13V313.338l18.091-53.665c6.505,2.058,13.37,3.144,20.392,3.144 h8.654l7.567,27.901c7.382,27.224,29.679,47.429,56.6,52.775v12.542h-33.391c-6.146,0-11.13,4.983-11.13,11.13v100.174 c0,6.147,4.984,11.13,11.13,11.13h133.565c6.146,0,11.13-4.983,11.13-11.13V367.165c0-6.147-4.984-11.13-11.13-11.13h-33.391 v-12.542c26.921-5.346,49.218-25.551,56.6-52.775l7.566-27.901h8.654c7.063,0,13.968-1.101,20.506-3.182l18.106,53.703v142.87 c0,6.147,4.984,11.13,11.13,11.13c6.146,0,11.13-4.983,11.13-11.13V311.512c0-1.209-0.197-2.411-0.583-3.556l-19.774-58.654 c5.753-4.328,10.853-9.601,15.049-15.703h83.093c6.146,0,11.13-4.983,11.13-11.13v-44.522 C512,171.8,507.016,166.817,500.87,166.817z M478.609,166.817h-22.261v-44.522h22.261V166.817z M33.391,122.295h22.261v44.522 H33.391V122.295z M244.87,344.904h22.261v11.13H244.87V344.904z M311.652,378.295v77.913H200.348v-77.913h33.391h44.522H311.652z"></path> </g> </g> <g> <g> <path d="M411.953,478.562c-6.146,0-11.13,4.983-11.13,11.13v0.186c0,6.147,4.984,11.13,11.13,11.13s11.13-4.983,11.13-11.13 v-0.186C423.083,483.546,418.1,478.562,411.953,478.562z"></path> </g> </g> <g> <g> <path d="M278.261,394.991c-12.275,0-22.261,9.986-22.261,22.261s9.986,22.261,22.261,22.261s22.261-9.986,22.261-22.261 S290.536,394.991,278.261,394.991z"></path> </g> </g> </g></svg>
//         </div>`,
//         className: '',
//         iconSize: [24, 24],
//         iconAnchor: [12, 12]
//       });

//       const marker = L.marker([drone.startZoneLat, drone.startZoneLong], { icon: droneIcon })
//         .addTo(mapInstance.current!);

//       ambulanceMarkersRef.current[drone.id] = marker;
//     });

//     // Cleanup
//     return () => {
//       Object.values(droneMarkersRef.current).forEach((marker) => marker.remove());
//       droneMarkersRef.current = {};
//     };
//   }, [droneZone]);


//   return (
//     <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border">
//       <div ref={mapContainer} className="absolute inset-0" />
//     </div>
//   );
// };

// export default Map;

// src/components/Map.tsx

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import { 
  AlertType, 
  PoliceType, 
  AmbulanceType, 
  FirefighterType, 
  DroneType 
} from '@/types/alerts';

import { 
  getRandomLatLngWithinRadius, 
  getRouteOnRoad, 
  animateMarkerAlongRoute 
} from '@/utils/mapUtils';

interface MapProps {
  alerts: AlertType[];
  onAlertSelect: (alert: AlertType) => void;
  midpoint?: [number, number];
  centerOffset?: number;
  policeZones?: PoliceType[];
  ambulanceZones?: AmbulanceType[];
  firefighterZones?: FirefighterType[];
  droneZone?: DroneType[];
}

const Map = ({
  alerts,
  onAlertSelect,
  midpoint,
  centerOffset = 0,
  policeZones = [],
  ambulanceZones = [],
  firefighterZones = [],
  droneZone = []
}: MapProps) => {
  // ------------------------------------------
  // Refs for the DOM container and the Leaflet Map instance
  // ------------------------------------------
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  // ------------------------------------------
  // Marker references (one ref per entity type)
  // ------------------------------------------
  const alertMarkersRef = useRef<{ [alertId: string]: L.Marker }>({});
  const policeMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const ambulanceMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const ffMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const droneMarkersRef = useRef<{ [key: string]: L.Marker }>({});

  // ------------------------------------------
  // State: current positions for each type
  // ------------------------------------------
  const [policePositions, setPolicePositions] = useState<Record<string, [number, number]>>({});
  // const [ambulancePositions, setAmbulancePositions] = useState<Record<string, [number, number]>>({});
  // const [ffPositions, setFfPositions] = useState<Record<string, [number, number]>>({});
  // const [dronePositions, setDronePositions] = useState<Record<string, [number, number]>>({});

  // ------------------------------------------
  // 1) Initialize the map only once
  // ------------------------------------------
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const initialCenter = midpoint ?? [40.7128, -74.006]; // default
    const map = L.map(mapContainer.current).setView(initialCenter, 9);
    mapInstance.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    return () => {
      // Cleanup map on unmount
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [midpoint]);

  // ------------------------------------------
  // 2) Adjust map center if midpoint or offset changes
  // ------------------------------------------
  useEffect(() => {
    if (!mapInstance.current || !midpoint) return;

    // Convert midpoint to container point, add offset, convert back
    const containerPoint = mapInstance.current.latLngToContainerPoint(midpoint);
    const adjustedPoint = L.point(containerPoint.x, containerPoint.y + centerOffset);
    const adjustedLatLng = mapInstance.current.containerPointToLatLng(adjustedPoint);
    mapInstance.current.setView(adjustedLatLng, mapInstance.current.getZoom());
  }, [midpoint, centerOffset]);

  // ------------------------------------------
  // 3) ALERT MARKERS (static, non-moving)
  // ------------------------------------------
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove old markers
    Object.values(alertMarkersRef.current).forEach((marker) => marker.remove());
    alertMarkersRef.current = {};

    // Add new markers
    alerts.forEach((alert) => {
      // Build an icon HTML based on alert.type
      const iconHtml = (() => {
        switch (alert.type) {
          case 'fire':
            return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                    </svg>`;
          case 'assault':
            return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round-x"><path d="M2 21a8 8 0 0 1 11.873-7"/><circle cx="10" cy="8" r="5"/><path d="m17 17 5 5"/><path d="m22 17-5 5"/></svg>`;
          default:
            // e.g. 'medical', etc.
            return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12
                               a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>`;
        }
      })();

      // Color depends on alert type
      const bgColor =
        alert.type === 'fire'
          ? 'rgba(255, 0, 0, 0.7)'
          : alert.type === 'assault'
          ? 'rgba(255, 115, 0, 0.7)'
          : 'rgba(0, 0, 255, 0.7)';

      const icon = L.divIcon({
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background-color: ${bgColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;"
          >
            ${iconHtml}
          </div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([alert.latitude, alert.longitude], { icon })
        .addTo(mapInstance.current!)
        .on('click', () => onAlertSelect(alert));

      alertMarkersRef.current[alert.id] = marker;
    });
  }, [alerts, onAlertSelect]);

  // ------------------------------------------
  // 4) POLICE MARKERS
  // ------------------------------------------

  // (A) Create markers (depends ONLY on policeZones)
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove existing
    Object.values(policeMarkersRef.current).forEach((m) => m.remove());
    policeMarkersRef.current = {};

    // Build newPositions from existing state, or start fresh
    const newPositions = { ...policePositions };
    policeZones.forEach((pz) => {
      const latNum = typeof pz.startZoneLat === 'string' 
        ? parseFloat(pz.startZoneLat) 
        : pz.startZoneLat;
      const lngNum = typeof pz.startZoneLong === 'string' 
        ? parseFloat(pz.startZoneLong) 
        : pz.startZoneLong;

      // Initialize position if not present
      if (!newPositions[pz.id]) {
        newPositions[pz.id] = [latNum, lngNum];
      }
    });

    // Update state once
    setPolicePositions(newPositions);

    // Create markers
    policeZones.forEach((pz) => {
      const [lat, lng] = newPositions[pz.id];
      const policeIcon = L.divIcon({
        html: `<div style="
          width: 36px;
          height: 36px;
          background-color: rgba(0, 0, 255, 0.7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-siren"><path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 12v6"/></svg>
        </div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: policeIcon })
        .addTo(mapInstance.current!);
      policeMarkersRef.current[pz.id] = marker;
    });
  }, [policeZones]); 
  // <-- Notice we do NOT depend on `policePositions` here 
  // to avoid re-creation each time positions update.

  // (B) Move police markers (depends on positions + zones)
  useEffect(() => {
    if (!mapInstance.current) return;

    const interval = setInterval(async () => {
      const updatedPositions = { ...policePositions };

      for (const pz of policeZones) {
        const currentPos = updatedPositions[pz.id];
        if (!currentPos) continue;

        // pick new random point
        const [randLat, randLng] = getRandomLatLngWithinRadius(
          currentPos[0],
          currentPos[1],
          500
        );

        // route and animate
        try {
          const routeCoords = await getRouteOnRoad(currentPos, [randLat, randLng]);
          const marker = policeMarkersRef.current[pz.id];
          if (marker && routeCoords.length > 1) {
            animateMarkerAlongRoute(marker, routeCoords, 5000);
            updatedPositions[pz.id] = [
              routeCoords[routeCoords.length - 1].lat,
              routeCoords[routeCoords.length - 1].lng
            ];
          }
        } catch (err) {
          console.warn('Routing failed (police):', pz.id, err);
        }
      }
      // after looping all police, update state
      setPolicePositions(updatedPositions);
    }, 30000);

    return () => clearInterval(interval);
  }, [policeZones, policePositions]);

  // ------------------------------------------
  // 5) AMBULANCE MARKERS
  // ------------------------------------------
  const [ambulancePositions, setAmbulancePositions] = useState<Record<string, [number, number]>>({});

  // (A) Create ambulance markers
  useEffect(() => {
    if (!mapInstance.current) return;

    Object.values(ambulanceMarkersRef.current).forEach((m) => m.remove());
    ambulanceMarkersRef.current = {};

    const newPositions = { ...ambulancePositions };
    ambulanceZones.forEach((az) => {
      const latNum = typeof az.startZoneLat === 'string' 
        ? parseFloat(az.startZoneLat) 
        : az.startZoneLat;
      const lngNum = typeof az.startZoneLong === 'string' 
        ? parseFloat(az.startZoneLong) 
        : az.startZoneLong;

      if (!newPositions[az.id]) {
        newPositions[az.id] = [latNum, lngNum];
      }
    });
    setAmbulancePositions(newPositions);

    ambulanceZones.forEach((az) => {
      const [lat, lng] = newPositions[az.id];
      const ambulanceIcon = L.divIcon({
        html: `<div style="
          width: 36px;
          height: 36px;
          background-color: rgba(255, 42, 42, 0.8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ambulance"><path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><path d="M8 8v4"/><path d="M9 18h6"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
        </div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const marker = L.marker([lat, lng], { icon: ambulanceIcon })
        .addTo(mapInstance.current!);
      ambulanceMarkersRef.current[az.id] = marker;
    });
  }, [ambulanceZones]); 
  // <-- No ambulancePositions in the array

  // (B) Move ambulance markers
  useEffect(() => {
    if (!mapInstance.current) return;

    const interval = setInterval(async () => {
      const updated = { ...ambulancePositions };
      for (const az of ambulanceZones) {
        const currentPos = updated[az.id];
        if (!currentPos) continue;

        const [lat, lng] = getRandomLatLngWithinRadius(currentPos[0], currentPos[1], 500);

        try {
          const routeCoords = await getRouteOnRoad(currentPos, [lat, lng]);
          const marker = ambulanceMarkersRef.current[az.id];
          if (marker && routeCoords.length > 1) {
            animateMarkerAlongRoute(marker, routeCoords, 5000);
            updated[az.id] = [
              routeCoords[routeCoords.length - 1].lat,
              routeCoords[routeCoords.length - 1].lng
            ];
          }
        } catch (err) {
          console.warn('Routing failed (ambulance):', az.id, err);
        }
      }
      setAmbulancePositions(updated);
    }, 25000);

    return () => clearInterval(interval);
  }, [ambulanceZones, ambulancePositions]);

  // ------------------------------------------
  // 6) FIREFIGHTER MARKERS
  // ------------------------------------------
  const [ffPositions, setFfPositions] = useState<Record<string, [number, number]>>({});

  // (A) Create firefighter markers
  useEffect(() => {
    if (!mapInstance.current) return;

    Object.values(ffMarkersRef.current).forEach((m) => m.remove());
    ffMarkersRef.current = {};

    const newPositions = { ...ffPositions };
    firefighterZones.forEach((fz) => {
      const latNum = typeof fz.startZoneLat === 'string'
        ? parseFloat(fz.startZoneLat)
        : fz.startZoneLat;
      const lngNum = typeof fz.startZoneLong === 'string'
        ? parseFloat(fz.startZoneLong)
        : fz.startZoneLong;

      if (!newPositions[fz.id]) {
        newPositions[fz.id] = [latNum, lngNum];
      }
    });
    setFfPositions(newPositions);

    firefighterZones.forEach((fz) => {
      const [lat, lng] = newPositions[fz.id];
      const ffIcon = L.divIcon({
        html: `<div style="
          width: 36px;
          height: 36px;
          background-color: rgba(0, 140, 59, 0.93);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
        <svg height="16" width="16" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#ffffff;} </style> <g> <path class="st0" d="M446.508,448.852c0.026-20.516-7.08-37.622-17.544-51.117c-10.477-13.534-24.142-23.612-37.596-31.143 c-9.602-5.356-19.099-9.419-27.408-12.449h72.659l-4.442-9.98c0,0-0.143-0.346-0.444-1.046c-0.313-0.699-0.757-1.737-1.332-3.102 c-1.15-2.73-2.822-6.735-4.833-11.79c-4.036-10.138-9.498-24.507-15.154-41.424c-10.843-32.339-22.299-73.991-26.126-112.75h6.152 c5.212,0,10.033-3.122,11.901-7.995c0-0.066,0-0.066,0.066-0.131c0.47-1.365,0.744-2.86,0.744-4.232c0-3.507-1.542-6.956-4.35-9.36 l-23.214-19.569c-1.607-54.023-41.071-98.694-93.505-110.072v-2.6c0-11.058-9.229-20.026-20.666-20.092h-5.415h-5.415 c-11.436,0.066-20.666,9.034-20.666,20.092v2.6c-52.436,11.378-91.9,56.049-93.508,110.072l-23.207,19.569 c-2.808,2.404-4.35,5.852-4.35,9.36c0,1.372,0.268,2.868,0.738,4.232c0.065,0.066,0.065,0.066,0.065,0.131 c1.875,4.872,6.688,7.995,11.908,7.995h6.152c-3.834,38.759-15.29,80.411-26.126,112.75c-5.656,16.917-11.117,31.286-15.153,41.424 c-2.019,5.055-3.684,9.059-4.834,11.79c-0.574,1.365-1.025,2.403-1.332,3.102c-0.3,0.699-0.451,1.039-0.451,1.039l-4.435,9.987 h72.652c-8.302,3.03-17.806,7.093-27.407,12.449c-13.456,7.531-27.12,17.609-37.59,31.143 c-10.463,13.495-17.576,30.601-17.55,51.117c0,5.271,0.49,10.764,1.457,16.473h-0.026c0,0.157,0.046,0.268,0.078,0.398 c0.014,0.072,0.02,0.15,0.033,0.229h0.013c0.007,0,0.007,0.013,0.007,0.013c0.34,2.149,1.208,3.84,2.142,5.337 c2.142,2.991,4.886,5.264,8.426,7.544c6.087,3.9,14.585,7.806,25.421,11.568C135.544,501.667,189.32,512,256.002,512 c66.682,0,120.461-10.333,152.962-21.587c10.83-3.762,19.334-7.668,25.421-11.568c3.54-2.279,6.284-4.553,8.426-7.544 c0.928-1.496,1.802-3.188,2.142-5.33v-0.019h0.014c0.013-0.079,0.026-0.157,0.039-0.229c0.026-0.13,0.078-0.242,0.078-0.398h-0.026 C446.025,459.616,446.508,454.123,446.508,448.852z M79.496,464.345h-0.066l-4.749,0.392h-0.359l6.238-1.032L79.496,464.345z M80.632,463.698H80.58l0.078-0.013L80.632,463.698z M120.992,480.968c-1.946-0.569-3.946-1.13-5.781-1.672 c-9.896-3.115-17.923-6.238-23.743-9.164c-4.01-2.019-6.956-3.906-8.628-5.33c-0.719-0.569-1.169-1.072-1.313-1.339 c-0.902-5.147-1.32-10.006-1.32-14.612c0.026-17.328,5.774-31.052,14.605-42.534c7.126-9.255,16.414-16.878,26.179-23.096V480.968z M396.411,291.229c7.106,21.215,13.873,38.452,18.041,48.616h-44.808c-15.18-26.976-23.854-60.895-28.465-91.202 c-4.834-31.646-5.448-59.275-5.448-70.999c0-1.496,0.014-2.639,0.026-3.592H369.5C373.379,214.932,385.28,257.917,396.411,291.229z M390.44,161.758v0.588h-0.536L390.44,161.758z M121.567,162.346v-0.588l0.536,0.588H121.567z M123.774,162.346l27.29-23.018 v-3.253c0-1.294,0-2.593,0.13-3.834v-0.026h46.172v-20.398h-43.286c9.562-37.962,41.065-67.538,80.719-75.474 c0.007,0,0.013-0.007,0.02-0.007v23.05h9.366V34.71l0.451-0.059V20.092c0-3.181,2.672-5.722,5.95-5.787h5.415h5.415 c3.279,0.065,5.95,2.606,5.95,5.787v14.559l0.451,0.059v24.676h9.367v-23.05c0.006,0,0.013,0.007,0.019,0.007 c39.654,7.936,71.16,37.512,80.722,75.474h-43.289v20.398h46.176v0.026c0.131,1.241,0.131,2.541,0.131,3.834v3.253l27.289,23.018 H256.002H123.774z M142.357,339.844H97.549c4.174-10.164,10.94-27.4,18.041-48.616c11.136-33.312,23.03-76.296,26.917-117.178 h33.742c0.007,0.954,0.02,2.097,0.02,3.592c0,11.724-0.608,39.354-5.447,70.999C166.211,278.95,157.543,312.869,142.357,339.844z M153.134,350.582c6.539-10.966,11.901-22.88,16.349-35.146l-0.928,32.371c-3.998,0.986-9.824,2.606-16.747,4.99L153.134,350.582z M248.713,497.63c-36.114-0.424-68.054-3.958-94.278-8.87v-24.762h94.278V497.63z M248.713,426.096h-94.278v-58.994 c5.303-1.901,10.085-3.37,13.834-4.416c2.822-0.784,5.089-1.332,6.63-1.685c0.771-0.177,1.359-0.301,1.751-0.386l0.424-0.085 l0.098-0.02l5.774-1.104l1.078-37.773h37.211l-0.177-0.19h27.656V426.096z M210.208,309.733l-0.032-0.039 c-5.37-5.762-10.908-10.732-15.65-17.382c-4.729-6.642-8.883-14.957-11.247-27.838l-0.262,0.046 c0.869-4.657,1.666-9.262,2.358-13.776c4.99-32.658,5.604-60.895,5.611-73.103c0-1.464-0.013-2.606-0.02-3.592h65.036h65.036 c-0.006,0.986-0.019,2.129-0.019,3.592c0.007,12.208,0.621,40.444,5.611,73.103c0.692,4.513,1.489,9.118,2.358,13.776l-0.261-0.046 c-2.365,12.881-6.518,21.196-11.248,27.838c-4.742,6.65-10.281,11.62-15.65,17.382l-0.033,0.039h-45.794H210.208z M358.435,488.61 c-26.385,4.99-58.645,8.589-95.144,9.02v-33.632h95.144V488.61z M358.435,426.096h-95.144V321.444h27.655l-0.176,0.19h37.211 l1.078,37.773l5.771,1.104l0.104,0.02l0.418,0.085c0.392,0.085,0.98,0.209,1.75,0.386c1.542,0.352,3.814,0.901,6.636,1.685 c3.958,1.091,9.04,2.665,14.696,4.716V426.096z M343.451,347.806l-0.927-32.371c4.441,12.266,9.81,24.18,16.342,35.146l1.332,2.215 C353.275,350.412,347.449,348.793,343.451,347.806z M429.161,464.802c-1.672,1.424-4.612,3.311-8.622,5.33 c-5.826,2.926-13.847,6.048-23.749,9.164c-1.554,0.464-3.279,0.94-4.911,1.424v-96.963c9.445,6.114,18.393,13.573,25.316,22.56 c8.831,11.482,14.579,25.206,14.605,42.534c0,4.605-0.418,9.465-1.32,14.612C430.336,463.731,429.879,464.234,429.161,464.802z M431.368,463.698l-0.027-0.013l0.079,0.013H431.368z M437.325,464.737l-4.756-0.392h-0.065l-1.058-0.64l6.231,1.032H437.325z"></path> <path class="st0" d="M261.084,119.308c1.266-1.235,2.07-2.926,2.07-4.879s-0.804-3.644-2.07-4.944 c-1.339-1.228-3.077-2.012-5.082-2.012c-2.005,0-3.743,0.784-5.082,2.012c-1.267,1.3-2.07,2.991-2.07,4.944s0.803,3.644,2.07,4.879 c1.339,1.294,3.077,2.012,5.082,2.012C258.007,121.32,259.745,120.602,261.084,119.308z"></path> <path class="st0" d="M272.115,149.994c9.837,0,18.929-5.134,23.88-13.462c4.951-8.256,4.951-18.524,0-26.845L279.94,82.632 c-4.944-8.25-14.043-13.39-23.938-13.39c-9.896,0-18.994,5.14-23.939,13.39l-16.055,27.054c-4.951,8.322-4.951,18.589,0,26.845 c4.951,8.328,14.043,13.462,23.88,13.462h16.114H272.115z M234.134,114.429c0-5.852,2.475-11.247,6.355-15.016 c3.945-3.834,9.497-6.244,15.513-6.244c6.016,0,11.568,2.411,15.513,6.244c3.879,3.769,6.355,9.164,6.355,15.016 c0,5.852-2.476,11.182-6.355,15.023c-3.946,3.828-9.498,6.238-15.513,6.238c-6.016,0-11.568-2.41-15.513-6.238 C236.609,125.611,234.134,120.281,234.134,114.429z"></path> </g> </g></svg>        </div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const marker = L.marker([lat, lng], { icon: ffIcon })
        .addTo(mapInstance.current!);
      ffMarkersRef.current[fz.id] = marker;
    });
  }, [firefighterZones]);
  // <-- note: no ffPositions in array

  // (B) Move firefighter
  useEffect(() => {
    if (!mapInstance.current) return;

    const interval = setInterval(async () => {
      const updated = { ...ffPositions };
      for (const fz of firefighterZones) {
        const currentPos = updated[fz.id];
        if (!currentPos) continue;

        const [lat, lng] = getRandomLatLngWithinRadius(currentPos[0], currentPos[1], 500);

        try {
          const routeCoords = await getRouteOnRoad(currentPos, [lat, lng]);
          const marker = ffMarkersRef.current[fz.id];
          if (marker && routeCoords.length > 1) {
            animateMarkerAlongRoute(marker, routeCoords, 5000);
            updated[fz.id] = [
              routeCoords[routeCoords.length - 1].lat,
              routeCoords[routeCoords.length - 1].lng
            ];
          }
        } catch (err) {
          console.warn('Routing failed (firefighter):', fz.id, err);
        }
      }
      setFfPositions(updated);
    }, 40000);

    return () => clearInterval(interval);
  }, [firefighterZones, ffPositions]);

  // ------------------------------------------
  // 7) DRONE MARKERS (off-road / random flight)
  // ------------------------------------------
  const [dronePositions, setDronePositions] = useState<Record<string, [number, number]>>({});

  // (A) Create drone markers
  useEffect(() => {
    if (!mapInstance.current) return;

    Object.values(droneMarkersRef.current).forEach((m) => m.remove());
    droneMarkersRef.current = {};

    const newPositions = { ...dronePositions };
    droneZone.forEach((dz) => {
      const latNum = typeof dz.startZoneLat === 'string' 
        ? parseFloat(dz.startZoneLat)
        : dz.startZoneLat;
      const lngNum = typeof dz.startZoneLong === 'string' 
        ? parseFloat(dz.startZoneLong)
        : dz.startZoneLong;

      if (!newPositions[dz.id]) {
        newPositions[dz.id] = [latNum, lngNum];
      }
    });
    setDronePositions(newPositions);

    // Create markers
    droneZone.forEach((dz) => {
      const [lat, lng] = newPositions[dz.id];
      const droneIcon = L.divIcon({
        html: `<div style="
          width: 36px;
          height: 36px;
          background-color: rgba(255, 42, 254, 0.8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg fill="#ffffff" height="16" width="16" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M244.646,117.342c-0.134-0.712-0.356-1.414-0.634-2.081c-0.278-0.679-0.623-1.325-1.024-1.926 c-0.4-0.612-0.867-1.18-1.38-1.692c-0.512-0.512-1.08-0.979-1.692-1.38c-0.601-0.401-1.247-0.746-1.926-1.024 c-0.668-0.278-1.368-0.501-2.08-0.634c-3.606-0.735-7.457,0.456-10.041,3.039c-0.512,0.512-0.979,1.08-1.38,1.692 c-0.412,0.601-0.746,1.247-1.024,1.926c-0.278,0.668-0.501,1.369-0.633,2.081c-0.146,0.712-0.223,1.447-0.223,2.17 c0,2.927,1.19,5.799,3.261,7.869c2.071,2.07,4.942,3.261,7.869,3.261c0.722,0,1.458-0.078,2.17-0.223 c0.712-0.134,1.414-0.356,2.08-0.634c0.679-0.278,1.325-0.623,1.926-1.024c0.612-0.401,1.18-0.868,1.692-1.38 c0.513-0.512,0.981-1.08,1.38-1.692c0.401-0.601,0.746-1.247,1.024-1.914c0.278-0.679,0.501-1.38,0.634-2.093 c0.145-0.712,0.223-1.447,0.223-2.17S244.791,118.054,244.646,117.342z"></path> </g> </g> <g> <g> <path d="M500.87,166.817v-55.652c0-6.147-4.984-11.13-11.13-11.13h-11.13V55.512h22.261c6.146,0,11.13-4.983,11.13-11.13 s-4.984-11.13-11.13-11.13h-22.261v-11.13c0-6.147-4.984-11.13-11.13-11.13s-11.13,4.983-11.13,11.13v11.13h-22.261 c-6.146,0-11.13,4.983-11.13,11.13s4.984,11.13,11.13,11.13h22.261v44.522h-11.13c-6.146,0-11.13,4.983-11.13,11.13v55.652 h-14.238l-4.107-12.321c-9.195-27.581-34.904-46.113-63.978-46.113h-84.262c-6.146,0-11.13,4.983-11.13,11.13 s4.984,11.13,11.13,11.13h84.262c19.476,0,36.7,12.414,42.86,30.891l4.522,13.57c2.786,8.358,10.577,13.973,19.387,13.973h26.684 h44.522v22.261h-72.933c-6.849,0-13.205,3.403-17.002,9.099c-8.399,12.597-22.451,20.118-37.591,20.118h-17.17 c-5.025,0-9.427,3.367-10.742,8.218l-9.795,36.118c-5.782,21.326-24.702,36.472-46.568,37.666h-43.878 c-21.866-1.194-40.784-16.341-46.568-37.667l-9.795-36.118c-1.316-4.85-5.718-8.218-10.742-8.218h-17.169 c-7.576,0-14.88-1.884-21.34-5.345c-0.114-0.068-0.228-0.134-0.345-0.198c-6.301-3.447-11.786-8.395-15.905-14.573 c-3.798-5.699-10.154-9.101-17.003-9.101H22.261v-22.261h44.522h26.685c8.81,0,16.601-5.615,19.386-13.972l4.525-13.571 c6.158-18.478,23.383-30.891,42.859-30.891h40.111c6.146,0,11.13-4.983,11.13-11.13s-4.984-11.13-11.13-11.13h-40.111 c-29.074,0-54.784,18.531-63.977,46.112l-4.108,12.323H77.913v-55.652c0-6.147-4.984-11.13-11.13-11.13h-11.13V55.512h22.261 c6.146,0,11.13-4.983,11.13-11.13s-4.984-11.13-11.13-11.13H55.652v-11.13c0-6.147-4.984-11.13-11.13-11.13 c-6.146,0-11.13,4.983-11.13,11.13v11.13H11.13C4.984,33.252,0,38.235,0,44.382s4.984,11.13,11.13,11.13h22.261v44.522h-11.13 c-6.146,0-11.13,4.983-11.13,11.13v55.652C4.984,166.817,0,171.8,0,177.947v44.522c0,6.147,4.984,11.13,11.13,11.13h83.094 c4.221,6.138,9.355,11.439,15.15,15.78l-19.748,58.577c-0.386,1.146-0.583,2.346-0.583,3.556v178.087 c0,6.147,4.984,11.13,11.13,11.13c6.146,0,11.13-4.983,11.13-11.13V313.338l18.091-53.665c6.505,2.058,13.37,3.144,20.392,3.144 h8.654l7.567,27.901c7.382,27.224,29.679,47.429,56.6,52.775v12.542h-33.391c-6.146,0-11.13,4.983-11.13,11.13v100.174 c0,6.147,4.984,11.13,11.13,11.13h133.565c6.146,0,11.13-4.983,11.13-11.13V367.165c0-6.147-4.984-11.13-11.13-11.13h-33.391 v-12.542c26.921-5.346,49.218-25.551,56.6-52.775l7.566-27.901h8.654c7.063,0,13.968-1.101,20.506-3.182l18.106,53.703v142.87 c0,6.147,4.984,11.13,11.13,11.13c6.146,0,11.13-4.983,11.13-11.13V311.512c0-1.209-0.197-2.411-0.583-3.556l-19.774-58.654 c5.753-4.328,10.853-9.601,15.049-15.703h83.093c6.146,0,11.13-4.983,11.13-11.13v-44.522 C512,171.8,507.016,166.817,500.87,166.817z M478.609,166.817h-22.261v-44.522h22.261V166.817z M33.391,122.295h22.261v44.522 H33.391V122.295z M244.87,344.904h22.261v11.13H244.87V344.904z M311.652,378.295v77.913H200.348v-77.913h33.391h44.522H311.652z"></path> </g> </g> <g> <g> <path d="M411.953,478.562c-6.146,0-11.13,4.983-11.13,11.13v0.186c0,6.147,4.984,11.13,11.13,11.13s11.13-4.983,11.13-11.13 v-0.186C423.083,483.546,418.1,478.562,411.953,478.562z"></path> </g> </g> <g> <g> <path d="M278.261,394.991c-12.275,0-22.261,9.986-22.261,22.261s9.986,22.261,22.261,22.261s22.261-9.986,22.261-22.261 S290.536,394.991,278.261,394.991z"></path> </g> </g> </g></svg>
        </div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const marker = L.marker([lat, lng], { icon: droneIcon })
        .addTo(mapInstance.current!);
      droneMarkersRef.current[dz.id] = marker;
    });
  }, [droneZone]);
  // <-- no dronePositions in array

  // (B) Animate drones
  useEffect(() => {
    if (!mapInstance.current) return;

    const interval = setInterval(() => {
      const updatedPositions = { ...dronePositions };
      droneZone.forEach((dz) => {
        const currentPos = updatedPositions[dz.id];
        if (!currentPos) return;

        const [targetLat, targetLng] = getRandomLatLngWithinRadius(
          currentPos[0],
          currentPos[1],
          500
        );

        const marker = droneMarkersRef.current[dz.id];
        if (!marker) return;

        // Animate in 20 steps over ~1 second
        const steps = 20;
        let stepCount = 0;
        const latStep = (targetLat - currentPos[0]) / steps;
        const lngStep = (targetLng - currentPos[1]) / steps;

        const anim = setInterval(() => {
          stepCount++;
          const newLat = currentPos[0] + latStep * stepCount;
          const newLng = currentPos[1] + lngStep * stepCount;
          marker.setLatLng([newLat, newLng]);

          if (stepCount === steps) {
            clearInterval(anim);
            updatedPositions[dz.id] = [newLat, newLng];
            setDronePositions({ ...updatedPositions });
          }
        }, 50);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [droneZone, dronePositions]);

  // ------------------------------------------
  // RENDER
  // ------------------------------------------
  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;
