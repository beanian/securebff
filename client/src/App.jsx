import { useEffect, useState } from "react";

function App() {
  const [csrf, setCsrf] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE || "";

  useEffect(() => {
    fetch(`${API_BASE}/csrf-token`, {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => setCsrf(data.csrf));
  }, []);

  const handleCheck = async () => {
    const csrfRes = await fetch(`${API_BASE}/csrf-token`, {
      credentials: "include"
    });
    const { csrf: freshToken } = await csrfRes.json();
  
    const res = await fetch(`${API_BASE}/check-account`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF": freshToken
      },
      body: JSON.stringify({ email })
    });
  
    const body = await res.json();
    setResult(`${res.status}: ${body.message}`);
  };
  

  return (
    <div>
      <h1>Check Email Demo</h1>
      <input
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleCheck}>Check</button>
      <pre>{result}</pre>
    </div>
  );
}

export default App;
