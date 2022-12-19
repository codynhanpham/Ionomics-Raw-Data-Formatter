# Ionomics-Raw-Data-Formatter
 A script to quickly organize the raw ionomics data into something more useful for downstream analysis.

---

# Installation

### Option 1: Use a Bundled Executable

The easiest way to use this script is to download the bundled executable from the [releases page](https://github.com/codynhanpham/Ionomics-Raw-Data-Formatter/releases). A version for `Windows x64` machines is available. If you are using a different operating system or architecture, you will need to run the script with [Node.js](https://nodejs.org/en/download/) or package it yourself (see below).

The zip file contains the executable and the `datasets` folder. You will need to keep these two in the same directory. The `datasets` folder contains a translation table (a `.csv` file) required for the script to associate the samples' collected names with their genome IDs.

---

### Option 2: Run with [Node.js](https://nodejs.org/en/download/)

The script was written in [Node.js](https://nodejs.org/en/download/), and that is the intended way to run it. You will need to have [Node.js](https://nodejs.org/en/download/) installed on your machine. You can download the latest version of **Node.js** for your machine [here](https://nodejs.org/en/download/).

**Once you have [Node.js](https://nodejs.org/en/download/) installed, you can start using the script by navigating to the directory where you downloaded this repository and following the instructions below in the terminal or command prompt.**

1. For the first run ever, use this command to download some required dependencies:
```
npm install
```
2. Then, start the script with:
```
node .
```

---

### Option 3: Package the Script Yourself!

If you want to package the script into a single executable, you can do so by first installing **Node.js** [here](https://nodejs.org/en/download/) and downloading this repository onto your machine. Then, from the root directory of the repository, open the terminal or command prompt and follow the instructions below.

1. Install some required dependencies by running:
```
npm install
```
2. Copy and run the two commands in the `build-script.txt` one by one:

The first command will bundle all of the necessary files into a single `build_node14.js` file using [esbuild](https://esbuild.github.io/)
```
npx esbuild index.js --bundle --platform=node --target=node14 --outfile=build_node14.js
```
Then, the second command will package the `build_node14.js` file into a single executable suitable for your machine using [pkg](https://www.npmjs.com/package/pkg)
```
npx pkg build_node14.js -t node14
```

***Note that even after packaging the script, you will still need to have the [datasets](https://github.com/codynhanpham/Ionomics-Raw-Data-Formatter/tree/main/datasets) folder in the same directory as the executable. The `datasets` folder contains a translation table (a `.csv` file) required for the script to associate the samples' collected names with their genome IDs.***

---

# Usage

1. After downloading the raw datasets, even if they are already in the `.csv` format, it is best to open them in Excel or another spreadsheet program and save them as `.csv` files again as `CSV UTF-8 (Comma delimited) (*.csv)`. This will ensure that the files are properly formatted for the script.

2. Start the script using the methods described above (either double-clicking the executable or running `node .`).

3. Regardless of the location of the input (raw) `.csv` file (it does not have to be in the same directory as the script), you will be prompted to enter the path to the input file. On Windows machines, after selecting the file, the shortcut is `Ctrl + Shift + C`.

*Tips: After single-clicking to select the file, on Windows 10, another way to get the path is to go to `Home` (top left) → `Copy path...`. On Windows 11, right-clicking the file will give you the option to `Copy as path` in the context menu.*

4. Simply follow the prompts as the script runs! You might want to see more details below, though.

5. The original raw data `.csv` is not affected (modified) by the script. The script will save the `.csv` outputs in the `outputs/<folder_name>/` folder in the **same directory as the input file**. You will have the option to rename this folder.
   - `FORMATTED_<filename>.csv` is the re-organized data with the genome IDs (E Identifiers) and re-labeled phenology + leaf stage. (***[Jump!](https://github.com/codynhanpham/Ionomics-Raw-Data-Formatter#formatted_filenamecsv)*** for more details)
   - `NO_GENOME_ID_<filename>.csv` will appear if there are samples that do not match any genome ID in the `datasets/translation-table.csv` or known patterns. (***[Jump!](https://github.com/codynhanpham/Ionomics-Raw-Data-Formatter#no_genome_id_filenamecsv)*** for more details)
   - `NO_PHENOLOGY_LEAFSTAGE_<filename>.csv` will appear if there are sample names that could not be parsed into meaningful phenology (timepoints/seasons) or leaf stage using known patterns. (***[Jump!](https://github.com/codynhanpham/Ionomics-Raw-Data-Formatter#no_phenology_leafstage_filenamecsv)*** for more details)

---

# Recommendations

### File Structure

While it does not matter where you store the script folder, it would be nice to have everything in one place and organized especially the raw and formatted datasets. The following is the recommended file structure:
```
━━━ some-parent-folder/
  ├── Ionomics-Raw-Data-Formatter (this script folder)
  └── datasets/
     └── outputs/
        └── raw_data_1/
           └── FORMATTED_raw_data_1.csv
        └── renamed folder/
           ├── FORMATTED_raw_data_2.csv
           └── NO_GENOME_ID_raw_data_2.csv
     ├── raw_data_1.csv
     ├── raw_data_2.csv
     └── ...
  └── some other things related to this...
```
In short, it would be nice to have all raw datasets in the same folder, and the script will keep all the outputs in one place, named after the raw data file.

*Tips: "File names must not have spaces" is a myth (probably, in this case?). You can type whatever folder name you want when prompted. Make yourself comfortable. Hyphens and underscores are simply conventions.*

### Check and Double-check and Triple-check and...

- Machines are powerful, but the script may contain unexpected bugs. Please please please please, double-check the outputs of the script!
- We simply cannot account for all weird cases. This script depends on how the samples were ID-ed, and the ID-ing task was done by humans. Checking the input files for unexpected labels and headers would help out a lot! The script exports all unhandled cases along with the main reformatted file. ***You can even manually fix the sample labels and use those exported files as the input for the script!***

---

# Extra extra Details

If there are any unhandled cases, the script will print out a `WARNING` line in yellow text. Most of the time, the sample which causes the error will be saved into either the `NO_GENOME_ID_<filename>.csv` or the `NO_PHENOLOGY_LEAFSTAGE_<filename>.csv` file(s) and can safely be dealt with manually later on.


### `FORMATTED_<filename>.csv`

- The phenology of the samples is relabeled to numbers from letters: `A → 1`, `B → 2`, and `C → 3`.
- Meanwhile, the leaf stage is changed into lowercase `xyz` from the `YMO` scheme: `Y → x`, `M → y`, and `O → z`. If the original scheme was `XYZ`, it is simply set to lowercase.
- Each phenology—leafstage pair is grouped with one of the many measured elements. Samples with the same genome ID are put on the same row.

***NOTE!! If there are multiple samples of the same genome ID and the same phenology—leafstage, the older entry will be lost due to being overwritten by a later one. Please double-check your datasets.***

### `NO_GENOME_ID_<filename>.csv`
- The `.csv` structure is the same as the input, though with only entries of samples that were not matched to any genome ID. Most likely, these samples are the `STANDARD` and can be safely ignored.
- Bad labeling can also mess with the script. The script splits the sample name by `_` and uses the first 4 character sets to figure out the genome ID from the translation table. For example, `MO_20_03_16` is used to identify the `MO_20_03_16_B_X` sample. If the sample was labeled as `MO_20_03_16B_X`, then no corresponding genome ID can be found.
- The script does handle cases where the sample name and genome ID are in the same cell, separated by a blank space, though!
- However, there are samples without corresponding genome IDs in the translation table.
- If over 5% of the entire dataset could not be matched to genome IDs, the script will ask whether there is a separate column included in the dataset for genome IDs. You can type in the column header if it exists, otherwise, these unmatched samples will be dumped into this `NO_GENOME_ID_<filename>.csv` file.

### `NO_PHENOLOGY_LEAFSTAGE_<filename>.csv`
- The `.csv` structure is the same as the input, though with only entries of samples that were not recognized to have known phenology (`ABC`) or leaf stage (`YMO` or `XYZ`) patterns. Same as above, most likely, these samples are the `STANDARD` and can be safely ignored.
- Again, bad labeling can mess with the script. The script splits (the first word of) the sample name by `_`, and uses the 5th character for the phenology and the last character for the leaf stage. For `NY_20_05_20_B_1_Y`, it is `B` and `Y`. If the sample name was ID-ed as `NY_20_05_20-B_1_Y`, the error occurs.

***Tips(?!):* The number `0` is different from the letter `O`. Perhaps changing the workspace to a monospaced typeface like `Consolas` would help?**

 ---
 
## Issues

If there are any problems with the code or if you have any additional requirements, feel free to call, text, or email me. You can even open a new Issue on GitHub.


