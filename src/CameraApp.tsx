import React, { useState } from "react";

const CameraApp = () => {
  const [selectedView, setSelectedView] = useState<number | null>(null);

  return (
    <section className="flex flex-col h-screen w-screen">
      {/* Top bar */}
      <div className="bg-black w-full flex-grow flex justify-between items-start px-4 py-2 md:px-6 md:py-4">
        <img
          src="/DARA.png"
          alt="Logo"
          className="w-[4rem] md:w-[6rem] lg:w-[8rem]"
        />
        <img
          src="/MaskGroup.png"
          alt="x icon"
          className="w-[1.5rem] md:w-[2.5rem] lg:w-[3rem]"
        />
      </div>

      {/* Bottom bar */}
      <div className="relative bg-[#2076CE] w-full h-auto py-16 px-12 md:px-8 flex items-center justify-between">
        {/* View selector */}
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex gap-4 md:gap-6">
          {[1, 2, 3, 4].map((_, index) => (
            <div
              key={index}
              className="flex  flex-col items-center justify-center h-20 md:h-24 lg:h-28 w-14 md:w-16 lg:w-20"
            >
              <button
                onClick={() => setSelectedView(index)}
                className="relative"
              >
                <img
                  src={
                    selectedView === index ? "/camera-icon.png" : "/view.png"
                  }
                  alt={`View ${index + 1}`}
                  className={`object-contain ${
                    selectedView === index
                      ? "-top-10 w-16 h-24 mb-12 md:w-20 md:h-20"
                      : "w-12 h-12 md:w-14 md:h-14"
                  } rounded-full transition-all duration-200`}
                />
              </button>
            </div>
          ))}
        </div>

        
        <img
          src="/Upload_button.png"
          alt="Upload"
          className="h-[3.5rem] md:h-[4.5rem] lg:h-[5rem] p-1"
        />

        
        <p className="text-xs md:text-sm lg:text-base text-white text-center flex-1 px-2 md:px-4">
          Tap to select the view and upload the images when complete
        </p>
      </div>
    </section>
  );
};

export default CameraApp;
