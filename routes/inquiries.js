// routes/inquiries.js
const express = require("express");
const router = express.Router();
const { Inquiry } = require("../models"); // 시퀄라이저 모델 가져오기
const { verifyToken } = require("../middleware/token"); // 토큰 검증 미들웨어 가져오기
const cookieParser = require("cookie-parser");
router.use(cookieParser());

// Inquiry 목록 조회 API
router.get("/", async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll();
    res.json(inquiries);
  } catch (error) {
    console.error("조회 중 오류 발생:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 단일 Inquiry 조회 API
router.get("/:id", async (req, res) => {
  const inquiryId = req.params.id;

  try {
    const inquiry = await Inquiry.findByPk(inquiryId);

    if (inquiry) {
      res.json(inquiry);
    } else {
      res.status(404).json({ error: "해당 ID의 Inquiry를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error("조회 중 오류 발생:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// Inquiry 생성 API
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, message, status } = req.body;
    const user_id = req.user.user_id;

    // 시퀄라이저 모델을 사용하여 데이터베이스에 데이터 삽입
    await Inquiry.create({
      user_id,
      title,
      message,
      status,
    });

    res.json({ message: "데이터가 성공적으로 삽입되었습니다." });
  } catch (error) {
    console.error("데이터 삽입 오류:", error);
    res.status(500).json({ error: "데이터 삽입 오류" });
  }
});

module.exports = router;
