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
  
  // 生成文件名，基于当前时间，格式为 YYYYMMDDHHmmss
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0,14);
  const filename = `${timestamp}.geojson`;
  
  // 文件保存路径
  const filePath = path.join(__dirname, 'public', 'vector', filename);

  // 将GeoJSON数据写入文件
  fs.writeFile(filePath, JSON.stringify(geojsonData), (err) => {
    if (err) {
      console.log('Error saving the file:', err);
      return res.status(500).send('Error saving the file.');
    }
    console.log('File saved successfully.');

    // 构造访问文件的URL或相对路径
    const fileUrl = `/vector/${filename}`;

    // 将文件URL或路径回传给客户端
    res.json({ fileUrl: fileUrl });
  });

});

//用户文件上传
const fileUpload = require('express-fileupload');
// 在 app.js 中，使用中间件
app.use(fileUpload({
    createParentPath: true // 允许创建多级目录
}));
// 一个POST路由，用于处理文件上传
app.post('/uploadvector', (req, res) => {
    console.log('Received request for /uploadvector'); // 调试信息
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    // `file` 是前端传来的文件对象名称
    let file = req.files.file; // 确保这里的`file`与前端发送的字段名一致
    // 对URL编码过的文件名进行解码
    let fileName = decodeURIComponent(file.name);
    // 检查文件格式
    const validFormats = ['.gson', '.geogson', '.shp', '.geojson', '.kml'];
    const fileExtension = path.extname(file.name).toLowerCase();
    
    if (validFormats.includes(fileExtension)) {
        // 设置文件保存路径
        let uploadPath = path.join(__dirname, 'public', 'vector_upload', fileName);

        file.mv(uploadPath, function(err) {
            if (err) {
                return res.status(500).send(err);
            }
            res.json({ message: 'File uploaded successfully', fileUrl: `/vector_upload/${fileName}` });
        });
    } else {
        res.status(400).send('Invalid file format.');
    }
});
