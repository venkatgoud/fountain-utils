const fs = require('fs');
const parser = require('./fountain');

function readCss() {
  var cssFile = './indian.css'

  fs.readFile(cssFile, function (err, data) {
    if (err) {
      throw err;
    }
    var css = data.toString()
    exportTo(css)
  })
}

function exportTo(css) {
  fs.readFile(inputFilename, function (err, data) {
    if (err) {
      throw err;
    }
    var screenplay = parser.parse(data.toString()).html.script

    const template = `<!doctype html>
    <html lang="en">

    <head>
        <meta charset="utf-8">
        <meta http-equiv=\"x-ua-compatible\" content=\"ie=edge\">
        <title>Indian Preview</title>
        <style type="text/css">

        body {
            background-color: #f7f7f7;
            color: #333333;
            font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;
            font-size: 14px;
            margin: 0;
        }
        ${css}
        </style>
    </head>

    <body>
        <section id="workspace" style="display: block;">
            <div id="indian-script" class="us-letter dpi100">
            <div class="page">
            ${screenplay}
            </div>
            </div>
        </section>
    </body>
    `
    console.log(template);
  });
}

const inputFilename = process.argv[2];

if (!inputFilename) {
  throw Error("Input file must be specified!");
}

readCss()
