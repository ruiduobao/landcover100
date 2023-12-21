from gma import rasp

input_file=r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\class.tif"
output_file=r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\class_repoject.tif"
rasp.Basic.Reproject(input_file, output_file,4326)