from gma import rasp

input_file=r"F:\landcover100_com_DB\Land_Cover\medium_resolution\武汉大学30m_1985-2019\CLCD_v01_2022_geoserver.tif"
output_file=r"F:\landcover100_com_DB\Land_Cover\medium_resolution\武汉大学30m_1985-2019\CLCD_v01_2022_albert_resample_repoject.tif"
rasp.Basic.Reproject(input_file, output_file,4326)