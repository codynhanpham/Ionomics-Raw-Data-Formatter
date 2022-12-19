import fs from "fs";

let errorIDs = []; // save the IDs of the entries that have errors, each ID will only be logged once

// Log Error and make a csv file
function ErrorHandler(error, sampleID, originalDataWithID) {
    // console.log(error);

    let errorCSV = "";
    // add the entry
    for (let i = 0; i < originalDataWithID.length; i++) {
        if (originalDataWithID[i].ID == sampleID && !errorIDs.includes(sampleID)) {
            let headers = Object.keys(originalDataWithID[i]);
            for (let j = 0; j < headers.length; j++) {
                // ignore the ID
                if (headers[j] != "ID") {
                    errorCSV += `${originalDataWithID[i][headers[j]]},`;
                }
            }
            errorCSV += "\n";
            break;
        }
    }
    return errorCSV;
}


// Basically similar to the CollectIDToTimeandPosWithPattern in ./formatter.js, but this one is hardcoded for each dataset: NY, SD, MO
// NY, SD, MO, CO all label the time points as A,B or C
// NY labels the leaf stage as M,O,Y
// SD labels the leaf stage as M,O,Y
// MO labels the leaf stage as X,Y,Z
// CO labels the leaf stage as X,Y,Z
function CollectIDToTimeandPosHardcoded(sampleName, sampleID, originalDataWithID) {
    let errorCSV = ""; // if there is an error, this will be the csv of the entry
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

    // sampleNameArraySplit[0] is either NY, SD, MO, or CO
    let timeLetter = "";
    let leafStage = "";
    if (sampleNameArraySplit[0].includes("NY")) {
        if (timeLetterRaw == "A") {
            timeLetter = 1;
        }
        else if (timeLetterRaw == "B") {
            timeLetter = 2;
        }
        else if (timeLetterRaw == "C") {
            timeLetter = 3;
        }
        else {
            errorCSV = ErrorHandler(`WARNING: Entry ${old_samplenName} is not in the recognized TimePoint/Season pattern. Defaulting to NA.`, sampleID, originalDataWithID);
            timeLetter = "NA";
        }

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
            errorCSV = ErrorHandler(`WARNING: Entry ${old_samplenName} is not in the recognized LeafStage pattern. Defaulting to NA.`, sampleID, originalDataWithID);
            leafStage = "NA";
        }
    }
    else if (sampleNameArraySplit[0].includes("SD")) {
        if (timeLetterRaw == "A") {
            timeLetter = 1;
        }
        else if (timeLetterRaw == "B") {
            timeLetter = 2;
        }
        else if (timeLetterRaw == "C") {
            timeLetter = 3;
        }
        else {
            errorCSV = ErrorHandler(`WARNING: Entry ${old_samplenName} is not in the recognized TimePoint/Season pattern. Defaulting to NA.`, sampleID, originalDataWithID);
            timeLetter = "NA";
        }

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
            errorCSV = ErrorHandler(`WARNING: Entry ${old_samplenName} is not in the recognized LeafStage pattern. Defaulting to NA.`, sampleID, originalDataWithID);
            leafStage = "NA";
        }
    }
    else if (sampleNameArraySplit[0].includes("MO")) {
        if (timeLetterRaw == "A") {
            timeLetter = 1;
        }
        else if (timeLetterRaw == "B") {
            timeLetter = 2;
        }
        else if (timeLetterRaw == "C") {
            timeLetter = 3;
        }
        else {
            errorCSV = ErrorHandler(`WARNING: Entry ${old_samplenName} is not in the recognized TimePoint/Season pattern. Defaulting to NA.`, sampleID, originalDataWithID);
            timeLetter = "NA";
        }

        if (leafStageRaw == "X") {
            leafStage = "x";
        }
        else if (leafStageRaw == "Y") {
            leafStage = "y";
        }
        else if (leafStageRaw == "Z") {
            leafStage = "z";
        }
        else {
            errorCSV = ErrorHandler(`WARNING: Entry ${old_samplenName} is not in the recognized LeafStage pattern. Defaulting to NA.`, sampleID, originalDataWithID);
            leafStage = "NA";
        }
    }
    else if (sampleNameArraySplit[0].includes("CO")) {
        if (timeLetterRaw == "A") {
            timeLetter = 1;
        }
        else if (timeLetterRaw == "B") {
            timeLetter = 2;
        }
        else if (timeLetterRaw == "C") {
            timeLetter = 3;
        }
        else {
            errorCSV = ErrorHandler(`WARNING: Entry ${old_samplenName} is not in the recognized TimePoint/Season pattern. Defaulting to NA.`, sampleID, originalDataWithID);
            timeLetter = "NA";
        }

        if (leafStageRaw == "X") {
            leafStage = "x";
        }
        else if (leafStageRaw == "Y") {
            leafStage = "y";
        }
        else if (leafStageRaw == "Z") {
            leafStage = "z";
        }
        else {
            errorCSV = ErrorHandler(`WARNING: Entry ${old_samplenName} is not in the recognized LeafStage pattern. Defaulting to NA.`, sampleID, originalDataWithID);
            leafStage = "NA";
        }
    }


    else {
        errorCSV = ErrorHandler(`WARNING: Entry ${old_samplenName} is not in the recognized TimePoint/Season pattern. Defaulting to NA.`, sampleID, originalDataWithID);
        timeLetter = "NA";
        errorCSV = ErrorHandler(`WARNING: Entry ${old_samplenName} is not in the recognized LeafStage pattern. Defaulting to NA.`, sampleID, originalDataWithID);
        leafStage = "NA";
    }

    // return the timeLetter and leafStage
    let combined = timeLetter + leafStage;
    return {
        timeLetter: timeLetter,
        leafStage: leafStage,
        combined: combined,
        errorCSV: errorCSV
    };
}

export { CollectIDToTimeandPosHardcoded };