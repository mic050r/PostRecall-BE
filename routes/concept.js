const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/token"); // 토큰 검증 미들웨어 가져오기
const cookieParser = require("cookie-parser");
router.use(cookieParser());
const { Concept } = require("../models");

// POST /concept
router.post("/", verifyToken, async (req, res) => {
  try {
    const { importance, description } = req.body;
    const user_id = req.user.user_id;

    // 시퀄라이저를 사용하여 Concept을 데이터베이스에 추가
    const createdConcept = await Concept.create({
      user_id,
      importance,
      description,
    });

    // 응답
    res.json({
      message: "데이터가 성공적으로 삽입되었습니다.",
      data: createdConcept,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /concept/list
router.get("/list", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // 시퀄라이저를 사용하여 데이터 조회
    const concepts = await Concept.findAll({
      where: { user_id },
    });

    if (concepts.length === 0) {
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      const data = concepts.map((concept) => ({
        description: concept.description,
      }));
      res.json(data);
    }
  } catch (error) {
    console.error("데이터 조회 오류:", error);
    res.status(500).json({ error: "데이터 조회 오류" });
  }
});

// GET /concept/importance
router.get("/importance", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { importance } = req.query;

    // 시퀄라이저를 사용하여 데이터 조회
    const concepts = await Concept.findAll({
      where: { user_id, importance },
    });

    if (concepts.length === 0) {
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      const data = concepts.map((concept) => ({
        description: concept.description,
      }));
      res.json(data);
    }
  } catch (error) {
    console.error("데이터 조회 오류:", error);
    res.status(500).json({ error: "데이터 조회 오류" });
  }
});

// GET /concept/sort
router.get("/sort", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { order } = req.query;

    // 시퀄라이저를 사용하여 데이터 조회
    const concepts = await Concept.findAll({
      where: { user_id },
      order: [["importance", order === "asc" ? "ASC" : "DESC"]],
    });

    if (concepts.length === 0) {
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      const data = concepts.map((concept) => ({
        description: concept.description,
      }));
      res.json(data);
    }
  } catch (error) {
    console.error("데이터 조회 오류:", error);
    res.status(500).json({ error: "데이터 조회 오류" });
  }
});

module.exports = router;
