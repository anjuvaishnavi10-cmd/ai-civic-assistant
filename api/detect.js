export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { image, issueType = "pothole" } = req.body || {};

    if (!image) {
      return res.status(400).json({
        error: "No image provided"
      });
    }

    const models = {
      pothole: "pothole-detection-u53qg/12",
      garbage: "garbage_detection-wwzwv/9"
    };

    const modelId = models[issueType];

    if (!modelId) {
      return res.status(400).json({
        error: "Unsupported issue type"
      });
    }

    const response = await fetch(
      `https://serverless.roboflow.com/${modelId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.ROBOFLOW_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: image
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "Roboflow detection failed"
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Detection error:", error);

    return res.status(500).json({
      error: "Image detection failed"
    });
  }
}
