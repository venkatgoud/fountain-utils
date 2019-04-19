const fs = require('fs');
const pdfUtil = require('./lib/pdf_util');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const optionDefinitions = [
  {name: 'help', alias: 'h', type: Boolean,
    description: 'Display this usage guide.'},
  {name: 'indian', type: Boolean, description: 'For Indian format'},
  {name: 'lang', type: String, description: 'Language - telugu, tamil etc'},
  {name: 'src', type: String, description: 'The input file'},
  {name: 'out', type: String, description: 'The output file'},
];

const options = commandLineArgs(optionDefinitions);
const usage = commandLineUsage([
  {header: 'Options', optionList: optionDefinitions},
  {content: 'Project home: {underline https://github.com/venkatgoud/fountain-utils}'},
]);

if (options.help) {
  console.log(usage);
} else if (options.src && options.out) {
  fs.readFile(options.src, (err, data) => {
    if (err) {
      throw err;
    }
    pdfUtil.generate(data, options.indian, options.lang, (doc) => {
      doc.pipe(fs.createWriteStream(options.out));
      doc.end();
    });
  });
} else {
  console.log(usage);
}
