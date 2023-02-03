import * as KNOWNSTUFF from "../datasets/elements.js";
// input a data object and a key, treat the value of the key as string and sort by it
function SortByValueOfKey(data, key) {
    return data.sort((a, b) => {
        let aKey = a[key];
        let bKey = b[key];
        if (aKey < bKey) {
            return -1;
        } else if (aKey > bKey) {
            return 1;
        } else {
            return 0;
        }
    });
}

function sortCSVbyColumn(parsedCSV, columnHeader) { // returns a sorted csv string
    let sortedCSV = parsedCSV.sort((a, b) => {
        let aKey = a[columnHeader];
        let bKey = b[columnHeader];
        if (aKey < bKey) {
            return -1;
        } else if (aKey > bKey) {
            return 1;
        } else {
            return 0;
        }
    });

    // convert back to csv string
    let csvString = "";
    // headers
    let headers = Object.keys(sortedCSV[0]);
    csvString += headers.join(",") + "\n";
    
    for (let i = 0; i < sortedCSV.length; i++) {
        let entry = sortedCSV[i];
        for (let key in entry) {
            csvString += `${entry[key]},`;
        }
        csvString = csvString.slice(0, csvString.length - 1);
        csvString += "\n";
    }

    return csvString;
}

// ID to keep track of the samples, since the sample name alone is not unique
function AddIDtoOriginalData(originalData) {
    // simply add a new ID key to the originalData
    for (let i = 0; i < originalData.length; i++) {
        originalData[i]["ID"] = i;
    }

    return originalData;
}

function hasOwnPropertyCaseInsensitive(obj, property) {
    var props = [];
    for (var i in obj) if (obj.hasOwnProperty(i)) props.push(i);
    var prop;
    while (prop = props.pop()) if (prop.toLowerCase() === property.toLowerCase()) return true;
    return false;
}

// Make new Array with new Objects {
//  "sample": "originalSampleName",
//  "GenomeID": "genomeID",
//  `${}element`: `${}element`,
// }
function ConvertAll(data, sampleColumnHeader) {
    let arrangedData = [];
    // loop through all all entries in data

    for (let i = 0; i < data.length; i++) {
        // make new object
        let arrangedEntry = {};
        // add sample name
        arrangedEntry["sample"] = data[i][sampleColumnHeader];
        arrangedEntry["GenomeID"] = data[i]["GenomeID"];
        arrangedEntry["ID"] = data[i]["ID"];
        if (hasOwnPropertyCaseInsensitive(data[0], "location.x")) {
            arrangedEntry["Location"] = data[i]["Location.x"] || data[i]["location.x"];
        }
        else {
            arrangedEntry["Location"] = "_";
        }
        // new elements key
        arrangedEntry["elements"] = {};
        // add all elements into arrangedEntry["elements"]
        for (let j = 0; j < KNOWNSTUFF.Elements.length; j++) {
            arrangedEntry["elements"][`${data[i]["Time_and_Stage"]}${KNOWNSTUFF.Elements[j]}`] = data[i][`${KNOWNSTUFF.Elements[j]}`];
        }
        
        arrangedEntry["Time"] = data[i]["Time"];
        arrangedEntry["Stage"] = data[i]["Stage"];
        arrangedEntry["Time_and_Stage"] = data[i]["Time_and_Stage"];
        // push new object to arrangedData
        arrangedData.push(arrangedEntry);
    }

    // sort by sample name
    arrangedData = SortByValueOfKey(arrangedData, "sample");
    return arrangedData;
}


// Key of data is the input key
// Value of data is an array of all entries with the same GenomeID
function GroupByKey(data, key) {
    let groupedData = {};
    // loop through all entries in data
    for (let i = 0; i < data.length; i++) {
        // if the key is not in the groupedData object, add it
        if (!groupedData.hasOwnProperty(data[i][key])) {
            groupedData[data[i][key]] = [];
        }
        // push the entry to the key array
        groupedData[data[i][key]].push(data[i]);
    }
    return groupedData;
}


// generate all posible elements headers by combining the KNOWNSTUFF.PossibleTimeAndStage and the KNOWSTUFF.Elements
function GenerateAllPossibleTimeStageElementsCombinations() {
    let allPossibleElements = [];
    for (let i = 0; i < KNOWNSTUFF.PossibleTimeAndStage.length; i++) {
        for (let j = 0; j < KNOWNSTUFF.Elements.length; j++) {
            allPossibleElements.push(`${KNOWNSTUFF.PossibleTimeAndStage[i]}${KNOWNSTUFF.Elements[j]}`);
        }
    }
    return allPossibleElements;
}

