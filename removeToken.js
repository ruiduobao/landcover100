import fs from 'fs';
const filePath = './node_modules/mapbox-gl/dist/mapbox-gl.js';

fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) throw err;
    data = data.replace(
        'if(t&&(t.message===w||401===t.status))',
        'if(false)',
    );
    fs.writeFile(filePath, data, function (err) {
        if (err) throw err;
        console.log('文件已修改');
    });
});
