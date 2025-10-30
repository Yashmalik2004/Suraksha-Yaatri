// backend/server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const os = require("os");
const path = require("path");

// --- Import DB & Routes ---
const db = require("./models/db");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dangerZoneRoutes = require("./routes/dangerZones");
const alertRoutes = require("./routes/alertRoutes");
const userContactsRoutes = require("./routes/userContactsRoutes");

// --- Import Controllers ---
const userController = require("./controllers/userController");
const { startExpiryScheduler } = require("./controllers/alertController");

const app = express();
const httpServer = createServer(app);

// --- Detect local IPv4 address dynamically ---
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let alias of interfaces[iface]) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address;
      }
    }
  }
  return "127.0.0.1";
}
const LOCAL_IP = getLocalIPAddress();

// --- CORS Setup (auto includes your network IP) ---
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // default Vite port
  `http://${LOCAL_IP}:3000`,
  `http://${LOCAL_IP}:5173`,
  `http://${LOCAL_IP}:8080`,
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// --- Middleware ---
app.use(bodyParser.json());

// --- API Routes ---
app.use("/users", userRoutes);
app.use("/admins", adminRoutes);
app.use("/user_contacts", userContactsRoutes);
app.use("/api/danger-zones", dangerZoneRoutes);
app.use("/alerts", alertRoutes);

// --- User profile route ---
app.get("/users/profile/:blockchain_id", userController.getProfile);

// --- Health Check Route ---
app.get("/", (req, res) => {
  res.send(
    `<h2>Suraksha Yaatri Backend Running</h2>
     <p>Server Active on: <b>${LOCAL_IP}</b></p>
     <p>Allowed Origins: ${allowedOrigins.join(", ")}</p>`
  );
});

// --- Socket.io Setup ---
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});
app.set("io", io);

// --- Start expiry scheduler (moves expired alerts) ---
startExpiryScheduler(io);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // listen on all interfaces for LAN access

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running with Socket.io on port ${PORT}`);
  console.log(`Accessible locally at: http://localhost:${PORT}`);
  console.log(`Accessible on network at: http://${LOCAL_IP}:${PORT}`);
  console.log("CORS enabled for:", allowedOrigins);
  console.log("Weapon AI auto-launch disabled (run app.py manually)");
});
