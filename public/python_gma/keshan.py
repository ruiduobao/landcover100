import os

def create_nested_subfolders(source_path, target_base_path):
    # 提取源路径中的最后两个要素
    last_two_elements = source_path.rstrip(os.sep).split(os.sep)[-2:]

    # 构建完整的目标路径
    full_target_path = os.path.join(target_base_path, *last_two_elements)
    print(last_two_elements)
    # 如果目标路径不存在，则创建它
    if not os.path.exists(full_target_path):
        os.makedirs(full_target_path)
        print(f"Created folder: {full_target_path}")
    else:
        print(f"Folder already exists: {full_target_path}")
    name=last_two_elements[0]+"_"+last_two_elements[1]
    return full_target_path,name

# 使用示例
source_path = "F:\\landcover100_com_DB\\Land_Cover\\high_resolution\\ESRI_worldcover\\2017-2021年全国土地利用分类数据（精度为10m）\\2021\\52"
target_base_path = "F:\\landcover100_com_DB\\Land_Cover\\high_resolution\\ESRI_worldcover\\mosaic\\mosaic"
print(create_nested_subfolders(source_path, target_base_path)[1])
