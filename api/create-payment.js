export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const { orderId, amount, currency } = req.body || {};

    if (!orderId || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: "Missing orderId, amount, or currency"
      });
    }

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

          order: {
            id: String(orderId),
            amount: Number(amount).toFixed(2),
            currency: String(currency)
          },

          interaction: {
            operation: "PURCHASE",
            merchant: {
              name: "Veloria Makeup and Skincare"
            },
            returnUrl: "https://project-rqpjs.vercel.app/payment-success",
            cancelUrl: "https://project-rqpjs.vercel.app/"
          }
        })
      }
    );

    const data = await gatewayResponse.json();

    if (!gatewayResponse.ok || data.result === "ERROR") {
      console.log("FABMISR ERROR:", JSON.stringify(data, null, 2));

      return res.status(500).json({
        success: false,
        error: "FABMISR rejected the request",
        details: data
      });
    }

    if (!data.session || !data.session.id) {
      console.log("NO SESSION:", JSON.stringify(data, null, 2));

      return res.status(500).json({
        success: false,
        error: "No payment session returned",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      sessionId: data.session.id,
      paymentUrl: `https://ap-gateway.mastercard.com/checkout/pay/${data.session.id}`
    });

  } catch (error) {
    console.log("SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
