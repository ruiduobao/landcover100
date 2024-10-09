import os
import shutil

# 筛选中国区域文件
BASIC_NAME="GLC_FCS30D_20002022_E90N65_Annual.tif"
longitude_range = range(60, 136, 5)
latitude_range = range(15, 56, 5)

file_names = []

for lon in longitude_range:
    for lat in latitude_range:
        file_name = f"GLC_FCS30D_20002022_E{lon}N{lat}_Annual.tif"
        file_names.append(file_name)


# 打印生成的文件名
for name in file_names:
    print(name)

FILE_PATH=r"F:\landcover100_com_DB\Land_Cover\medium_resolution\GLC_FCS\2021_2022\原始数据\GLC_FCS30D_20002022"

COPY_TO_PATH=r"F:\landcover100_com_DB\Land_Cover\medium_resolution\GLC_FCS\2021_2022\原始数据\GLC_FCS30D_20002022_筛选中国范围"

# 获取FILE_PATH下的实际文件名
existing_files = os.listdir(FILE_PATH)

# 复制文件
for name in file_names:
    if name in existing_files:
        source_file_path = os.path.join(FILE_PATH, name)
        destination_file_path = os.path.join(COPY_TO_PATH, name)
        shutil.copyfile(source_file_path, destination_file_path)

print("文件复制完成")

