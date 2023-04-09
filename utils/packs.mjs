import Datastore from "nedb";
import fs from "fs";
import gulp from "gulp";
import logger from "fancy-log";
import mergeStream from "merge-stream";
import path from "path";
import through2 from "through2";
import yargs from "yargs";
import getSubfolderName from "./folders.mjs";


/**
 * Parsed arguments passed in through the command line.
 * @type {object}
 */
const parsedArgs = yargs(process.argv).argv;

/**
 * Folder where the compiled compendium packs should be located relative to the
 * base 5e system folder.
 * @type {string}
 */
const PACK_DEST = "packs";

/**
 * Folder where source JSON files should be located relative to the 5e system folder.
 * @type {string}
 */
const PACK_SRC = "packs/_source";

/**
 * Cache of DBs so they aren't loaded repeatedly when determining IDs.
 * @type {Object<string,Datastore>}
 */
const DB_CACHE = {};


/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Clean Packs                              */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Removes unwanted flags, permissions, and other data from entries before extracting or compiling.
 * @param {object} data - Data for a single entry to clean.
 * @param {object} [options]
 * @param {boolean} [options.clearSourceId] - Should the core sourceId flag be deleted.
 */
function cleanPackEntry(data, { clearSourceId=true }={}) {
	if ( data.ownership ) data.ownership = { default: 0 };
	if ( clearSourceId ) delete data.flags?.core?.sourceId;
	delete data.flags?.importSource;
	delete data.flags?.exportSource;
	if ( data._stats?.lastModifiedBy ) data._stats.lastModifiedBy = "everyday00heroes";

	// Remove empty entries in flags
	if ( !data.flags ) data.flags = {};
	Object.entries(data.flags).forEach(([key, contents]) => {
		if ( Object.keys(contents).length === 0 ) delete data.flags[key];
	});

	// Remove mystery-man.svg from Actors
	if ( ["hero", "npc"].includes(data.type) && data.img === "icons/svg/mystery-man.svg" ) {
		data.img = "";
		data.prototypeToken.texture.src = "";
	}

	if ( data.effects ) data.effects.forEach(i => cleanPackEntry(i, { clearSourceId: false }));
	if ( data.items ) data.items.forEach(i => cleanPackEntry(i, { clearSourceId: false }));
	if ( data.system?.description?.value ) data.system.description.value = cleanString(data.system.description.value);
	if ( data.label ) data.label = cleanString(data.label);
	if ( data.name ) data.name = cleanString(data.name);
	data.sort = 0;
}


/**
 * Attempts to find an existing matching ID for an item of this name, otherwise generates a new unique ID.
 * @param {object} data - Data for the entry that needs an ID.
 * @param {string} pack - Name of the pack to which this item belongs.
 * @returns {Promise<string>} - Resolves once the ID is determined.
 */
function determineId(data, pack) {
	const db_path = path.join(PACK_DEST, `${pack}.db`);
	if ( !DB_CACHE[db_path] ) {
		DB_CACHE[db_path] = new Datastore({ filename: db_path, autoload: true });
		DB_CACHE[db_path].loadDatabase();
	}
	const db = DB_CACHE[db_path];

	return new Promise((resolve, reject) => {
		db.findOne({ name: data.name }, (err, entry) => {
			if ( entry ) {
				resolve(entry._id);
			} else {
				resolve(db.createNewId());
			}
		});
	});
}

/**
 * Removes invisible whitespace characters and normalizes single- and double-quotes.
 * @param {string} str - The string to be cleaned.
 * @returns {string} - The cleaned string.
 */
function cleanString(str) {
	return str.replace(/\u2060/gu, "").replace(/[‘’]/gu, "'").replace(/[“”]/gu, '"');
}

/**
 * Cleans and formats source JSON files, removing unnecessary permissions and flags
 * and adding the proper spacing.
 * @returns {*}
 *
 * - `gulp cleanPacks` - Clean all source JSON files.
 * - `gulp cleanPacks --pack classes` - Only clean the source files for the specified compendium.
 * - `gulp cleanPacks --pack classes --name Barbarian` - Only clean a single item from the specified compendium.
 */
