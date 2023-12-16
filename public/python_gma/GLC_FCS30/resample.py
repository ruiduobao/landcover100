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

InFile=r"E:\百度网盘\刘良云土地覆盖\刘良云土地覆盖\2020年GLC_FCS30米全国土地覆盖数据.tif"
OutFile=r"E:\百度网盘\刘良云土地覆盖\刘良云土地覆盖\2020年GLC_FCS30米全国土地覆盖数据_geoserver.tif"
rasp.Basic.Resample(InFile, OutFile,0.004)
create_pyramid(OutFile)