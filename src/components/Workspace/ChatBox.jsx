import { useState } from "react";

export default function ChatBox() {
  const [msg, setMsg] = useState("");

  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <h2 className="text-xl mb-3">💬 Team Chat</h2>

      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Type message..."
        className="w-full p-2 rounded bg-gray-800"
      />
    </div>
  );
}