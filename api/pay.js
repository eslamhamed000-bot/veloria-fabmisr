export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    const { sessionId, orderId, amount } = req.body;

    const merchantId = process.env.FABMISR_MERCHANT_ID;
    const password = process.env.FABMISR_PASSWORD;

    const transactionId = "1";

    const url = `https://fabmisr.gateway.mastercard.com/api/rest/version/100/merchant/${merchantId}/order/${orderId}/transaction/${transactionId}`;

    const auth = Buffer.from(`merchant.${merchantId}:${password}`).toString("base64");

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify({
        apiOperation: "PAY",
        order: {
          amount: amount,
          currency: "EGP"
        },
        session: {
          id: sessionId
        }
      })
    });

    const data = await response.json();

    console.log("PAY RESPONSE:", data);

    return res.status(200).json({
      success: true,
      result: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
