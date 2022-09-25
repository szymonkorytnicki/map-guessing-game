for file in assets/svgToPng/*.jpg.png
do
    # convert $file -transparent white $file.png
    convert $file -trim $file.png
done