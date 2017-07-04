const fs = require('fs');
const parser = require('./fountain');

const character = process.argv[2]
const inputFilename = process.argv[3];
const outputFilename = process.argv[4];

if (!character) {
  throw Error("Character name must be specified");
}

if (!inputFilename) {
  throw Error("Input file must be specified!");
}

if (!outputFilename) {
  throw Error("output file must be specified!");
}

console.log("character:" + character)
console.log("inputFilename:" + inputFilename)
console.log("outputFilename: " + outputFilename)

var isOurCharacter = false;

fs.readFile(inputFilename, function (err, data) {
  if (err) {
    throw err;
  }

  var output = fs.createWriteStream(outputFilename);

  parser.parse(data.toString(), true, function (result) {
    var tokens = result.tokens

    tokens.forEach(function (token) {
      switch (token.type) {
        case 'character': {           
          isOurCharacter = (token.text.toUpperCase() === character.toUpperCase())           
          break
        }
        case 'dialogue': if (isOurCharacter) { output.write(character+'\n'+token.text+'\n'); } break;
        default: break;
      }
    });
  })

  
});

