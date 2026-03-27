const { spawn } = require("child_process");
const path = require("path");

let scanProcess = null;
let isScanning = false;

/**
 * Start weapon detection scan by spawning app.py
 */
exports.startWeaponScan = async (req, res) => {
  try {
    // Prevent multiple scans
    if (isScanning) {
      return res.status(400).json({ error: "Scan already in progress" });
    }

    const io = req.app.get("io");
    if (!io) {
      return res.status(500).json({ error: "Socket.io not configured" });
    }

    isScanning = true;

    // Emit that scan is starting
    io.emit("scan-started");

    // Path to app.py
    const pythonPath = "python";
    const appPath = path.join(__dirname, "../../ai/app.py");

    // Spawn the Python process
    scanProcess = spawn(pythonPath, [appPath], {
      cwd: path.join(__dirname, "../../ai"),
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Handle Python output
    scanProcess.stdout.on("data", (data) => {
      const message = data.toString().trim();
      console.log(`[AI] ${message}`);
      
      // Emit status updates
      if (message.includes("Checking") || message.includes("Connected") || message.includes("opened")) {
        io.emit("scan-status", { message });
      }
      
      // Parse and emit weapon detections
      if (message.includes("Weapon detected:") || message.includes("detected")) {
        io.emit("scan-status", { message });
      }
    });

    scanProcess.stderr.on("data", (data) => {
      const error = data.toString().trim();
      console.error(`[AI Error] ${error}`);
      
      // Send error if not expected (like "q to quit" message)
      if (!error.includes("to quit") && !error.includes("selection")) {
        io.emit("scan-status", { message: `Status: ${error}` });
      }
    });

    scanProcess.on("close", (code) => {
      console.log(`[AI] Process exited with code ${code}`);
      isScanning = false;
      scanProcess = null;
      io.emit("scan-complete");
    });

    scanProcess.on("error", (err) => {
      console.error("[AI] Failed to start scan:", err);
      isScanning = false;
      scanProcess = null;
      io.emit("scan-error", { error: err.message });
    });

    res.json({ 
      message: "Weapon scan started", 
      pid: scanProcess.pid 
    });
  } catch (err) {
    isScanning = false;
    console.error("Error starting weapon scan:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Stop the ongoing weapon detection scan
 */
exports.stopWeaponScan = async (req, res) => {
  try {
    if (!scanProcess || !isScanning) {
      return res.status(400).json({ error: "No scan in progress" });
    }

    // Send 'q' to quit the process
    scanProcess.stdin.write("q\n");
    
    // Force kill after 5 seconds if not exited
    const killTimeout = setTimeout(() => {
      if (scanProcess) {
        scanProcess.kill("SIGTERM");
      }
    }, 5000);

    scanProcess.on("close", () => clearTimeout(killTimeout));

    isScanning = false;
    const io = req.app.get("io");
    if (io) io.emit("scan-status", { message: "Scan stopped by user" });

    res.json({ message: "Scan stopped" });
  } catch (err) {
    console.error("Error stopping weapon scan:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get scan status
 */
exports.getScanStatus = (req, res) => {
  res.json({
    isScanning,
    pid: scanProcess ? scanProcess.pid : null,
  });
};
