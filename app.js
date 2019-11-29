const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").createServer(app);
const bodyParser = require("body-parser");
const firebase = require("firebase");
const dateFormat = require("dateformat");
const { config } = require("./config");

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cors());

firebase.initializeApp(config);

const db = firebase.firestore();

http.listen(4000, () => {
   console.log("server on");
});

app.get("/board/:id", (req, res) => {
   const id = req.params.id;
   db.collection("boards")
      .doc(id)
      .get()
      .then(snapshot => {
         const data = snapshot.data();
         res.status(200).send(data);
      })
      .catch(err => {
         res.status(400).send({ message: "에러 발생" });
      });
});

app.get("/boards/count", (req, res) => {
   db.collection("boards")
      .get()
      .then(snapshot => {
         const size = snapshot.size;
         res.status(200).send({ size });
      })
      .catch(err => {
         console.log(err);
      });
});

app.get("/boards/:page", (req, res) => {
   const page = req.params.page;

   db.collection("boards")
      .orderBy("date")
      .limit(12)
      .get()
      .then(snapshot => {
         let rows = [];
         snapshot.forEach(doc => {
            let data = doc.data();
            data = { id: doc.id, ...data };
            rows.push(data);
         });
         res.status(200).send(rows);
      })
      .catch(err => {
         console.log(err);
      });
});

app.post("/email", (req, res) => {
   const { email, password } = req.body;
   firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(user => {
         firebase
            .auth()
            .currentUser.sendEmailVerification()
            .then(res => {
               console.log(res);
            })
            .catch(err => {
               console.error(err);
            });
      })
      .catch(err => {
         console.error(err);
      });
});

app.post("/login", (req, res) => {
   const { email, password } = req.body;
   firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(user => {
         const emailVerified = user.user.emailVerified;
         if (!emailVerified)
            res.status(401).send("메일을 통해 인증을 해주세요.");
         else res.status(200).send("로그인 성공");
      })
      .catch(err => {
         switch (err.code) {
            case "auth/wrong-password":
               res.status(400).send("비밀번호를 다시 확인해주세요.");
               return;
            case "auth/user-not-found":
               res.status(400).send("이메일을 다시 확인해주세요.");
               return;
            default:
               res.status(400).send("알수 없는 에러가 발생했습니다.");
         }
         console.log(err);
      });
});

app.post("/post", (req, res) => {
   try {
      const postData = req.body;
      const date = dateFormat(new Date(), "yyyy-mm-dd");
      const data = { ...postData, date };
      let doc = db.collection("boards").doc();
      doc.set(data);
      res.status(200).send("데이터가 추가되었습니다.");
   } catch (err) {
      res.status(400).send("알수 없는 에러가 발생했습니다.");
   }
});
