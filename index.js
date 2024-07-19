//----------------------------------------------------------------------------------------------------
/* 
Summary: 
Scrapes the entered form url and fills all inputs with the information inputted from the user
in 'fill_info.json' 

Steps:
1. Gets the page url
2. Removes the placeholder text
3. Get ALL headings (not just the question headings), filter out for the correct headings using llamaAI
4. Check whether fill_info.json has information:
    > No information, write to fill_info.json with the headings on the form for the user to fill, code stops
    > Has information, continue on with the code
5. Auto fill the form with the information
6. Take a screenshot 

Modules:
CreateFormInfo.js > index.js
ToConfirm.js > index.js
*/

//----------------------------------------------------------------------------------------------------

/* 
Future steps:
> Documentation of architecture (also think about whether this is the best architecture)
> Bullet points for content
> Diagrams of what gets sent to what (i.e. think of a grade 3 reading this, make it simple)
    > also imagine this is your first time reading the code

*/


//imports
import puppeteer from 'puppeteer';
import fs from 'fs'

//script containing functions to confirm things
import ToConfirm from './ToConfirm.js';

//script to create new form info in fill_info.json
import CreateFormInfo from './CreateFormInfo.js';


async function scrape(url){
    //launches form
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    
    //removes all placeholder text in inputs
    let textInput = await page.$$('input[type="text"]');
    for(const element of textInput){
        await element.type(" ", {delay: 700});
    }


    //get ALL HEADINGS on form (even if it's not a form question)
    const notVerifiedHeading = await page.evaluate(() => {
        const elements = document.querySelectorAll('[role="heading"]');
        return Array.from(elements).map(element => element.innerHTML);
    });

    //gets confirmed headings from AI
    let confirmedHeading = await ToConfirm.confirmedHeading(notVerifiedHeading);

    //creates form (returns true if there is already information)
    let fillForm = CreateFormInfo.createFormInfo(confirmedHeading);

    //read updated file
    let jsonData = fs.readFileSync('fill_info.json', "utf8");


    if(fillForm){
        //fill fields in form
        const fillFormFunc = await page.evaluate((confirmedHeading, jsonData) => {
            jsonData = JSON.parse(jsonData);

            //get ALL TEXT IN HEADINGS on form (even if it's not a form question)
            const elements = document.querySelectorAll('[role="heading"]');
            const convertEle = Array.from(elements).map(element => element.innerText);

            //loops through all the heading text
            for(let i = 0; i < elements.length; i++){
                elementHeading = elements[i];

                //function to find the input type of the form question, returns the input js
                function findInput(testElement){
                    let testParent = testElement.parentElement;
                    let testChildren = testElement.children;
                    if(testParent.querySelector('input')){

                        let anyCheckbox = testParent.querySelectorAll('[role="checkbox"]');
                        if(anyCheckbox.length != 0){
                            //return anyCheckbox
                            return ["cb", anyCheckbox]
                        }

                        let anyInput = testParent.querySelectorAll('input');                    
                        return anyInput
                    }
                    return findInput(testParent)
                }

                //loops through all the headings in fill_info.json file
                for(let key in jsonData){
                    if(key == convertEle[i]){
                        let testEle = findInput(elementHeading);

                        //click on checkboxes
                        if(testEle[0]=="cb"){
                            let checkboxArr = jsonData[key].split(",");
                            testEle.shift();

                            testEle[0].forEach((element, index) => {
                                if(checkboxArr[index] == "1"){
                                    element.click();
                                } 
                            })
                        }

                        //fills out inputs if they are in the correct format
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


    console.log("=== Code has ended ===");

    //save screenshot as indexSS in current directory
    await page.screenshot({path: 'indexSS.png', fullPage: true});

    //submit form
    const submitButton = await page.evaluate(() => {
        const button = document.querySelectorAll('[role="button"]');
        return Array.from(button).map(element => element.click());
    });

    
    browser.close();
}

//form url [change this]
scrape('https://docs.google.com/forms/d/1ypB4qKBrLelrPoIV5trZK8D9zbWto4ZKz6yLyORrJ2s/viewform?edit_requested=true');