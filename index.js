const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const crypto = require("crypto");

// Add these lines near the top:
const path = require("path");

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

const csrfTokens = new Map();

// Optional: legacy route just for testing manually
// app.get("/", (req, res) => {
//   res.cookie("probeSession", "session-" + crypto.randomUUID(), {
//     httpOnly: true,
//     sameSite: "strict",
//     secure: false // HTTPS = true in prod
//   });
//   res.send("Session cookie set.");
// });

app.get("/csrf-token", (req, res) => {
  if (!req.cookies.probeSession) {
    res.cookie("probeSession", "session-" + crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "strict",
      secure: false
    });
  }

  const csrf = crypto.randomUUID();
  csrfTokens.set(csrf, true);

  res.json({ csrf });
});

app.post("/check-account", (req, res) => {
  const session = req.cookies.probeSession;
  const token = req.header("X-CSRF");
  const email = req.body.email;

  if (!session || !token || !csrfTokens.has(token)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  csrfTokens.delete(token);

  // Simulate account check
  const exists = email.endsWith("@example.com");

  console.log("✔️ Email checked:", email);

  res.status(200).json({
    exists,
    message: exists
      ? "An account already exists for this email."
      : "No account found. You can continue to sign up."
  });
});

const distPath = path.join(__dirname, "client", "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});



const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
