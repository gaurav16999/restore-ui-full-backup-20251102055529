import React from "react";

const SimpleTest = () => {
  return (
    <div style={{ padding: "20px", backgroundColor: "white", minHeight: "100vh" }}>
      <h1 style={{ color: "black", fontSize: "24px" }}>Simple Test Page</h1>
      <p style={{ color: "black" }}>If you can see this, React is working!</p>
      <p style={{ color: "black" }}>Current time: {new Date().toLocaleString()}</p>
      <div style={{ marginTop: "20px" }}>
        <a href="/login" style={{ color: "blue", textDecoration: "underline" }}>
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default SimpleTest;