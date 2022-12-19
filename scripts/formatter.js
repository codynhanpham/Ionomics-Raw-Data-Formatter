import fs from "fs";
import * as InputHandler from "./input-handler.js";
import * as CSVParser from "./csv-parsing.js";
import * as HARDCODED from "./formatter-hardcoded.js";

// check if the input headers are correct, if not, reprompt the user to enter the correct headers
function CheckHeaderInput(header, dataTable, prompt) {
    let headerExists = false;
    for (let i = 0; i < dataTable.length; i++) {
        if (dataTable[i][header] != undefined) {
            headerExists = true;
            break;
        }
    }
    if (!headerExists) {
        console.log(`\nThe input header "${header}" does not seem to exist in the CSV file.`);
        console.log("Please double-check and enter the correct header.");
        header = InputHandler.inputString(prompt);
        header = CheckHeaderInput(header, dataTable, prompt);
    }
    return header;
}

function getSampleColumnHeader(dataTable, expectedColumnHeader) {
    let sampleColumnHeader = "";
    if (!expectedColumnHeader) {
        // there are a few column headers that are likely to be used, so we can check for them automatically first
        let sampleColumnHeaders = ["sample"];

        // try to get rawData[i][sampleColumnHeader[j]] 10 times (rows) to see if it exists, if not, prompt the user to enter the sample column header
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < sampleColumnHeaders.length; j++) {
                if (dataTable[i][sampleColumnHeaders[j]] != undefined) {
                    sampleColumnHeader = sampleColumnHeaders[j];
                    break;
                }
            }
            if (sampleColumnHeader != "") {
                break;
            }
        }
    }
    else {
        // try the same, but with the expectedColumnHeader to check if the expectedColumnHeader is correct
        for (let i = 0; i < 10; i++) {
            if (dataTable[i][expectedColumnHeader] != undefined) {
                sampleColumnHeader = expectedColumnHeader;
                break;
            }
        }
    }

    // if the sampleColumnHeader is still empty, then prompt the user to enter the sample column header
    if (sampleColumnHeader == "") {
        console.log("The sample column header was not found automatically or the input header was incorrect.");
        console.log("Please enter the sample column header manually. It is CASE SENSITIVE.");
        sampleColumnHeader = InputHandler.inputString("Enter the column header for the sample name: ");
        console.log("");
        // feed the sampleColumnHeader back into the function to check if it exists
        sampleColumnHeader = getSampleColumnHeader(dataTable, sampleColumnHeader);
    }

    return sampleColumnHeader;
}

// Basically similar to how we do Ctrl F to find a string pattern in excel.
// This will take in a string or substring, and loop through each line of the CSV file.
// Only look at the keyToSearch column, and if the string or substring is found, return the index of the line.
// Then return the indexes of the lines that contains the string or substring.
function CtrlF(string, keyToSearch, dataTable) {
    let indexes = [];
    for (let i = 0; i < dataTable.length; i++) {
        let entry = dataTable[i];
        // if entry[keyToSearch] contains the string or substring, add the index to the array
        if (entry[keyToSearch].includes(string)) {
            indexes.push(i);
        }
    }
    return indexes;
}

function CollectIDToGenomeID(sampleName, translationTable) {
    // replace"-" with "_" in sampleName
    sampleName = sampleName.replace(/-/g, "_");
    // split the sampleName by " "
    let sampleNameArray = sampleName.split(" ");

    // mostlikely the sampleName only contains one word. If it contains more than one word, then the second word contains the GenomeID.
    if (sampleNameArray.length > 1) {
        let genomeID = sampleNameArray[1];
        return genomeID;
    }

    // if the sampleName only contains one word, then we need to use Ctrl F to find the GenomeID
    // though the sampleName may include additional information. so we have to split the sampleNameArray[0] by "_"
    // The first 4 words (example, MO_20_03_21) should match to something in the translation table.
    let sampleNameArraySplit = sampleNameArray[0].split("_");
    // find the sampleName in the translation table
    let searchString = sampleNameArraySplit[0]+"_"+sampleNameArraySplit[1]+"_"+sampleNameArraySplit[2]+"_"+sampleNameArraySplit[3];
    let indexes = CtrlF(searchString, "COLLECTED_NAME", translationTable);

    // if the sampleName is not found in the translation table, then it is likely that there is a column somewhere in the rawData that contains the GenomeID
    // return NA here and the CollectIDsToGenomeIDs function below will handle it
    if (indexes.length == 0) {
        return "NA";
    }

    // if the sampleName is found in the translation table, then return the GenomeID
    return translationTable[indexes[0]]["MASTERGENOTYPEID"];
}

