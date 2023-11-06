// //设置用户上传功能
// function handleSelectChange() {
//     const selectElement = document.getElementById('data_type_select');
//     const fileUploadContainer = document.getElementById('file-upload-container');
//     const drawIcons = document.getElementById('drawIcons');
//     // 隐藏所有相关的div
//     fileUploadContainer.style.display = 'none';
//     drawIcons.style.display = 'none';
    
//     // 根据选中的选项显示相应的div
//     if (selectElement.value === 'type2') { // 如果是本地上传
//         fileUploadContainer.style.display = 'block';
//     } else if (selectElement.value === 'type3') { // 如果是在线勾画
//         drawIcons.style.display = 'flex';
//     }
// }
//按选中区域选择功能进行显示
function handleSelectChange() {
    var selectedValue = document.getElementById('data_type_select').value;
    var administrativeContainer = document.getElementById('administrative-select-container');
    var fileUploadContainer = document.getElementById('file-upload-container');
    var drawIconsContainer = document.getElementById('drawIcons');

    // 隐藏所有其他选项
    administrativeContainer.style.display = 'none';
    fileUploadContainer.style.display = 'none';
    drawIconsContainer.style.display = 'none';

    switch(selectedValue) {
        case 'type1': // 当选中按行政区划时
            administrativeContainer.style.display = 'block';
            break;
        case 'type2': // 当选中本地上传时
            fileUploadContainer.style.display = 'block';
            break;
        case 'type3': // 当选中在线勾画时
            drawIconsContainer.style.display = 'block';
            break;
    }
}

// 页面加载完成后绑定change事件到select框
document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('data_type_select').addEventListener('change', handleSelectChange);
});
