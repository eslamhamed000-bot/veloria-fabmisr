export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      orderId,
      amount,
      currency
    } = req.body;

    const merchantId = process.env.FABMISR_MERCHANT_ID;
    const password = process.env.FABMISR_PASSWORD;

    const auth = Buffer
      .from(`merchant.${merchantId}:${password}`)
      .toString("base64");

    const response = await fetch(
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
            id: orderId,
            amount: amount,
            currency: currency,
            description: "Veloria Secure Payment"
          },

          interaction: {
            operation: "PURCHASE",
            merchant: {
              name: "Veloria Makeup and Skincare"
            },

            returnUrl:
              "https://project-rqpjs.vercel.app/payment-success"
          }

        })
      }
    );

    const data = await response.json();

    console.log(data);

    if (
      data.session &&
      data.session.id
    ) {

      const paymentUrl =
        `https://ap-gateway.mastercard.com/checkout/pay/${data.session.id}`;

      return res.status(200).json({
        success: true,
        paymentUrl
      });

    } else {

      return res.status(500).json({
        success: false,
        data
      });

    }

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

}
