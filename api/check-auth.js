export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false
    });
  }

  try {

    const merchantId =
      process.env.FABMISR_MERCHANT_ID;

    const password =
      process.env.FABMISR_PASSWORD;

    const {
      orderId,
      authenticationTransactionId
    } = req.body;

    const auth = Buffer
      .from(
        `merchant.${merchantId}:${password}`
      )
      .toString("base64");

    const url =
`https://fabmisr.gateway.mastercard.com/api/rest/version/100/merchant/${merchantId}/order/${orderId}/transaction/${authenticationTransactionId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    const data =
      await response.json();

    console.log("CHECK AUTH STATUS:", {
  result: data.result,
  authStatus: data.order?.authenticationStatus,
  gatewayCode: data.response?.gatewayCode,
  gatewayRecommendation:
    data.response?.gatewayRecommendation,
  transactionStatus:
    data.authentication?.["3ds2"]?.transactionStatus
});

console.log(
  "CHECK AUTH RESPONSE:",
  JSON.stringify(data, null, 2)
);
   console.log(
  "CHECK AUTH URL:",
  url
);
    return res.status(200).json(data);

  } catch (error) {

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

}
