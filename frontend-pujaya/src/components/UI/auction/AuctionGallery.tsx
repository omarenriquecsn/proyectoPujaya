import React from 'react';
import Image from 'next/image';

interface AuctionGalleryProps {
  mainImg: string | null;
  imgProduct: string[];
  name: string;
  zoomOpen: boolean;
  setZoomOpen: (open: boolean) => void;
  setMainImg: (img: string) => void;
  endDate?: string; // Nueva prop para el timer
}

const PlaceholderSVG = (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="#E5E7EB" />
    <circle cx="32" cy="32" r="14" stroke="#D1D5DB" strokeWidth="2" />
    <path d="M20 44L44 20" stroke="#D1D5DB" strokeWidth="2" />
    <path d="M44 44L20 20" stroke="#D1D5DB" strokeWidth="2" />
    <circle cx="32" cy="32" r="4" fill="#D1D5DB" />
  </svg>
);

const AuctionGallery: React.FC<AuctionGalleryProps> = ({
  mainImg,
  imgProduct,
  name,
  zoomOpen,
  setZoomOpen,
  setMainImg,
  endDate,
}) => {
  // Timer state
  const [timeLeft, setTimeLeft] = React.useState<string>('');

  React.useEffect(() => {
    if (!endDate) return;
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('Auction ended');
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      let str = '';
      if (days > 0) str += `${days}d `;
      if (days > 0 || hours > 0) str += `${hours}h `;
      str += `${minutes}m ${seconds}s`;
      setTimeLeft(str);
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <>
      {/* Modal zoom */}
      {zoomOpen && mainImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setZoomOpen(false)}
        >
          <div className="relative max-w-3xl w-full flex items-center justify-center">
            <button
              className="absolute top-2 right-2 text-white text-2xl font-bold bg-black bg-opacity-40 rounded-full px-3 py-1 hover:bg-opacity-80 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setZoomOpen(false);
              }}
              aria-label="Close zoom"
            >
              ×
            </button>
            <Image
              src={mainImg}
              alt={name}
              className="max-h-[80vh] max-w-full rounded-xl shadow-lg border bg-white"
              style={{ objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
              width={800}
              height={800}
            />
          </div>
        </div>
      )}
      <div className="relative w-full">
        <div className="bg-[#F3F4F6] rounded-2xl w-full flex flex-col items-center justify-center p-0 md:p-6 min-h-[340px] shadow-sm relative">
          <div className="flex-1 flex items-center justify-center w-full min-h-[260px] relative">
            {/* Timer sobre la imagen principal */}
            {endDate && timeLeft && (
              <div className="absolute top-1 left-1 z-10 bg-[#EF4444] border-0 rounded-full px-2.5 py-0.5 flex items-center gap-2 font-bold text-white text-xs select-none shadow-none min-h-[22px] min-w-[80px]">
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 20 20"
                  className="inline-block align-middle"
                >
                  <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="2" fill="none" />
                  <path d="M10 5v5l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="align-middle leading-none">{timeLeft}</span>
              </div>
            )}
            {mainImg ? (
              <Image
                src={mainImg}
                alt={name}
                className="h-80 max-h-[260px] w-auto object-contain rounded-xl cursor-zoom-in bg-white border"
                onClick={() => setZoomOpen(true)}
                width={400}
                height={300}
              />
            ) : (
              <div className="h-48 w-full flex items-center justify-center">{PlaceholderSVG}</div>
            )}
          </div>
          {/* Miniaturas */}
          <div className="flex flex-row gap-3 w-full justify-start px-4 py-4 bg-transparent mt-2">
            {Array.isArray(imgProduct) && imgProduct.length > 0
              ? imgProduct.map((img, idx) => (
                  <div
                    key={idx}
                    className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all shadow-sm bg-[#F3F4F6] ${
                      mainImg === img
                        ? 'border-blue-600'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setMainImg(img)}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={name + ' ' + (idx + 1)}
                        className="w-12 h-12 object-cover rounded-md"
                        style={{ background: '#fff' }}
                        width={100}
                        height={100}
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center">
                        {PlaceholderSVG}
                      </div>
                    )}
                  </div>
                ))
              : // Si no hay imágenes, mostrar 4 placeholders
                Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 rounded-lg border-2 flex items-center justify-center bg-[#F3F4F6] border-transparent"
                  >
                    {PlaceholderSVG}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuctionGallery;
