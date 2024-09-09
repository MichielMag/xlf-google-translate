#!/usr/bin/env node
import yargs from 'yargs';
import { translate } from './';

yargs.command(
	'* <xlfFilePath> <to> <apiKey>',
	'Translate XLF file',
	(yargs => {
		yargs
			.positional('xlfFilePath', {
				describe: 'Location of the .XLF file.',
			})
			.positional('to', {
				describe:
					'Language code (e.g. NL) of the language to translate to ',
			})
			.positional('apiKey', {
				describe: 'Google Translate API key.',
			})
			.option('previous', {
				describe: 'File containing a previously made translation',
				type: 'string',
				alias: 'p',
			});
	}) as any,
	(({
		xlfFilePath,
		to,
		apiKey,
		previous,
	}: {
		xlfFilePath: string;
		to: string;
		apiKey: string;
		previous: string;
	}) => {
		console.log(`Translating ${xlfFilePath} to '${to}'.`);
		if (previous) {
			console.log('Using ' + previous);
		}
		translate(xlfFilePath, { to: to, apiKey: apiKey, previous });
	}) as any
).argv;
