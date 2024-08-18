import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "inr",
            },
            display_name: "Free shipping",
           
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 500 * 100,
              currency: "inr",
            },
            display_name: "Next day air",
            // Delivers in exactly 1 business day
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 1,
              },
              maximum: {
                unit: "business_day",
                value: 1,
              },
            },
          },
        },
      ],
      mode: "payment",
      line_items: req.body.cartItems.map((item) => {
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: item.productId,
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        };
      }),
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listing on Port 3000");
});
