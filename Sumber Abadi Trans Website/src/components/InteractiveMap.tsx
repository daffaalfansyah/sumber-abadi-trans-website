import { useRef, useEffect, useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Maximize2, Loader } from 'lucide-react';

interface InteractiveMapProps {
  lat: number;
  lng: number;
  onLocationSelect: (lat: number, lng: number) => void;
  markerColor?: string;
  label?: string;
}

export function InteractiveMap({ 
  lat, 
  lng, 
  onLocationSelect, 
  markerColor = '#10b981',
  label = 'Pilih Lokasi'
}: InteractiveMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState({ lat, lng });
  const [marker, setMarker] = useState({ lat, lng });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [tiles, setTiles] = useState<Map<string, HTMLImageElement>>(new Map());
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });

  useEffect(() => {
    setCenter({ lat, lng });
    setMarker({ lat, lng });
  }, [lat, lng]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.min(500, Math.max(300, width * 0.6));
        setCanvasSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    loadAndDrawMap();
  }, [zoom, center, marker, tiles, canvasSize]);

  const getTileCoordinates = (lat: number, lng: number, zoom: number) => {
    const n = Math.pow(2, zoom);
    const xtile = Math.floor((lng + 180) / 360 * n);
    const ytile = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
    return { x: xtile, y: ytile };
  };

  const loadTile = async (x: number, y: number, z: number): Promise<HTMLImageElement> => {
    const key = `${z}/${x}/${y}`;
    
    if (tiles.has(key)) {
      return tiles.get(key)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
      
      img.onload = () => {
        setTiles(prev => new Map(prev).set(key, img));
        resolve(img);
      };
      
      img.onerror = () => reject(new Error(`Failed to load tile ${key}`));
    });
  };

  const latLngToPixel = (lat: number, lng: number, width: number, height: number) => {
    const scale = Math.pow(2, zoom);
    const worldWidth = 256 * scale;
    
    const x = (lng + 180) / 360 * worldWidth;
    const latRad = lat * Math.PI / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = (worldWidth / 2) - (worldWidth * mercN / (2 * Math.PI));

    const centerX = (center.lng + 180) / 360 * worldWidth;
    const centerLatRad = center.lat * Math.PI / 180;
    const centerMercN = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2));
    const centerY = (worldWidth / 2) - (worldWidth * centerMercN / (2 * Math.PI));

    return {
      x: x - centerX + width / 2,
      y: y - centerY + height / 2
    };
  };

  const pixelToLatLng = (x: number, y: number, width: number, height: number) => {
    const scale = Math.pow(2, zoom);
    const worldWidth = 256 * scale;

    const centerX = (center.lng + 180) / 360 * worldWidth;
    const centerLatRad = center.lat * Math.PI / 180;
    const centerMercN = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2));
    const centerY = (worldWidth / 2) - (worldWidth * centerMercN / (2 * Math.PI));

    const worldX = x - width / 2 + centerX;
    const worldY = y - height / 2 + centerY;

    const lng = (worldX / worldWidth) * 360 - 180;
    const mercN = (worldWidth / 2 - worldY) * (2 * Math.PI) / worldWidth;
    const latRad = 2 * Math.atan(Math.exp(mercN)) - Math.PI / 2;
    const lat = latRad * 180 / Math.PI;

    return { lat, lng };
  };

  const loadAndDrawMap = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvasSize.width;
    const height = canvasSize.height;

    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, width, height);

    const centerTile = getTileCoordinates(center.lat, center.lng, zoom);
    const tilesX = Math.ceil(width / 256) + 2;
    const tilesY = Math.ceil(height / 256) + 2;

    const tilePromises = [];
    for (let dx = -Math.floor(tilesX / 2); dx <= Math.ceil(tilesX / 2); dx++) {
      for (let dy = -Math.floor(tilesY / 2); dy <= Math.ceil(tilesY / 2); dy++) {
        const tileX = centerTile.x + dx;
        const tileY = centerTile.y + dy;
        const maxTile = Math.pow(2, zoom);
        
        if (tileX >= 0 && tileX < maxTile && tileY >= 0 && tileY < maxTile) {
          tilePromises.push(
            loadTile(tileX, tileY, zoom).then(img => ({ img, x: tileX, y: tileY })).catch(() => null)
          );
        }
      }
    }

    try {
      const loadedTiles = await Promise.all(tilePromises);
      
      loadedTiles.forEach(tile => {
        if (!tile) return;
        
        const tileLat = Math.atan(Math.sinh(Math.PI * (1 - 2 * tile.y / Math.pow(2, zoom)))) * 180 / Math.PI;
        const tileLng = tile.x / Math.pow(2, zoom) * 360 - 180;
        const tilePixel = latLngToPixel(tileLat, tileLng, width, height);
        
        ctx.drawImage(tile.img, tilePixel.x, tilePixel.y, 256, 256);
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading tiles:', error);
      setLoading(false);
    }

    // Draw marker
    const markerPos = latLngToPixel(marker.lat, marker.lng, width, height);
    
    // Marker shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(markerPos.x, markerPos.y, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Marker pin
    ctx.fillStyle = markerColor;
    ctx.beginPath();
    ctx.arc(markerPos.x, markerPos.y - 20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Marker point
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(markerPos.x, markerPos.y - 20, 5, 0, Math.PI * 2);
    ctx.fill();

    // Marker tail
    ctx.fillStyle = markerColor;
    ctx.beginPath();
    ctx.moveTo(markerPos.x, markerPos.y);
    ctx.lineTo(markerPos.x - 8, markerPos.y - 15);
    ctx.lineTo(markerPos.x + 8, markerPos.y - 15);
    ctx.closePath();
    ctx.fill();

    // Coordinates display
    const boxWidth = Math.min(220, width - 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(10, height - 60, boxWidth, 50);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, height - 60, boxWidth, 50);
    
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📍 Koordinat Marker:', 20, height - 40);
    ctx.font = '10px monospace';
    ctx.fillText(`Lat: ${marker.lat.toFixed(6)}`, 20, height - 25);
    ctx.fillText(`Lng: ${marker.lng.toFixed(6)}`, 20, height - 12);

    // Attribution
    if (width > 400) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(width - 170, height - 25, 160, 20);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('© OpenStreetMap contributors', width - 10, height - 10);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX || e.changedTouches[0].clientX;
      clientY = e.touches[0]?.clientY || e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const newLocation = pixelToLatLng(x, y, canvas.width, canvas.height);
    setMarker(newLocation);
    onLocationSelect(newLocation.lat, newLocation.lng);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const newCenterPixel = pixelToLatLng(
      canvas.width / 2 - dx * scaleX,
      canvas.height / 2 - dy * scaleY,
      canvas.width,
      canvas.height
    );
    
    setCenter(newCenterPixel);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    if (zoom < 18) {
      setZoom(zoom + 1);
      setTiles(new Map());
    }
  };

  const handleZoomOut = () => {
    if (zoom > 1) {
      setZoom(zoom - 1);
      setTiles(new Map());
    }
  };

  const handleCenterOnMarker = () => {
    setCenter({ lat: marker.lat, lng: marker.lng });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-gray-700 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          {label}
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-600 text-sm bg-white px-3 py-1.5 rounded-lg border border-gray-300">
            Zoom: {zoom}
          </span>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 18}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleCenterOnMarker}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            title="Pusatkan ke Marker"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div ref={containerRef} className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 shadow-lg">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-center">
              <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Memuat peta...</p>
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className={`w-full h-auto ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'} touch-none`}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={(e) => {
            handleMouseUp();
            if (!isDragging) handleCanvasClick(e);
          }}
        />
        <div className="absolute top-3 left-3 right-3 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-gray-200">
          <p className="text-gray-700 text-xs sm:text-sm flex items-center gap-2 flex-wrap">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span><strong>Klik/Tap</strong> untuk pilih lokasi | <strong>Drag</strong> untuk geser</span>
          </p>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-blue-800 text-xs sm:text-sm">
          🗺️ Peta interaktif menggunakan OpenStreetMap. Zoom dan geser peta untuk eksplorasi, lalu klik/tap untuk memilih koordinat yang tepat.
        </p>
      </div>
    </div>
  );
}
