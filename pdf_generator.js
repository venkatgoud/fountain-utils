const PDFDocument = require('pdfkit');
const fs = require('fs');
const parser = require('./fountain');
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

const optionDefinitions = [
    { name: 'help',alias: 'h', type: Boolean, 
        description: 'Display this usage guide.'
    },
    { name: 'indian', type: Boolean, description: 'For Indian format' },
    { name: 'src', type: String, description: 'The input file' },
    { name: 'out', type: String, description: 'The output file' }
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

const A4_DEFAULT_MAX = 58;
const DPI = 72;

const print_profiles = {

    "indian": {
        paper_size: "a4",
        font_size: 12,
        lines_per_page: 57,
        top_margin: 1.0,
        page_width: 8.27,
        page_height: 11.7,
        left_margin: 1.5,
        right_margin: 1,
        font_width: 0.1,          
        page_number_top_margin: 0.5,         
        title_page: {
            top_start: 3.5,
            left_side: ['notes', 'copyright'],
            right_side: ['draft date', 'date', 'contact']
        },
        scene_heading: {
            left: 1.5,
            max: A4_DEFAULT_MAX
        },
        action: {
            left: 1.5,
            max: A4_DEFAULT_MAX,
            width: 3.13
        },
        shot: {
            left: 1.5
        },
        character: {
            left: 5
        },
        parenthetical: {
            left: 5
        },
        dialogue: {
            left: 4.5
        },
        transition: {
            left: 0.0
        },
        centered: {
            left: 3.13
        },
    },
    "a4": {
        paper_size: "a4",
        font_size: 12,
        lines_per_page: 57,
        top_margin: 1.0,
        page_width: 8.27,
        page_height: 11.7,
        left_margin: 1.5,
        right_margin: 1,
        font_width: 0.1,          
        page_number_top_margin: 0.5,         
        title_page: {
            top_start: 3.5,
            left_side: ['notes', 'copyright'],
            right_side: ['draft date', 'date', 'contact']
        },
        scene_heading: {
            left: 1.5,
            max: A4_DEFAULT_MAX
        },
        action: {
            left: 1.5,
            max: A4_DEFAULT_MAX,
            width: 5.77
        },
        shot: {
            left: 1.5
        },
        character: {
            left: 3.5
        },
        parenthetical: {
            left: 3
        },
        dialogue: {
            left: 2.5
        },
        transition: {
            left: 0.0
        },
        centered: {
            left: 3.13
        },
        synopsis: {
            left: 0.5
        },
        section: {
            left: 0.5
        }
    }
};

let includePageNumbers = true; 
let default_profile = print_profiles.a4;

if (options.indian) {
    console.log("Generating Indian style");
    default_profile = print_profiles.indian;
}

let margins = {
    top: DPI * default_profile.top_margin,
    left: DPI * default_profile.left_margin,
    bottom: DPI * default_profile.top_margin,
    right: DPI * default_profile.right_margin
}

let docOptions = {
    bufferPages: includePageNumbers,
    size: 'A4',
    margins: margins
};

function initializePDF() {
    let doc = new PDFDocument(docOptions);
    doc.registerFont('ScriptNormal', 'Courier');
    doc.registerFont('ScriptBold', 'Courier-Bold');
    doc.registerFont('ScriptBoldOblique', 'Courier-BoldOblique');
    doc.registerFont('ScriptOblique','Courier-Oblique');
    doc.font('ScriptNormal');
    doc.fontSize(default_profile.font_size);

    doc.info.Creator = 'Venkat Goud';        
    return doc;     
} 

//TODO - add a callback function as a param. Could be used for reports
function processSceneHeading(doc, slugline) {     
    doc.font('ScriptBold');
    doc.text(slugline.toUpperCase(), 
        DPI*default_profile.scene_heading.left,doc.y, {underline: true});    
    doc.moveDown();
    doc.font('ScriptNormal');
}

function processAction(doc, action) {
    inlineStyle(doc, action, DPI*default_profile.action.left, 
    DPI*default_profile.action.width);     
    doc.moveDown();
}

function processTransition(doc, transition) {
    doc.text(transition, {align: 'right'});
    doc.moveDown();
}

function processDialog(doc, dialog) {
    inlineStyle(doc, dialog, DPI*default_profile.dialogue.left);     
}

function inlineStyle(doc, text, left, width) {   
    doc.font('ScriptNormal');             
    var split_for_fromatting = text.split(/(\\\*)|(\*{1,3})|(\\?_)|(\[\[)|(\]\])/g).filter(function(a) {
        return a;
    });
     
    var emphasis = {
        italic: false,
        bold: false,
        underline: false
    }     

    for (var i = 0; i < split_for_fromatting.length; i++) {
        var elem = split_for_fromatting[i];        
        if (elem === '***') {
            emphasis.italic = !emphasis.italic;
            emphasis.bold = !emphasis.bold;
        } else if (elem === '**') {
            emphasis.bold = !emphasis.bold;
        } else if (elem === '*') {
            emphasis.italic = !emphasis.italic;
        } else if (elem === '_') {
            emphasis.underline = !emphasis.underline;
        } else if (elem === '[[') {
            //TODO 
        } else if (elem === ']]') {
            //TODO
        } else {
            if (emphasis.bold && emphasis.italic) {
                doc.font('ScriptBoldOblique');
            } else if (emphasis.bold) {
                doc.font('ScriptBold');
            } else if (emphasis.italic) {
                doc.font('ScriptOblique');
            } else {
                doc.font('ScriptNormal');
            }
            if (elem === '\\_' || elem === '\\*') {
                elem = elem.substr(1, 1);
            }
            doc.text(elem, left, doc.y, {                
                underline: emphasis.underline,
                continued: true,
                width: width
            });                         
        }
    }
    doc.text(' '); // clear continued option
    doc.font('ScriptNormal');             
}

function processCharacter(doc, character){
    doc.text(character, DPI*default_profile.character.left);    
} 

function processParenthetical(doc, dialog){
    doc.text(dialog, DPI*default_profile.parenthetical.left);    
}

function processCentered(doc, text) {    
    doc.text(text, DPI*default_profile.centered.left);    
    doc.moveDown();
}

function processIgnored(type, text) {
    console.log(`ignoring ${type} ${text}`);
}

function addPageNumbers(doc) {    
    
    if (includePageNumbers) {
        const range = doc.bufferedPageRange();         
        let i,end;
        for (i=range.start, end = range.start + range.count; i < end; i++) {
            doc.switchToPage(i);
            let page_num = (i+1).toFixed()+' '; //TODO without a string it hangs.
            let number_y = default_profile.page_number_top_margin;
            let number_x = default_profile.action.left + default_profile.action.max * default_profile.font_width - page_num.length * default_profile.font_width;             
            doc.text(`${page_num}`, number_x * DPI, number_y * DPI);
        }
    }
}

function addTitlePage(doc, title_map) {     
    // let titles = Object.getOwnPropertyNames(title_map);
    // titles.forEach((k)=>console.log(`${k}: ${title_map[k]}`)); 
    //Title, author, authors, source

    var title_y = default_profile.title_page.top_start;

    var center = function(txt, y) {
        var txt_length = txt.replace(/\*/g, '').replace(/_/g, '').length;
        var feed = DPI*(default_profile.page_width - txt_length * default_profile.font_width) / 2;
        doc.text(txt, feed, y);
    };

    var empty_lines = function(count){        
        title_y += count*1 * 0.1667; //TODO              
    }

    function print_title_line(type, value){
        if (value) {
            value.split('\n').forEach(function(line) {             
                line = line.toUpperCase();                         
                center(line, DPI* title_y);
                empty_lines(1);
            });
        }
    }
    print_title_line('title',title_map.title);
    empty_lines(5);    
    print_title_line('credit',title_map.credit);
    empty_lines(1);
    print_title_line('author',title_map.author);
    empty_lines(1);
    print_title_line('source',title_map.source);
    empty_lines(1);
    print_title_line('draft_date',title_map.draft_date);
    empty_lines(5);
    print_title_line('contact',title_map.contact);
    
    doc.addPage();
}

function generate(inputFilename, outputFilename) {
    // Create a document
    let doc =  initializePDF(outputFilename);

    fs.readFile(inputFilename, function (err, data) {
      if (err) {
        throw err;
      }
  
      parser.parse(data.toString(), true, function (result) {
        var tokens = result.tokens
        addTitlePage(doc, result.title_info);
        
        tokens.forEach(function (token) {                  
          switch (token.type) {            
            case 'title': 
            case 'credit':
            case 'author': 
            case 'authors':
            case 'source': 
            case 'notes':   
            case 'draft_date':
            case 'date':    
            case 'contact': 
            case 'copyright':                            
                break;
            case 'character':   processCharacter(doc,token.text); break;
            case 'page_break':  doc.addPage(); break;
            case 'line_break':  doc.moveDown(); break;
            case 'scene_heading': processSceneHeading(doc,token.text); break;
            case 'transition': processTransition(doc, token.text); break;
            case 'action':  processAction(doc,token.text); break;
            case 'parenthetical': processParenthetical(doc,token.text); break;
            case 'dialogue_begin': break;
            case 'dialogue_end':  doc.moveDown(); break;
            case 'dual_dialogue_begin': break; //TODO
            case 'dual_dialogue_end': break;
            case 'dialogue': processDialog(doc,token.text); break;
            case 'centered': processCentered(doc, token.text); break
            case 'section': 
            case 'synopsis':  
            case 'note':  
            case 'boneyard_begin':  
            case 'boneyard_end': processIgnored(doc, token.type, token.text); break;            
            default: { if (!token.text) { console.log(token) } } break;
          }
        });         
        doc.pipe(fs.createWriteStream(outputFilename)); 
        addPageNumbers(doc);
        doc.end();                
      })
    });    
}
 
if (options.help) {   
    console.log(usage)
}
else if (options.src && options.out) {
    generate(options.src, options.out);
}
else {
    console.log(usage)
}
