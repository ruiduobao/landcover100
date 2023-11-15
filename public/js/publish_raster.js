function publish_Raster() {
    const workspace = 'landcover100_DEM';
    const storename = 'DEM1000';
    const coverageName = 'clip_dem';
    const filePath = "D:/website/landcover100/public/raster_output_fromDB/clip_dem.tif";

    // 这里需要根据实际的用户名和密码进行替换
    const username = 'admin'; 
    const password = 'RDB123456.';

    fetch('/publishRaster', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            workspace: workspace,
            storename: storename,
            coverageName: coverageName,
            filePath: filePath,
            username: username,
            password: password
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Raster Published! WMTS Link: ' + data.wmtsLink);
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error publishing raster.');
    });
};