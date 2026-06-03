export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const { sessionId, orderId } = req.body || {};

    if (!sessionId || !orderId) {
      return res.status(400).json({
        success: false,
        error: "Missing sessionId or orderId"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pay endpoint is ready",
      sessionId,
      orderId,
      nextStep: "Connect secure card fields / 3DS"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
