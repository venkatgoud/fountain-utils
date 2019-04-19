/* eslint-disable comma-dangle */
/* eslint-disable require-jsdoc */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const reporter = require('./lib/reporter');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const optionDefinitions = [
  {name: 'help', alias: 'h', type: Boolean,
    description: 'Display this usage guide.'
  },
  {name: 'char', type: String,
    description: 'Character name', defaultValue: null},
  {name: 'src', type: String, description: 'The input file'},
  {name: 'out', type: String, description: 'The output file',
    defaultValue: null},
  {name: 'pdf', type: Boolean, description: 'Write to pdf.',
    defaultValue: false}
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
]);

if (options.help || options.pdf && !options.out) {
  console.log(usage);
} else if (options.src) {
  generate(options);
} else {
  console.log(usage);
}

function generate(options) {
  const inputFile = options.src;
  const doc = new PDFDocument();

  function writeToPdf(charName, dialog) {
    doc.text(charName);
    doc.text(dialog);
    doc.moveDown();
  }

  function printLocations(locations) {
    if (!options.pdf) {
      locations.forEach((l)=>{
        console.log;
      });
    } else {
      locations.forEach((l)=>{
        doc.text(l);
        doc.moveDown();
      });
    }
  }

  function printCharDialogs(charName, dialog) {
    if (!options.pdf) {
      console.log(charName+'\n'+dialog+'\n');
    } else {
      writeToPdf(charName, dialog);
    }
  }

  function printNewPage(c, count) {
    if (!options.pdf) {
      console.log(`\n--${c} has ${count} Dialogs--\n`);
    } else {
      doc.addPage();
      doc.text(`${c} has ${count} Dialogs`);
      doc.moveDown();
    }
  }

  function printLocationSummary(locations) {
    printLine(`There are ${locations.length} locations`);
  }

  function printLine(line) {
    if (!options.pdf) {
      console.log(line);
    } else {
      doc.text(line);
      doc.moveDown();
    }
  }

  function printDialogSummary(dialogMap) {
    printLine('Dialogs');
    const characters = Object.keys(dialogMap).
        sort((a, b)=>{
          return a.localeCompare(b);
        });
    for (let i=0; i < characters.length; i++) {
      const c = characters[i];
      const dialogs = dialogMap[c];
      printLine(`${c}: ${dialogs.length}`);
    }
  }

  function printSummary(dialogMap, locations) {
    printLine('Summary');
    printLocationSummary(locations);
    printDialogSummary(dialogMap);
    printLocations(locations);
    printDialogs(dialogMap, options.char);
  }

  function printDialogs(dialogMap, character) {
    if (character) {
      const dialogs = dialogMap[character];
      printCharDialogs(character, dialogs);
    } else {
      const characters = Object.keys(dialogMap);
      for (let i=0; i < characters.length; i++) {
        const c = characters[i];
        const dialogs = dialogMap[c];
        printNewPage(c, dialogs.length);
        for (let j=0; j < dialogs.length; j++) {
          printCharDialogs(c, dialogs[j]);
        }
      }
    }

    if (options.pdf) {
      doc.pipe(fs.createWriteStream(options.out));
      doc.end();
    }
  }

  fs.readFile(inputFile, function(err, data) {
    if (err) {
      throw err;
    }
    reporter.generate(data, (dialogMap, locations) => {
      printSummary(dialogMap, locations);
    });
  });
}

