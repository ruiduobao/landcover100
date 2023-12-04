//添加地理编码、矢量数据从postgis中查询的路由




// 新增路由来处理地理编码请求
router.post('/getGeoAddress', async (req, res, next) => {
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
  router.post('/getGsonDB', async (req, res) => {
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

module.exports = router;