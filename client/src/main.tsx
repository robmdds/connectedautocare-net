import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// CACHE BUSTED - v4.0 - SIMPLIFIED FORM WITH ALL 5 FIELDS
console.log("CACHE BUSTED VSC FORM - v4.0 timestamp:", Date.now());
createRoot(document.getElementById("root")!).render(<App />);
