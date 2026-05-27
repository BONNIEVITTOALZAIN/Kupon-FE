export type TipeKupon = 'terdaftar' | 'extra';
export type StatusKupon = 'belum' | 'sudah';

export interface Kupon {
  id: string;
  kode: string;
  nomor: string;
  nama: string;
  tipe: TipeKupon;
  status: StatusKupon;
  used_at: string | null;
  scanned_by?: string | null;
  created_at: string;
  qrDataUrl?: string; // Client-side generated or fetched QR data
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KuponListResponse {
  success: boolean;
  message: string;
  data: {
    kupons: Kupon[];
    pagination: PaginationInfo;
  };
}

export interface StatsInfo {
  total: number;
  sudah: number;
  belum: number;
  extra: number;
  terdaftar: number;
  recentActivity: Kupon[];
}

export interface StatsResponse {
  success: boolean;
  message: string;
  data: StatsInfo;
}

export interface ScanResult {
  valid: boolean;
  message: string;
  kupon: Kupon | null;
}

export interface ScanResponse {
  success: boolean;
  message: string;
  data: ScanResult;
}
