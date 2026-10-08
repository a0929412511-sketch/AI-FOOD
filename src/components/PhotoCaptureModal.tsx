import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { PRESET_MEALS } from '../utils/presetMeals';
import { MealAnalysis } from '../types';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (base64Image: string, mimeType: string) => Promise<void>;
  onSelectPreset: (preset: MealAnalysis) => void;
  isAnalyzing: boolean;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  onAnalyze,
  onSelectPreset,
  isAnalyzing,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'preset'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Camera stream when modal opens in 'camera' tab
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera' || previewImage) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode, previewImage]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('此瀏覽器不支援相機功能，請改用上傳照片。');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('無法開啟相機（請確認權限或改用上傳相片）。');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from video stream
  const handleSnapPhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreviewImage(dataUrl);
    setSelectedMimeType('image/jpeg');
    stopCamera();
  };

  // File Upload Handler with client-side image compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const rawResult = reader.result;
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setPreviewImage(compressed);
            setSelectedMimeType('image/jpeg');
          } else {
            setPreviewImage(rawResult);
            setSelectedMimeType(file.type || 'image/jpeg');
          }
        };
        img.onerror = () => {
          setPreviewImage(rawResult);
          setSelectedMimeType(file.type || 'image/jpeg');
        };
        img.src = rawResult;
      }
    };
    reader.readAsDataURL(file);
  };

  // Confirm and start Gemini Analysis
  const handleConfirmAnalyze = async () => {
    if (!previewImage) return;
    try {
      await onAnalyze(previewImage, selectedMimeType);
      setPreviewImage(null);
      onClose();
    } catch (err) {
      console.error('Analyze failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-amber-100 via-pink-100 to-amber-100 flex items-center justify-between border-b border-amber-200/80">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <div>
              <h2 className="font-extrabold text-base text-stone-800">
                拍照或上傳餐點照片
              </h2>
              <p className="text-xs text-stone-500">
                交給波波營養師，一秒算出卡路里與健康評分！
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/60 text-stone-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers if not previewing */}
        {!previewImage && (
          <div className="flex border-b border-stone-200 bg-stone-50/70 p-1.5 gap-1.5 text-xs font-bold text-stone-600">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-white text-amber-900 shadow-sm border border-amber-200'
                  : 'hover:bg-stone-200/50'
              }`}
            >
              <Camera className="w-4 h-4 text-amber-500" />
              即時拍照
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-amber-900 shadow-sm border border-amber-200'
                  : 'hover:bg-stone-200/50'
              }`}
            >
              <Upload className="w-4 h-4 text-pink-500" />
              相簿上傳
            </button>
            <button
              onClick={() => setActiveTab('preset')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'preset'
                  ? 'bg-white text-amber-900 shadow-sm border border-amber-200'
                  : 'hover:bg-stone-200/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              示範餐點快速試玩
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col items-center">
          {previewImage ? (
            /* Preview Captured / Uploaded Image */
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md max-h-72 w-full flex items-center justify-center bg-stone-100">
                <img
                  src={previewImage}
                  alt="餐點預覽"
                  className="max-h-72 w-auto object-contain"
                />
              </div>

              <div className="w-full flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setPreviewImage(null);
                    if (activeTab === 'camera') startCamera();
                  }}
                  disabled={isAnalyzing}
                  className="px-4 py-2.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  重新拍照
                </button>

                <button
                  onClick={handleConfirmAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 max-w-xs px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-stone-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-200/50 active:scale-95 transition cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-white" />
                      波波正在分析營養中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      立即開始 AI 智慧評分
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : activeTab === 'camera' ? (
            /* Camera Live View */
            <div className="w-full flex flex-col items-center">
              {cameraError ? (
                <div className="w-full py-12 px-6 flex flex-col items-center text-center bg-rose-50 rounded-2xl border border-rose-200">
                  <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
                  <p className="text-sm font-bold text-rose-800">{cameraError}</p>
                  <p className="text-xs text-rose-600 mt-1 mb-4">
                    請至瀏覽器設定允許相機存取，或點選上方「相簿上傳」。
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 rounded-full bg-white border border-rose-300 text-rose-700 font-bold text-xs shadow-xs"
                  >
                    切換至相簿上傳
                  </button>
                </div>
              ) : (
                <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-inner">
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Camera Aim Crosshairs Frame */}
                  <div className="absolute inset-8 border-2 border-dashed border-white/70 rounded-2xl pointer-events-none flex items-center justify-center">
                    <span className="bg-black/50 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full">
                      將整盤美味餐點放入框內 🥗
                    </span>
                  </div>

                  {/* Switch camera button */}
                  <button
                    onClick={switchCamera}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition cursor-pointer"
                    title="切換前後鏡頭"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!cameraError && (
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleSnapPhoto}
                    className="px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-500 text-stone-900 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-amber-300/60 active:scale-95 transition cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    按下快門拍照
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'upload' ? (
            /* File Upload View */
            <div className="w-full flex flex-col items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-14 px-6 border-2 border-dashed border-pink-300 hover:border-pink-500 bg-pink-50/40 hover:bg-pink-50/80 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition"
              >
                <div className="w-16 h-16 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center text-3xl mb-3 shadow-inner">
                  🍱
                </div>
                <h4 className="font-extrabold text-stone-800 text-base">
                  點擊選擇照片 或 拖曳至此
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  支援 JPG、PNG、WEBP 等一般餐點相片
                </p>
                <button
                  type="button"
                  className="mt-4 px-5 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-200 transition"
                >
                  從相簿選取照片
                </button>
              </div>
            </div>
          ) : (
            /* Presets View */
            <div className="w-full space-y-3">
              <p className="text-xs text-stone-500 text-center mb-2">
                尚未準備餐點照片？點選以下範例餐點立即體驗可愛儀表板：
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {PRESET_MEALS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      onClose();
                    }}
                    className="flex items-center gap-3.5 p-3 rounded-2xl border-2 border-amber-200/80 bg-amber-50/30 hover:bg-amber-100/60 transition cursor-pointer shadow-xs group"
                  >
                    <img
                      src={preset.imageUrl}
                      alt={preset.mealName}
                      className="w-16 h-16 rounded-xl object-cover border border-amber-200"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-stone-800 group-hover:text-amber-800 transition">
                          {preset.mealName}
                        </h4>
                        <span className="font-extrabold text-xs px-2 py-0.5 rounded-full bg-white text-rose-500 border border-rose-200">
                          {preset.overallScore} 分
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {preset.estimatedCalories} kcal · {preset.scoreRating}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
