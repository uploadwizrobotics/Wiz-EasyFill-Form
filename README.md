# Form Extractor
***
***
## ⓘ About
The Form Extractor helps users auto-fill frequently used forms.

&nbsp;

## 🛠 Tools
- An IDE (perferably VS Code)
- LlamaAI token

&nbsp;

## 🠋 Installation and Setup
### Node.js
Install Node.js using the following link:
```bash
https://nodejs.org/en/download/package-manager
```
&nbsp;
Check the Node.js version by typing this command in the terminal.
```bash
node -v
```

&nbsp;

### Puppeteer
Type the following in the terminal.
```bash
npm install puppeteer
```

&nbsp;

### LlamaAI Token
Create a LlamaAI account using the following link:
```bash
https://console.llama-api.com/account/my-account
```
&nbsp;
Copy your API token from their website. Paste the token inbetween the quotation marks on this line shown below in the `ToConfirm.js` file.
```js
//token line
const llamaToken = "LL-jx853TmvX8qt8GBhyid12wnhw0f2M5NR43mQ3cw8f0NglXYCoKMxhs8Ay";
```
Keep in mind there is a **limited amount of times you can use this token for free** which can be found in the **Usage section on the LlamaAI website**.

&nbsp;

## ↻ Usage
Start by running the code by typing this command in the terminal.
```bash
node index
```
&nbsp;
The `fill_info.json` file should populate with the questions on the form. An example is shown below.
```bash
{"Enter your name":"[Insert]","Email Address":"[Insert]","Birthday":"[Insert]","Occupation":"[Insert]"}
```
&nbsp;
Replace the areas marked with **[Insert]** with the information you want to be filled in the form. An example is shown below with formats for the different types of inputs.
```bash
{"Enter your name":"John Doe","Email Address":"JohnDoe@email.com","Birthday":"2000-01-01","Occupation":"1,0,1"}
```
- Text inputs can be filled out as normal
- Date inputs must follow this format: **YYYY-MM-DD**
- Checkbox inputs must be represented by **1's (checked) and 0's (unchecked)** to determine which boxes on the form you want checked/unchecked
&nbsp;

Fill the form with the information by typing this command in the terminal again.
```bash
node index
```
Any additional error/success messages will be outputted in the terminal window.

&nbsp;

## ✎ Development
### CreateFormInfo.js
***
#### createFormInfo(confirmedHeading)
This script is used to fill in the ``fill_info.json`` file. Here is a breakdown of what the code does:


Reads the ``fill_info.json`` file and converts everything inside into an array.
```bash
let oldInfoD = fs.readFileSync('fill_info.json', "utf8");
let allValues = Object.values(JSON.parse(oldInfoD));
```
&nbsp;
If ``fill_info.json`` is:
- Blank - the script will populate ``fill_info.json`` with the confirmed questions and return false, meaning nothing will be filled in the form. Please see the example under the Usage section.
- Filled with the confirmed questions but the answers to the questions are **[Insert]** - return false, meaning nothing will be filled in the form.
- Filled with the confirmed questions with answers to the questions - return true, meaning the information will be filled in the form.
```bash
if(oldInfoD == "{}"){
        let newInfoD = {};

        for(let heading of confirmedHeading){
            newInfoD[heading] = "[Insert]";
        }
        fs.writeFileSync('fill_info.json', JSON.stringify(newInfoD));
        console.log("!!New form info has been created!!"
        return false

    } else if(allValues.includes("[Insert]")){
        console.log("!!Form info is missing information!!")
        return false

    } else {
        console.log("!!Form info has already been created!!")
        return true
```

&nbsp;

### ToConfirm.js
***
#### confirmedHeading(notVerifiedHeading)
Create a new llamaAI using your token.
```bash
import LlamaAI from 'llamaai';

const llamaToken = "LL-jx853TmvX8qt8GBhyid12wnhw0f2M5NR43mQ3cw8f0NglXYC8jBJ7KMxhs8Ay";
const llamaAPI = new LlamaAI(llamaToken);
```
&nbsp;
Ask llamaAI which of the unverified headings are most likely to appear in a form. The unverified headings are passed in from ``index.js``. Save llamaAI's answer in the **msg** variable.
```bash
 const apiReqJson = {
        "messages": [
            {"role": "assistant", "content": "Which of these headings are most likely to appear in a form given these options: " + notVerifiedHeading},
        ],
        "stream": false,
        "function_call": "run_request",
    };

    let msg = '';

    await llamaAPI.run(apiReqJson).then(response => {
        msg = response.choices[0].message.content;
    }).catch(error => {
        console.log(error);
    });

```
&nbsp;
LlamaAI's answer usually follows this format:
>Based on the options provided, the most likely headings to appear in a form are:
*Enter your name
*Email Address
*Birthday
*Occupation
These headings are common and relevant to personal information, which is typically collected in a form.

The confirmed headings are followed by an asterisk.

