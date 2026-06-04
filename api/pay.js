export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({ success: false, error: "Method not allowed" });

  }



  try {

    const { sessionId, orderId, amount } = req.body;



    if (!sessionId || !orderId || !amount) {

      return res.status(400).json({

        success: false,

        error: "Missing sessionId, orderId or amount"

      });

    }



    const merchantId = process.env.FABMISR_MERCHANT_ID;

    const password = process.env.FABMISR_PASSWORD;



    const url = `https://fabmisr.gateway.mastercard.com/api/rest/version/100/merchant/${merchantId}/order/${orderId}/transaction`;



    const auth = Buffer.from(`merchant.${merchantId}:${password}`).toString("base64");



    const response = await fetch(url, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "Authorization": `Basic ${auth}`

      },

      body: JSON.stringify({

        apiOperation: "PAY",

        session: {

          id: sessionId

        },

        order: {

          amount: amount,

          currency: "EGP"

        }

      })

    });



    const data = await response.json();



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
