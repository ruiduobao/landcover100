import os

def rename_tif_files(directory):
    # 遍历指定目录及其子目录
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.geojson'):
                # 构建原始文件路径
                old_file_path = os.path.join(root, file)

                # 构建新文件名和新文件路径
                new_file_name = file.replace('country_NO_', '')
                new_file_path = os.path.join(root, new_file_name)

                # 重命名文件
                os.rename(old_file_path, new_file_path)
                print(f"Renamed '{old_file_path}' to '{new_file_path}'")

# 使用示例
folder_path = r"F:\帮别人忙\肖老师\中间过程文件\点矢量\split"
rename_tif_files(folder_path)
