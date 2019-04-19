/* eslint-disable require-jsdoc */
/* eslint-disable comma-dangle */
const defaultDictPath = './google-10000-english-usa.txt';
// const defaultDictPath = './words'
const fs = require('fs');
const literator = require('./lib/literator');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const optionDefinitions = [
  {name: 'help', alias: 'h', type: Boolean,
    description: 'Convert tenglish to Telugu and vice versa',
  },
  {name: 'src_scheme', type: String,
    description: 'Source scheme', defaultValue: 'itrans'},
  {name: 'out_scheme', type: String,
    description: 'Output scheme', defaultValue: 'telugu'},
  {name: 'src', type: String, description: 'The input file'},
  {name: 'out', type: String,
    description: 'The output file', defaultValue: null},
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


function loadDictionary(done) {
  const dictionary = {};
  fs.readFile(defaultDictPath, function(err, data) {
    if (err) throw err;
    const words = data.toString().split('\n');
    for (let i=0; i < words.length; i++) {
      dictionary[words[i].toLowerCase()] = true;
    }
    done(dictionary);
  });
}

function generate(inputFilename, dictionary, fromScheme, toScheme, done) {
  fs.readFile(inputFilename, (err, data) => {
    if (err) {
      throw err;
    }
    literator.literate(data, dictionary, fromScheme, toScheme, (output) => {
      done(output);
    });
  });
}

if (options.src) {
  loadDictionary((dict) => {
    generate(options.src, dict, options.src_scheme,
        options.out_scheme, (output)=>{
          if (!options.out) {
            console.log(output);
          } else {
            fs.writeFile(options.out, output,
                (err) => {
                  if (err) throw err;
                });
          }
        });
  });
} else {
  console.log(usage);
}
