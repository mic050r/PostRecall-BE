const express = require("express");
const router = express.Router();
const { Wrong } = require("../models"); // 시퀄라이저 모델 가져오기
const { verifyToken } = require("../middleware/token");
const cookieParser = require("cookie-parser");
router.use(cookieParser());

// 오답(Post-it) 생성 API
router.post("/", verifyToken, async (req, res) => {
  try {
    const { importance, description } = req.body;
    const user_id = req.user.user_id; // 사용자 ID 가져오기

    // 시퀄라이저 모델을 사용하여 데이터베이스에 데이터 삽입
    await Wrong.create({
      user_id,
      importance,
      description,
    });

    res.json({ message: "데이터가 성공적으로 삽입되었습니다." });
  } catch (error) {
    console.error("데이터 삽입 오류:", error);
    res.status(500).json({ error: "데이터 삽입 오류" });
  }
});

// 오답(Post-it) 리스트 조회 API
router.get("/list", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; // 사용자 ID 가져오기

    // 시퀄라이저 모델을 사용하여 데이터베이스에서 데이터 조회
    const wrongs = await Wrong.findAll({
      where: { user_id },
      attributes: ["description"],
    });

    if (wrongs.length === 0) {
      // 해당 user_id에 대한 데이터가 없을 경우
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
      const data = wrongs.map((wrong) => ({
        description: wrong.description,
      }));
      res.json(data);
    }
  } catch (error) {
    console.error("데이터 조회 오류:", error);
    res.status(500).json({ error: "데이터 조회 오류" });
  }
});

// 오답(Post-it) 중요도 태그 별 조회 API
router.get("/importance", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; // 사용자 ID 가져오기
    const { importance } = req.query;

    // 시퀄라이저 모델을 사용하여 데이터베이스에서 데이터 조회
    const wrongs = await Wrong.findAll({
      where: { user_id, importance },
      attributes: ["description"],
    });

    if (wrongs.length === 0) {
      // 해당 조건에 맞는 데이터가 없을 경우
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
      const data = wrongs.map((wrong) => ({
        description: wrong.description,
      }));
      res.json(data);
    }
  } catch (error) {
    console.error("데이터 조회 오류:", error);
    res.status(500).json({ error: "데이터 조회 오류" });
  }
});

// 오답(Post-it) 중요도 별로 내림차순, 오름차순 조회 API
router.get("/sort", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; // 사용자 ID 가져오기
    const { order } = req.query;

    // 시퀄라이저 모델을 사용하여 데이터베이스에서 데이터 조회
    const wrongs = await Wrong.findAll({
      where: { user_id },
      order: [["importance", order === "asc" ? "ASC" : "DESC"]],
      attributes: ["description"],
    });

    if (wrongs.length === 0) {
      // 해당 조건에 맞는 데이터가 없을 경우
      res.status(404).json({ error: "데이터를 찾을 수 없습니다." });
    } else {
      // 조회된 데이터를 배열로 묶어서 JSON 응답으로 반환
      const data = wrongs.map((wrong) => ({
        description: wrong.description,
      }));
      res.json(data);
    }
  } catch (error) {
    console.error("데이터 조회 오류:", error);
    res.status(500).json({ error: "데이터 조회 오류" });
  }
});

module.exports = router;
