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

      .limit(3)
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
