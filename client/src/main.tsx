import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Force complete cache refresh - v2.0
console.log("Loading simplified VSC form - timestamp:", Date.now());
createRoot(document.getElementById("root")!).render(<App />);
