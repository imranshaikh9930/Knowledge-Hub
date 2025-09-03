const express = require("express");
require("dotenv").config();
const bodyParser = require('body-parser');
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const docsRoutes = require("./routes/doc.routes");
const connectDb = require("./config/connectDb");
const app = express();

const PORT = process.env.PORT || 8500;

app.use(bodyParser.urlencoded())
app.use(bodyParser.json());
app.use(cors());
app.use("/auth",authRoutes);
app.use("/docs",docsRoutes);

app.listen(PORT,()=>{
    console.log(`Server is Running Port ${PORT}`);
    connectDb();
})