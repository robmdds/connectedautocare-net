export default function SimpleTest() {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'green' }}>✅ REACT IS WORKING!</h1>
      <p>Current URL: {window.location.pathname}</p>
      <p>Timestamp: {new Date().toISOString()}</p>
      <div style={{ margin: '20px 0' }}>
        <a href="/policies" style={{ margin: '10px', padding: '10px', background: 'blue', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Test Policies</a>
        <a href="/claims" style={{ margin: '10px', padding: '10px', background: 'red', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Test Claims</a>
        <a href="/login" style={{ margin: '10px', padding: '10px', background: 'green', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Test Login</a>
      </div>
    </div>
  );
}