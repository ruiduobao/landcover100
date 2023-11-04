// app.js
const express = require('express');
const app = express();
const port = 3003;

app.set('view engine', 'ejs');

// 在 app.js 中
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', { title: '首页' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
