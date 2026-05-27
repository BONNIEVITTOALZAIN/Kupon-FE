'use client';

import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Kupon } from '@/types/kupon';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  CheckCircle,
  AlertOctagon,
  RefreshCw,
  Clock,
  User,
  Tag,
  Hash,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ScannerPage() {
  const { getToken } = useAuth();
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    kupon: Kupon | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = 'qr-reader-container';

  // Synth beep sound using Web Audio API so it's asset-free and always works
  const playBeep = (type: 'success' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); // Buzz
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      console.error('Audio beep play error:', e);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (loading) return;
    
    // Stop camera temporarily to prevent multiple scans
    stopCamera();
    
    setLoading(true);
    setScanResult(null);

    try {
      const token = getToken();
      // Send code to backend for validation and double claim prevention
      const response = await api.scanKupon(token, decodedText);

      if (response.success && response.data?.valid) {
        playBeep('success');
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#f59e0b'],
        });
        setScanResult({
          success: true,
          message: response.message,
          kupon: response.data.kupon,
        });
      } else {
        playBeep('error');
        setScanResult({
          success: false,
          message: response.message || 'Kupon tidak valid atau sudah digunakan.',
          kupon: response.data?.kupon || null,
        });
      }
    } catch (err: any) {
      playBeep('error');
      setScanResult({
        success: false,
        message: err.message || 'Terjadi kesalahan sistem scan.',
        kupon: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setScanResult(null);
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        // Use the back/rear camera if available, otherwise use default
        const backCamera = devices.find((device) =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear')
        );
        const cameraId = backCamera ? backCamera.id : devices[0].id;

        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          handleScanSuccess,
          (errorMessage) => {
            // Quiet fail for scan frames
          }
        );
        setCameraActive(true);
      } else {
        alert('Kamera tidak ditemukan di perangkat Anda.');
      }
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      alert('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setCameraActive(false);
  };

  useEffect(() => {
    // Start camera on page load
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleReset = () => {
    setScanResult(null);
    startCamera();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
            Scanner QR Code Kupon
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Arahkan QR Code kupon ke kamera laptop/PC untuk melakukan verifikasi instan.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column: Camera Scanner View */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm flex flex-col items-center p-6 text-center">
            <h3 className="text-md font-extrabold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-500" />
              Live Camera Feed
            </h3>

            {/* Video viewport wrapper */}
            <div className="relative w-full aspect-square max-w-[320px] rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-850 bg-slate-900/5 dark:bg-slate-950 flex items-center justify-center">
              {/* Outer scanning visual effect box */}
              {cameraActive && !loading && !scanResult && (
                <div className="absolute inset-0 z-10 pointer-events-none border-[3px] border-emerald-500/20 m-6 rounded-xl animate-pulse">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-[4px] border-l-[4px] border-emerald-500 rounded-tl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-[4px] border-r-[4px] border-emerald-500 rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[4px] border-l-[4px] border-emerald-500 rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[4px] border-r-[4px] border-emerald-500 rounded-br" />
                  {/* Laser line moving top-down */}
                  <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-emerald-400/80 shadow-md shadow-emerald-400/50 animate-[bounce_2s_infinite]" />
                </div>
              )}

              {/* Native html5-qrcode target anchor */}
              <div id={scannerId} className="w-full h-full object-cover [&_video]:object-cover" />

              {!cameraActive && !scanResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900 text-white z-10">
                  <span className="text-4xl mb-3">🎥</span>
                  <p className="text-sm font-bold mb-4">Kamera tidak aktif</p>
                  <button
                    onClick={startCamera}
                    className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Aktifkan Kamera
                  </button>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
                  <p className="text-xs font-bold tracking-wide">Mengecek Database...</p>
                </div>
              )}
            </div>

            {cameraActive && (
              <button
                onClick={stopCamera}
                className="mt-5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors border border-rose-500/20 px-4 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
              >
                Hentikan Kamera
              </button>
            )}
          </div>

          {/* Right Column: Validation / Scanning Results Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm p-6 min-h-[380px] flex flex-col">
            <h3 className="text-md font-extrabold text-slate-700 dark:text-slate-200 mb-4">
              Status Validasi Kupon
            </h3>

            {!scanResult && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800/60 rounded-xl">
                <span className="text-5xl mb-4">🔲</span>
                <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Menunggu Scan...</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1.5 font-medium">
                  Arahkan QR Code pada kupon kertas ke arah viewport kamera aktif di sebelah kiri.
                </p>
              </div>
            )}

            {scanResult && (
              <div className="flex-1 flex flex-col justify-between">
                {/* Result header */}
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-2xl flex items-start gap-3 border ${
                      scanResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {scanResult.success ? (
                      <CheckCircle className="w-6 h-6 flex-shrink-0 text-emerald-500" />
                    ) : (
                      <AlertOctagon className="w-6 h-6 flex-shrink-0 text-rose-500" />
                    )}
                    <div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wider">
                        {scanResult.success ? 'KUPON VALID' : 'KUPON DITOLAK'}
                      </h4>
                      <p className="text-xs font-semibold mt-1 opacity-90">{scanResult.message}</p>
                    </div>
                  </div>

                  {/* Coupon Meta info */}
                  {scanResult.kupon && (
                    <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/30 space-y-3.5">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase">
                            Nama Penerima
                          </span>
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                            {scanResult.kupon.nama}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Hash className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase">
                              No. Kupon
                            </span>
                            <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                              {scanResult.kupon.nomor}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Tag className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase">
                              Kode QR
                            </span>
                            <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                              {scanResult.kupon.kode}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase">
                            Status Pengambilan
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase mt-1 ${
                              scanResult.kupon.status === 'sudah'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {scanResult.kupon.status === 'sudah' ? 'Sudah Diambil' : 'Belum Diambil'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reset button to scan again */}
                <button
                  onClick={handleReset}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-emerald-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md cursor-pointer"
                >
                  Scan Kupon Berikutnya
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
