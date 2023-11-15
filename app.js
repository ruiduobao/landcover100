// app.js
const express = require('express');
const app = express();
const port = 3003;
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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

//设置一个数据库属性
const pgp = require('pg-promise')();
//本地数据库
// const dbConfig = {
//     host: 'localhost',
//     port: 5434,
//     database: 'postgis_34_sample',
//     user: 'postgres',
//     password: '12345678'
// };
//云端数据库
const dbConfig = {
    host: '182.254.147.254',
    port: 5432,
    database: 'shengshixian',
    user: 'ruiduobao',
    password: 'RDB123456.'
};
const db = pgp(dbConfig);

// 新增路由来处理地理编码请求
app.post('/getGeoAddress', async (req, res, next) => {
  const placeName = req.body.address; // 从请求体中获取地址

  // 检查place参数是否有效
  if (!placeName || placeName.trim() === '') {
      const error = new Error('Invalid place parameter.');
      return next(error);
  }
  const GAODE_API_KEY = 'b6ba147ffd1e49158d12f7cb16d0f381';
  const GAODE_GEOCODE_URL = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(placeName)}&key=${GAODE_API_KEY}`;

  let location = null;

  try {
      const response = await axios.get(GAODE_GEOCODE_URL);
      if (response.data && response.data.geocodes && response.data.geocodes.length > 0) {
          location = response.data.geocodes[0].location;
      } else {
          throw new Error('geo code failed');
      }
  } catch (error) {
      return next(error);
  }

  if (location) {
      const [longitude, latitude] = location.split(',');
      // 调用函数来创建并保存 GeoJSON 文件
      try {
          const filepath = await createAndSaveGeoJSON(placeName, longitude, latitude);
          console.log('GeoJSON file created successfully at:', filepath);
          // 构造文件 URL
          const fileUrl = `/vectordata/${encodeURIComponent(placeName)}.gson`;  // 相对于服务器根目录的URL路径
          // 返回成功消息和文件 URL
          // 返回成功消息和文件 URL
          const responseData = { status: 'success', message: 'Data exported successfully', filepath: fileUrl };
          console.log('Response data:', responseData);  // 打印响应数据
          console.log('hello，world0'); 
          res.json(responseData);
      } catch (err) {
          console.error('Error writing GeoJSON file:', err);
          res.status(500).json({ status: 'error', message: 'Internal Server Error', filepath: null });
      }
  } else {
      res.status(404).json({ status: 'error', message: `Not found gson for ${placeName}`, filepath: null });
  }
});


// 从数据库中导出矢量文件到路径
app.post('/getGsonDB', async (req, res) => {
  const dataCode = req.body.code;

  if (!dataCode) {
      return res.status(400).send('dataCode is required');
  }
  try {
      // 6位数字且后4位为0000
      if (/^\d{2}0000$/.test(dataCode)) {
          const sql = 'SELECT ST_AsGeoJSON(geom) as geojson_geom, * FROM "SHENG"."CHN_sheng_2023" WHERE first_gid = $1';
          const results = await db.any(sql, [dataCode]);
          return sendResults(res, dataCode, results);
      }
      // 6位数字且后2位为00
      else if (/^\d{4}00$/.test(dataCode)) {
          const results = await queryLatestYearData('SHI', 'CHN_shi', dataCode);
          return sendResults(res, dataCode, results);
      }
      // 6位数字且后两位不为00
      else if (/^\d{6}$/.test(dataCode) && !/00$/.test(dataCode)) {
          const results = await queryLatestYearData('XIAN', 'CHN_xian', dataCode);
          return sendResults(res, dataCode, results);
      }
      // 12位数字
      else if (/^\d{12}$/.test(dataCode)) {
          const sql = 'SELECT ST_AsGeoJSON(geom) as geojson_geom, * FROM "XIANG"."CHN_xiang_2020" WHERE code = $1';
          const results = await db.any(sql, [dataCode]);
          return sendResults(res, dataCode, results);
      }
      else {
          return res.status(400).send('Invalid dataCode format');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

//发送矢量文件导出的路径结果
function sendResults(res, dataCode, results) {
  if (results.length > 0) {
      const geojsonFeatureCollection = {
          type: "FeatureCollection",
          features: results.map(result => {
              const geojsonGeom = JSON.parse(result.geojson_geom);
              delete result.geojson_geom;
              delete result.geom;
              return {
                  type: "Feature",
                  geometry: geojsonGeom,
                  properties: result
              };
          })
      };
      const gsonFilePath = path.join(__dirname, 'public', 'vector_fromDB', `${dataCode}.gson`);
      fs.writeFileSync(gsonFilePath, JSON.stringify(geojsonFeatureCollection));
      const gsonFileUrl = `/vector_fromDB/${dataCode}.gson`;
      res.json({ status: 'success', message: 'Data exported successfully', filepath: gsonFileUrl });
  } else {
      res.status(404).send('Data not found');
  }
}

//获取最近年份的行政代码
async function queryLatestYearData(schema, baseTableName, dataCode) {
  const years = Array.from({ length: 11 }, (_, i) => 2023 - i);
  for (let year of years) {
      const tableName = `${baseTableName}_${year}`;
      const sql = `SELECT ST_AsGeoJSON(geom) as geojson_geom, * FROM "${schema}"."${tableName}" WHERE code = $1`;
      const results = await db.any(sql, [dataCode]);
      if (results.length > 0) {
          return results;
      }
  }
  return [];
}
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

//调用python裁剪栅格
const { exec } = require('child_process');

app.post('/clip-dem', (req, res) => {
    // 假设请求体中包含了矢量数据文件的路径
    const vectorDataFilePath = req.body.vectorDataFilePath;
    console.log('vectorDataFilePath:', vectorDataFilePath);
    //办公室电脑路径
    // const pythonEnv = "C:/softfiles/envs/GMA_envir/python.exe";
    // const scriptPath = "E:/ruiduobao/MY_website/landcover100_com/public/python_gma/clip_data.py";
    // const inputRasterPath = "E:/ruiduobao/MY_website/landcover100_com/public/raster_data_DB/DEM_1000_3857.tif";
    // const outputRasterPath = "E:/node_gdal_waibu22223452.tif";
    //家里电脑路径
    const pythonEnv = " C:/Users/HTHT/.conda/envs/GMA_envir/python.exe";
    const scriptPath = "D:/website/landcover100/public/python_gma/clip_data.py";
    const inputRasterPath = "D:/website/landcover100/public/raster_data_DB/DEM_1000_3857.tif";
    const outputRasterPath = "D:/website/landcover100/public/raster_output_fromDB/clip_dem.tif";



    exec(`${pythonEnv} "${scriptPath}" "${vectorDataFilePath}" "${inputRasterPath}" "${outputRasterPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行出错: ${error}`);
            return res.status(500).send(`Server error: ${error.message}`);
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send(`Script error: ${stderr}`);
        }
        // 检查stdout是否包含成功的消息
        if (stdout.includes("doneclip") || stdout.includes("done")) {
            console.log(`stdout: ${stdout}`);
            res.send({ outputPath: outputRasterPath });
        } else {
            // 如果没有成功消息，发送一个通用错误
            console.error(`未知错误: ${stdout}`);
            return res.status(500).send('Unknown script error');
        }
    });
});

