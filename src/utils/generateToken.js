// utils/generateToken.js
import jwt from "jsonwebtoken";

/**
 * Generate JWT token for any authenticated user
 * @param {Object} payload
 * @param {string} payload.userId - MongoDB _id
 * @param {string} payload.role - student | teacher | admin
 */
const generateToken = ({ id, role }) => {
  return jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export default generateToken;
