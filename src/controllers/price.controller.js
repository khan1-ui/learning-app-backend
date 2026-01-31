import PriceConfig from "../models/PriceConfig.js";

/**
 * @desc    Get price by class + subject
 * @route   GET /api/prices
 * @access  Student
 */
export const getPrice = async (req, res) => {
  const { classLevel, subject } = req.query;

  if (!classLevel || !subject) {
    return res.status(400).json({
      message: "classLevel and subject required",
    });
  }

  const priceConfig = await PriceConfig.findOne({
    classLevel: Number(classLevel),
    subject,
  });

  res.json({
    price: priceConfig ? priceConfig.price : 0,
  });
};

/**
 * @desc    Set / Update price (Admin / Teacher)
 * @route   POST /api/prices
 */
export const setPrice = async (req, res) => {
  const { classLevel, subject, price } = req.body;

  const config = await PriceConfig.findOneAndUpdate(
    { classLevel, subject },
    { price },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    data: config,
  });
};
export const getAllPrices = async (req, res) => {
  const prices = await PriceConfig.find().sort({
    classLevel: 1,
    subject: 1,
  });
  res.json(prices);
};
