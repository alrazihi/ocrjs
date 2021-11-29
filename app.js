const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const { TesseractWorker } = require("tesseract.js");

const worker = new TesseractWorker();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
app.use(
  express.urlencoded({
    extended: true,
  })
);

const upload = multer({ storage: storage }).single("avatar");

app.set("view engine", "ejs");
app.use(express.static("public"));

// routes
app.get("/", (req, res) => {
  res.render("index");
});
app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    console.log(req.file, req.body.sele);
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log("This is your err", err);
      //eng+ara+fra
      worker
        .recognize(data, req.body.sele, { tessjs_create_pdf: "1" })
        .progress((progress) => {
          console.log(progress);
        })
        .then((result) => {
          res.send(result.text);
          // res.redirect("/download");
        })
        .finally(() => worker.terminate());
    });
  });
});

app.get("/download", (req, res) => {
  const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
  res.download(file);
});

const PORT = 5000 || process.env.PORT;
app.listen(PORT, () =>
  console.log("Hala I'm on port http://localhost:" + PORT)
);
