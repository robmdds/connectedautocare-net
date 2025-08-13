import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// FORCE COMPLETE REFRESH - v5.0 - NEW FORM WITH ALL 5 FIELDS
console.log("🔥 COMPLETE REFRESH - NEW FORM v5.0 timestamp:", Date.now());
createRoot(document.getElementById("root")!).render(<App />);
