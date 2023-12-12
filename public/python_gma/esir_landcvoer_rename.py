import os

def rename_tif_files(directory):
    # 遍历指定目录及其子目录
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tif'):
                # 构建原始文件路径
                old_file_path = os.path.join(root, file)

                # 构建新文件名和新文件路径
                new_file_name = file.replace('_colorized', '')
                new_file_path = os.path.join(root, new_file_name)

                # 重命名文件
                os.rename(old_file_path, new_file_path)
                print(f"Renamed '{old_file_path}' to '{new_file_path}'")

# 使用示例
folder_path = r"F:\landcover100_com_DB\others\中国2000-2020人口密度"
rename_tif_files(folder_path)
