import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Force complete cache refresh - v3.0 - VSC SIMPLIFIED FORM
console.log("Loading simplified VSC form - v3.0 timestamp:", Date.now());
createRoot(document.getElementById("root")!).render(<App />);
