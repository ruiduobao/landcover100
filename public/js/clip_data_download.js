function clipDataDownload() {

    // 矢量文件的绝对路径的文件夹
    const VECTOR_DIR_PATH="D:/website/landcover100/public"
    const vectorDataFilePath=VECTOR_DIR_PATH+geojson_path[0]
    // 准备发送到服务器的数据
    const data = { vectorDataFilePath };

    // 发送 POST 请求到服务器
    fetch('/clip-dem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('裁剪成功，结果文件路径:', data.outputPath);
        // 这里可以添加代码来处理裁剪结果的路径，例如显示下载链接
    })
    .catch(error => {
        console.error('裁剪栅格数据时发生错误:', error);
    });
    console.log(geojson_path)
}