function CollectIDsToGenomeIDs(rawData, sampleColumnHeader, translationTable) {
    // if the GenomeID is "NA" > 5% of the total entries, then prompt the user to enter the GenomeID column header manually as it could be a problem
    // though, let user have the option to force NA (only use the translation table) if they want to
    let genomeIDColumnHeaderNA = 0;
    let collectIDtoGenomeIDtable = []; // just so we are not directly modifying the rawData yet
    // use translation table to get the GenomeID with CollectIDToGenomeID
    for (let i = 0; i < rawData.length; i++) {
        let entry = rawData[i];
        let collectID = entry[sampleColumnHeader];
        let genomeID = CollectIDToGenomeID(collectID, translationTable);
        if (genomeID == "NA") {
            genomeIDColumnHeaderNA++;
        }
        collectIDtoGenomeIDtable.push({"collectID": collectID, "genomeID": genomeID});
    }

    // if the GenomeID is "NA" > 5% of the total entries, then prompt the user to enter the GenomeID column header manually
    if (genomeIDColumnHeaderNA/rawData.length > 0.05) {
        console.log(`\n${genomeIDColumnHeaderNA}/${rawData.length} (${Math.round(genomeIDColumnHeaderNA/rawData.length*100)}%) of the samples could not be matched to the GenomeID translation table. This could be a problem.`);
        console.log("This often means that there is a column in the raw data which contains the GenomeID.");
        console.log("\nYou may want to enter the GenomeID column header manually. It is CASE SENSITIVE.");
        console.log("Otherwise, you can leave these unmatched samples as NA by leaving the prompt below blank.");
        let genomeIDColumnHeader = InputHandler.inputString("Enter the column header for the GenomeID: ");
        
        // if the user enters a GenomeID column header, then use that to get the GenomeID
        if (genomeIDColumnHeader != "") {
            // double check if the GenomeID column header exists
            genomeIDColumnHeader = CheckHeaderInput(genomeIDColumnHeader, rawData, "Enter the column header for the GenomeID: ");
            console.log("");

            for (let i = 0; i < rawData.length; i++) {
                let entry = rawData[i];
                let genomeID = entry[genomeIDColumnHeader];
                if (genomeID == "") {
                    genomeID = "NA";
                }
                collectIDtoGenomeIDtable[i]["genomeID"] = genomeID;
            }
        }
        else {
            console.log("The unmatched samples will be left as NA.\n");
        }
    }

    // add the GenomeID column to the rawData
    for (let i = 0; i < rawData.length; i++) {
        let entry = rawData[i];
        entry["GenomeID"] = collectIDtoGenomeIDtable[i]["genomeID"];
    }

    return rawData;
}

function FindLastLetterPattern(dataTable) {
    // first, look though the whole dataTable to figure out the last letter pattern (either X,Y,Z or O,M,Y)
    let lastLetterFreq = [];
    for (let i = 0; i < dataTable.length; i++) {
        let entry = dataTable[i]["sample"];
        entry = entry.replace(/-/g, "_").toUpperCase();
        let entryArray = entry.split(" ");
        let entryArraySplit = entryArray[0].split("_");
        let lastLetter = "";
        let j = 0;
        while (lastLetter == "") {
            lastLetter = entryArraySplit[entryArraySplit.length-1-j];
            j++;
        }

        // check if the entryArraySplit contains "STANDARD" or "STANDARDS" or "CONTROL" or "CONTROLS"
        // if it does, then skip this entry
        let skip = false;
        if (entryArraySplit.includes("STANDARD") || entryArraySplit.includes("STANDARDS") || entryArraySplit.includes("CONTROL") || entryArraySplit.includes("CONTROLS")) {
            skip = true;
        }

        // get the Frequency of each last letter
        // update the lastLetterFreq
        // lastLetterFreq { letter: lastLetter, freq: 0 }
        if (!skip) {
            let found = false;
            for (let j = 0; j < lastLetterFreq.length; j++) {
                if (lastLetterFreq[j]["letter"] == lastLetter) {
                    lastLetterFreq[j]["freq"]++;
                    found = true;
                    break;
                }
            }
            if (!found) {
                lastLetterFreq.push({ letter: lastLetter, freq: 1 });
            }
        }
    }

    // sort the lastLetterFreq by freq
    lastLetterFreq.sort(function(a, b) {
        return b.freq - a.freq;
    });
    // console.log(lastLetterFreq);

    // top 3 lastLetterFreq
    let top3 = [];
    for (let i = 0; i < 3; i++) {
        top3.push(lastLetterFreq[i]["letter"]);
    }

    return top3;
}

