var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
//Tambahkan body-parser
var bodyParser = require("body-parser");
//Tambahkan assert
var assert = require("assert");
const jwt = require("jsonwebtoken");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();
const port = 3000;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// gunakan body parser sebgai middleware
app.use(bodyParser.json());

// data yang kita gunakan adalah kelas pada karakter game
var kelas = [
  { id: 1, nama_kelas: "Backend" },
  { id: 2, nama_kelas: "Frontend" },
  { id: 3, nama_kelas: "Fullstack" },
];

//get all kelas
app.get("/api/kelas", function (req, res, next) {
  try {
    // res.json({ data: kelas });
    // res.send({ data: kelas });
    res.send(err);
  } catch (err) {
    //melemparkan exception
    next(err);
  }
});

// app.get("/api/kelas/:id", function (req, res) {
//   try {
//     // const kls = kelas.find((k) => k.id === parseInt(req.params.id));
//     // assert(kls, `ID Kelas ${req.params.id} tidak ditemukan`);
//     // res.status(200).json({ data: kls });
//     // res.send({ data: kls });
//     res.send(err);
//   } catch (err) {
//     //tampilkan status 500
//     res
//       .status(500)
//       .json({ error: "INTERNAL_SERVER_ERROR", message: err.message });
//   }
// });

// get kelas by id
app.get("/api/kelas/:id", function (req, res) {
  try {
    const kls = kelas.find((k) => k.id === parseInt(req.params.id));
    assert(kls, `ID Kelas ${req.params.id} tidak ditemukan`);
    res.status(200).json({ data: kls });
    res.send({ data: kls });
    res.send(err);
  } catch (err) {
    if (err.name === "AssertionError") {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Menambahkan data
app.post("/api/kelas", function (req, res) {
  try {
    //Kondisi apabila nama kelas kosong
    if (!req.body.nama_kelas) {
      // Menampilkan pesan error ketika field nama kelas kosong
      res.status(400).send("Nama kelas harus diisi");
      return;
    }

    const kls = {
      id: kelas.length + 1,
      nama_kelas: req.body.nama_kelas,
    };
    kelas.push(kls);
    res.send(kls);
    res.send(err);
  } catch (err) {
    next(err);
  }
});
// Mengupdate data
app.put("/api/kelas/:id", function (req, res) {
  try {
    //Cek id kelas
    const klas = kelas.find((k) => k.id === parseInt(req.params.id));
    if (!klas) res.status(404).send("Kelas tidak ditemukan"); // tampilkan status 404

    if (!req.body.nama_kelas) {
      // Menampilkan pesan error ketika field nama kelas kosong
      res.status(400).send("Nama kelas harus diisi");
      return;
    }

    klas.nama_kelas = req.body.nama_kelas;
    res.send({ pesan: "Data berhasil diupdate.", data: klas });
    res.send(err);
  } catch (err) {
    next(err);
  }
});
// Menghapus data
app.delete("/api/kelas/:id", function (req, res) {
  try {
    //Cek id kelas
    const klas = kelas.find((k) => k.id === parseInt(req.params.id));
    if (!klas) res.status(404).send("Kelas tidak ditemukan"); // tampilkan status 404

    const index = kelas.indexOf(klas);
    kelas.splice(index, 1);
    res.send({ pesan: "Data berhasil dihapus.", data: klas });
    res.send(err);
  } catch (err) {
    next(err);
  }
});

//jwt
app.post("/api/login", (req, res) => {
  const user = {
    id: Date.now(),
    userEmail: "admin@gamelab.id",
    password: "gamelab",
  };
  //Untuk generate token user
  jwt.sign({ user }, "secretkey", (err, token) => {
    res.json({
      token,
    });
  });
});

app.get("/api/profile", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) res.sendStatus(403);
    else {
      res.json({
        message: "Selamat Datang di Gamelab Indonesia",
        userData: authData,
      });
    }
  });
});

//Verifikasi Token
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  //cek jika bearer kosong/tidak ada
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    //Get token
    const bearerToken = bearer[1];

    //set the token
    req.token = bearerToken;

    //next middleware
    next();
  } else {
    //Jika tidak bisa akses mengarahkan ke halaman forbidden
    res.sendStatus(403);
  }
}

app.listen(3000, () => {
  console.log(`listening on port ${port}`);
});

// app.use((err, req, res, next) => {
//   res.status(500).json({
//     status: false,
//     name: err.name,
//     message: err.message,
//   });
// });

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;
