// Test the quote flow directly in browser console
console.log("🧪 Testing VSC Quote Flow...");

// Simulate form data
const testData = {
  vin: "JF1GJAC66DH033129",
  mileage: 85000,
  fullName: "John Doe", 
  email: "john@test.com",
  zipCode: "12345"
};

console.log("💾 Saving test data to sessionStorage...");
sessionStorage.setItem('vscQuoteData', JSON.stringify(testData));

// Verify data was saved
const saved = sessionStorage.getItem('vscQuoteData');
console.log("✅ Data saved:", saved);

// Test retrieval
const retrieved = JSON.parse(saved);
console.log("📋 Retrieved data:", retrieved);

console.log("🚀 Now navigate to /vsc-quote to test...");
