// app.js
const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const axios = require('axios');


const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
app.set('view engine', 'ejs');

//家里电脑路径
console.log("当前环境:", process.env.NODE_ENV);
//环境参数 如果 NODE_ENV 设置为 "production"，则加载 .env.production 文件。否则，默认加载 .env.development 文件
require('dotenv').config({
    path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"
  });


// Swagger JSDoc 配置
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'landcover100的API',
            version: '1.0.0',
            description: '初始调用landcover100的API',
        },
    },
    apis: ['./app.js'], // 指向包含 Swagger 注释的文件
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// 使用 Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));






// 在 app.js 中
app.use(express.static('public'));
// 用于解析JSON格式的请求体
app.use(express.json()); 


app.get('/', (req, res) => {
  res.render('index', { title: '首页'});
});
//启动端口
const port = process.env.port;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

//设置一个数据库属性
const pgp = require('pg-promise')();

//云端数据库
const dbConfig = {
    host: process.env.SHPDB_host,
    port: process.env.SHPDB_port,
    database: process.env.SHPDB_database,
    user: process.env.SHPDB_user,
    password: process.env.SHPDB_password
};
const db = pgp(dbConfig);
//创建新界面的路由
//getResourceTree 获取树状结构数据列表:扁平化数据接口即可;每个节点应包含 id,父级节点id，展示名称及其他必要字段
const csv = require('csv-parser'); 

// 获取并解析 CSV 文件中的数据
const getCSVData = async (csvFilePath) => {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          // 创建一个新对象，移除键名中的所有单引号
          const cleanData = Object.keys(data).reduce((acc, key) => {
            // 使用正则表达式移除键名两端的单引号
            const cleanKey = key.replace(/^'(.*)'$/, '$1');
            acc[cleanKey] = data[key];
            return acc;
          }, {});
          results.push(cleanData);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  };

