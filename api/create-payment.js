export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const merchantId = process.env.FABMISR_MERCHANT_ID;
    const password = process.env.FABMISR_PASSWORD;

    const orderId = `VL-${Date.now()}`;
    const amount = "1250.00";
    const currency = "EGP";

    const params = new URLSearchParams();

    params.append("apiOperation", "CREATE_CHECKOUT_SESSION");
    params.append("apiUsername", `merchant.${merchantId}`);
    params.append("apiPassword", password);
    params.append("merchant", merchantId);

    params.append("interaction.operation", "PURCHASE");

    params.append("order.id", orderId);
    params.append("order.amount", amount);
    params.append("order.currency", currency);

    const response = await fetch(
      "https://ap-gateway.mastercard.com/api/nvp/version/100",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      }
    );

    const text = await response.text();

    const data = {};
    text.split("&").forEach((part) => {
      const [key, value] = part.split("=");
      if (key) data[decodeURIComponent(key)] = decodeURIComponent(value || "");
    });

    console.log("FABMISR NVP RESPONSE:", data);

    if (data.result !== "SUCCESS") {
      return res.status(500).json({
        success: false,
        error: data["error.explanation"] || "FABMISR rejected request",
        details: data
      });
    }

    const sessionId = data["session.id"];

    return res.status(200).json({
      success: true,
      orderId,
      amount,
      currency,
      merchantId,
      sessionId,
      paymentUrl: `https://ap-gateway.mastercard.com/checkout/pay/${sessionId}`
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
