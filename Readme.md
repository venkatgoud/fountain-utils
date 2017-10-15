## Utility scripts for Fountain.

### Dialog reports

To generate a file containing all the dialogs for a particular character.

	node dialog_report.js charactername inputfile outputfile

Example:

 	node dialog_report.js WILL samples/bigfish.fountain will_dialogs.txt

To generate a file containing all the dialogs for all characters in order.

	node all_dialogs.js inputfile outputfile

Example:

	node all_dialogs.js samples/bigfish.fountain all_dialogs.txt

### Transliteration/Conversion

This is primarily for non-english scripts which use a transliteration scheme to write the screenplays. For example, 'TEnglish' is used to write Telugu screenplays using Roman script that sounds like Telugu when read.

	node literator.js inputFile outputFile fromScheme toScheme

**itrans** and **telugu** are default.

Example

To convert a **TEnglish** screenplay to తెలుగు.

	node literator.js samples/tenglish.fountain telugu_proper.fountain
	node literator.js samples/tenglish.fountain telugu_proper.fountain itrans telugu

To convert a తెలుగు screenplay to **TEnglish**.

	node literator.js  samples/telugu.fountain tenglish.fountain telugu itrans

At the moment it only transliterates the dialogs and other elements are left untouched.

### Export to 'Indian' format.

India especially in the South, the script format is different than the widely used International format. This utility will export a html with Indian format.

Example

node export.js samples/bigfish.fountain > indian_format.html


### Issues
==
Parentheticals, title pages don't work well. Fountain parser includes HTML elements such as <br/>.

Options to convert other elements such as action, dialogs and all.

Make it work with prince pdf.

Add options to include scene numbers.
