const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.listen(3000, function () {
  console.log("App start on port 3000");
});

//認証なしAPI
app.get("/", (req, res) =>
  res.json({
    status: "OK",
  })
);

//認証+Tokenの発行
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  //認証 *実際はDBと連携
  if (username === "hoge" && password === "password") {
    //token生成
    const token = jwt.sign(
      {
        username: username,
      },
      "my_secret",
      {
        expiresIn: "1h",
      }
    );
    res.json({
      token: token,
    });
  } else {
    res.json({
      error: "auth error",
    });
  }
});

//認証ありAPI
app.get("/protected", verifyToken, (req, res) => {
  res.send("Protected Contents");
});

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  //HeaderにAuthorizationが定義されているか
  if (authHeader !== undefined) {
    // Bearerが正しく定義されているか
    if (authHeader.split(" ")[0] === "Bearer") {
      try {
        const token = jwt.verify(authHeader.split(" ")[1], "my_secret");
        //tokenの内容に問題がないか
        if (token.username === "hoge" && Date.now() < token.exp * 10000) {
          console.log(token);
          next();
        } else {
          res.json({ error: "auth error" });
        }
      } catch (e) {
        //tokenエラー
        console.log(e.message);
        res.json({ error: e.message });
      }
    } else {
      res.json({ error: "header format error" });
    }
  } else {
    res.json({ error: "header error" });
  }
}
