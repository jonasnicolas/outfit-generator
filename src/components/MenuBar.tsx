export function MenuBar() {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        padding: "8px 10px",
        fontSize: 14,
      }}
    >
      <a href="#" style={{ textDecoration: "underline", color: "#000" }}>
        File
      </a>
      <a href="#" style={{ textDecoration: "underline", color: "#000" }}>
        Edit
      </a>
      <a href="#" style={{ textDecoration: "underline", color: "#000" }}>
        View
      </a>
      <a href="#" style={{ textDecoration: "underline", color: "#000" }}>
        Help
      </a>
      {/* <button
        onClick={onTestConnection}
        style={{
          padding: "2px 8px",
          fontSize: "12px",
          background: "#c0c0c0",
          border: "1px outset #c0c0c0",
          cursor: "pointer",
          marginLeft: "8px",
        }}
      >
        Test DB
      </button>
      <button
        onClick={onDebugDataMismatch}
        style={{
          padding: "2px 8px",
          fontSize: "12px",
          background: "#c0c0c0",
          border: "1px outset #c0c0c0",
          cursor: "pointer",
          marginLeft: "8px",
        }}
      >
        Check Data
      </button> */}
    </div>
  );
}
