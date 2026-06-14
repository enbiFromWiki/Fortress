import "./App.css";
import { Routes, Route } from "react-router";
import { Login } from "./login";
import { Home } from "./home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/loginpage" element={<Login />} />
    </Routes>
  );
}

export default App;
