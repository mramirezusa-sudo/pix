export default async function handler(req, res) {
  
  // ✅ HANDLE CORS PROPERLY
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const data = req.body;

    // ✅ SIMPLE extraction (no AI yet, safe start)
    let width = data.width || 0;
    let height = data.height || 0;

    // If user typed something like "12x8" in text, detect it
    if ((!width || !height) && data.details) {
      const match = data.details.match(/(\d+)\s*x\s*(\d+)/i);
      if (match) {
        width = parseFloat(match[1]);
        height = parseFloat(match[2]);
      }
    }

    const sqft = width * height;

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

    return res.status(200).json({
      service_type: data.surface || "wall printing",
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
