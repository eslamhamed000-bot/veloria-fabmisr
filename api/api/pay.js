export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { sessionId, orderId, amount } = req.body;

    if (!sessionId || !orderId) {
      return res.status(400).json({
        success: false,
        error: "Missing sessionId or orderId"
      });
    }

    const merchantId = process.env.MERCHANT_ID;
    const apiPassword = process.env.API_PASSWORD;

    const url = `https://fabmisr.gateway.mastercard.com/api/rest/version/100/merchant/${merchantId}/order/${orderId}/transaction`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + Buffer.from(`merchant.${merchantId}:${apiPassword}`).toString("base64")
      },
      body: JSON.stringify({
        apiOperation: "PAY",
        session: {
          id: sessionId
        },
        transaction: {
          amount: amount,
          currency: "EGP"
        }
      })
    });

    const data = await response.json();

    return res.status(200).json({
      success: true,
      gatewayResponse: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
