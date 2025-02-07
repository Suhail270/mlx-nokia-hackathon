export interface AlertType {
  id: string;
  type: 'fire' | 'assault' | 'kidnapping' | 'other' | 'نار' | 'يتعدى';
  severity: 'critical' | 'warning' | 'info';
  location: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  description: string;
  image?: string;
  video_path: string;
  geo_info: string;
  responder_type: string
  response_time: number
  resolution_time: number
  status: string
}

export interface PoliceType {
  id: string;
  zone: string;
  startZoneLat: string;
  startZoneLong: string;
}

export interface FirefighterType {
  id: string;
  zone: string;
  startZoneLat: string;
  startZoneLong: string;
}

export interface DroneType {
  id: string;
  zone: string;
  startZoneLat: string;
  startZoneLong: string;
}

export interface AmbulanceType {
  id: string;
  zone: string;
  startZoneLat: string;
  startZoneLong: string;
}

export interface DispatchType {
  id: string;
  alert_id: string;
  police_id: string;
  ambulance_id: string;
  firefighter_id: string;
  drone_id: string;
  dispatch_time: string;
}

