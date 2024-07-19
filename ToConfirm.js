//----------------------------------------------------------------------------------------------------
/* 
Summary: 
Includes any functions needed to verify things (i.e. headings)

*/

//----------------------------------------------------------------------------------------------------

import LlamaAI from 'llamaai';

//token line
const llamaToken = "LL-jx853TmvX8qt8GBhyid12wnhw0f2M5NR43mQ3cw8f0NglXYCoNP8jBJ7KMxhs8Ay";
const llamaAPI = new LlamaAI(llamaToken);

async function confirmedHeading(notVerifiedHeading){
    //llamaAI PORTION
    //set llama request test
    const apiReqJson = {
        "messages": [
            {"role": "assistant", "content": "Which of these headings are most likely to appear in a form given these options: " + notVerifiedHeading},
        ],
        "stream": false,
        "function_call": "run_request",
    };

    let msg = '';

    //run llama request (around $0.000467 per request)
    await llamaAPI.run(apiReqJson).then(response => {
        console.log(response.choices[0].message.content);
        msg = response.choices[0].message.content;
    }).catch(error => {
        console.log(error);
    });


    //find all string with this pattern (asterisk at the beginning followed by anything): *any text
    let testreg = /(\*.+)/g;
    let result2 = msg.match(testreg);

    let confirmedHeading = [];
    for(let i in result2){
        result2[i].replace(/(\*.)/g, "");
        confirmedHeading.push(result2[i].replace(/\*./g, ""))
    }

    return confirmedHeading
}

export default {confirmedHeading}


