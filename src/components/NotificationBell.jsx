import { useState } from "react";

const NotificationBell = () => {
  const [count, setCount] = useState(3);

  return (
    <div style={{ position: "relative", display: "inline-block", cursor: "pointer" }}
         onClick={() => setCount(0)}>
      <span style={{ fontSize: "1.5rem" }}>🔔</span>
      {count > 0 && (
        <span style={{
          position: "absolute", top: "-6px", right: "-6px",
          background: "red", color: "white", borderRadius: "50%",
          fontSize: "0.7rem", width: "18px", height: "18px",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {count}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;