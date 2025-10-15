import React from 'react';

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  src: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ open, onClose, src }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-4xl aspect-video bg-white rounded-xl overflow-hidden shadow-2xl">
        <button
          aria-label="Chiudi"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-white/90 text-slate-700 hover:bg-white p-2 shadow"
        >
          ✕
        </button>
        <iframe
          className="h-full w-full"
          src={src}
          title="Come funziona"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default VideoModal;

