export type TestPhase = 
  | 'idle' 
  | 'finding_server' 
  | 'ping' 
  | 'download' 
  | 'upload' 
  | 'complete' 
  | 'error';

export type SpeedUnit = 'Mbps' | 'MB/s' | 'Kbps';
export type ConnectionMode = 'Multi' | 'Single';

export interface ServerNode {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  sponsor: string;
  host: string;
  lat: number;
  lon: number;
  distanceKm?: number;
  ping?: number;
  status?: 'optimal' | 'good' | 'fair';
}

export interface ClientInfo {
  ip: string;
  isp: string;
  org?: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  asn?: string;
  connectionType?: string;
}

export interface SpeedTestResult {
  id: string;
  timestamp: number;
  downloadSpeed: number; // in Mbps
  uploadSpeed: number; // in Mbps
  ping: number; // ms
  jitter: number; // ms
  downloadLatency: number; // ms under load
  uploadLatency: number; // ms under load
  packetLoss: number; // percentage 0-100
  server: ServerNode;
  clientInfo: ClientInfo;
  connectionMode: ConnectionMode;
  ratingGrade: {
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    title: string;
    description: string;
    color: string;
  };
  durationSeconds: number;
}

export interface LiveSample {
  time: number; // seconds from start of phase
  speed: number; // current instant Mbps
  avgSpeed: number; // running smoothed average Mbps
  progress: number; // 0 to 100
  bytesTransferred: number;
}

export interface TestSettings {
  units: SpeedUnit;
  connectionMode: ConnectionMode;
  duration: 'quick' | 'standard' | 'extended'; // 6s, 12s, 20s
  enableAudio: boolean;
  theme: 'dark' | 'pure-black' | 'cyber';
  gaugeMaxSpeed: number; // 100, 500, 1000, 2500, 10000
}

export interface VideoTestStage {
  resolution: string;
  label: string;
  targetBitrateMbps: number;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  loadTimeMs: number;
  bufferHealthPct: number;
}

export interface VideoTestResult {
  maxResolution: string;
  qualityLabel: string;
  loadTimeAvgMs: number;
  bufferHealthPct: number;
  bitrateCapableMbps: number;
  stages: VideoTestStage[];
  recommendation: string;
}
