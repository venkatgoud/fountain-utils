const fs = require('fs');
const parser = require('./fountain');

const inputFilename = process.argv[2];
const outputFilename = process.argv[3];

if (!inputFilename) {
  throw Error("Input file must be specified!");
}

if (!outputFilename) {
  throw Error("output file must be specified!");
}

console.log("inputFilename:" + inputFilename)
console.log("outputFilename: " + outputFilename)

var dialogMap = {}
var speakingCharacter

fs.readFile(inputFilename, function (err, data) {
  if (err) {
    throw err;
  }
  parser.parse(data.toString(), true, function (result) {
    var tokens = result.tokens

    tokens.forEach(function (token) {
      switch (token.type) {
        case 'character': {
          speakingCharacter = token.text.toUpperCase()
          if (!dialogMap[speakingCharacter]) {
            dialogMap[speakingCharacter] = []  
          }                      
          break
        }
        case 'dialogue': dialogMap[speakingCharacter].push(token.text); break;
        default: break;
      }
    });
  })

  var output = fs.createWriteStream(outputFilename);
  Object.keys(dialogMap).forEach(function(c){
    var dialogs = dialogMap[c]
    output.write("\n==========Begin Dialogs for " + c + "========")
    dialogs.forEach(function(d){
      output.write('\n'+c)
      output.write('\n'+d)
    })
    output.write('\n==========End Dialogs for ' + c + '========')
  })

});




