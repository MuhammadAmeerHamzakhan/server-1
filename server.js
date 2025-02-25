// const express = require("express")
// const cors = require ("cors")
// const fs = require ("fs")
// const app = require ()
// require('dotenv').config()
// console.log(process.env)
// const db = "mongodb+srv://AmeerHamzaKhan:<bagrisami123>@cluster0.70pzv8u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// const mongoose = require ("mongoose")
// const schema = mongoose.Schema;
// const SignupModel = New Schema ({
//     Email: String,
//     Dob : Date,
//     FatherName: String,
//     gender: String,
//     password: String,
// })
// const schemamodel= mongoose.model(signup,Signupmodel);
// app.post("/signup" , (req,res)=> {
//     const {name,fathername,gender,Dob,Email,password} = req.body
// })
const express = require("express");
var bodyParser = require("body-parser");
const cors = require("cors");
const { Users } = require("./src/models/db.models");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const path = require('path')
require("dotenv").config();
const multer = require("multer");

// const fs = require("fs");
// const mongoose = require("mongoose");

// const bcrypt = require("bcrypt");
// const saltRounds = 10;

// const db = process.env.MONGO_DB;
let PORT = process.env.PORT || 5000;

const AuthRoute = require("./src/routes/authRoute");
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000" }));
const db = require("./src/db/db");
app.use("/", AuthRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,  '/uploads'))
  },
  filename: function (req, file, cb) {
    console.log(file)
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })
app.post("/updateProfile", upload.single("file"), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log('/updateProfile')
  // res.status(201).send({ message: "File Uplload" });
}
);

app.use(function (req, res, next) {
  console.log(req.cookies);

  if (req.cookies.Token) {
    jwt.verify(
      req.cookies.Token,
      process.env.TOKEN_SECRET,
      function (err, decodedData) {
        console.log("error when verifying cookie", err);
        console.log("data ", decodedData);

        if (decodedData) {
          let issuedat = decodedData.iat * 1000; // isssued at

          let nowTime = Date.now();
          console.log("issed time", nowTime);
          let diff = nowTime - issuedat;
          console.log(" Titme differnce", diff);

          if (diff > 6000000) {
            res.status(500).send({
              message: "no activity",
            });
          } else {
            next();
          }
        }
      }
    );
  } else {
    res.status(401).send({
      message: "session expire",
      status: false,
    });
  }
});

app.get("/profile", async function (req, res) {
  try {
    console.log(req.body);

    const data = await Users.findOne({ _id: req.body._id });

    console.log("profile data ", data);

    res.status(401).send({
      data: {
        _id: data._id,
        email: data.email,
        DOB: data.DOB,
        name: data.name,
        fatherName: data.fatherName,
        gender: data.gender,
      },
      status: true,
    });
  } catch (error) {
    console.log("error in profile api ", error);

    res.status(401).send({
      message: "Invalid User Id",
      status: false,
    });
  }
});

app.listen(PORT, function () {
  console.log("server is lisning on the post of  " + PORT);
});