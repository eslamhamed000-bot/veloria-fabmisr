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

    const gatewayResponse = await fetch(
      `https://ap-gateway.mastercard.com/api/rest/version/100/merchant/${merchantId}/session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`
        },
        body: JSON.stringify({
          apiOperation: "CREATE_CHECKOUT_SESSION",
          interaction: {
            operation: "PURCHASE",
            returnUrl: "https://project-rqpjs.vercel.app/"
          }
        })
      }
    );

    const data = await gatewayResponse.json();

    if (!gatewayResponse.ok || data.result === "ERROR") {
      console.log("FABMISR ERROR:", JSON.stringify(data, null, 2));

      return res.status(500).json({
        success: false,
        error: "FABMISR rejected request",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      merchantId,
      sessionId: data.session.id
    });

  } catch (error) {
    console.log("SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