function cleanPacks() {
	const packName = parsedArgs.pack;
	const entryName = parsedArgs.name?.toLowerCase();
	const folders = fs.readdirSync(PACK_SRC, { withFileTypes: true }).filter(file =>
		file.isDirectory() && ( !packName || (packName === file.name) )
	);

	const packs = folders.map(folder => {
		logger.info(`Cleaning pack ${folder.name}`);
		return gulp.src(path.join(PACK_SRC, folder.name, "/**/*.json"))
			.pipe(through2.obj(async (file, enc, callback) => {
				const json = JSON.parse(file.contents.toString());
				const name = json.name.toLowerCase();
				if ( entryName && (entryName !== name) ) return callback(null, file);
				cleanPackEntry(json);
				if ( !json._id ) json._id = await determineId(json, folder.name);
				fs.rmSync(file.path, { force: true });
				fs.writeFileSync(file.path, `${JSON.stringify(json, null, 2)}\n`, { mode: 0o664 });
				callback(null, file);
			}));
	});

	return mergeStream(packs);
}
export const clean = cleanPacks;


/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Compile Packs                            */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Compile the source JSON files into compendium packs.
 * @returns {*}
 *
 * - `gulp compilePacks` - Compile all JSON files into their NEDB files.
 * - `gulp compilePacks --pack classes` - Only compile the specified pack.
 */
function compilePacks() {
	const packName = parsedArgs.pack;
	// Determine which source folders to process
	const folders = fs.readdirSync(PACK_SRC, { withFileTypes: true }).filter(file =>
		file.isDirectory() && ( !packName || (packName === file.name) )
	);

	const packs = folders.map(folder => {
		const filePath = path.join(PACK_DEST, `${folder.name}.db`);
		fs.rmSync(filePath, { force: true });
		const db = fs.createWriteStream(filePath, { flags: "a", mode: 0o664 });
		const data = [];
		logger.info(`Compiling pack ${folder.name}`);
		return gulp.src(path.join(PACK_SRC, folder.name, "/**/*.json"))
			.pipe(through2.obj((file, enc, callback) => {
				const json = JSON.parse(file.contents.toString());
				cleanPackEntry(json);
				data.push(json);
				callback(null, file);
			}, callback => {
				data.sort((lhs, rhs) => lhs._id > rhs._id ? 1 : -1);
				data.forEach(entry => db.write(`${JSON.stringify(entry)}\n`));
				callback();
			}));
	});
	return mergeStream(packs);
}
export const compile = compilePacks;


/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Extract Packs                            */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

/**
 * Extract the contents of compendium packs to JSON files.
 * @returns {*}
 *
 * - `gulp extractPacks` - Extract all compendium NEDB files into JSON files.
 * - `gulp extractPacks --pack classes` - Only extract the contents of the specified compendium.
 * - `gulp extractPacks --pack classes --name Barbarian` - Only extract a single item from the specified compendium.
 */
function extractPacks() {
	const packName = parsedArgs.pack ?? "*";
	const entryName = parsedArgs.name?.toLowerCase();
	const packs = gulp.src(`${PACK_DEST}/**/${packName}.db`)
		.pipe(through2.obj((file, enc, callback) => {
			const filename = path.parse(file.path).name;
			const folder = path.join(PACK_SRC, filename);
			if ( !fs.existsSync(folder) ) fs.mkdirSync(folder, { recursive: true, mode: 0o775 });

			const db = new Datastore({ filename: file.path, autoload: true });
			db.loadDatabase();

			db.find({}, (err, entries) => {
				entries.forEach(async entry => {
					const name = entry.name.toLowerCase();
					if ( entryName && (entryName !== name) ) return;
					cleanPackEntry(entry);
					const output = `${JSON.stringify(entry, null, 2)}\n`;
					const outputName = `${slugify(name, {strict: true})}-${entry._id}`;
					const subfolder = path.join(folder, await getSubfolderName(entry, filename));
					if ( !fs.existsSync(subfolder) ) fs.mkdirSync(subfolder, { recursive: true, mode: 0o775 });
					fs.writeFileSync(path.join(subfolder, `${outputName}.json`), output, { mode: 0o664 });
				});
			});

			logger.info(`Extracting pack ${filename}`);
			callback(null, file);
		}));

	return mergeStream(packs);
}
export const extract = extractPacks;

/**
 * Slugify pack names in the same way Foundry does.
 */
