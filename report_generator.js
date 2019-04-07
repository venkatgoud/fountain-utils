const PDFDocument = require('pdfkit');
const fs = require('fs');
const reporter = require('./lib/reporter');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

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
    const doc = new PDFDocument();

    function write_to_pdf(char_name, dialog) {
        doc.text(char_name);
        doc.text(dialog);
        doc.moveDown();
    }

    function print_locations(locations) {
        if (!options.pdf) {
            locations.forEach((l)=>{console.log})
        }
        else {
            locations.forEach((l)=>{
                doc.text(l);
                doc.moveDown();
            })
        }
    }

    function print_char_dialogs(char_name, dialog) {
        if (!options.pdf) {
            console.log(char_name+'\n'+dialog+'\n');
        }
        else {
            write_to_pdf(char_name, dialog)
        }
    }

    function print_new_page(c, count) {
        if (!options.pdf) {
            console.log(`\n--${c} has ${count} Dialogs--\n`)
        }
        else {
            doc.addPage();
            doc.text(`${c} has ${count} Dialogs`);
            doc.moveDown();
        }
    }

    function print_location_summary(locations) {
        let out = `There are ${locations.length} locations`;            
        print_line(out);
    }

    function print_line(line) {
        if (!options.pdf){
            console.log(line);                            
        }
        else {
            doc.text(line);                  
            doc.moveDown();            
        }
    }

    function print_dialog_summary(dialogMap) {
        print_line('Dialogs');
        let characters = Object.keys(dialogMap).sort((a,b)=>{return a.localeCompare(b)});
        for(let i=0; i < characters.length; i++) {
            let c = characters[i];
            var dialogs = dialogMap[c]
            let out = `${c}: ${dialogs.length}`;
            print_line(out);                     
        }
    }

    function print_summary(dialogMap, locations) {
        print_line('Summary');
        print_location_summary(locations)
        print_dialog_summary(dialogMap)    
        print_locations(locations);
        print_dialogs(dialogMap, options.char);     
    }

    function print_dialogs(dialogMap, character) {
        if (character) {
            let dialogs    = dialogMap[character]
            print_char_dialogs(character, dialogs)
        }
        else {
            let characters = Object.keys(dialogMap);
            for(let i=0; i < characters.length; i++) {
                let c = characters[i];
                var dialogs = dialogMap[c]
                print_new_page(c, dialogs.length);
                for(let j=0; j < dialogs.length; j++) {
                    print_char_dialogs(c,dialogs[j])
                }
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
        reporter.generate(data, (dialogMap, locations) => {             
            print_summary(dialogMap, locations)
        });
    });
}

