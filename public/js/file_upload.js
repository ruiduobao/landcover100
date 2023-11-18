// 点击上传文件区域时的处理
document.getElementById('file-upload-container').addEventListener('click', function() {
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.gson,.shp,.geojson,.kml,.dbf,.shx,.qmd,.cpg,.prj';
    fileInput.multiple = true; // 允许多文件上传
    fileInput.style.display = 'none';

    fileInput.onchange = async function(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        let route = ''; // 用于确定调用的后端路由
        const formData = new FormData();

        if (files.length === 1) {
            // 单文件上传
            const file = files[0];
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileName = encodeURIComponent(file.name);
            if (!['kml', 'geojson', 'gson'].includes(fileExtension)) {
                alert('单文件上传必须是 KML, GeoJSON, 或 GSON 格式');
                return;
            }

            route = '/uploadvector';
            formData.append('file', file, fileName); // 使用原始的字段名 'file'
        } else {
            // 多文件上传
            if (!files.some(file => file.name.endsWith('.shp')) ||
                !files.some(file => file.name.endsWith('.shx')) ||
                !files.some(file => file.name.endsWith('.dbf'))) {
                alert('多文件上传必须包含 SHP, SHX, 和 DBF 文件');
                return;
            }

            route = '/uploadSHPvector';
            files.forEach(file => {
                const fileName = encodeURIComponent(file.name);
                formData.append('files[]', file, fileName); // 使用新的字段名 'files[]'
            });
        }

        // 发送文件到服务器
        try {
            const response = await fetch(route, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                console.log('Files uploaded successfully:', result.fileUrl);
                // 这里可以写代码将文件加载到地图上
                loadGeoJSONfromPath(result.fileUrl)
            } else {
                console.error('Upload failed:', result.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    fileInput.click(); // 模拟点击，打开文件管理器
});
