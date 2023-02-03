import * as InputHandler from "./scripts/input-handler.js";
import * as CSVParser from "./scripts/csv-parsing.js";
import * as Formatter from "./scripts/formatter.js";
import * as SortAndArrange from "./scripts/sort-and-arrange.js";
import fs from "fs";

console.clear();

console.log("The source code and compiled executable of this script is available at https://github.com/codynhanpham/Ionomics-Raw-Data-Formatter\n\n");

const translationTable = CSVParser.parseCSV("./datasets/translation-table.csv");

let csvLocation = InputHandler.inputString("Enter the path to the CSV file: ");
console.log("\n");
// trim " from the string
csvLocation = csvLocation.replace(/"/g, "");
let rawData = CSVParser.parseCSV(csvLocation);
rawData = SortAndArrange.AddIDtoOriginalData(rawData);
let originalData = JSON.parse(JSON.stringify(rawData)); // though this is wasteful, it helps creating csv of unhandled cases for subsequent manual fixes
rawData = CSVParser.removeKeys(rawData, ["plate","numinSet","Run","fullnum","ICP.run","WR.run","WR.plate","ICP.plate","ICP.runnum","run.date"]);

rawData = Formatter.UpdateRawDataWithGenomeIDandTimepointAndLeafStage(rawData, originalData, translationTable, true);

const convertedData = SortAndArrange.ConvertAll(rawData.data, rawData.sampleColumnHeader);

const sortedData = SortAndArrange.SortByValueOfKey(convertedData, "Time_and_Stage");

const groupedDataLocation = SortAndArrange.GroupByKey(sortedData, "Location");

// for each location, group by GenomeID
const groupedDataLocAndGenomeID = {};
for (let location in groupedDataLocation) {
    groupedDataLocAndGenomeID[location] = SortAndArrange.GroupByKey(groupedDataLocation[location], "GenomeID");
}

/*
    So, the data here is something like this:
    {
        "MO": {
            "GenomeID1": [
                {
                    "sample": "sampleName",
                    "ID": 0,
                    "elements": [Object],
                    "Time_and_Stage": "Timepoint_Stage"
                    ...
                },
                ...
            ],
            "GenomeID2": [
                ...
            ],
            ...
        },
        "CO": {
            ...
        },
    }
*/

const sortObject = obj => Object.keys(obj).sort().reduce((res, key) => (res[key] = obj[key], res), {});
const sortedGroup = sortObject(groupedDataLocAndGenomeID);

const csv = SortAndArrange.GenerateCSVFromData(sortedGroup, originalData, rawData.sampleColumnHeader);

// split csvLocation by \ to get the file name and the parent directory
const csvSplit = csvLocation.split("\\");
// get the directory name
let csvDirectory = csvSplit.slice(0, csvSplit.length - 1).join("\\");
// get the file name
const csvName = csvSplit[csvSplit.length - 1].split(".")[0];


let outputCounter = 1;
// Let user rename the file
console.log("\n\nOutput(s):")
console.log(`  [${outputCounter}] Successfully formatted data will be saved to\t${csvDirectory}\\outputs\\${csvName}\\FORMATTED_${csvName}.csv`);
outputCounter++;
if (csv.noGenomeIDData != "") {
    console.log(`  [${outputCounter}] Samples without Genome ID will be saved to\t${csvDirectory}\\outputs\\${csvName}\\NO_GENOME_ID_${csvName}.csv`);
    outputCounter++;
}
if (rawData.error) {
    console.log(`  [${outputCounter}] Samples with Time/Stage error will be saved to\t${csvDirectory}\\outputs\\${csvName}\\NO_PHENOLOGY_LEAFSTAGE_${csvName}.csv`);
}
console.log("\n\n\t\tTHIS WILL OVERWRITE ANY EXISTING FILES IN THE FOLDER OF THE SAME NAME!!!\n");
console.log(`Rename the output folder? (${csvDirectory}\\outputs\\<NEW_NAME>\\files_${csvName}.csv)`)
const renameFolder = InputHandler.inputString(`Enter new folder name (Leave empty to keep <${csvName}>): `);

// create the outputs directory if it doesn't exist
if (!fs.existsSync(csvDirectory + "\\outputs")) {
    fs.mkdirSync(csvDirectory + "\\outputs");
}

if (renameFolder != "") {
    csvDirectory = csvDirectory + "\\outputs\\" + renameFolder;
}
else {
    csvDirectory = csvDirectory + "\\outputs\\" + csvName;
}

// create the directory if it doesn't exist
if (!fs.existsSync(csvDirectory)) {
    fs.mkdirSync(csvDirectory);
}

// write the formatted data to the csv
fs.writeFileSync(`${csvDirectory}\\FORMATTED_${csvName}.csv`, csv.formattedData, "utf8");
// load the saved data again to sort it by GenomeID, very inefficient but it works for now
let sortedCSV = CSVParser.parseCSV(`${csvDirectory}\\FORMATTED_${csvName}.csv`);
sortedCSV = SortAndArrange.sortCSVbyColumn(sortedCSV, "GenomeID");
fs.writeFileSync(`${csvDirectory}\\FORMATTED_${csvName}.csv`, sortedCSV, "utf8");

if (csv.noGenomeIDData != "") {

    fs.writeFileSync(`${csvDirectory}\\NO_GENOME_ID_${csvName}.csv`, csv.noGenomeIDData, "utf8");
}
if (rawData.error) {
    fs.writeFileSync(`${csvDirectory}\\NO_PHENOLOGY_LEAFSTAGE_${csvName}.csv`, rawData.errorCSV, "utf8");
}



console.log("\n");
console.log(`Done! Output saved to ${csvDirectory}\n`);


const end = InputHandler.inputString("(Press enter to exit)\n"); // keep the console open