// 获取并解析 JSON 文件中的数据
const getJSONData = async (jsonFilePath) => {
    return new Promise((resolve, reject) => {
      let rawData = '';
  
      fs.createReadStream(jsonFilePath)
        .on('data', (chunk) => {
          rawData += chunk;
        })
        .on('end', () => {
          try {
            const data = JSON.parse(rawData);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  };
  // 新建路由以处理带有 id 的请求
/**
 * @swagger
 * /getResourceTree:
 *   post:
 *     summary: 获取资源树信息
 *     description: 根据传递的id,从CSV文件中查找对应的资源树信息,并从JSON文件中查找对应的波段信息,合并后返回给用户
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 需要获取信息的资源id
 *     responses:
 *       200:
 *         description: 成功返回资源树信息
 *         content:
 *           application/json:
 *             schema: 
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 数据源id
 *                 id_type:
 *                   type: string
 *                   description: 遥感产品的具体类型
 *                 pid1:
 *                   type: string
 *                   description: 遥感产品的大类,比如DEM、土地覆盖等
 *                 pid2:
 *                   type: string
 *                   description: 遥感产品的小类,比如高分辨率DEM、低分辨率DEM
 *                 name:
 *                   type: string
 *                   description: 遥感产品的中文名  
 *                 geoser_DB:
 *                   type: string
 *                   description: 该数据的预览图层在geoserver存储的仓库
 *                 geoserver_layer:
 *                   type: string
 *                   description: 该数据的预览图层在geoserver仓库中存储的图层
 *                 dataType: 
 *                   type: string
 *                   description: 栅格数据深度
 *                 resolution:
 *                   type: string 
 *                   description: 栅格分辨率
 *                 zip_level:
 *                   type: string
 *                   description: 栅格原始文件大小与压缩后的比值
 *                 URL:
 *                   type: string
 *                   description: 数据说明链接
 *                 others: 
 *                   type: string
 *                   description: 其他
 *                 Absolute_path:
 *                   type: string
 *                   description: 在开发环境中的栅格文件路径
 *                 resPath:
 *                   type: string
 *                   description: 在部署环境中的栅格文件路径  
 *                 wmts:
 *                   type: string
 *                   description: 预览图层的wmts地址
 *                 band:
 *                   type: array
 *                   items: 
 *                     type: object
 *                     properties:
 *                       band: 
 *                         type: string
 *                         description: 波段次序
 *                       bandName:
 *                         type: string
 *                         description: 波段名称
 *                       introduction:
 *                         type: string
 *                         description: 波段介绍
 *                       value:
 *                         type: object
 *                         description: 波段中每个值对应的类别
 *                         items: 
 *                              value: 
 *                                type: number
 *                                description: 像素值
 *                              color:
 *                                type: string
 *                                description: 像素渲染的RGB颜色
 *                              description:
 *                                type: string
 *                                description: 该像素值对应的地物类别
 *                 note:
 *                   type: string
 *                   description: 注意事项
 *       404:
 *         description: 未找到对应的id
 *       500:
 *         description: 服务器内部错误
 */

app.post('/getResourceTree', async (req, res) => {
    try {
      // 配置 CSV 文件的路径
      const csvFilePath = path.join(__dirname, 'public', 'WMTS_excel','GET_INFO_JSON', 'data_toClip_info.csv');
      const data = await getCSVData(csvFilePath);
      //读取gson文件的路径（获取波段信息）
      const rasterDbInfo = await getJSONData(path.join(__dirname, 'public', 'WMTS_excel', 'GET_INFO_JSON', 'RASTERDB_INFO_ALL.json'));
    //   console.log(rasterDbInfo)
      // 从请求体中获取 ID
      const id = req.body.id;
      
      
      const treeInfo = data.find(row => row.id === id);
      if (!treeInfo) {
        // 如果没有找到对应的 id，返回错误信息
        return res.status(404).json({ error: 'ID not found' });
      }
      const bandInfo = rasterDbInfo.find(item => item.id_type === treeInfo.id_type);
      // 返回 JSON 格式的数据
      res.json({
        //数据源id
        id: treeInfo.id,
        //遥感产品的具体类型
        id_type: treeInfo.id_type,
        //遥感产品的大类，比如DEM、土地覆盖等
        pid1: treeInfo.pid1,
        //遥感产品的小类，比如高分辨率DEM、低分辨率DEM
        pid2: treeInfo.pid2,
        //遥感产品的中文名
        name: treeInfo.name,
        //该数据的预览图层在geoserver存储的仓库
        geoser_DB: treeInfo.geoser_DB,
        //该数据的预览图层在geoserver仓库中存储的图层
        geoserver_layer: treeInfo.geoserver_layer,
        //栅格数据深度
        dataType: treeInfo.dataType,
        //栅格分辨率
        resolution: treeInfo.resolution,
        //栅格原始文件大小与压缩后的比值
        zip_level: treeInfo.zip_level,
        //数据说明链接
        URL: treeInfo.URL,
        //其他
        others: treeInfo.others,
        //在开发环境中的栅格文件路径
        Absolute_path: treeInfo.Absolute_path,
        //在部署环境中的栅格文件路径
        resPath: treeInfo.resPath,
        //预览图层的wmts地址
        wmts: treeInfo.wmts,
        //栅格数据的波段详细信息
        band: bandInfo.band_info,
        //注意事项
        note: treeInfo.note
      });
    } catch (error) {
      // 处理可能的错误
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
// 新增路由来处理地理编码请求
// 示例端点，使用 Swagger JSDoc 注释
/**
 * 
 * /getGeoAddress:
 *   post:
 *     summary: 获取地理编码地址
 *     description: 使用高德地图 API 根据提供的地址获取地理编码。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 description: 要查询的地址。
 *     responses:
 *       200:
 *         description: 地址的地理编码信息。
 *       400:
 *         description: 请求参数无效。
 */
// 新增路由来处理地理编码请求
app.post('/getGeoAddress', async (req, res, next) => {
  const placeName = req.body.address; // 从请求体中获取地址

  // 检查place参数是否有效
  if (!placeName || placeName.trim() === '') {
      const error = new Error('Invalid place parameter.');
      return next(error);
  }
  const GAODE_API_KEY =process.env.GAODE_API_KEY;
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
/**
 * @swagger
 * /getGsonDB:
 *   post:
 *     summary: 从数据库中导出矢量文件
 *     description: 根据提供的数据代码（dataCode），从数据库中导出相应的矢量文件。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: 数据代码，可以是6位（省级、市级）、12位（乡级）数字。
 *                 example: "110000"
 *     responses:
 *       200:
 *         description: 成功导出矢量文件。
 *       400:
 *         description: 请求参数无效或格式错误。
 *       500:
 *         description: 服务器内部错误。
 */
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
/**
 * @swagger
 * /savegeojson:
 *   post:
 *     summary: 保存GeoJSON数据到文件
 *     description: 接收前端发送的GeoJSON数据并将其保存为文件。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: GeoJSON数据对象。
 *             example: {
 *               "type": "FeatureCollection",
 *               "features": [
 *                 {
 *                   "type": "Feature",
 *                   "properties": {},
 *                   "geometry": {
 *                     "type": "Point",
 *                     "coordinates": [-0.127758, 51.507351]
 *                   }
 *                 }
 *               ]
 *             }
 *     responses:
 *       200:
 *         description: 文件保存成功，返回文件访问URL。
 *       500:
 *         description: 服务器内部错误，文件保存失败。
 */
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
/**
 * @swagger
 * /uploadvector:
 *   post:
 *     summary: 处理文件上传
 *     description: 上传矢量文件（支持 .gson, .geojson, .kml, .shp 格式），并将某些格式转换为 gson。
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的矢量文件。
 *     responses:
 *       200:
 *         description: 文件上传成功，返回文件的URL。
 *       400:
 *         description: 无文件上传或文件格式无效。
 *       500:
 *         description: 服务器内部错误或文件处理失败。
 */
app.post('/uploadvector', async (req, res) => {
    //文件上传和类型判断的代码
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    let file = req.files.file;
    let fileName = decodeURIComponent(file.name);
    const fileExtension = path.extname(fileName).toLowerCase();

    // 用于存储处理后的文件名
    let processedFileName; 
    try {
        //处理gson格式
        if (['.gson', '.geojson'].includes(fileExtension)) {
            // 直接保存文件并处理
            processedFileName = fileName;
            // ... 保存文件的代码
            // 设置文件保存路径
            const uploadPath = path.join(__dirname, 'public', 'vector_upload', processedFileName);
            file.mv(uploadPath, function(err) {
                if (err) {
                    return res.status(500).send(err);
                }
                res.json({ message: 'File uploaded successfully', fileUrl: `/vector_upload/${processedFileName}` });
            });
        } 
        //处理kml格式
        else if (fileExtension === '.kml') {
            // 保存并转换文件
            processedFileName = fileName.replace('.kml', '.gson');
            // ... 保存文件的代码
            // 设置文件保存路径
            const uploadPath = path.join(__dirname, 'public', 'vector_upload', fileName);
            console.log(uploadPath)
            file.mv(uploadPath, function(err) {
                if (err) {
                    return res.status(500).send(err);
                }
            });
            // ... 调用 Python 脚本转换文件的代码
            //python的路径
            const pythonEnv = process.env.pythonEnv;
            //kml转gson脚本路径
            const scriptPath = process.env.kml2gson_scriptPath;
            //矢量文件路径+输出geoson文件路径
            const vectorInFile = uploadPath;
            const vectorOutFile = path.join(__dirname, 'public', 'vector_upload', processedFileName);

            //调用python脚本
            exec(`${pythonEnv} "${scriptPath}" "${vectorInFile}" "${vectorOutFile}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`执行出错: ${error}`);
                    return res.status(500).send(`Server error: ${error.message}`);
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return res.status(500).send(`Script error: ${stderr}`);
                }
                // 检查stdout是否包含成功的消息
                if (stdout.includes("donecovert") || stdout.includes("done")) {
                    console.log(`stdout: ${stdout}`);
                    res.json({ message: 'File uploaded and kml2gson successfully ', fileUrl: `/vector_upload/${processedFileName}` });
                } else {
                    // 如果没有成功消息，发送一个通用错误
                    console.error(`未知错误: ${stdout}`);
                    return res.status(500).send('Unknown script error');
                }
            });


        } else if (fileExtension === '.shp') {
            // 检查相关文件并转换
            processedFileName = fileName.replace('.shp', '.gson');
            // ... 轃用 Python 脚本转换文件的代码
        } 
        
        else {
            return res.status(400).send('Invalid file format.');
        }
    } catch (error) {
        console.error('Error publishing raster data:', error);
        res.status(500).send('upload data gson、kml failed');
    }
});

//上传的矢量shp转为gson的单独路由
/**
 * @swagger
 * /uploadSHPvector:
 *   post:
 *     summary: 处理 Shapefile (.shp) 文件上传并转换为 GeoJSON (.gson)
 *     description: 上传 Shapefile 矢量数据文件集 (.shp, .shx, .dbf)，并将其转换为 GeoJSON 格式。
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               'files[]':
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 要上传的 Shapefile 文件集，包括 .shp, .shx, .dbf 文件。
 *     responses:
 *       200:
 *         description: 文件上传和转换成功，返回转换后文件的URL。
 *       400:
 *         description: 无文件上传、缺少必要文件或文件格式不正确。
 *       500:
 *         description: 服务器内部错误或文件处理失败。
 */
app.post('/uploadSHPvector', async (req, res) => {
    try {
        //文件上传和类型判断的代码
        if (!req.files || !req.files['files[]']) {
            return res.status(400).send('No files were uploaded.');
        }

        const files = req.files['files[]'];
        const fileNames = files.map(f => decodeURIComponent(f.name));

        // 检查是否包含必要的文件
        const requiredExtensions = ['.shp', '.shx', '.dbf'];
        const hasAllFiles = requiredExtensions.every(ext => 
            fileNames.some(name => name.toLowerCase().endsWith(ext))
        );

        if (!hasAllFiles) {
            return res.status(400).send('Missing necessary SHP files (.shp, .shx, .dbf).');
        }

        // 处理和移动文件
        const uploadDirectory = path.join(__dirname, 'public', 'vector_upload');
        let shpFilePath;
        for (const file of files) {
            let uploadPath = path.join(uploadDirectory, decodeURIComponent(file.name));
            await file.mv(uploadPath);
            if (file.name.toLowerCase().endsWith('.shp')) {
                shpFilePath = uploadPath;
            }
        }

        // 转换文件
        if (shpFilePath) {
            const processedFileName = path.basename(shpFilePath, '.shp') + '.gson';
            const vectorOutFile = path.join(uploadDirectory, processedFileName);
            const pythonEnv = process.env.pythonEnv;
            const scriptPath = process.env.shp2gson_scriptPath;


            exec(`${pythonEnv} "${scriptPath}" "${shpFilePath}" "${vectorOutFile}"`, (error, stdout, stderr) => {
                if (error || stderr) {
                    console.error(`Error: ${error}`, `Stderr: ${stderr}`);
                    return res.status(500).send(`Server error: ${error ? error.message : 'Unknown error'}`);
                }

                res.json({ message: 'File uploaded and converted successfully', fileUrl: `/vector_upload/${processedFileName}` });
            });
        } else {
            return res.status(400).send('No SHP file found.');
        }
    } catch (error) {
        console.error('Error publishing raster data:', error);
        res.status(500).send('Upload SHP data failed');
    }
});



//调用python裁剪栅格
const { exec } = require('child_process');

//使用矢量裁剪栅格数据
/**
 * @swagger
 * /clip_raster:
 *   post:
 *     summary: 根据矢量数据剪切栅格数据
 *     description: 使用矢量数据文件路径剪切指定的栅格数据文件，并返回剪切后的栅格数据文件路径。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vectorDataFilePath:
 *                 type: string
 *                 description: 矢量数据文件的路径。
 *                 example: '/path/to/vector/file.geojson'
 *               inputRasterPath:
 *                 type: string
 *                 description: 输入栅格数据文件的路径。
 *                 example: '/path/to/input/raster.tif'
 *               outputRasterPath:
 *                 type: string
 *                 description: 输出栅格数据文件的预期路径。
 *                 example: '/path/to/output/raster.tif'
 *     responses:
 *       200:
 *         description: 栅格数据剪切成功，返回输出文件路径。
 *       500:
 *         description: 服务器内部错误或脚本执行错误。
 */
app.post('/clip_raster', (req, res) => {
    // 假设请求体中包含了矢量数据文件的路径
    const vectorDataFilePath = req.body.vectorDataFilePath;
    const outputRasterPath = req.body.outputRasterPath;
    const inputRasterPath=req.body.inputRasterPath;
    console.log('vectorDataFilePath:', vectorDataFilePath);
    console.log('outputRasterPath:', outputRasterPath);
    console.log('inputRasterPath:', inputRasterPath);
    const pythonEnv = process.env.pythonEnv;
    const scriptPath = process.env.clip_data_scriptPath;


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

//计算面积路由
/**
 * @swagger
 * /calculate_area:
 *   post:
 *     summary: 计算矢量数据的面积
 *     description: 根据提供的 GeoJSON 文件路径，计算其代表的矢量数据的面积。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vectorDataFilePath:
 *                 type: string
 *                 description: GeoJSON 矢量数据文件的路径。
 *                 example: '/path/to/vector/file.geojson'
 *     responses:
 *       200:
 *         description: 成功计算面积，返回面积值。
 *       500:
 *         description: 服务器内部错误或脚本执行错误。
 */
app.post('/calculate_area', (req, res) => {
    const geojsonFilePath = req.body.vectorDataFilePath;

    // Python 环境和脚本路径
    const pythonEnv = process.env.pythonEnv;
    const scriptPath = process.env.cal_vector_area_scriptPath;

    exec(`${pythonEnv} "${scriptPath}" "${geojsonFilePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行出错: ${error}`);
            return res.status(500).send(`Server error: ${error.message}`);
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send(`Script error: ${stderr}`);
        }

        // 将 stdout（面积结果）发送回客户端
        console.log(`stdout: ${stdout}`);
        res.send({ area: stdout.trim() });
    });
});
//创建栅格通过geoserver发布的路由
const publishRasterData = async (workspace, storename, coverageName, filePath) => {

    
    // 这里需要根据实际的用户名和密码进行替换
    const username =process.env.geoserver_username; 
    const password =process.env.geoserver_password;

    const geoserverUrl =process.env.geoserverUrl;
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

    // 步骤3：构建WMTS服务链接
    const geoserver_url=process.env.geoserverUrl
    const wmtsLink =geoserver_url+`/${workspace}/gwc/service/wmts?layer=${workspace}%3A${coverageName}&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TRANSPARENT=true&TileMatrix=12&TileCol=3431&TileRow=1673`
    return wmtsLink;
}

//将数据发布到geoserver中
/**
 * @swagger
 * /publishRaster:
 *   post:
 *     summary: 将栅格数据发布到 GeoServer
 *     description: 接收栅格数据文件的相关信息，并将其发布到 GeoServer，返回 WMTS 链接。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspace
 *               - storename
 *               - coverageName
 *               - filePath
 *               - username
 *               - password
 *             properties:
 *               workspace:
 *                 type: string
 *                 description: GeoServer 中的工作区名称。
 *                 example: 'myWorkspace'
 *               storename:
 *                 type: string
 *                 description: GeoServer 中的数据存储名称。
 *                 example: 'myDataStore'
 *               coverageName:
 *                 type: string
 *                 description: 栅格数据的覆盖名称。
 *                 example: 'myCoverage'
 *               filePath:
 *                 type: string
 *                 description: 栅格数据文件的路径。
 *                 example: '/path/to/raster.tif'
 *               username:
 *                 type: string
 *                 description: GeoServer 登录用户名。
 *                 example: 'admin'
 *               password:
 *                 type: string
 *                 description: GeoServer 登录密码。
 *                 example: 'geoserver'
 *     responses:
 *       200:
 *         description: 数据发布成功，返回 WMTS 链接。
 *       500:
 *         description: 服务器内部错误或发布过程中出错。
 */
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


//下载文件路由 请求路径，下载文件
/**
 * @swagger
 * /download_raster:
 *   get:
 *     summary: 下载栅格数据文件
 *     description: 根据提供的文件路径参数，下载指定的栅格数据文件。
 *     parameters:
 *       - in: query
 *         name: filePath
 *         required: true
 *         description: 要下载的栅格数据文件的相对路径。
 *         schema:
 *           type: string
 *           example: 'example_raster.tif'
 *     responses:
 *       200:
 *         description: 文件下载成功。
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: 提供的文件路径无效或文件不存在。
 */
app.get('/download_raster', function(req, res) {
    // 直接使用 rasterDataFilePath 变量进行下载
    // 获取相对于 public 目录的文件路径
    const raster_output_NAME_FULL = req.query.filePath;
    
    // 构建完整的文件路径
    const fullPath = path.join(__dirname, 'public', 'raster_output_fromDB', raster_output_NAME_FULL);
    if (fullPath) {
        res.download(fullPath);
    } else {
        res.status(400).send('No file path provided');
    }
});

//定时清除工作空间和已发布的文件
async function recreateWorkspace(workspace) {
    const username =process.env.geoserver_username; 
    const password =process.env.geoserver_password;

    const geoserverUrl =process.env.geoserverUrl;

    try {
        // 删除现有的工作空间
        await axios.delete(`${geoserverUrl}/rest/workspaces/${workspace}?recurse=true`, {
            auth: { username, password }
        });
        console.log(`Successfully deleted workspace ${workspace}.`);

        // 等待一段时间后再创建新工作空间（例如，等待5秒）
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 创建新的工作空间
        const response = await axios.post(`${geoserverUrl}/rest/workspaces`, {
            workspace: {
                name: workspace
            }
        }, {
            auth: { username, password },
            headers: { 'Content-type': 'application/json' }
        });

        console.log(`Successfully created workspace ${workspace}. Response: `, response.data);
    } catch (error) {
        console.error(`Error in managing workspace ${workspace}:`, error);
    }
}
//定时删除服务器中的文件
async function deleteFilesInDirectory(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
}

setInterval(async () => {
    const workspace = process.env.workspace;
    const directory = process.env.geoserver_directory;

    await recreateWorkspace(workspace);
    //需要等待部署到服务器之后再进行下一步
    // await deleteFilesInDirectory(directory);
}, 3600000); // 每小时执行一次

// casdoor登录路由
const url = require('url')
const { SDK } = require('casdoor-nodejs-sdk');
const cors = require('cors')

//设置网址（本地环境和服务器环境）
const Server_URL=process.env.Server_URL

// 获取证书文件的路径
const certFilePath = process.env.cert_PEM_file_path;
// 同步读取证书文件
const cert = fs.readFileSync(certFilePath, 'utf8');
//casdoor参数
const authCfg = {
  endpoint: process.env.endpoint,
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  certificate: cert,
  orgName: process.env.orgName,
  appName: process.env.appName,
}

const sdk = new SDK(authCfg);
//跨域
app.use(cors({
    origin: Server_URL,
    credentials: true
  }))

//获取用户信息
/**
 * @swagger
 * /api/getUserInfo:
 *   get:
 *     summary: 获取用户信息
 *     description: 根据提供的 JWT 令牌获取用户信息。
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: JWT 认证令牌。
 *         schema:
 *           type: string
 *           example: 'your_jwt_token_here'
 *     responses:
 *       200:
 *         description: 成功获取用户信息。
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: 用户信息对象。
 *       400:
 *         description: 缺少或无效的 JWT 令牌。
 */
app.get('/api/getUserInfo', (req, res) => {
    // console.log("/api/getUserInfo")
    // console.log(req)
    let urlObj = url.parse(req.url, true).query;
    // console.log("urlObj.token",urlObj.token)
    let user = sdk.parseJwtToken(urlObj.token);
    // console.log("JSON.stringify(user)",JSON.stringify(user))
    res.write(JSON.stringify(user));
    res.end();
  });
  
  app.post('*', (req, res) => {
    let urlObj = url.parse(req.url, true).query;
    sdk.getAuthToken(urlObj.code).then(response => {
      
      const accessToken = response.access_token;
      res.send(JSON.stringify({ token: accessToken }));
    });
  });
//跳转到用户主页信息的路由
/**
 * @swagger
 * /user:
 *   get:
 *     summary: 跳转到用户主页
 *     description: 根据提供的用户信息跳转到用户的主页。
 *     parameters:
 *       - in: query
 *         name: userinfo
 *         required: true
 *         description: 用户信息的 JSON 字符串。
 *         schema:
 *           type: string
 *           example: '{"name":"John Doe", "createdTime":"2023-01-01", "score": 100, "type":"normal", "phone":"1234567890"}'
 *     responses:
 *       200:
 *         description: 用户主页渲染成功。
 *       400:
 *         description: 缺少或无效的用户信息。
 */
app.get("/user", (req, res) => {
    const userinfo = JSON.parse(req.query.userinfo);
    res.render("user", {
      name: userinfo.name,
      createdTime: userinfo.createdTime,
      score:userinfo.score,
      type:userinfo.type,
      phone:userinfo.phone
    });
  })
  
// 定义/login路由,用户修改密码后跳转到该网页
/**
 * @swagger
 * /login:
 *   get:
 *     summary: 登录重定向
 *     description: 将用户重定向到登录服务。
 *     responses:
 *       302:
 *         description: 成功重定向到登录页面。
 */
app.get('/login', (req, res) => {
    res.redirect(Server_URL); // 重定向到指定的URL
});

//跳转到网站使用须知网页中
/**
 * @swagger
 * /UserWebPage:
 *   get:
 *     summary: 跳转到网站使用须知网页
 *     description: 将用户重定向到网站的使用须知页面。
 *     responses:
 *       200:
 *         description: 成功渲染网站使用须知网页。
 */
app.get("/UserWebPage", (req, res) => {
    res.render("UserWebPage");
})

//获取矢量文件和导出的栅格文件保存路径
/**
 * @swagger
 * /get_SHP_RASTER_Paths:
 *   post:
 *     summary: 获取矢量文件和栅格文件的保存路径
 *     description: 返回服务器上矢量文件和导出的栅格文件的保存路径。
 *     responses:
 *       200:
 *         description: 成功返回矢量文件和栅格文件的保存路径。
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vectorDirPath:
 *                   type: string
 *                   description: 矢量文件的保存路径。
 *                 rasterOutputDirPath:
 *                   type: string
 *                   description: 导出的栅格文件的保存路径。
 */
app.post('/get_SHP_RASTER_Paths', (req, res) => {
    res.json({
      vectorDirPath:process.env.VECTOR_DIR_PATH,
      rasterOutputDirPath:process.env.raster_output_DIR_PATH,
    });
  });


