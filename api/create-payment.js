export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const merchantId = process.env.FABMISR_MERCHANT_ID;
    const password = process.env.FABMISR_PASSWORD;
    const apiVersion = "61";

    if (!merchantId || !password) {
      return res.status(500).json({ success: false, error: "Missing FABMISR credentials" });
    }

    const auth = Buffer.from(`merchant.${merchantId}:${password}`).toString("base64");

    const orderId = `VELORIA-${Date.now()}`;
    const amount = "1250.00";
    const currency = "EGP";

    const createResponse = await fetch(
      `https://ap-gateway.mastercard.com/api/rest/version/${apiVersion}/merchant/${merchantId}/session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`
        },
        body: JSON.stringify({
          session: {
            authenticationLimit: 25
          }
        })
      }
    );

    const createData = await createResponse.json();

    if (!createResponse.ok || createData.result !== "SUCCESS" || !createData.session?.id) {
      return res.status(500).json({
        success: false,
        step: "create-session",
        details: createData
      });
    }

    const sessionId = createData.session.id;

    const updateResponse = await fetch(
      `https://ap-gateway.mastercard.com/api/rest/version/${apiVersion}/merchant/${merchantId}/session/${sessionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`
        },
        body: JSON.stringify({
          order: {
            id: orderId,
            amount,
            currency,
            description: "Veloria Makeup and Skincare Order"
          },
          transaction: {
            reference: orderId
          },
          interaction: {
            merchant: {
              name: "Veloria Make Up & Skin Care"
            }
          }
        })
      }
    );

    const updateData = await updateResponse.json();

    if (!updateResponse.ok || updateData.result === "ERROR") {
      return res.status(500).json({
        success: false,
        step: "update-session",
        details: updateData
      });
    }

    return res.status(200).json({
      success: true,
      merchantId,
      sessionId,
      orderId,
      amount,
      currency,
      apiVersion
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
