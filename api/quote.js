export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body || {};

    // ✅ SIMPLE extraction (no AI yet, safe start)
let width = parseFloat(data.width) || 0;
let height = parseFloat(data.height) || 0;

    // If user typed something like "12x8" in text, detect it
    if ((!width || !height) && data.details) {
      const match = (data.details || "").match(/(\d+(\.\d+)?)\s*(x|by)\s*(\d+(\.\d+)?)/i);
      if (match) {
  width = parseFloat(match[1]);
  height = parseFloat(match[4]);
}
    }

    const sqft = width > 0 && height > 0 ? width * height : 0;

    // ✅ BASIC package logic
    let packageType = "standard";
    let pricePerFt = 12;

    if (sqft < 50) {
      packageType = "basic";
      pricePerFt = 8;
    } else if (sqft > 150) {
      packageType = "premium";
      pricePerFt = 18;
    }

    const estimate = sqft * pricePerFt;
// ✅ SMART SERVICE DETECTION
let service = "wall printing";

if (data.surface === "floor") {
  service = "floor printing";
} else if (data.surface === "wall") {
  service = "wall printing";
} else if (data.surface === "other") {
  service = "custom printing";
}
    return res.status(200).json({
      service_type: service,
      square_feet: sqft,
      recommended_package: packageType,
      range_low: Math.round(estimate * 0.9),
      range_high: Math.round(estimate * 1.25),
      missing_information: [
        "timeline",
        "surface condition",
        "project photo"
      ]
    });

  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
}
