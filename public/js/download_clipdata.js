//下载裁剪之后的数据
function Download_Clip_raster() {
    //裁剪后的文件名
    raster_output_NAME_FULL=raster_filename+".tif"
    window.location.href = '/download_raster?filePath=' + raster_output_NAME_FULL;
}
