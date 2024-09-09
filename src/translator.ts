// Imports the Google Cloud client library
import { v2 } from '@google-cloud/translate';
import {
	InputJSONXLF,
	NonTranslatedEntry,
	OutputJSONXLF,
	TranslatedEntry,
} from './interfaces';

let translator: v2.Translate;
function getTranslator() {
	return translator!;
}

function setTranslator(apiKey: string) {
	translator = new v2.Translate({ key: apiKey });
}

export async function translateXlf(
	jsonXlf: InputJSONXLF,
	options: { apiKey: string; to: string }
) {
	// Initialize translator entry first.
	setTranslator(options.apiKey);
	const jsonXlfCopy: InputJSONXLF = JSON.parse(JSON.stringify(jsonXlf));

	const ids = Object.keys(jsonXlfCopy.resources['ng2.template']);
	const translations: { [key: string]: TranslatedEntry } = {};
	// Use for-of loop to make sure Google Translate Requests are performed in sequence instead of parallel.
	for await (const [index, id] of ids.entries()) {
		// Translation
		const entryToTranslate = jsonXlfCopy.resources['ng2.template'][id];
		translations[id] = {
			...entryToTranslate,
			target: await translateEntry(entryToTranslate, {
				from: jsonXlfCopy.sourceLanguage,
				to: options.to,
			}),
		};
		printProgress(`( ${index + 1} / ${ids.length} )`);
	}
	console.log(); // For making sure progress is reported correctly.

	const translatedJsonXlf: OutputJSONXLF = {
		...jsonXlfCopy,
		resources: {
			['ng2.template']: {
				...jsonXlfCopy.resources['ng2.template'],
				...translations,
			},
		},
	};

	return translatedJsonXlf;
}

async function translateEntry(
	entryToTranslate: NonTranslatedEntry<string | any[]>,
	options: { from: string; to: string }
) {
	let translation: string | any;
	// Response can be either string or array.
	if (typeof entryToTranslate.source === 'string') {
		translation = await translateString(
			entryToTranslate as NonTranslatedEntry<string>,
			options
		);
	} else if (Array.isArray(entryToTranslate.source)) {
		translation = await translateArray(
			entryToTranslate as NonTranslatedEntry<any[]>,
			options
		);
	}
	return translation;
}

async function translateString(
	entryToTranslate: NonTranslatedEntry<string>,
	options: { from: string; to: string }
) {
	const [translation] = await getTranslator().translate(
		entryToTranslate.source,
		{
			from: options.from,
			to: options.to,
		}
	);

	return translation;
}

async function translateArray(
	entryToTranslate: NonTranslatedEntry<any[]>,
	options: { from: string; to: string }
) {
	const translationArray: string[] = [];
	for (let obj of entryToTranslate.source) {
		if (typeof obj === 'string') {
			const [translation] = await getTranslator().translate(obj, {
				from: options.from,
				to: options.to,
			});
			translationArray.push(translation);
		} else {
			translationArray.push(obj);
		}
	}

	return translationArray;
}

function printProgress(progress: string) {
	process.stdout.clearLine(1);
	process.stdout.cursorTo(0);
	process.stdout.write(progress);
}
