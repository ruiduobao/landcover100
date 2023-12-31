// app.js
const express = require('express');
const app = express();
const port = 3003;
const fs = require('fs');
const path = require('path');
const axios = require('axios');

app.set('view engine', 'ejs');

//家里电脑路径
console.log("当前环境:", process.env.NODE_ENV);
//环境参数 如果 NODE_ENV 设置为 "production"，则加载 .env.production 文件。否则，默认加载 .env.development 文件
require('dotenv').config({
    path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"
  });


// 在 app.js 中
app.use(express.static('public'));
// 用于解析JSON格式的请求体
app.use(express.json()); 

// //用于存储数据源的gson文件
// const dataDBPath = path.join(__dirname, 'public', 'raster_data_DB', 'dataDB_time.gson');
// const dataDB = JSON.parse(fs.readFileSync(dataDBPath, 'utf8'));

app.get('/', (req, res) => {
  res.render('index', { title: '首页'});
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

// app.post('/uploadvector', (req, res) => {
//     console.log('Received request for /uploadvector'); // 调试信息
//     if (!req.files || Object.keys(req.files).length === 0) {
//         return res.status(400).send('No files were uploaded.');
//     }
//     // `file` 是前端传来的文件对象名称
//     let file = req.files.file; // 确保这里的`file`与前端发送的字段名一致
//     // 对URL编码过的文件名进行解码
//     let fileName = decodeURIComponent(file.name);
//     // 检查文件格式
//     const validFormats = ['.gson', '.geogson', '.shp', '.geojson', '.kml'];
//     const fileExtension = path.extname(file.name).toLowerCase();
    
//     if (validFormats.includes(fileExtension)) {
//         // 设置文件保存路径
//         let uploadPath = path.join(__dirname, 'public', 'vector_upload', fileName);
//         file.mv(uploadPath, function(err) {
//             if (err) {
//                 return res.status(500).send(err);
//             }
//             res.json({ message: 'File uploaded successfully', fileUrl: `/vector_upload/${fileName}` });
//         });
//     } else {
//         res.status(400).send('Invalid file format.');
//     }
// });
// 一个POST路由，用于处理文件上传
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
            const pythonEnv = " C:/Users/HTHT/.conda/envs/GMA_envir/python.exe";
            //kml转gson脚本路径
            const scriptPath = "D:/website/landcover100/public/python_gma/kml2gson.py";
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
            const pythonEnv = "C:/Users/HTHT/.conda/envs/GMA_envir/python.exe";
            const scriptPath = "D:/website/landcover100/public/python_gma/shp2gson.py";


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
app.post('/clip_raster', (req, res) => {
    // 假设请求体中包含了矢量数据文件的路径
    const vectorDataFilePath = req.body.vectorDataFilePath;
    const outputRasterPath = req.body.outputRasterPath;
    const inputRasterPath=req.body.inputRasterPath;
    console.log('vectorDataFilePath:', vectorDataFilePath);
    console.log('outputRasterPath:', outputRasterPath);
    console.log('inputRasterPath:', inputRasterPath);

    // const inputRasterPath = "E:/ruiduobao/MY_website/landcover100_com/public/raster_data_DB/DEM_1000_3857.tif";
    // const outputRasterPath = "E:/node_gdal_waibu22223452.tif";

    // const inputRasterPath = "D:/website/landcover100/public/raster_data_DB/DEM_1000_3857.tif";
    // const outputRasterPath = "D:/website/landcover100/public/raster_output_fromDB/clip_dem.tif";
    //办公室电脑路径
    const pythonEnv = "C:/softfiles/envs/GMA_envir/python.exe";
    const scriptPath = "E:/ruiduobao/MY_website/landcover100_com/public/python_gma/clip_data.py";
    //python的路径
    // const pythonEnv = " C:/Users/HTHT/.conda/envs/GMA_envir/python.exe";
    //裁剪脚本路径
    // const scriptPath = "D:/website/landcover100/public/python_gma/clip_data.py";

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
app.post('/calculate_area', (req, res) => {
    const geojsonFilePath = req.body.vectorDataFilePath;

    // Python 环境和脚本路径
    const pythonEnv = "C:/softfiles/envs/GMA_envir/python.exe";
    const scriptPath = "E:/ruiduobao/MY_website/landcover100_com/public/python_gma/cal_vector_area.py";

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
    const username = 'admin'; 
    const password = 'RDB123456.';

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

    // 步骤3：构建WMTS服务链接
    
    const wmtsLink =`http://182.254.147.254:8080/geoserver/${workspace}/gwc/service/wmts?layer=${workspace}%3A${coverageName}&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix=12&TileCol=3431&TileRow=1673`
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


//下载文件路由 请求路径，下载文件
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
    const username = 'admin'; 
    const password = 'RDB123456.';
    const geoserverUrl = 'http://182.254.147.254:8080/geoserver';

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
    const workspace = 'landcover100_DEM';
    const directory = '/usr/share/geoserver/data_dir/data/landcover100_DEM';

    await recreateWorkspace(workspace);
    //需要等待部署到服务器之后再进行下一步
    // await deleteFilesInDirectory(directory);
}, 3600000); // 每小时执行一次

// casdoor登录路由
const url = require('url')
const { SDK } = require('casdoor-nodejs-sdk');
const cors = require('cors')

//设置网址（本地环境和服务器环境）
const Server_URL="http://localhost:3003"
const cert = `
-----BEGIN CERTIFICATE-----
MIIE2TCCAsGgAwIBAgIDAeJAMA0GCSqGSIb3DQEBCwUAMCYxDjAMBgNVBAoTBWFk
bWluMRQwEgYDVQQDDAtjZXJ0X2ZhYzhxNjAeFw0yMzExMjExOTE2MjRaFw00MzEx
MjExOTE2MjRaMCYxDjAMBgNVBAoTBWFkbWluMRQwEgYDVQQDDAtjZXJ0X2ZhYzhx
NjCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMWTVJjfoWu31q1Kj3tR
NJaN6EhHdeF80uSzfxyH6BxHOi1yTj0mWzMqk7fKft2OxAdTh64bbI6UH0ce/lhm
88vHV1/iaryGrAy3awe7oGgtnGBWYV24f8CfkTETBQ0o+TeG5Fuz2zR4M2czi/mO
0XRU7wBpNf+SLqAWUzF2n0Yl5d+7GSKPB+4JV82faAscJgi3BhwifBfN2hxKRkrF
WM4V8Fr1YvEAXEw1QxbOhqgkAKF32vPQW1vbuzafafO9GBUNJupt3AEVmSBwkw+b
0IvU8HG/1Gif0GJ1r/gDbRi2EuJL6kVU/VQ864qcffuH7uUV3foOrHJExc/0sjWq
q4eDvKlXbfzMFukZtfEAVI1CdpePVkIM3uBbgc5YJ0MnFD0Nt9gQNGaKBat2CCwY
XSXVl6X5HiXu8U/WUXWnul1k2zTbvYG8xYlsJVlqR0VzJ+5dpQJ+OUl3UnvHVY4s
57xL6b4sOrZa0R3fzQpLOk+WDDK12C55Xbz7P+2Gwno6JDJ1FT2c1h/Qpp9GQWvJ
elAo/xwCg2emeCEf91Mwf9O8eEdqpG+tX1plDLsBzN6nd43J16yslOzH2UwL2SgC
vNLUZom5svjOXMnOFF5hr7pcpPQyYryGexvgvzgF84k3Wnkjlwale5M4kHtpnc/2
e+HtQARDdl/8YLvNRWTEeUZ7AgMBAAGjEDAOMAwGA1UdEwEB/wQCMAAwDQYJKoZI
hvcNAQELBQADggIBAMOiCcqeM05/DxramTWBDa8nFobvwg2viq6COdINv2u9ExN5
e+mhYMvuQi9vXZCFS8wVmHxC6i//jXc+A7lbTZiBX3ANwjw8D4tTjKVjEGw2qnmW
PRgZseqFc1YwA1/IljDyeCx9mr4DZjNE2dMnbtXRYN+etldxSLJTo4pjqp5liRiB
M8+D/MqfxF9PUAQZVjHtsW9TOcYJ90+LBbJGx4ZesxNteboCCBbUiQnavAwiu2jR
32Gq5DhojfvFW6xsvCpM24yhYUhGH3CL2V/9dhd2jNlIHtYuwE0MMC0kbjr4/yt8
t9VSLXUcsHEDs4ho9GfY0AEDf374TlQODZ8WXDUuDNvGv4sE+pkYRNhhJAI/92ve
XdjtRxnlkUNJ5Z1Dfw97A/L+aeCs4ff7ebM/poi8JSCZucRnQXy4nu67+3+yH5JK
/u9276hgSwDbXldfjz/HLbienZ2tnv78A8f3V/JGoAAd1H8K1bSG84h9K0RwoBKd
LhzEFjHX43YnfQ721c3nPYgc4QR7a0LVj3df9IDf0LKOhWPB5V/dWdLBI8txzuXN
UM9yTiBSWfiTH2aCO/IJgJWdRkijyuZsuBakoWJFyYZtL2LU0bnn3LVDL1mo/YWg
/PbtxS/kFwjvpvrbwIkoYBINd8v7ulRHOnc5GOGaeT80sfYHxFv1DBLkokyh
-----END CERTIFICATE-----
`;

//casdoor参数
const authCfg = {
  endpoint: 'https://login.landcover100.com',
  clientId: '2ad095dec6ed461cdf87',
  clientSecret: 'd5fedc8ed12f05841ec6c0257c60ccb66a58226c',
  certificate: cert,
  orgName: 'RuiduobaoOrganization',
  appName: 'LandCover100APP',
}

const sdk = new SDK(authCfg);
//跨域
app.use(cors({
    origin: Server_URL,
    credentials: true
  }))
//获取用户信息
app.get('/api/getUserInfo', (req, res) => {
    // console.log("/api/getUserInfo")
    // console.log(req)
    let urlObj = url.parse(req.url, true).query;
    console.log("urlObj.token",urlObj.token)
    let user = sdk.parseJwtToken(urlObj.token);
    console.log("JSON.stringify(user)",JSON.stringify(user))
    res.write(JSON.stringify(user));
    res.end();
  });
  
  app.post('*', (req, res) => {
    let urlObj = url.parse(req.url, true).query;
    sdk.getAuthToken(urlObj.code).then(response => {
      
      const accessToken = response.access_token;
      // const accessToken = response;
      // console.log("JSON.stringify({ token: accessToken })",JSON.stringify({ token: accessToken }))
      // const refresh_token = response.refresh_token;
      res.send(JSON.stringify({ token: accessToken }));
    });
  });
//跳转到用户主页信息的路由
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
app.get('/login', (req, res) => {
    res.redirect(Server_URL); // 重定向到指定的URL
});

//跳转到网站使用须知网页中
app.get("/UserWebPage", (req, res) => {
    res.render("UserWebPage");
})