const allPossibleTimeStageElementsCombinations = GenerateAllPossibleTimeStageElementsCombinations();



// generate a csv file from the GroupedData
// first row is the header, the rest are the data
// first column is the GenomeID
// the rest of the columns are all the possible elements combinations
// ignore GenomeID if it is "NA"
// if the GenomeID group does not have a value for a specific element, put "NA" in the cell
function GenerateCSVFromData(GroupedData, rawDataWithID) {
    // must run AddIDtoOriginalData() first in the main script
    let csvData = "";
    let noGenomeIDDataCSV = {}; // for the data with GenomeID "NA"
    // add header
    csvData += "GenomeID,";
    csvData += "Location,";

    for (let i = 0; i < allPossibleTimeStageElementsCombinations.length; i++) {
        csvData += `${allPossibleTimeStageElementsCombinations[i]},`;
    }
    csvData += "\n";

    // add data
    // Loop through each Location
    for (let location in GroupedData) {

        for (let key in GroupedData[location]) {
            // ignore GenomeID if it is "NA"
            if (key != "NA") {
                // add GenomeID
                csvData += `${key},`;
    
                csvData += `${location},`;
    
                // add all the elements
                for (let i = 0; i < allPossibleTimeStageElementsCombinations.length; i++) {
                    // also loop through all the entries in each GenomeID group
                    let found = false;
                    for (let j = 0; j < GroupedData[location][key].length; j++) {
                        // if the entry has the element, add it to the csv
                        if (GroupedData[location][key][j].elements.hasOwnProperty(allPossibleTimeStageElementsCombinations[i])) {
                            csvData += `${GroupedData[location][key][j].elements[allPossibleTimeStageElementsCombinations[i]]},`;
                            found = true;
                            break;
                        }
                    }
                    // if the entry does not have the element, add "NA" to the csv
                    if (!found) {
                        csvData += "NA,";
                    }
                }
                csvData += "\n";
            }
            else {
                console.log('\x1b[33m%s\x1b[0m', `\nWARNING: ${GroupedData[location][key].length} ${location} samples were not matched to GenomeIDs.`);
                // return the data as in the original file
    
                const NAsampleIDs = [];
                for (let i = 0; i < GroupedData[location][key].length; i++) {
                    NAsampleIDs.push(GroupedData[location][key][i].ID);
                }
                
                noGenomeIDDataCSV[location] = GenerateCSVofNA(NAsampleIDs, rawDataWithID);
                
            }
        }
    }

    // pool all noGenomeIDDataCSV[location] into one csv string
    // since the first row (header) is the same for all, only need to add the first row once
    let noGenomeIDDataCSVString = "";
    let firstRow = true;
    for (let location in noGenomeIDDataCSV) {
        if (firstRow) {
            noGenomeIDDataCSVString += noGenomeIDDataCSV[location];
            firstRow = false;
        }
        else {
            // remove the first row (header)
            let rows = noGenomeIDDataCSV[location].split("\n");
            rows.shift();
            noGenomeIDDataCSVString += rows.join("\n");
        }
    }

    return {
        formattedData: csvData,
        noGenomeIDData: noGenomeIDDataCSVString
    };
}

function GenerateCSVofNA(sampleIDs, rawDataWithID) {
    let csvData = "";
    // get all headers (keys) from the first entry in rawDataWithID
    let headers = Object.keys(rawDataWithID[0]);
    // add header
    for (let i = 0; i < headers.length; i++) {
        // ignore the ID
        if (headers[i] != "ID") {
            csvData += `${headers[i]},`;
        }
    }
    csvData += "\n";

    // add data: find all entries in rawDataWithID that have the same sample ID as in the sampleIDs array (ID to account for identical sample names)
    for (let i = 0; i < rawDataWithID.length; i++) {
        for (let j = 0; j < sampleIDs.length; j++) {
            if (rawDataWithID[i].ID == sampleIDs[j]) {
                // add all the data, ignore the ID, though
                for (let k = 0; k < headers.length; k++) {
                    if (headers[k] != "ID") {
                        csvData += `${rawDataWithID[i][headers[k]]},`;
                    }
                }

                csvData += "\n";
            }
        }
    }

    return csvData;
}



export { AddIDtoOriginalData, SortByValueOfKey, sortCSVbyColumn, ConvertAll, GroupByKey, GenerateCSVFromData };