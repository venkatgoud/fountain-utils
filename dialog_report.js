const PDFDocument = require('pdfkit');
const fs = require('fs');
const parser = require('./fountain');
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

const optionDefinitions = [
    { name: 'help',alias: 'h', type: Boolean, 
        description: 'Display this usage guide.'
    },
    { name: 'char', type: String, description: 'Character name', defaultValue:null },
    { name: 'src', type: String, description: 'The input file' },     
    { name: 'out', type: String, description: 'The output file', defaultValue:null },
    { name: 'pdf', type: Boolean, description: 'Write to pdf.',defaultValue:false},       
];

const options = commandLineArgs(optionDefinitions);
const usage = commandLineUsage([      
    {
      header: 'Options',
      optionList: optionDefinitions
    },
    {
      content: 'Project home: {underline https://github.com/venkatgoud/fountain-utils}'
    }
  ]) 

if (options.help || options.pdf && !options.out) {   
    console.log(usage)
}
else if (options.src) {    
    generate(options);
}
else {
    console.log(usage)
}

function generate(options) {
    let inputFile = options.src; 
    let dialogMap = {};

    const doc = new PDFDocument({autoFirstPage: false}); 

    function write_to_pdf(char_name, dialog) {
        doc.text(char_name);
        doc.text(dialog);
        doc.moveDown();
    }
   
    function print_dialog(char_name, dialog) {
        if (!options.pdf) {
            console.log(char_name+'\n'+dialog+'\n');
        }
        else {
            write_to_pdf(char_name, dialog)
        }
    }

    function print_new_page(c) {
        if (!options.pdf) {
            console.log("\n==========Begin Dialogs for " + c + "========")
        }
        else {
            doc.addPage();
        } 
    }

    function print_all_dialogs() {         
        let characters = Object.keys(dialogMap);        
        for(let i=0; i < characters.length; i++) {
            let c = characters[i];
            print_new_page(c);
            var dialogs = dialogMap[c]
            for(let j=0; j < dialogs.length; j++) {                        
                print_dialog(c,dialogs[j])
            }                                  
        }
        if (options.pdf){
            doc.pipe(fs.createWriteStream(options.out)); 
            doc.end(); 
        }
    }

    fs.readFile(inputFile, function (err, data) {
        if (err) {
            throw err;
        }

        parser.parse(data.toString(), true, function (result) {
            var tokens = result.tokens
            
            let character = options.char && options.char.toUpperCase();
            let speakingCharacter;

            for(let i=0; i < tokens.length; i++) {
                let token = tokens[i];
                switch (token.type) {
                case 'character': {                               
                    if (!character) {
                        speakingCharacter = token.text.toUpperCase();                                                                                           
                    }
                    else {
                        speakingCharacter = (token.text.toUpperCase() === character ? character : null);                                             
                    }
                    if (speakingCharacter && !dialogMap[speakingCharacter]) {
                        dialogMap[speakingCharacter] = []  
                    }
                    break;
                }
                case 'dialogue': 
                    if (speakingCharacter) {                         
                        dialogMap[speakingCharacter].push(token.text); 
                    } 
                    break;
                default: break;
                }
            };
            
            print_all_dialogs();            
        });
    });

    

}
  
  