/**
 * Web Worker for AutoWikiBrowser script. Used to run certain tasks on a parallel process to be able to terminate it.
 * Idea from https://stackoverflow.com/a/66162733/1256925. Dirty hack workaround due to https://stackoverflow.com/q/66188950/1256925.
 * See https://en.wikipedia.org/wiki/User:Joeytje50/JWB.js for the full script, as well as licensing.
 * Licensed under GNU GPL 2. http://www.gnu.org/copyleft/gpl.html
 */

JWB.worker.function = function() {
	var ret = {};
	
	function regexMatch(str, pattern, flags, callback) {
		var re, result;
		try {
			re = new RegExp(pattern, flags);
			result = str.match(re);
		} catch(e) {
			// catch and propagate invalid regexes etc.
			callback(undefined, e);
		}
		callback(result, undefined);
	}
	ret.match = regexMatch;
	
	function regexReplace(str, pattern, flags, rWith, callback) {
		var re, result;
		try {
			re = new RegExp(pattern, flags);
			result = str.replace(re, rWith);
		} catch(e) {
			// catch and propagate invalid regexes etc.
			callback(undefined, e);
		}
		callback(result, undefined);
	}
	ret.replace = regexReplace;
	
	//function to *only* replace the parsed wikitext
	//It excludes comments (<!-- -->), and nowiki, math, source, syntaxhighlight, pre, code, gallery and timeline tags)
	//Based on http://stackoverflow.com/a/23589204/1256925
	function unparsedReplace(str, pattern, flags, rWith, callback) {
		var exclude = '(<!--[\\s\\S]*?-->|<(nowiki|math|source|syntaxhighlight|pre|gallery|timeline)[^>]*?>[\\s\\S]*?<\\/\\2>)';
		//add /i flag, to exclude the correct tags regardless of casing.
		//This won't matter for the actual replacing, as the specified flags are used there.
		var replacements = 0;
		var global = flags.indexOf('g') !== -1;
		// build regex with exclusion list.
		// This re will be case insensitive, but the actual replacement done will still be case sensitive if the 'i' flag is not given.
		// This re will also be executed globally on the string, but the separate tracker will only allow one replacement to be done if 'g' is not given.
		try {
			var re = new RegExp(exclude + '|(' + pattern + ')', flags.replace(/i|$/, 'i').replace(/g|$/, 'g'));
			str = str.replace(re, function(match, g1, g2, g3) {
				if (!global && replacements > 0) { // a replacement has already been made in non-global mode
					return match;
				} else if (g3 !== undefined) { //continue to perform replacement if the match is the group that's supposed to be the match
					replacements++; // keep track of the amount of replacements made.
					return match.replace(new RegExp(pattern, flags), rWith);
				} else { //do nothing if the match is one of the excluded groups
					return match;
				}
			});
		} catch(e) {
			// catch and propagate invalid regexes etc.
			callback(undefined, e);
		}
		callback(str, undefined);
	}
	ret.unparsedreplace = unparsedReplace;
	
	onmessage = function(e) {
		let data = e.data;
		console.log('worker message', data);
		let callback = (result, err) => postMessage({cmd: data.cmd, result: result, err: err});
		switch (data.cmd) {
			case 'match':
				regexMatch(data.str, data.pattern, data.flags, callback);
				break;
			case 'replace':
				regexReplace(data.str, data.pattern, data.flags, data.rWith, callback);
				break;
			case 'unparsedreplace':
				unparsedReplace(data.str, data.pattern, data.flags, data.rWith, callback);
				break;
			default:
				postMessage({err: 'Unknown command: ' + data.cmd});
		}
	};
	
	return ret; // return object containing synchronous functions as a fallback.
};
