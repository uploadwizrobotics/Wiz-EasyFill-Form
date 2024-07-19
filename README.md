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

The `fill_info.json` file should populate with the questions on the form. An example is shown below.
```bash
{"Enter your name":"[Insert]","Email Address":"[Insert]","Birthday":"[Insert]","Occupation":"[Insert]"}
```
Replace the areas marked with **[Insert]** with the information you want to be filled in the form. An example is shown below with formats for the different types of inputs.
```bash
{"Enter your name":"John Doe","Email Address":"JohnDoe@email.com","Birthday":"2000-01-01","Occupation":"1,0,1"}
```
- Text inputs can be filled out as normal
- Date inputs must follow this format: **YYYY-MM-DD**
- Checkbox inputs must be represented by **1's (checked) and 0's (unchecked)** to determine which boxes on the form you want checked/unchecked

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

If ``fill_info.json`` is:
- Blank - the script will populate ``fill_info.json`` with the confirmed questions and return false, meaning nothing will be filled in the form. Please see the example under the Usage section.
- Filled with the confirmed questions but the answers to the questions are **[Insert]** - return false, meaning nothing will be filled in the form
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







