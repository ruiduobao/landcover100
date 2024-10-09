from gma import vesp

InFile = r'F:\landcover100_com_DB\others\全欧洲耕地地块\全欧洲.gpkg'
OutFile = r'F:\landcover100_com_DB\others\全欧洲耕地地块\全欧洲_修复几何.gpkg'

vesp.Basic.FixGeometry(InFile, OutFile)