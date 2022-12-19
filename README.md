# Ionomics-Raw-Data-Formatter
 A script to quickly organize the raw ionomics data into something more useful for downstream analysis.


## Installation

### Use a Bundled Executable

The easiest way to use this script is to download the bundled executable from the [releases page](https://github.com/codynhanpham/Ionomics-Raw-Data-Formatter/releases). A version for Windows x64 machines is available. If you are using a different operating system or architecture, you will need to run the script with NodeJS or package it yourself (see below).

The zip file contains the executable and the datasets folder. You will need to keep these two files in the same directory. The datasets folder contains the translation table (a csv file) required for the script.

### Run with NodeJS

The script was written in NodeJS, and that is the intended way to run it. You will need to have NodeJS installed on your machine. You can download the latest version of NodeJS for your machine [here](https://nodejs.org/en/download/).

Once you have NodeJS installed, you can run the script by navigating to the directory where you downloaded this repository and running the following command:

```
node .
```

### Package the Script

If you want to package the script into a single executable, you can do so by first installing NodeJS [here](https://nodejs.org/en/download/) and downloading the repository onto your machine. Then, from the root directory of the repository, run the two commands in the build-script.txt file.

The first command will bundle all of the necessary files into a single `build_node14.js` file using [esbuild](https://esbuild.github.io/). Then, the second command will package the `build_node14.js` file into a single executable suitable for your machine using [pkg](https://www.npmjs.com/package/pkg).

Note that even after packaging the script, you will still need to have the [datasets](https://github.com/codynhanpham/Ionomics-Raw-Data-Formatter/tree/main/datasets) folder in the same directory as the executable. The datasets folder contains the translation table (a csv file) required for the script.

## Usage

1. After downloading the raw datasets, even if they are already in the `.csv` format, it is best to open them in Excel or another spreadsheet program and save them as `.csv` files again as `CSV UTF-8 (Comma delimited) (*.csv)`. This will ensure that the files are properly formatted for the script.

2. Start the script using the methods described above (either double-clicking the executable or running `node .`).

3. Regardless of the location of the input `.csv` file (it does not have to be in the same directory as the script), you will be prompted to enter the path to the input file. On windows machines, after selecting the file, the shortcut is `Ctrl + Shift + C`.

4. Simply follow the prompts as the script runs.

5. The script will save the `.csv` outputs in the `/outputs/` folder in the same directory as the input file.