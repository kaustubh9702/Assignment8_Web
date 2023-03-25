const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const app = express();
mongoose
  .connect(
    "mongodb+srv://lawalek:kaustubh123@cluster0.mrea4xc.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to database!");
  });

app.use(express.json());
app.use(cors());
app.get("/api/user", (req, res, next) => {
  res.send("Hello from Express!");
});

app.post("/user/create", (req, res) => {
  const user = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
  });
  user
    .save()
    .then(() => {
      res.status(201).json({
        message: "User added successfully",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message,
      });
    });
});

app.get("/user/getAll", (req, res, next) => {
  User.find()
    .select(["-fullName"])
    .then((documents) => {
      res.status(200).json({
        message: "Users fetched successfully!",
        users: documents,
      });
    });
});

app.post("/user/login", (req, res, next) => {
  let fetchedUser;
  User.findOne({
    email: req.body.email,
  }).then((user) => {
    if (!user) {
      return res.status(401).json({
        message: "Auth failed",
      });
    }
    fetchedUser = user;
    bcrypt.compare(req.body.password, user.password).then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      res.status(200).json({
        message: "Auth successful",
      });
    });
  });
});

app.delete("/user/delete", (req, res, next) => {
  if (req.body.email) {
    User.find({ email: req.body.email }, (err, user) => {
      if (user.length > 0) {
        User.deleteOne({ email: req.body.email }).then((result) => {
          console.log(result);
          res.status(200).json({ message: "User deleted!" });
        });
      } else {
        res.status(200).json({ message: "User not found!" });
      }
    });
  } else {
    res.status(200).json({ message: "Email not provided!" });
  }
});

app.put("/user/edit", (req, res, next) => {
  if (req.body.email) {
    User.find({ email: req.body.email }, (err, user) => {
      if (user.length > 0) {
        const newUser = new User({
          _id: user[0]._id,
          fullName: req.body.fullName,
          email: req.body.email,
          password: req.body.password,
        });
        User.findOneAndUpdate({ email: req.body.email }, newUser, {
          runValidators: true,
        })
          .then((result) => {
            console.log(result);
            res.status(200).json({ message: "User updated!" });
          })
          .catch((err) => {
            res.status(500).json({
              message: err.message,
            });
          });
      } else {
        res.status(200).json({ message: "User not found!" });
      }
    });
  } else {
    res.status(200).json({ message: "Email not provided!" });
  }
});

app.listen(8000, () => {
  console.log("Server started on port 8000");
});
