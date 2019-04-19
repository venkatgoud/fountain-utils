## Utility scripts for Fountain.

### Reports

	node report_generator.js --help

Example:

To generate a file containing all the dialogs for a particular character.

	node report_generator.js --src ./samples/bigfish.fountain --pdf --char karl --out karl_dialogs.pdf

To generate a file containing all the dialogs for all characters in order.

	node report_generator.js --src ./samples/bigfish.fountain --pdf --out all_dialogs.pdf

### Transliteration/Conversion

This is primarily for Indian scripts written with a transliteration scheme. For example, 'TEnglish' is used to write Telugu screenplays using Roman script that sounds like Telugu when read.

	node converter.js --src inputFile --out outputFile 

**itrans** and **telugu** are default.

Example

To convert a **TEnglish** screenplay to తెలుగు.

	node converter.js --src samples/tenglish.fountain --out telugu_proper.fountain

To convert a తెలుగు screenplay to **TEnglish**.

	node literator.js --src samples/telugu.fountain --out tenglish.fountain --src_scheme telugu --out_scheme itrans

At the moment it only transliterates the dialogs. All other elements are left untouched. It ignores English words in the dictionary defined in the `google 10000 words` file.

### Export to 'Indian' format.

India especially in the South, the script format is different than the widely used International format. This utility will export a pdf in Indian script format.

Examples

	node pdf_generator.js --src samples/bigfish.fountain --out samples/bigfish.pdf 

	node pdf_generator.js --indian --src samples/bigfish.fountain --out samples/bigfish.pdf 
	
When the source dialogs are in Telugu.

	node pdf_generator.js --indian --lang telugu --src samples/telugu.fountain --out samples/telugu.pdf

	node pdf_generator.js --lang telugu --src samples/telugu.fountain --out samples/telugu.pdf

	

### Credits

[pdfkit](https://github.com/foliojs/pdfkit)

[Fountain.js](https://github.com/mattdaly/Fountain.js) 

[afterwriting](https://github.com/afterwriting/)

[sanscript](https://www.npmjs.com/package/sanscript)

### Issues

* The generated pdf is not Hollywood standards complaint. The margins are off. CONTD is not implemented. A page might end with a Character!
* It doesn't generate location report yet.
 
