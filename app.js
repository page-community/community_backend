const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").createServer(app);
const bodyParser = require("body-parser");
const firebase = require("firebase");
const dateFormat = require("dateformat");

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cors());

const config = {
   apiKey: "AIzaSyC46Gpvx2eiYWZMoTpRS6bvwcWmGW6taiM",
   authDomain: "community-b365f.firebaseapp.com",
   databaseURL: "https://community-b365f.firebaseio.com",
   projectId: "community-b365f",
   storageBucket: "community-b365f.appspot.com",
   messagingSenderId: "736742194944",
   appId: "1:736742194944:web:6f26ad1e4c95c6862b7de5",
   measurementId: "G-PBYT84HWSY"
};

firebase.initializeApp(config);

const db = firebase.firestore();

http.listen(4000, () => {
   console.log(dateFormat(new Date(), "yyyy-mm-dd"));
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

app.get("/boards", (req, res) => {
   db.collection("boards")
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
         console.log("error");
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
