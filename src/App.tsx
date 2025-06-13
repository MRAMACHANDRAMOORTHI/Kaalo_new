import CameraApp from "./CameraApp"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GalleryPage from "./GalleryPage";

const App = () => {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CameraApp />} />
        <Route path="/gallery" element={<GalleryPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
