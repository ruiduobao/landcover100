import gma
from tqdm import tqdm
from gma import rasp
from osgeo import gdal

def progress_callback(complete, message, unknown):
    """
    Callback function to display progress.
    """
    # complete is a float between 0 and 1 representing the progress
    print(f"Progress: {complete*100:.2f}%", end="\r")
    return 1  # Returning 1 continues the operation, returning 0 cancels

def create_pyramid(tif_file):
    """
    Function to add pyramid layers to a TIFF file using GDAL.
    
    Args:
    tif_file (str): Path to the TIFF file.
    
    Returns:
    str: Message indicating the success or failure of the operation.
    """
    try:
        # Open the dataset
        dataset = gdal.Open(tif_file, gdal.GA_Update)

        # Check if the dataset is valid
        if dataset is None:
            return "Failed to open the TIFF file."

        # Generate pyramid layers
        resampling_method = 'average'
        pyramid_levels = [2, 4, 8, 16]
        
        gdal.SetConfigOption('COMPRESS_OVERVIEW', 'LZW')
        dataset.BuildOverviews(resampling_method, pyramid_levels, callback=progress_callback)

        # Close the dataset
        dataset = None

        return "Pyramid layers added successfully to the TIFF file."
    except Exception as e:
        return f"An error occurred: {e}"

INPUT_DIR=r"F:\landcover100_com_DB\DEM\medium_resolution\AW3D30_V4\tifs"
outfile=r"F:\landcover100_com_DB\DEM\medium_resolution\AW3D30_V4\mosaic\AW3D3_30.tif"
outfile_CHINA=r"F:\landcover100_com_DB\DEM\medium_resolution\AW3D30_V4\mosaic\AW3D3_30_CHINA.tif"
outfile_CHINA_GEOSERVER=r"F:\landcover100_com_DB\DEM\medium_resolution\AW3D30_V4\mosaic\AW3D3_30_CHINA_geoserver.tif"
SHP_PATH=r"F:\landcover100_com_DB\others\中国范围矢量\2023年省级.shp"

# InFiles = gma.osf.FindPath(INPUT_DIR)
# gma.rasp.Basic.Mosaic(InFiles,outfile)

gma.rasp.Basic.Clip(outfile, outfile_CHINA, SHP_PATH)
gma.rasp.Basic.GenerateOVR(outfile)

rasp.Basic.Resample(outfile_CHINA, outfile_CHINA_GEOSERVER,0.004)
create_pyramid(outfile_CHINA_GEOSERVER)
