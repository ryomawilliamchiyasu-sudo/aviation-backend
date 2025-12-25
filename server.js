const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/weather", async (req, res) => {
  try {
    const station = (req.query.station || "CYYZ").toUpperCase();

    const url = `https://aviationweather.gov/api/data/metar?ids=${station}&format=json`;

    // Dynamic import for ESM module in CommonJS
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(url);
    const data = await response.json();

    // The API returns an array of METAR reports
    if (!data || !data.length) {
      return res.status(204).json({ message: "No METAR data available" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching live weather:", error);
    res.status(500).json({ error: "Failed to fetch live weather" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