function FindNthLetterPattern(dataTable, nth_index) {
    let nthLetterFreq = [];
    for (let i = 0; i < dataTable.length; i++) {
        let entry = dataTable[i]["sample"];
        entry = entry.replace(/-/g, "_").toUpperCase();
        let entryArray = entry.split(" ");
        let entryArraySplit = entryArray[0].split("_");
        let nthLetter = entryArraySplit[nth_index];

        // check if the entryArraySplit contains "STANDARD" or "STANDARDS" or "CONTROL" or "CONTROLS"
        // if it does, then skip this entry
        let skip = false;
        if (entryArraySplit.includes("STANDARD") || entryArraySplit.includes("STANDARDS") || entryArraySplit.includes("CONTROL") || entryArraySplit.includes("CONTROLS")) {
            skip = true;
        }

        // get the Frequency of each Nth letter
        if (!skip) {
            let found = false;
            for (let j = 0; j < nthLetterFreq.length; j++) {
                if (nthLetterFreq[j]["letter"] == nthLetter) {
                    nthLetterFreq[j]["freq"]++;
                    found = true;
                    break;
                }
            }
            if (!found) {
                nthLetterFreq.push({ letter: nthLetter, freq: 1 });
            }
        }
    }

    // sort the lastLetterFreq by freq
    nthLetterFreq.sort(function(a, b) {
        return b.freq - a.freq;
    });
    // console.log(nthLetterFreq);

    // top 3 lastLetterFreq
    let top3 = [];
    for (let i = 0; i < 3; i++) {
        top3.push(nthLetterFreq[i]["letter"]);
    }

    return top3;
}

function LogError(error) {
    console.log(error);

    // maybe log to a txt file

    return;
}


// Y young, M middle, O old
// This will convert something like "MO_20_03_21_B_Y" to 2z, or "SD_20_08_01_B_O" to 2x, or "NY_20_03_79_C_1_Y" to 3z
// The last letter is either X,Y,Z or O,M,Y, so maybe look into the pattern of the dataset to figure out how to convert it.
function CollectIDToTimeandPosWithPattern(sampleName, { leafStagePattern, timeLetterPattern }) {
    // because some entries use lowercase, so we need to convert everything to uppercase
    let old_samplenName = sampleName;
    sampleName = sampleName.toUpperCase();
    // replace"-" with "_" in sampleName
    sampleName = sampleName.replace(/-/g, "_");
    // split the sampleName by " "
    let sampleNameArray = sampleName.split(" ");

    // We only care about the sampleNameArray[0] this time
    let sampleNameArraySplit = sampleNameArray[0].split("_");
    let timeLetterRaw = sampleNameArraySplit[4];
    // get the last letter
    let leafStageRaw = "";
    let j = 0;
    while (leafStageRaw == "") {
        leafStageRaw = sampleNameArraySplit[sampleNameArraySplit.length-1-j];
        j++;
    }
    // console.log(`Time point: ${timeLetterRaw}, Leaf stage: ${leafStageRaw}`);

    // Convert the timeLetterRaw to timeLetter: A -> 1, B -> 2, C -> 3...
    let timeLetter = "";
    timeLetterPattern.sort(); // only works because the timeLetterPattern is in alphabetical order
    if (!timeLetterPattern.includes(timeLetterRaw)) {
        LogError(`WARNING: Entry ${old_samplenName} is not in the recognized TimePoint/Season pattern. Defaulting to NA.`);
        timeLetter = "NA";
    }
    else {
        timeLetter = timeLetterPattern.indexOf(timeLetterRaw)+1;
    }

    // Convert the leafStageRaw to leafStage: Y -> z, M -> y, O -> x,...
    let leafStage = "";
    if ((leafStagePattern).toString() === (["X", "Y", "Z"]).toString()) {
        if (leafStagePattern.includes(leafStageRaw.toUpperCase())) {
            leafStage = leafStageRaw.toLowerCase();
        }
        else {
            LogError(`WARNING: Entry ${old_samplenName} is not in the recognized LeafStage pattern. Defaulting to NA.`);
            leafStage = "NA";
        }
    }
    else if ((leafStagePattern).toString() === (["M", "O", "Y"]).toString()) {
        if (leafStageRaw == "M") {
            leafStage = "y";
        }
        else if (leafStageRaw == "O") {
            leafStage = "z";
        }
        else if (leafStageRaw == "Y") {
            leafStage = "x";
        }
        else {
            LogError(`WARNING: Entry ${old_samplenName} is not in the recognized LeafStage pattern. Defaulting to NA.`);
            leafStage = "NA";
        }
    }
    else {
        LogError(`WARNING: Entry ${old_samplenName} is not in the recognized LeafStage pattern. Defaulting to NA.`);
        leafStage = "NA";
    }

    // return the timeLetter and leafStage
    let combined = timeLetter + leafStage;
    return {
        timeLetter: timeLetter,
        leafStage: leafStage,
        combined: combined
    };
    
}



