export interface AlertType {
  id: string;
  type: 'fire' | 'assault' | 'kidnapping' | 'other';
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