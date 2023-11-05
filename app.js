// app.js
const express = require('express');
const app = express();
const port = 3003;
const fs = require('fs');
const path = require('path');

app.set('view engine', 'ejs');

// 在 app.js 中
app.use(express.static('public'));
// 用于解析JSON格式的请求体
app.use(express.json()); 

app.get('/', (req, res) => {
  res.render('index', { title: '首页' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

//POST路由，处理从前端接收到的GeoJSON数据并保存到文件
app.post('/savegeojson', (req, res) => {
  // 假设我们从请求体中得到了GeoJSON数据
  // 需要一个解析JSON的中间件比如express.json()
  const geojsonData = req.body;
  
  // 生成文件名，基于当前时间
  const filename = `${new Date().toISOString()}.geojson`;
  
  // 文件保存路径
  const filePath = path.join(__dirname, 'public', 'vector', filename);

  // 将GeoJSON数据写入文件
  fs.writeFile(filePath, JSON.stringify(geojsonData), (err) => {
    if (err) {
      console.log('Error saving the file:', err); // 先记录日志
      return res.status(500).send('Error saving the file.'); // 然后发送响应
    }
    console.log('File saved successfully.');
    res.send('File saved successfully.'); // 成功保存文件后发送成功消息
  });

});

