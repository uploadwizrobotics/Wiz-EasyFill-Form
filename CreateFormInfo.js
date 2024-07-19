//----------------------------------------------------------------------------------------------------
/* 
Summary: 
Includes any functions needed to create form information

*/

//----------------------------------------------------------------------------------------------------

import fs from 'fs'

//function to create/validate form information in fill_info.json
function createFormInfo(confirmedHeading){
    let oldInfoD = fs.readFileSync('fill_info.json', "utf8");
    let allValues = Object.values(JSON.parse(oldInfoD));
    return allValues


    //fill json file with confirmed headings if empty
    if(oldInfoD == "{}"){
        let newInfoD = {};

        for(let heading of confirmedHeading){
            newInfoD[heading] = "[Insert]";
        }
        fs.writeFileSync('fill_info.json', JSON.stringify(newInfoD));
        console.log("!!New form info has been created!!")

        return false

    } else if(allValues.includes("[Insert]")){
        console.log("!!Form info is missing information!!")

        return false

    } else {
        console.log("!!Form info has already been created!!")

        return true
    }
}

export default {createFormInfo}
