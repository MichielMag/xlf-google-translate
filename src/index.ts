import xliff from 'xliff';
import fs from 'fs';
import { translateXlf } from './translator';
import { InputJSONXLF, OutputJSONXLF } from './interfaces';

export async function translate(
	xlfInputFile: string,
	options: {
		to: string;
		apiKey: string;
		previous?: string;
	}
) {
	// Parse input and convert to Json.
	const inputFile = fs.readFileSync(xlfInputFile, 'utf-8');
	const jsXliff: InputJSONXLF = await xliff.xliff12ToJs(inputFile);

	let translation: OutputJSONXLF;

	if (options.previous) {
		// Re-use a previous translation file
		const previousFileXliff: InputJSONXLF = await xliff.xliff12ToJs(
			fs.readFileSync(options.previous, 'utf-8')
		);

		const untranslatedEntries = getUntranslated(previousFileXliff, jsXliff);
		const newTranslations: OutputJSONXLF = await translateXlf(
			untranslatedEntries,
			options
		);

		translation = {
			sourceLanguage: newTranslations.sourceLanguage,
			resources: {
				['ng2.template']: {
					...previousFileXliff.resources['ng2.template'],
					...newTranslations.resources['ng2.template'],
				},
			},
		};
	} else {
		// No previous translation available.
		translation = await translateXlf(jsXliff, options);
	}

	// Convert output back to XLF and write.
	const xml: string = await xliff.jsToXliff12(translation);
	const fileWithLanguageCodeAppended = xlfInputFile.replace(
		/(\.[\w\d_-]+)$/i,
		`-${options.to}$1`
	);
	fs.writeFileSync(fileWithLanguageCodeAppended, xml);
	console.log('output written to', fileWithLanguageCodeAppended);
}

function getUntranslated(previous: InputJSONXLF, current: InputJSONXLF) {
	const copy = JSON.parse(JSON.stringify(current));

	for (let key of Object.keys(previous.resources['ng2.template'])) {
		delete copy.resources['ng2.template'][key];
	}

	return copy;
}
