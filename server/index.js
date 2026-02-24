import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json({ limit: "2mb" }));

// Basic CORS for development (adjust for production as needed)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.post("/api/save-schedule", (req, res) => {
  try {
    const payload = req.body;
    const outDir = path.resolve(process.cwd(), "data");
    const outPath = path.join(outDir, "schedule.json");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8", (err) => {
      if (err) {
        console.error("Failed to write schedule:", err);
        return res.status(500).json({ ok: false, error: err.message });
      }
      console.log("Schedule saved to", outPath);
      res.json({ ok: true, path: outPath });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

const port = process.env.PORT || 5174;
app.listen(port, () => console.log(`Schedule server listening on http://localhost:${port}`));
