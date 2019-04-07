const parser = require('./fountain');

function generate(data, done) {
  let dialogMap = {};
  let locations = [];
  parser.parse(data.toString(), true, function (result) {
    var tokens = result.tokens;
    let character;
    for(let i=0; i < tokens.length; i++) {
      let token = tokens[i];      
      switch (token.type) {
        case 'character': {
          character = token.text.toUpperCase();
          if (!dialogMap[character])                                                                                                                                       
            dialogMap[character] = []                      
          break;
        }
      case 'dialogue': 
        dialogMap[character].push(token.text);            
        break;
      case 'scene_heading':
        break;        
      default: break;
      }
    }
    done(dialogMap, locations);
  })
}

module.exports = {
  generate: generate,
}
