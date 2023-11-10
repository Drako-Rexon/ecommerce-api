const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const app = express();
const PORT = process.env.PORT; // || 4000;
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const authRoute = require('./routes/authRoute');
const productRoute = require('./routes/productRoute');
const blogRoute = require('./routes/blogRoute');
const categoryRoute = require('./routes/productCategoryRoute');
const blogCategoryRoute = require('./routes/blogCategoryRoute');
const brandRoute = require('./routes/brandRoute');

dbConnect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
  try {
    res.send("YOHO!!!... The server is running");
  } catch (err) {
    console.log("Error: ", err);
  }
});

app.use('/api/users', authRoute);
app.use('/api/product', productRoute);
app.use('/api/blogs', blogRoute);
app.use('/api/productcategory', categoryRoute);
app.use('/api/blogcategory', blogCategoryRoute);
app.use('/api/brand', brandRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:` + PORT);
});