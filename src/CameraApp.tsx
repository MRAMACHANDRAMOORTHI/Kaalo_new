import { addDoc, collection } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "./firbaseConfig";

const CameraApp = () => {
  const [selectedView, setSelectedView] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<(string | null)[]>([null, null]);
  const [uploading, setUploading] = useState(false);
  const [viewStates, setViewStates] = useState<["unclicked" | "preview" | "captured", "unclicked" | "preview" | "captured"]>(["unclicked", "unclicked"]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((e) => {
              console.error("Video play error:", e);
            });
          };
        }
      } catch (error) {
        console.error("Camera Error:", error);
        setToastMessage("Camera not accessible ❌");
        setTimeout(() => setToastMessage(null), 3000);
      }
    };

    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const captureImage = () => {
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

    const updatedStates = [...viewStates] as [
      "unclicked" | "preview" | "captured",
      "unclicked" | "preview" | "captured"
    ];
    updatedStates[selectedView] = "captured";
    setViewStates(updatedStates);

    if (selectedView < 1) setSelectedView(selectedView + 1);
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
        view1: capturedImages[0],
        view2: capturedImages[1],
        imageCount: 2,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
      };
      await addDoc(collection(db, "captured_images"), docData);
      setToastMessage("Upload successful ✅");
      setCapturedImages([null, null]);
      setViewStates(["unclicked", "unclicked"]);
      setSelectedView(0);
    } catch (error) {
      console.error("Upload Error:", error);
      setToastMessage("Upload failed ❌");
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
      setUploading(false);
    }
  };

  const handleViewClick = (index: number) => {
    const currentState = viewStates[index];
    if (currentState === "unclicked") {
      const updatedStates = [...viewStates] as [
        "unclicked" | "preview" | "captured",
        "unclicked" | "preview" | "captured"
      ];
      updatedStates[index] = "preview";
      setViewStates(updatedStates);
      setSelectedView(index);
    } else if (currentState === "preview") {
      captureImage();
    }
  };

  const getButtonImage = (index: number) => {
    const state = viewStates[index];
    if (state === "unclicked") return `/View ${index + 1}_ Open_Unselect.png`;
    if (state === "preview") return `/View ${index + 1}_ Open_Select_with Capture.png`;
    return `/View ${index + 1}_ Open_Select.png`;
  };

  const isUploadReady = capturedImages.every(Boolean);

  return (
    <section className="flex flex-col h-screen w-screen overflow-hidden bg-black">
      <div className="relative w-full h-[80%] bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full flex justify-between items-start px-3 py-2">
          <img src="/DARA.png" alt="Logo" className="w-12 h-12 object-contain" />
          <img src="/MaskGroup.png" alt="Close" className="w-6 h-6 object-contain" />
        </div>
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
          View {selectedView + 1} of 2
        </div>
      </div>

      <div className="relative bg-[#2076CE] w-full flex-1 py-8 px-4 flex items-center justify-between">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-5">
          {[0, 1].map((index) => {
            const src = getButtonImage(index);
            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  onClick={() => handleViewClick(index)}
                  className="relative w-[25px] h-[56px] sm:w-[25px] sm:h-[56px] cursor-pointer overflow-hidden"
                >
                  <img
                    src={src}
                    alt={`View ${index + 1}`}
                    className="absolute bottom-0 w-full object-contain transition-all duration-300"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1 flex justify-start">
          <button
            disabled={!isUploadReady || uploading}
            onClick={uploadImages}
            className={`transition-opacity ${
              isUploadReady && !uploading
                ? "opacity-100"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <img src="/Upload_button.png" alt="Upload" className="h-12 object-contain" />
          </button>
        </div>

        <div className="flex flex-col items-end text-right">
          <p className="text-white text-sm font-medium">
            {capturedImages[0] && capturedImages[1]
              ? "Ready to upload!"
              : `Tap View ${capturedImages[0] ? 2 : 1} to capture`}
          </p>
          <p className="text-blue-100 text-xs mt-1">
            {capturedImages.filter(Boolean).length}/2 images captured
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white text-black rounded-xl shadow-lg px-6 py-4 max-w-xs text-center space-y-3">
            <p className="text-base font-medium">{toastMessage}</p>
            <a href="/gallery" className="text-sm text-blue-600 font-semibold underline">
              Go to Gallery
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default CameraApp;
