import React, { useState, useRef } from 'react';
import { toast } from '../utils/toast';

const PHOTO_TYPES = [
  { id: 'substance', label: 'Substance View', icon: '⚪' },
  { id: 'packaging', label: 'Packaging / Baggie', icon: '📦' },
  { id: 'label',     label: 'Kit Box / Label', icon: '🏷️' },
  { id: 'context',   label: 'Scene / Context', icon: '📍' },
];

export default function EvidenceGallery({ photos = [], onAddPhoto, onRemovePhoto }) {
  const [activeType, setActiveType] = useState('substance');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  const startCamera = async (type) => {
    setActiveType(type);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setShowCamera(true);
    } catch {
      toast('Camera error — uploading file instead', 'warning');
      fileRef.current?.click();
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    streamRef.current?.getTracks().forEach(t => t.stop());
    setShowCamera(false);

    onAddPhoto({
      id: Date.now(),
      type: activeType,
      label: PHOTO_TYPES.find(p => p.id === activeType)?.label,
      dataUrl,
      timestamp: new Date().toISOString(),
    });
    toast('Evidence photo added', 'success');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onAddPhoto({
        id: Date.now(),
        type: activeType,
        label: PHOTO_TYPES.find(p => p.id === activeType)?.label,
        dataUrl: ev.target.result,
        timestamp: new Date().toISOString(),
      });
      toast('Evidence photo added', 'success');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Evidence Photos ({photos.length})
        </p>
        <span className="text-xs text-gray-400">Optional supporting views</span>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      {/* Camera Live Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4">
          <div className="flex justify-between items-center text-white">
            <span className="text-sm font-semibold">Capturing: {PHOTO_TYPES.find(p => p.id === activeType)?.label}</span>
            <button
              onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); setShowCamera(false); }}
              className="text-white text-lg font-bold"
            >✕</button>
          </div>
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl flex-1 object-cover my-4" />
          <button
            onClick={capture}
            className="w-full py-4 rounded-2xl bg-white text-gray-900 font-bold text-lg active:scale-95"
          >
            Capture Photo
          </button>
        </div>
      )}

      {/* Photo Type Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {PHOTO_TYPES.map(pt => (
          <button
            key={pt.id}
            type="button"
            onClick={() => startCamera(pt.id)}
            className="p-3 rounded-2xl bg-white border border-gray-200 text-left flex items-center gap-2 hover:border-blue-400 active:scale-95 transition-all shadow-sm"
          >
            <span className="text-xl">{pt.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-700 truncate">{pt.label}</p>
              <p className="text-xs text-gray-400">+ Add view</p>
            </div>
          </button>
        ))}
      </div>

      {/* Captured Thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {photos.map(p => (
            <div key={p.id} className="relative rounded-xl overflow-hidden aspect-square border border-gray-200 shadow-sm bg-gray-50">
              <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemovePhoto(p.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shadow"
              >✕</button>
              <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5">
                <p className="text-[10px] text-white truncate">{p.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
