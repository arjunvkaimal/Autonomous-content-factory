import { BrowserRouter, Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";
import FinalReview from "./pages/FinalReview";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/review" element={<FinalReview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;