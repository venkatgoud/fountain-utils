const fs = require('fs');
const parser = require('./fountain');
const Sanscript = require('sanscript')

var defaultFromScheme = 'itrans'
var defaultToScheme = 'telugu'
const defaultDictPath = './words'

var dictionary = {}

function loadDictionary(done) {
  fs.readFile(defaultDictPath, function(err, data) {
    if(err) throw err;
    var array = data.toString().split("\n");
    array.forEach(function(word){
      dictionary[word] = true
    })
    done()
  });
}

function transliterate(input, fromScheme, toScheme) {
  var output = Sanscript.t(input, fromScheme, toScheme);
  return output
}

function transform(dialog, fromScheme, toScheme) {
  const tokens = dialog.split(' ')
  var output = '';
  tokens.forEach(function (token) {
    if (exclude(token)) {
      output = output + token + ' '
    }
    else {
      output = output + transliterate(token, fromScheme, toScheme) + ' '
    }
  });

  return output;
}

function exclude(word) {
  return dictionary[word.toLowerCase()]
  // return (word === 'Phone' || word === 'mattress' || word === 'massage' || word === 'permission')
}

function generate() {
  fs.readFile(inputFilename, function (err, data) {
    if (err) {
      throw err;
    }

    var output = fs.createWriteStream(outputFilename);

    parser.parse(data.toString(), true, function (result) {
      var tokens = result.tokens
      tokens.forEach(function (token) {
        switch (token.type) {
          case 'parenthetical': output.write('\n'+token.text); break;
          case 'title': output.write('\ntitle:' + token.text); break;
          case 'credit': output.write('\ncredit:' + token.text); break;
          case 'author': output.write('\nauthors:' + token.text); break;
          case 'authors': output.write('\nauthors:' + token.text); break;
          case 'source': output.write('\nsource:' + token.text); break;
          case 'notes': output.write('\nnotes:' + token.text); break;
          case 'draft_date': output.write('\ndraft_date:' + token.text); break;
          case 'date': output.write('\ndate:' + token.text); break;
          case 'contact': output.write('\ncontact:' + token.text); break;
          case 'copyright': output.write('\ncopyright:' + token.text); break;
          case 'character': output.write('\n'+token.text+'\n'); break;
          case 'page_break':output.write("\n\n"); break;
          case 'line_break': output.write("\n\n"); break;
          case 'scene_heading':
          case 'transition':
          case 'action':  output.write('\n'+token.text+'\n'); break;
          case 'dialogue_begin': break;
          case 'dialogue_end': output.write("\n"); break;
          case 'dialogue':
              output.write(transform(token.text, fromScheme, toScheme));
              break;
          default: { if (!token.text) { console.log(token) } { output.write(token.text) }; } break;
        }
      });
    })
  });
}

const inputFilename = process.argv[2];
const outputFilename = process.argv[3];
var fromScheme = process.argv[4];
var toScheme = process.argv[5];

if (!fromScheme) {
  fromScheme = defaultFromScheme
}

if (!toScheme) {
  toScheme = defaultToScheme
}

if (!inputFilename) {
  throw Error("Input file must be specified!");
}

if (!outputFilename) {
  throw Error("output file must be specified!");
}

console.log("inputFilename:" + inputFilename)
console.log("outputFilename: " + outputFilename)

loadDictionary(generate)