function slugify(text, {replacement='-', strict=false}={}) {

	// Map characters to lower case ASCII
	const charMap = JSON.parse('{"$":"dollar","%":"percent","&":"and","<":"less",">":"greater","|":"or","¢":"cent","£":"pound","¤":"currency","¥":"yen","©":"(c)","ª":"a","®":"(r)","º":"o","À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","Æ":"AE","Ç":"C","È":"E","É":"E","Ê":"E","Ë":"E","Ì":"I","Í":"I","Î":"I","Ï":"I","Ð":"D","Ñ":"N","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","Ù":"U","Ú":"U","Û":"U","Ü":"U","Ý":"Y","Þ":"TH","ß":"ss","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","æ":"ae","ç":"c","è":"e","é":"e","ê":"e","ë":"e","ì":"i","í":"i","î":"i","ï":"i","ð":"d","ñ":"n","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","ù":"u","ú":"u","û":"u","ü":"u","ý":"y","þ":"th","ÿ":"y","Ā":"A","ā":"a","Ă":"A","ă":"a","Ą":"A","ą":"a","Ć":"C","ć":"c","Č":"C","č":"c","Ď":"D","ď":"d","Đ":"DJ","đ":"dj","Ē":"E","ē":"e","Ė":"E","ė":"e","Ę":"e","ę":"e","Ě":"E","ě":"e","Ğ":"G","ğ":"g","Ģ":"G","ģ":"g","Ĩ":"I","ĩ":"i","Ī":"i","ī":"i","Į":"I","į":"i","İ":"I","ı":"i","Ķ":"k","ķ":"k","Ļ":"L","ļ":"l","Ľ":"L","ľ":"l","Ł":"L","ł":"l","Ń":"N","ń":"n","Ņ":"N","ņ":"n","Ň":"N","ň":"n","Ő":"O","ő":"o","Œ":"OE","œ":"oe","Ŕ":"R","ŕ":"r","Ř":"R","ř":"r","Ś":"S","ś":"s","Ş":"S","ş":"s","Š":"S","š":"s","Ţ":"T","ţ":"t","Ť":"T","ť":"t","Ũ":"U","ũ":"u","Ū":"u","ū":"u","Ů":"U","ů":"u","Ű":"U","ű":"u","Ų":"U","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","ź":"z","Ż":"Z","ż":"z","Ž":"Z","ž":"z","ƒ":"f","Ơ":"O","ơ":"o","Ư":"U","ư":"u","ǈ":"LJ","ǉ":"lj","ǋ":"NJ","ǌ":"nj","Ș":"S","ș":"s","Ț":"T","ț":"t","˚":"o","Ά":"A","Έ":"E","Ή":"H","Ί":"I","Ό":"O","Ύ":"Y","Ώ":"W","ΐ":"i","Α":"A","Β":"B","Γ":"G","Δ":"D","Ε":"E","Ζ":"Z","Η":"H","Θ":"8","Ι":"I","Κ":"K","Λ":"L","Μ":"M","Ν":"N","Ξ":"3","Ο":"O","Π":"P","Ρ":"R","Σ":"S","Τ":"T","Υ":"Y","Φ":"F","Χ":"X","Ψ":"PS","Ω":"W","Ϊ":"I","Ϋ":"Y","ά":"a","έ":"e","ή":"h","ί":"i","ΰ":"y","α":"a","β":"b","γ":"g","δ":"d","ε":"e","ζ":"z","η":"h","θ":"8","ι":"i","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"3","ο":"o","π":"p","ρ":"r","ς":"s","σ":"s","τ":"t","υ":"y","φ":"f","χ":"x","ψ":"ps","ω":"w","ϊ":"i","ϋ":"y","ό":"o","ύ":"y","ώ":"w","Ё":"Yo","Ђ":"DJ","Є":"Ye","І":"I","Ї":"Yi","Ј":"J","Љ":"LJ","Њ":"NJ","Ћ":"C","Џ":"DZ","А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ж":"Zh","З":"Z","И":"I","Й":"J","К":"K","Л":"L","М":"M","Н":"N","О":"O","П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"Ch","Ш":"Sh","Щ":"Sh","Ъ":"U","Ы":"Y","Ь":"","Э":"E","Ю":"Yu","Я":"Ya","а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ж":"zh","з":"z","и":"i","й":"j","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sh","ъ":"u","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","ё":"yo","ђ":"dj","є":"ye","і":"i","ї":"yi","ј":"j","љ":"lj","њ":"nj","ћ":"c","ѝ":"u","џ":"dz","Ґ":"G","ґ":"g","Ғ":"GH","ғ":"gh","Қ":"KH","қ":"kh","Ң":"NG","ң":"ng","Ү":"UE","ү":"ue","Ұ":"U","ұ":"u","Һ":"H","һ":"h","Ә":"AE","ә":"ae","Ө":"OE","ө":"oe","฿":"baht","ა":"a","ბ":"b","გ":"g","დ":"d","ე":"e","ვ":"v","ზ":"z","თ":"t","ი":"i","კ":"k","ლ":"l","მ":"m","ნ":"n","ო":"o","პ":"p","ჟ":"zh","რ":"r","ს":"s","ტ":"t","უ":"u","ფ":"f","ქ":"k","ღ":"gh","ყ":"q","შ":"sh","ჩ":"ch","ც":"ts","ძ":"dz","წ":"ts","ჭ":"ch","ხ":"kh","ჯ":"j","ჰ":"h","Ẁ":"W","ẁ":"w","Ẃ":"W","ẃ":"w","Ẅ":"W","ẅ":"w","ẞ":"SS","Ạ":"A","ạ":"a","Ả":"A","ả":"a","Ấ":"A","ấ":"a","Ầ":"A","ầ":"a","Ẩ":"A","ẩ":"a","Ẫ":"A","ẫ":"a","Ậ":"A","ậ":"a","Ắ":"A","ắ":"a","Ằ":"A","ằ":"a","Ẳ":"A","ẳ":"a","Ẵ":"A","ẵ":"a","Ặ":"A","ặ":"a","Ẹ":"E","ẹ":"e","Ẻ":"E","ẻ":"e","Ẽ":"E","ẽ":"e","Ế":"E","ế":"e","Ề":"E","ề":"e","Ể":"E","ể":"e","Ễ":"E","ễ":"e","Ệ":"E","ệ":"e","Ỉ":"I","ỉ":"i","Ị":"I","ị":"i","Ọ":"O","ọ":"o","Ỏ":"O","ỏ":"o","Ố":"O","ố":"o","Ồ":"O","ồ":"o","Ổ":"O","ổ":"o","Ỗ":"O","ỗ":"o","Ộ":"O","ộ":"o","Ớ":"O","ớ":"o","Ờ":"O","ờ":"o","Ở":"O","ở":"o","Ỡ":"O","ỡ":"o","Ợ":"O","ợ":"o","Ụ":"U","ụ":"u","Ủ":"U","ủ":"u","Ứ":"U","ứ":"u","Ừ":"U","ừ":"u","Ử":"U","ử":"u","Ữ":"U","ữ":"u","Ự":"U","ự":"u","Ỳ":"Y","ỳ":"y","Ỵ":"Y","ỵ":"y","Ỷ":"Y","ỷ":"y","Ỹ":"Y","ỹ":"y","‘":"\'","’":"\'","“":"\\\"","”":"\\\"","†":"+","•":"*","…":"...","₠":"ecu","₢":"cruzeiro","₣":"french franc","₤":"lira","₥":"mill","₦":"naira","₧":"peseta","₨":"rupee","₩":"won","₪":"new shequel","₫":"dong","€":"euro","₭":"kip","₮":"tugrik","₯":"drachma","₰":"penny","₱":"peso","₲":"guarani","₳":"austral","₴":"hryvnia","₵":"cedi","₸":"kazakhstani tenge","₹":"indian rupee","₽":"russian ruble","₿":"bitcoin","℠":"sm","™":"tm","∂":"d","∆":"delta","∑":"sum","∞":"infinity","♥":"love","元":"yuan","円":"yen","﷼":"rial"}');
	let slug = text.split("").reduce((result, char) => {
		return result + (charMap[char] || char);
	}, "").trim().toLowerCase();

	// Replace slashes between words with dashes
	slug = slug.replaceAll(/(\w+)([\\|/])(\w+)/g, "$1-$3");

	// Convert any spaces to the replacement character and de-dupe
	slug = slug.replace(new RegExp('[\\s' + replacement + ']+', 'g'), replacement);

	// If we're being strict, replace anything that is not alphanumeric
	if (strict) {
		slug = slug.replace(new RegExp('[^a-zA-Z0-9' + replacement + ']', 'g'), '');
	}
	return slug;
}