Filter out llamaAI's answer for everything that starts with an asterisk in a variable. Then, delete the asterisks and save the headings into an array. Return this array, which consists of the confirmed headings.
```bash
let testreg = /(\*.+)/g;
let result2 = msg.match(testreg);

let confirmedHeading = [];
for(let i in result2){
    result2[i].replace(/(\*.)/g, "");
    confirmedHeading.push(result2[i].replace(/\*./g, ""))
}

return confirmedHeading
```
&nbsp;

### index.js
***
Import all the required files and libraries. Puppeteer is used to scrape and interact with the web. fs is used to read files. The remaining imports are other scripts that will be used.
```bash
import puppeteer from 'puppeteer';
import fs from 'fs'

import ToConfirm from './ToConfirm.js';
import CreateFormInfo from './CreateFormInfo.js';
```
&nbsp;
#### scrape()
This function will:
- Scrape the form for all headings, regardless of if it's part of the questions.
- Fill out the form using the information from ``fill_info.json``.
- Take a screenshot of the form just before submitting it.

Launches the form and removes all of the placeholder text.
```bash
async function scrape(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    
    let textInput = await page.$$('input[type="text"]');
    for(const element of textInput){
        await element.type(" ", {delay: 700});
    }
```
&nbsp;
Get all headings on the form, regardless of if it's part of the questions.
```bash
     const notVerifiedHeading = await page.evaluate(() => {
        const elements = document.querySelectorAll('[role="heading"]');
        return Array.from(elements).map(element => element.innerHTML);
    });
```
&nbsp;
 These headings will be verified using the ``confirmedHeading`` function in the ``ToConfirm.js`` file.
```bash
 let confirmedHeading = await ToConfirm.confirmedHeading(notVerifiedHeading);
```
&nbsp;
 The form information will then be created using the ``createFormInfo`` function in the ``CreateFormInfo.js`` file. This function will also determine whether the information in ``fill_info.json`` is allowed to be filled into the form.
```bash
let fillForm = CreateFormInfo.createFormInfo(confirmedHeading);
```
&nbsp;
Read the ``fill_info.json`` file in case it was updated by the user.
```bash
let jsonData = fs.readFileSync('fill_info.json', "utf8");
```
&nbsp;
This if statement will run if the information on the ``fill_info.json`` has no errors. The following code in the if statement will be used to fill the form information.
```bash
if(fillForm){
        const fillFormFunc = await page.evaluate((confirmedHeading, jsonData) => {
            jsonData = JSON.parse(jsonData);

            const elements = document.querySelectorAll('[role="heading"]');
            const convertEle = Array.from(elements).map(element => element.innerText);
            for(let i = 0; i < elements.length; i++){
                elementHeading = elements[i];

                function findInput(testElement){
                    let testParent = testElement.parentElement;
                    let testChildren = testElement.children;
                    if(testParent.querySelector('input')){

                        let anyCheckbox = testParent.querySelectorAll('[role="checkbox"]');
                        if(anyCheckbox.length != 0){
                            return ["cb", anyCheckbox]
                        }

                        let anyInput = testParent.querySelectorAll('input');                    
                        return anyInput
                    }
                    return findInput(testParent)
                }

                for(let key in jsonData){
                    if(key == convertEle[i]){
                        let testEle = findInput(elementHeading);

                        if(testEle[0]=="cb"){
                            let checkboxArr = jsonData[key].split(",");
                            testEle.shift();

                            testEle[0].forEach((element, index) => {
                                if(checkboxArr[index] == "1"){
                                    element.click();
                                } 
                            })
                        }

                        for(const element of testEle){
                            let elementType = element.type;
                    
                            if(elementType == 'date' && !jsonData[key].match(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/g)){
                                return "!!Date format is incorrect in fill_info.json!!"
                            } else if (key.toLowerCase().indexOf("email") && jsonData[key].match(/\S+@\S+\.\S+/g)){
                                return "!!Email format is incorrect in fill_info.json!!"
                            } else {
                                element.value = jsonData[key];
                            }
                        }
                    }
                }    

            }
            return "--- Finished filling out the form ---"      
            
        }, confirmedHeading, jsonData);

        console.log(fillFormFunc)
    }
    
    console.log("=== Code has ended ===")
```


&nbsp;
Take a screenshot of the form and save it as ``indexSS.png``. Submit the form and close the browser afterwards.
```bash
    await page.screenshot({path: 'indexSS.png', fullPage: true});

    const submitButton = await page.evaluate(() => {
        const button = document.querySelectorAll('[role="button"]');
        return Array.from(button).map(element => element.click());
    });

    
    browser.close();
}

scrape('https://docs.google.com/forms/d/1ypB4qKBrLelrPoIV5trZK8D9zbWto4ZKz6yLyORrJ2s/viewform?edit_requested=true');
```
The final line is to call the function, passing in the form link.
***







