const express = require("express");
const router = express.Router();
const { Quiz } = require("../models"); // 시퀄라이저 모델 가져오기
const { verifyToken } = require("../middleware/token"); // 토큰 검증 미들웨어 가져오기
const cookieParser = require("cookie-parser");
router.use(cookieParser());
// 퀴즈(Post-it) 생성 API
router.post("/", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { importance, question, description } = req.body;

    // 시퀄라이저 모델을 사용하여 데이터베이스에 데이터 삽입
    await Quiz.create({
      user_id,
      importance,
      question,
      description,
    });

    res.json({ message: "데이터가 성공적으로 삽입되었습니다." });
  } catch (error) {
    console.error("데이터 삽입 오류:", error);
    res.status(500).json({ error: "데이터 삽입 오류" });
  }
});

// 퀴즈(Post-it) 리스트 조회 API
router.get("/list", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;

    // 시퀄라이저 모델을 사용하여 데이터베이스에서 데이터 조회
    const quizzes = await Quiz.findAll({
      where: { user_id },
      attributes: ["question", "description"],
    });

    if (quizzes.length === 0) {
      // 해당 사용자에 대한 데이터가 없을 경우
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
      const data = quizzes.map((quiz) => ({
        question: quiz.question,
        description: quiz.description,
      }));
      res.json(data);
    }
  } catch (error) {
    console.error("데이터 조회 오류:", error);
    res.status(500).json({ error: "데이터 조회 오류" });
  }
});

// 퀴즈(Post-it) 중요도 태그 별 조회 API
router.get("/importance", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { importance } = req.query;

    // 시퀄라이저 모델을 사용하여 데이터베이스에서 데이터 조회
    const quizzes = await Quiz.findAll({
      where: { user_id, importance },
      attributes: ["question", "description"],
    });

    if (quizzes.length === 0) {
      // 해당 조건에 맞는 데이터가 없을 경우
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
      const data = quizzes.map((quiz) => ({
        question: quiz.question,
        description: quiz.description,
      }));
      res.json(data);
    }
  } catch (error) {
    console.error("데이터 조회 오류:", error);
    res.status(500).json({ error: "데이터 조회 오류" });
  }
});

// 퀴즈(Post-it) 중요도 별로 내림차순, 오름차순 조회 API
router.get("/sort", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { order } = req.query;

    // 시퀄라이저 모델을 사용하여 데이터베이스에서 데이터 조회
    const quizzes = await Quiz.findAll({
      where: { user_id },
      order: [["importance", order === "asc" ? "ASC" : "DESC"]],
      attributes: ["question", "description"],
    });

    if (quizzes.length === 0) {
      // 해당 조건에 맞는 데이터가 없을 경우
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
      const data = quizzes.map((quiz) => ({
        question: quiz.question,
        description: quiz.description,
      }));
      res.json(data);
    }
  } catch (error) {
    console.error("데이터 조회 오류:", error);
    res.status(500).json({ error: "데이터 조회 오류" });
  }
});

module.exports = router;
