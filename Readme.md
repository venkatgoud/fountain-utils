## Utility scripts for Fountain.

### Dialog reports

	node dialog_report.js --help

Example:

To generate a file containing all the dialogs for a particular character.

	node dialog_report.js --src ./samples/bigfish.fountain --pdf --char karl --out karl_dialogs.pdf

To generate a file containing all the dialogs for all characters in order.

	node dialog_report.js --src ./samples/bigfish.fountain --pdf --out all_dialogs.pdf

### Transliteration/Conversion

This is primarily for Indian scripts written with a transliteration scheme. For example, 'TEnglish' is used to write Telugu screenplays using Roman script that sounds like Telugu when read.

	node literator.js inputFile outputFile fromScheme toScheme

**itrans** and **telugu** are default.

Example

To convert a **TEnglish** screenplay to తెలుగు.

	node literator.js samples/tenglish.fountain telugu_proper.fountain
	node literator.js samples/tenglish.fountain telugu_proper.fountain itrans telugu

To convert a తెలుగు screenplay to **TEnglish**.

	node literator.js  samples/telugu.fountain tenglish.fountain telugu itrans

At the moment it only transliterates the dialogs. All other elements are left untouched. It ignores English words in the dictionary defined in the `word` file.

### Export to 'Indian' format.

India especially in the South, the script format is different than the widely used International format. This utility will export a pdf in Indian script format.

Example

node pdf_generator.js --src samples/bigfish.fountain --out samples/bigfish.pdf 

node pdf_generator.js --indian --src samples/bigfish.fountain --out samples/bigfish.pdf 

### Credits

[pdfkit]https://github.com/foliojs/pdfkit

[Fountain.js]https://github.com/mattdaly/Fountain.js 

[afterwriting]https://github.com/afterwriting/


### Issues
==
The generated pdf is not Hollywood standards complaint!!
 
