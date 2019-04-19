/* eslint-disable require-jsdoc */
const PDFDocument = require('pdfkit');
const parser = require('./fountain');
const A4_DEFAULT_MAX = 58;
const DPI = 72;
const includePageNumbers = true;
const print_profiles = {

  'indian': {
    paper_size: 'a4',
    font_size: 12,
    lines_per_page: 57,
    top_margin: 1.0,
    page_width: 8.27,
    page_height: 11.7,
    left_margin: 1.5,
    right_margin: 1,
    font_width: 0.1,
    pageNumber_top_margin: 0.5,
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
      left: 4.5,
      width: 3.13
    },
    transition: {
      left: 0.0
    },
    centered: {
      left: 3.13
    }
  },
  'a4': {
    paper_size: 'a4',
    font_size: 12,
    lines_per_page: 57,
    top_margin: 1.0,
    page_width: 8.27,
    page_height: 11.7,
    left_margin: 1.5,
    right_margin: 1,
    font_width: 0.1,
    pageNumber_top_margin: 0.5,
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
      left: 2.5,
      width: 3.13
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

function setupPrintProfile(indian) {
  if (indian) {
    return print_profiles.indian;
  }
  return print_profiles.a4;
}

function initializePDF(profile) {
  const margins = {
    top: DPI * profile.top_margin,
    left: DPI * profile.left_margin,
    bottom: DPI * profile.top_margin,
    right: DPI * profile.right_margin,
  };
  const docOptions = {
    bufferPages: includePageNumbers,
    size: 'A4',
    margins: margins,
  };

  const doc = new PDFDocument(docOptions);
  doc.registerFont('ScriptNormal', 'Courier');
  doc.registerFont('ScriptBold', 'Courier-Bold');
  doc.registerFont('ScriptBoldOblique', 'Courier-BoldOblique');
  doc.registerFont('ScriptOblique', 'Courier-Oblique');
  doc.registerFont('telugu', './fonts/Mandali-Regular.ttf');
  doc.font('ScriptNormal');
  doc.fontSize(profile.font_size);

  doc.info.Creator = 'Venkat Goud';
  return doc;
}

function processSceneHeading(doc, profile, slugline) {
  doc.font('ScriptBold');
  doc.text(slugline.toUpperCase(),
      DPI*profile.scene_heading.left,doc.y, {underline: true});
  doc.moveDown();
  doc.font('ScriptNormal');
}

function processAction(doc, profile, action) {
  inlineStyle(doc, action, DPI*profile.action.left,
      DPI*profile.action.width);
  doc.moveDown();
}

function processTransition(doc, transition) {
  doc.text(transition, {align: 'right'});
  doc.moveDown();
}

function processDialog(doc, profile, dialog, indian, lang) {
  inlineStyle(doc, dialog, DPI*profile.dialogue.left, DPI*profile.action.width, indian, lang);
}

function inlineStyle(doc, text, left, width, indian, lang) {
  const splitForFormatting = text.split(/(\\\*)|(\*{1,3})|(\\?_)|(\[\[)|(\]\])/g).filter(function(a) {
    return a;
  });

  const emphasis = {
    italic: false,
    bold: false,
    underline: false,
  };

  for (let i = 0; i < splitForFormatting.length; i++) {
    let elem = splitForFormatting[i];
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
      // TODO
    } else if (elem === ']]') {
      // TODO
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
      if (indian && lang) {
        doc.font(lang).text(elem, left, doc.y, {
          underline: emphasis.underline,
          continued: true,
          width: width,
        });
      } else {
        doc.text(elem, left, doc.y, {
          underline: emphasis.underline,
          continued: true,
          width: width,
        });
      }
    }
  }
  doc.text(' '); // clear continued option

  doc.font('ScriptNormal');
}

function processCharacter(doc, profile, character) {
  doc.text(character, DPI*profile.character.left);
}

function processParenthetical(doc, profile, dialog) {
  doc.text(dialog, DPI*profile.parenthetical.left);
}

function processCentered(doc, profile, text) {
  doc.text(text, DPI*profile.centered.left);
  doc.moveDown();
}

function processIgnored(type, profile, text) {
  console.log(`ignoring ${type} ${text}`);
}

function addPageNumbers(doc, profile) {
  if (includePageNumbers) {
    const range = doc.bufferedPageRange();
    let i; let end;
    for (i=range.start, end = range.start + range.count; i < end; i++) {
      doc.switchToPage(i);
      const pageNum = (i+1).toFixed()+' '; // TODO without a string it hangs.
      const numberY = profile.pageNumber_top_margin;
      const numberX = profile.action.left +
        profile.action.max * profile.font_width -
        pageNum.length * profile.font_width;
      doc.text(`${pageNum}`, numberX * DPI, numberY * DPI);
    }
  }
}

function addTitlePage(doc, profile, titleMap) {
  // let titles = Object.getOwnPropertyNames(titleMap);
  // titles.forEach((k)=>console.log(`${k}: ${titleMap[k]}`));
  //Title, author, authors, source

  let titleY = profile.title_page.top_start;

  const center = function(txt, y) {
    let txt_length = txt.replace(/\*/g, '').replace(/_/g, '').length;
    let feed = DPI*(profile.page_width - txt_length * profile.font_width) / 2;
    doc.text(txt, feed, y);
  };

  const empty_lines = function(count) {
    titleY += count*1 * 0.1667; // TODO
  };

  const print_title_line = function(type, value) {
    if (value) {
      value.split('\n').forEach(function(line) {
        line = line.toUpperCase();
        center(line, DPI* titleY);
        empty_lines(1);
      });
    }
  };

  print_title_line('title', titleMap.title);
  empty_lines(5);
  print_title_line('credit', titleMap.credit);
  empty_lines(1);
  print_title_line('author', titleMap.author);
  empty_lines(1);
  print_title_line('source', titleMap.source);
  empty_lines(1);
  print_title_line('draft_date', titleMap.draft_date);
  empty_lines(5);
  print_title_line('contact', titleMap.contact);

  doc.addPage();
}

function generate(data, indian, lang, done) {
  const profile = setupPrintProfile(indian);
  // Create a document
  const doc = initializePDF(profile);

  parser.parse(data.toString(), true, function(result) {
    const tokens = result.tokens;
    addTitlePage(doc, profile, result.title_info);

    tokens.forEach(function(token) {
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
        case 'character': processCharacter(doc, profile, token.text); break;
        case 'page_break': doc.addPage(); break;
        case 'line_break': doc.moveDown(); break;
        case 'scene_heading': processSceneHeading(doc, profile, token.text); break;
        case 'transition': processTransition(doc, profile, token.text); break;
        case 'action': processAction(doc, profile, token.text); break;
        case 'parenthetical': processParenthetical(doc, profile, token.text); break;
        case 'dialogue_begin': break;
        case 'dialogue_end': doc.moveDown(); break;
        case 'dual_dialogue_begin': break; //TODO
        case 'dual_dialogue_end': break;
        case 'dialogue': processDialog(doc, profile, token.text, indian, lang); break;
        case 'centered': processCentered(doc, profile, token.text); break;
        case 'section':
        case 'synopsis':
        case 'note':
        case 'boneyard_begin':
        case 'boneyard_end': processIgnored(doc, profile, token.type, token.text); break;
        default:
          if (!token.text) {
            console.log(token);
          }
          break;
      }
    });
    addPageNumbers(doc, profile);
    done(doc);
  });
}

module.exports = {
  generate: generate,
};
