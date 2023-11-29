//将文件重命名为文件名+时间+后缀
//防止重名文件
function renameFileWithTimestamp(filename) {
    // 获取当前时间
    var now = new Date();
    var year = now.getFullYear();
    var month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，需要加1
    var day = now.getDate().toString().padStart(2, '0');
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');
    var seconds = now.getSeconds().toString().padStart(2, '0');
  
    // 格式化时间为"yyyyMMddHHmmss"的字符串
    var formattedTime = year + month + day + hours + minutes + seconds;
  
  
    // 创建新文件名
    var newFileName = filename + "_"+formattedTime;
  
    return newFileName;
  }
  
  // 使用示例
  var originalFileName = "120000_DEM250";
  var newFileName = renameFileWithTimestamp(originalFileName);
  console.log(newFileName); // 输出新的文件名
  