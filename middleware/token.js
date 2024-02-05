const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res.status(401).json({ error: "인증 토큰이 없습니다." });
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);
    req.user = { ...decodedToken, user_id: decodedToken.userId.toString() };
    next();
  } catch (err) {
    console.error("JWT 검증 오류:", err);
    return res.status(401).json({ error: "유효하지 않은 토큰입니다." });
  }
}

module.exports = { verifyToken };
