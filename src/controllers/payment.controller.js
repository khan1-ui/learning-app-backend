import SSLCommerzPayment from "sslcommerz-lts";
import Order from "../models/Order.js";
import PurchasedSubject from "../models/PurchasedSubject.js";

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASS;
const is_live = false; // sandbox

/* =========================
   INITIATE PAYMENT
========================= */
export const initiatePayment = async (req, res) => {
  const store_id = process.env.SSLCOMMERZ_STORE_ID;
  const store_passwd = process.env.SSLCOMMERZ_STORE_PASS;
  const is_live = false;

  console.log("SSL ENV FINAL:", { store_id, store_passwd });

  if (!store_id || !store_passwd) {
    return res.status(500).json({
      message: "SSLCommerz credentials missing",
    });
  }
  try {
    const { subject, classLevel } = req.body;

    if (!subject || !classLevel) {
      return res.status(400).json({ message: "Subject & class required" });
    }

    const exists = await PurchasedSubject.findOne({
      student: req.user._id,
      subject,
      classLevel: Number(classLevel),
    });

    if (exists) {
      return res.status(400).json({ message: "Subject already unlocked" });
    }

    const amount = 100;
    const tran_id = `SUB_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await Order.create({
      student: req.user._id,
      subject,
      classLevel: Number(classLevel),
      amount,
      transactionId: tran_id,
      status: "PENDING",
    });

    const paymentData = {
      total_amount: amount,
      currency: "BDT",
      tran_id,

      success_url: `${process.env.SERVER_URL}/api/payments/success`,
      fail_url: `${process.env.SERVER_URL}/api/payments/fail`,
      cancel_url: `${process.env.SERVER_URL}/api/payments/cancel`,

      shipping_method: "NO",
      product_name: `Class ${classLevel} - ${subject}`,
      product_category: "Education",
      product_profile: "digital",

      cus_name: req.user.name || "Student",
      cus_email: req.user.email || "student@mail.com",
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: req.user.phone || "01700000000",
    };

    const sslcz = new SSLCommerzPayment(
      store_id,
      store_passwd,
      is_live
    );

    const apiResponse = await sslcz.init(paymentData);

    if (!apiResponse?.GatewayPageURL) {
      console.error("SSLCommerz response:", apiResponse);
      return res.status(500).json({ message: "SSLCommerz gateway error" });
    }

    return res.json({
      gatewayURL: apiResponse.GatewayPageURL,
    });
  } catch (error) {
    console.error("❌ initiatePayment error:", error);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};

/* =========================
   PAYMENT SUCCESS
========================= */
export const paymentSuccess = async (req, res) => {
  try {
    const tran_id = req.body.tran_id;

    const order = await Order.findOne({ transactionId: tran_id });
    if (!order) {
      return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
    }

    order.status = "SUCCESS";
    await order.save();

    const exists = await PurchasedSubject.findOne({
      student: order.student,
      subject: order.subject,
      classLevel: order.classLevel,
    });

    if (!exists) {
      await PurchasedSubject.create({
        student: order.student,
        subject: order.subject,
        classLevel: order.classLevel,
        amount: order.amount,
        paymentRef: tran_id,
      });
    }

    res.redirect(`${process.env.CLIENT_URL}/payment-success`);
  } catch (error) {
    console.error("paymentSuccess error:", error);
    res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
  }
};

/* =========================
   PAYMENT FAIL
========================= */
export const paymentFail = async (req, res) => {
  await Order.findOneAndUpdate(
    { transactionId: req.body.tran_id },
    { status: "FAILED" }
  );
  res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
};

export const paymentCancel = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/payment-cancelled`);
};
