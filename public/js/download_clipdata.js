//下载裁剪之后的数据
function Download_Clip_raster() {
    //登录才能下载
    if(token){
            //裁剪后的文件名
            raster_output_NAME_FULL=raster_filename+".tif"
            window.location.href = '/download_raster?filePath=' + raster_output_NAME_FULL;
    }   
    else{alert("登录后才可下载文件")}
}