// MAIN FUNCTION
function UpdateRawDataWithGenomeIDandTimepointAndLeafStage(rawData, originalData, translationTable, hardcoded) {
    // first, translate the CollectID to GenomeID
    const sampleColumnHeader = getSampleColumnHeader(rawData); // see function getSampleColumnHeader
    rawData = CollectIDsToGenomeIDs(rawData, sampleColumnHeader, translationTable);

    let errorCSV = ""; // return the original rawData if there is an error getting the time and stage
    // add headers of originalData to errorCSV
    let headers = Object.keys(originalData[0]);
    // add header
    for (let i = 0; i < headers.length; i++) {
        // ignore the ID
        if (headers[i] != "ID") {
            errorCSV += `${headers[i]},`;
        }
    }
    errorCSV += "\n";
    let errorCounter = 0;
    let isError = false;

    if (hardcoded) {
        // loop through the rawData
        for (let i = 0; i < rawData.length; i++) {
            let Time_and_Stage = HARDCODED.CollectIDToTimeandPosHardcoded(rawData[i][sampleColumnHeader], rawData[i]["ID"], originalData); // rawData is needed to make a csv of unhandled cases
            rawData[i]["Time_and_Stage"] = Time_and_Stage.combined;
            rawData[i]["Time"] = Time_and_Stage.timeLetter;
            rawData[i]["Stage"] = Time_and_Stage.leafStage;
            errorCSV += Time_and_Stage.errorCSV;

            if (Time_and_Stage.errorCSV) {
                errorCounter++;
            }
            
        }

        if (errorCounter > 0) {
            console.log('\x1b[33m%s\x1b[0m', `\nWARNING: ${errorCounter} samples were not matched to Time/Season and/or LeafStage.`);
            isError = true;
        }

        return {
            data: rawData,
            sampleColumnHeader: sampleColumnHeader,
            error: isError,
            errorCSV: errorCSV
        };
    }
    // // CollectIDToTimeandPosWithPattern() is to be done in the future... Maybe...
    // else {
    //     const leafStagePattern = FindLastLetterPattern(rawData).sort();
    //     const timeLetterPattern = FindNthLetterPattern(rawData, 4).sort();
    //     // loop through the rawData
    //     for (let i = 0; i < rawData.length; i++) {
    //         let Time_and_Stage = CollectIDToTimeandPosWithPattern(rawData[i][sampleColumnHeader], { leafStagePattern, timeLetterPattern });
    //         rawData[i]["Time_and_Stage"] = Time_and_Stage.combined;
    //         rawData[i]["Time"] = Time_and_Stage.timeLetter;
    //         rawData[i]["Stage"] = Time_and_Stage.leafStage;
    //     }
    //     return {
    //         data: rawData,
    //         sampleColumnHeader: sampleColumnHeader
    //     };
    // }
}


export { CtrlF, UpdateRawDataWithGenomeIDandTimepointAndLeafStage }