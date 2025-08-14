import { createRoot } from "react-dom/client";
import SimpleTest from "./SimpleTest";
import "./index.css";

// FORCE COMPLETE REFRESH - v5.0 - NEW FORM WITH ALL 5 FIELDS
console.log("🔥 COMPLETE REFRESH - NEW FORM v5.0 timestamp:", Date.now());

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("❌ ROOT ELEMENT NOT FOUND");
    document.body.innerHTML = "<h1 style='color:red;'>ERROR: Root element not found</h1>";
  } else {
    console.log("✅ ROOT ELEMENT FOUND, CREATING REACT APP");
    const root = createRoot(rootElement);
    root.render(<SimpleTest />);
    console.log("✅ REACT APP RENDERED SUCCESSFULLY");
  }
} catch (error: any) {
  console.error("❌ REACT ERROR:", error);
  document.body.innerHTML = `<h1 style='color:red;'>REACT ERROR: ${error.message}</h1>`;
}
