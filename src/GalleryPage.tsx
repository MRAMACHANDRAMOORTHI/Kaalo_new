import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firbaseConfig";

interface CapturedImage {
  view1: string | null;
  view2: string | null;
  sessionId: string;
  createdAt: any;
}

const GalleryPage = () => {
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const snapshot = await getDocs(collection(db, "captured_images"));
        const data: CapturedImage[] = snapshot.docs.map((doc) => ({
          sessionId: doc.data().sessionId,
          view1: doc.data().view1,
          view2: doc.data().view2,
          createdAt: doc.data().createdAt,
        }));
        setImages(data);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        📸 Uploaded Session Images
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading images...</p>
      ) : images.length === 0 ? (
        <p className="text-center text-gray-500">No uploads found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {images.map((img, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-xl overflow-hidden p-4"
            >
              <p className="text-sm text-gray-600 mb-3">
                Session: {img.sessionId}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={img.view1 ?? ""}
                  alt={`View 1 - ${img.sessionId}`}
                  className="w-full h-auto rounded-md object-cover border"
                />
                <img
                  src={img.view2 ?? ""}
                  alt={`View 2 - ${img.sessionId}`}
                  className="w-full h-auto rounded-md object-cover border"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
