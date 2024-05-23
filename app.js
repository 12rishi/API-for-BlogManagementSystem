const express = require("express");
const { blogdetails, users } = require("./model/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
require("./model/index");
//telling app.js to parse the incoming json format data
app.use(express.json());
//giving access to upload folder to frontend
app.use(express.static("./uploadFile/"));
//importing multer
const { multer, storage } = require("./middleware/multerConfig");
const upload = multer({ storage: storage });
app.get("/", (req, res) => {
  res.status(200).json({
    message: "hello guyz ",
  });
});
app.get("/blogs", (req, res) => {
  res.status(200).json({
    message: "this is blog page",
  });
});
//for post
app.post("/blogs", upload.single("blogImage"), async (req, res) => {
  //destructuring data coming from frontend
  const { title, subTitle, description } = req.body;
  //inserting data to database
  await blogdetails.create({
    title: title,
    subTitle: subTitle,
    description: description,
    imageUrl: req.file.filename,
  });
  res.status(200).json({
    message: "successfully inserted data in database",
  });
});
app.get("/blog", async (req, res) => {
  const data = blogdetails.findAll();
  if (data.length === 0) {
    req.status(404).json({
      message: "Blogs not Found",
      data: data,
    });
  } else {
    req.status(200).json({
      message: "blogs created successfully",
      data: data,
    });
  }
});
app.get("/blogs/:id", async (req, res) => {
  const id = req.params.id;
  const data = await blogdetails.findAll({
    where: {
      id: id,
    },
  });
  res.status(200).json({
    message: "fetched successfully",
    data: data,
  });
});
app.patch("/blogs/:id", upload.single("blogImage"), async (req, res) => {
  const id = req.params.id;
  const { title, subTitle, description } = req.body;
  let data = await blogdetails.findByPk(id);
  console.log(data);
  if (!data) {
    return res.status(400).json({
      message: "Data not found ",
    });
  }
  data.title = title;
  data.subTitle = subTitle;
  data.description = description;
  if (req.file) {
    data.imageUrl = req.file.filename;
  }
  await data.save();

  res.status(200).json({
    message: "updated successfully",
    data: data,
  });
});
app.delete("/blogs/:id", (req, res) => {
  const id = req.params.id;
  blogdetails.destroy({
    where: {
      id: id,
    },
  });
  res.status(200).json({
    message: "blog deleted successfully ",
  });
});
//authentication
//register
app.post("/register", upload.single("profilePhoto"), async (req, res) => {
  const { email, userName, password } = req.body;
  if (!email || !userName || !password) {
    return res.status(400).json({
      message: "provide username,password,email ",
    });
  }
  await users.create({
    userName,
    email,
    password: bcrypt.hashSync(password, 10),
    photo: req.file.filename,
  });
  res.status(200).json({
    message: "posted details successfully",
  });
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await users.findAll({
    where: {
      email: email,
    },
  });
  console.log(user);

  if (email.length === 0) {
    res.status(400).json({
      message: "invalid email",
    });
  } else {
    const passwordValidate = bcrypt.compare(password, user[0].password);
    if (!passwordValidate) {
      res.json(400).json({
        message: "invalid password",
      });
    } else {
      const token = jwt.sign({ id: user[0].id }, "hahahaha", {
        expiresIn: "30d",
      });
      res.status(200).json({
        token,
        message: "login successfully",
      });
    }
  }
});
app.listen(3000, () => {
  console.log("port is running at 3000");
});
