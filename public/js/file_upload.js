//设置用户上传功能
function handleSelectChange() {
    const selectElement = document.getElementById('data_type_select');
    const fileUploadContainer = document.getElementById('file-upload-container');
    const drawIcons = document.getElementById('drawIcons');
    // 隐藏所有相关的div
    fileUploadContainer.style.display = 'none';
    drawIcons.style.display = 'none';
    
    // 根据选中的选项显示相应的div
    if (selectElement.value === 'type2') { // 如果是本地上传
        fileUploadContainer.style.display = 'block';
    } else if (selectElement.value === 'type3') { // 如果是在线勾画
        drawIcons.style.display = 'flex';
    }
}

// 点击上传文件区域时的处理
document.getElementById('file-upload-container').addEventListener('click', function() {
    // 创建一个隐藏的文件输入元素
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.gson,.shp,.geojson,.kml'; // 指定允许上传的文件类型
    fileInput.style.display = 'none'; // 隐藏文件输入元素
    fileInput.onchange = async function(event) {
        const file = event.target.files[0];
        // 确认是否选择了文件
        if (file) {
            // 创建 FormData

            // 对文件名进行URL编码
            const fileName = encodeURIComponent(file.name);
            const formData = new FormData();
            formData.append('file',file,fileName);

            // 发送文件到服务器
            try {
                const response = await fetch('/uploadvector', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (response.ok) {
                    console.log('File uploaded successfully:', result.fileUrl);
                    // 这里可以写代码将文件加载到地图上
                    loadGeoJSONfromPath(result.fileUrl)
                } else {
                    console.error('Upload failed:', result.message);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };
    fileInput.click(); // 模拟点击，打开文件管理器
});
