export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const merchantId = process.env.FABMISR_MERCHANT_ID;
    const password = process.env.FABMISR_PASSWORD;

    if (!merchantId || !password) {
      return res.status(500).json({
        success: false,
        error: "Missing FABMISR credentials"
      });
    }

    const auth = Buffer
      .from(`merchant.${merchantId}:${password}`)
      .toString("base64");

    const response = await fetch(
      `https://ap-gateway.mastercard.com/api/rest/version/61/merchant/${merchantId}/session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`
        },
        body: JSON.stringify({
          session: {
            authenticationLimit: 25
          }
        })
      }
    );

    const data = await response.json();

    console.log("CREATE SESSION RESPONSE:", JSON.stringify(data, null, 2));

    if (!response.ok || data.result === "ERROR") {
      return res.status(500).json({
        success: false,
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      sessionId: data.session.id,
      apiVersion: "61",
      merchantId
    });

  } catch (error) {
    console.log("SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