//创建栅格通过geoserver发布的路由
const publishRasterData = async (workspace, storename, coverageName, filePath, username, password) => {
    const geoserverUrl = 'http://182.254.147.254:8080/geoserver';
    const data = fs.readFileSync(filePath);

    // 设置基本认证信息
    const auth = { username, password };

    // 步骤1：创建覆盖存储
    await axios.post(`${geoserverUrl}/rest/workspaces/${workspace}/coveragestores`, {
        coverageStore: {
            name: storename,
            type: 'GeoTIFF',
            enabled: true,
            workspace: {
                name: workspace
            }
        }
    }, { auth });

    // 步骤2：上传栅格数据
    await axios.put(`${geoserverUrl}/rest/workspaces/${workspace}/coveragestores/${storename}/file.geotiff`, data, {
        headers: { 'Content-type': 'image/tiff' },
        auth
    });

    // 步骤4：为图层配置 Gridset
    const gridSetId = 'WebMercatorQuad'; // 这是一个 GeoServer 中预定义的 Gridset ID
    await axios.post(`${geoserverUrl}/gwc/rest/layers/${workspace}:${coverageName}.xml`, {
    // 以下配置需要根据你的实际需求和 GeoServer 文档进行调整
    geoServerLayer: {
        name: `${workspace}:${coverageName}`,
        mimeFormats: ['image/png', 'image/jpeg'],
        gridSubsets: {
        gridSubset: [
            {
            gridSetName: gridSetId,
            // 其他可能的 Gridset 配置
            }
        ]
        },
        // 其他可能的图层配置
    }
    }, {
    headers: {
        'Content-type': 'application/xml'
    },
    auth
    });

    // 构建WMTS服务链接
    
    const wmtsLink ='http://182.254.147.254:8080/geoserver/${workspace}/gwc/service/wmts?layer=${workspace}:${coverageName}&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix=12&TileCol=3431&TileRow=1673'



    return wmtsLink;
}

app.post('/publishRaster', async (req, res) => {
    try {
        const wmtsLink = await publishRasterData(
            req.body.workspace,
            req.body.storename,
            req.body.coverageName,
            req.body.filePath,
            req.body.username,
            req.body.password
        );
        res.status(200).send({ wmtsLink });
    } catch (error) {
        console.error('Error publishing raster data:', error);
        res.status(500).send('Error publishing raster data');
    }
});
