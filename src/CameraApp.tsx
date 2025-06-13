import { addDoc, collection } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "./firbaseConfig";

const CameraApp = () => {
  const [selectedView, setSelectedView] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [capturedImages, setCapturedImages] = useState<(string | null)[]>([
    null,
    null,
  ]);
  const [uploading, setUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Camera Error:", error);
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
          streamRef.current = fallbackStream;
          if (videoRef.current) videoRef.current.srcObject = fallbackStream;
        } catch (fallbackError) {
          console.error("Fallback Camera Error:", fallbackError);
        }
      }
    };

    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const captureImage = () => {
  try {
    const video = videoRef.current;
    if (!video) return;

    const originalWidth = video.videoWidth;
    const originalHeight = video.videoHeight;

    const MAX_WIDTH = 720;
    const scale = originalWidth > MAX_WIDTH ? MAX_WIDTH / originalWidth : 1;

    const canvas = document.createElement("canvas");
    canvas.width = originalWidth * scale;
    canvas.height = originalHeight * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    
    const updated = [...capturedImages];
    updated[selectedView] = imageData;
    setCapturedImages(updated);

    
    if (selectedView < 1) setSelectedView(selectedView + 1);
  } catch (err) {
    console.error("Capture failed:", err);
    setToastMessage("Capture failed on this device ❌");
    setTimeout(() => setToastMessage(null), 3000);
  }
};


  const uploadImages = async () => {
    const validImages = capturedImages.filter(Boolean);
    if (validImages.length < 2) return;

    setUploading(true);

    try {
      const timestamp = Date.now();
      const sessionId = `session_${timestamp}`;
      const docData = {
        sessionId,
        timestamp,
        createdAt: new Date(),
        view1: capturedImages[0] || null,
        view2: capturedImages[1] || null,
        imageCount: validImages.length,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
      };

      await addDoc(collection(db, "captured_images"), docData);

      setToastMessage("Upload successful ✅");
      setTimeout(() => setToastMessage(null), 3000);

      setCapturedImages([null, null]);
      setSelectedView(0);
    } catch (error) {
      console.error("Upload Error Details:", error);
      setToastMessage("Upload failed ❌");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleViewClick = (index: number) => {
    if (index === selectedView) {
      captureImage();
    } else {
      setSelectedView(index);
    }
  };

  const capturedCount = capturedImages.filter(Boolean).length;
  const isUploadReady = capturedCount >= 2;

  return (
    <section className="flex flex-col h-screen w-screen overflow-hidden bg-black">
      
      <div className="relative w-full h-[75%] bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        
        <div className="absolute top-0 left-0 w-full flex justify-between items-start px-3 py-2 sm:px-4 sm:py-3">
          <img
            src="/DARA.png"
            alt="Logo"
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
          />
          <img
            src="/MaskGroup.png"
            alt="Close"
            className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
          />
        </div>

        
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
          View {selectedView + 1} of 2
        </div>
      </div>

      
      <div className="relative bg-[#2076CE] w-full flex-1 py-8 px-4 sm:py-12 sm:px-8 lg:py-16 lg:px-12 flex items-center justify-between">
       
        <div className="absolute -top-6 sm:-top-8 lg:-top-9 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-4">
          {[0, 1].map((index) => (
            <div key={index} className="flex flex-col items-center">
              <button
                onClick={() => handleViewClick(index)}
                className={`relative transition-all duration-200 ${
                  index === selectedView ? "scale-110" : "hover:scale-105"
                }`}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center ${
                    capturedImages[index]
                      ? "bg-green-500 border-green-400"
                      : index === selectedView
                      ? "bg-blue-500 border-blue-400"
                      : "bg-gray-400 border-gray-300"
                  }`}
                >
                  {capturedImages[index] ? (
                    <span className="text-white text-lg">✓</span>
                  ) : (
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${
                        index === selectedView
                          ? "border-white"
                          : "border-gray-600"
                      }`}
                    >
                      <div
                        className={`w-full h-full rounded-full ${
                          index === selectedView ? "bg-white" : "bg-gray-600"
                        }`}
                      ></div>
                    </div>
                  )}
                </div>
              </button>
              <span className="text-white text-xs mt-1">View {index + 1}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex justify-start ">
          <button
            disabled={!isUploadReady || uploading}
            onClick={uploadImages}
            className={`transition-opacity ${
              isUploadReady && !uploading
                ? "opacity-100"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <img
              src="/Upload_button.png"
              alt="Upload"
              className="h-12 sm:h-14 lg:h-16 object-contain"
            />
          </button>
        </div>

        <div className="flex flex-col items-end text-right">
          <p className="text-white text-sm sm:text-base font-medium">
            {capturedCount === 0
              ? "Tap View 1 to capture first image"
              : capturedCount === 1
              ? "Tap View 2 to capture second image"
              : "Both views captured - ready to upload!"}
          </p>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            {capturedCount}/2 images captured
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white text-black rounded-xl shadow-lg px-6 py-4 max-w-xs text-center space-y-3">
            <p className="text-base font-medium">{toastMessage}</p>
            <a
              href="/gallery"
              className="text-sm text-blue-600 font-semibold underline"
            >
              Go to Gallery
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default CameraApp;
