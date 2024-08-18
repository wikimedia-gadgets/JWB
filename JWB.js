/** <nowiki>
 * Install this script by pasting the following in your personal JavaScript file:

mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Joeytje50/JWB.js/load.js&action=raw&ctype=text/javascript');

 * Or for users on en.wikipedia.org:

{{subst:lusc|User:Joeytje50/JWB.js/load.js}}

 * Note that this script will only run on the 'Project:AutoWikiBrowser/Script' page.
 * This script is based on the downloadable AutoWikiBrowser.
 * 
 * @licence
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 * @version 4.4.4
 * @author Joeytje50
 * </nowiki>
 */

window.JWBdeadman = false; // ADMINS: in case of fire, set this variable to true to disable this entire tool for all users

//TODO: more advanced pagelist-generating options
//TODO: generate page list based on images on a page
//TODO: Add feature to perform general cleanup (<table> to {|, fullurl-links to wikilinks, removing underscores from wikilinks)
//TODO: Add report button to AJAX error alert box
//TODO: Re-add errored pages to the page list
//TODO: Automatically generate full list of protection levels
//TODO: Add 'Ignore quotes' alongside 'Ignore unparsed content'; for example: Ignore [] Unparsed content [] Quotes
//TODO: Read Wikipedia:AutoWikiBrowser/Config for when not to apply typo fixes
//TODO: RETF disable any \b and some other cases
//TODO: Fix deletedrevs deprecated API

//Cleanup / modernize:
// .indexOf('') != -1 -> .includes()
// mw for requests, instead of ajax
// Optional?.chaining?.properties

/***** Global object/variables *****/
window.JWB = {}; //The main global object for the script.

(function() {
	// Easier way to change import location for local debugging etc.
	JWB.imports = {
		'JWB.css':	'//en.wikipedia.org/w/index.php?title=User:Joeytje50/JWB.css&action=raw&ctype=text/css',
		'i18n.js':	'//en.wikipedia.org/w/index.php?title=User:Joeytje50/JWB.js/i18n.js&action=raw&ctype=text/javascript',
		'i18n':		{},
		'RETF.js':	'//en.wikipedia.org/w/index.php?title=User:Joeytje50/RETF.js&action=raw&ctype=text/javascript',
		'worker.js':'//en.wikipedia.org/w/index.php?title=User:Joeytje50/JWB.js/worker.js&action=raw&ctype=text/javascript',
	};
	
	let objs = ['page', 'api', 'worker', 'fn', 'pl', 'messages', 'setup', 'settings', 'ns'];
	for (let i=0;i<objs.length;i++) {
		JWB[objs[i]] = {};
	}
	JWB.summarySuffix = ' (via JWB)';
	if (document.location.hostname == 'en.wikipedia.org') JWB.summarySuffix = ' (via [[WP:JWB]])';
	JWB.lang = mw.config.get('wgUserLanguage').replace('-', '_');
	JWB.contentLang = mw.config.get('wgContentLanguage').replace('-', '_');
	JWB.index_php = mw.config.get('wgScript');
	JWB.isStopped = true;
	JWB.tooltip = window.tooltipAccessKeyPrefix || '';
	let configext = 'js';
	if (document.location.hostname.split('.').slice(-2).join('.') == 'wikia.com' || document.location.hostname.split('.').slice(-2).join('.') == 'fandom.com') {
		//LEGACY: fallback to settings on css for Wikia; uses JSON now.
		configext = 'css';
	}
	JWB.settingspage = 'JWB-settings.'+configext;
	if (window.hasOwnProperty('JWBSETTINGS')) {
		JWB.settingspage = JWBSETTINGS+'-settings.'+configext;
		delete window.JWBSETTINGS; //clean up the global variable
	}
	JWB.hasJSON = false; // whether or not the wiki supports JSON userpages (mw 1.31+).
	JWB.hasSMW = false; // whether or not the wiki has SMW installed.
})();

/***** User verification *****/

(function() {
	if (mw.config.get('wgCanonicalNamespace')+':'+mw.config.get('wgTitle') !== 'Project:AutoWikiBrowser/Script' || JWB.allowed === false || mw.config.get('wgUserName') === null) {
		JWB.allowed = false;
		return;
	}
	mw.loader.load(JWB.imports['JWB.css'], 'text/css');
	mw.loader.load('mediawiki.diff.styles');
	new mw.Api().loadMessagesIfMissing( [ 'pagecategorieslink', 'pagecategorieslink' ] );

	JWB.langs = [];

	$.getScript(JWB.imports['i18n.js'], function() {
		if (JWB.allowed === false) {
			JWB.checkInit(); // deny access without attempting to load other languages.
			return;
		}

		if (JWB.lang !== 'en' && JWB.imports.i18n.hasOwnProperty(JWB.lang)) {
			JWB.langs.push(JWB.imports.i18n[JWB.lang]);
			JWB.messages[JWB.lang] = JWB.messages[JWB.lang] || null;
		} else if (JWB.lang !== 'en' && JWB.lang !== 'qqx') {
			// this only happens if the language file does not exist.
			JWB.lang = 'en';
		}
		if (JWB.contentLang !== 'en' && JWB.contentLang !== JWB.lang && JWB.imports.i18n.hasOwnProperty(JWB.contentLang)) {
			JWB.langs.push(JWB.imports.i18n[JWB.contentLang]);
			JWB.messages[JWB.contentLang] = JWB.messages[JWB.contentLang] || null;
		}

		if (JWB.langs.length) {
			$.when.apply($, JWB.langs.map(url => $.getScript(url))).done(function(r) {
				JWB.checkInit();
			});
		} else { // no more languages to load.
			console.log('no languages needed loading');
			JWB.checkInit();
		}
	});
	
	//RegEx Typo Fixing
	$.getScript(JWB.imports['RETF.js'], function() {
			$('#refreshRETF').click(RETF.load);
	});

	if (window.JWBdeadman === true) {
		window.JWB = false; // disable all access
		alert("This tool has been temporarily been disabled by Wikipedia admins due to issues it would otherwise cause. Please check back soon to see if it is working again.");
		return false;
	} else if (!window.Worker) {
		// https://caniuse.com/webworkers - this should not happen for any sensible human being. Either you're on IE<10, or you're just testing my patience.
		alert("Web Workers are not supported in this browser. Please use a more modern browser to use JWB. Most matching and replacing features are not supported in this browser.");
	}

	(new mw.Api()).get({
		action: 'query',
		titles: 'Project:AutoWikiBrowser/CheckPageJSON',
		prop: 'info|revisions',
		meta: 'userinfo|siteinfo',
		rvprop: 'content',
		rvlimit: 1,
		uiprop: 'groups',
		siprop: 'namespaces|usergroups|extensions',
		indexpageids: true,
		format: 'json',
	}).done(function(response) {
		if (response.error) {
			alert('API error: ' + response.error.info);
			JWB = false; //preventing further access. No verification => no access.
			return;
		}
		JWB.ns = response.query.namespaces; //saving for later
		
		// This will execute before JWB.init() and therefore before JWB.setup.load() loading the user's settings.
		let wikigroups = response.query.usergroups;
		for (var u of wikigroups) {
			if (u.rights.indexOf('edituserjson') !== -1) {
				JWB.hasJSON = true;
				break;
			}
		}
		
		// Check if we've got SMW on this wiki
		let extensions = response.query.extensions;
		for (var e of extensions) {
			if (e.name == "SemanticMediaWiki") {
				JWB.hasSMW = true;
				break;
			}
		}
		
		JWB.username = response.query.userinfo.name; //preventing any "hacks" that change wgUserName or mw.config.wgUserName
		var groups = response.query.userinfo.groups;
		var page = response.query.pages[response.query.pageids[0]];
		var users = [];
		var bots = [];
		JWB.sysop = groups.indexOf('sysop') !== -1;
		if (response.query.pageids[0] !== '-1') {
			var checkPageData = JSON.parse(page.revisions[0]['*']);
			users = checkPageData.enabledusers;
			if ("enabledbots" in checkPageData) {
				bots = checkPageData.enabledbots;
			}
		} else {
			users = false; //fallback when page doesn't exist
			if (JWB.sysop) { // Check and inform admins if their checkpage is the unsupported format.
				(new mw.Api()).get({
					action: 'query',
					titles: 'Project:AutoWikiBrowser/CheckPage',
					prop: 'info',
					indexpageids: true,
				}).done(function(oldpage){
					var q = oldpage.query;
					if (q.pageids[0] != '-1' && !q.pages[q.pageids[0]].hasOwnProperty('redirect')) {
						// CheckPageJSON does not exist, and CheckPage does exist, and is not a redirect.
						// This indicates the checkpage needs to be ported to JSON. Notify admins.
						prompt('Warning: The AWB checkpage found at Project:AutoWikiBrowser/CheckPage is no longer supported.\n'+
								'Please convert this checkpage to a JSON checkpage. See the URL below for more information.\n'+
								'After creating the JSON checkpage, you can use "Special:ChangeContentModel" to change the content model to JSON.',
								'https://en.wikipedia.org/wiki/Wikipedia:AutoWikiBrowser/CheckPage_format');
					}
				});
			}
		}
		JWB.bot = groups.indexOf('bot') !== -1 && (users === false || bots.includes(JWB.username));
		// Temporary global debugging variables
		JWB.debug = [groups.indexOf('bot'), users === false, bots && bots.indexOf(JWB.username)];
		if (JWB.username === "Joeytje50" && response.query.userinfo.id === 13299994) {//TEMP: Dev full access to entire interface.
			JWB.bot = true;
			users.push("Joeytje50");
		}
		if (JWB.sysop || response.query.pageids[0] === '-1' || users === false || users.includes(JWB.username) || bots.includes(JWB.username)) {
			JWB.allowed = true;
			JWB.checkInit(); //init if everything necessary has been loaded
		} else {
			if (allLoaded) {
				//run this after messages have loaded, so the message that shows is in the user's language
				alert(JWB.msg('not-on-list'));
			}
			JWB = false; //prevent further access
		}
	}).fail(function(xhr, error) {
		alert(JWB.msg('verify-error') + '\n' + error);
		JWB = false; //preventing further access. No verification => no access.
	});
})();

/***** API functions *****/

//Main template for API calls
JWB.api.call = function(data, callback, onerror) {
	data.format = 'json';
	if (data.action !== 'query' && data.action !== 'compare' && data.action !== 'ask') {
		data.bot = true; // mark edits as bot
	}
	$.ajax({
		data: data,
		dataType: 'json',
		url: mw.config.get('wgScriptPath') + '/api.php',
		type: 'POST',
		success: function(response) {
			if (response.error) {
				if (onerror && onerror(response, 'API') === false) return;
				alert('API error: ' + response.error.info);
				JWB.stop();
			} else {
				callback(response);
			}
		},
		// onerror: if it exists and returns false, do not show error alert. Otherwise, do show alert.
		error: function(xhr, error) {
			if (onerror && onerror(error, 'AJAX') === false) return;
			alert('AJAX error: ' + error);
			JWB.stop();
		}
	});
};

//Get page diff, and process it for more interactivity
JWB.api.diff = function(callback) {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.status('diff');
	var editBoxInput = $('#editBoxArea').val();
	var redirect = $('input.redirects:checked').val();
	var data = {
		action: 'compare',
		indexpageids: true,
		fromtitle: JWB.page.name,
		//toslots: 'main', // TODO: Once this gets supported more widely, convert to the non-deprecated toslots system.
		//'totext-main': editBoxInput,
		totext: editBoxInput,
		topst: true,
	};
	if (redirect=='follow') data.redirects = true;
	JWB.api.call(data, function(response) {
		var diff;
		diff = response.compare['*'];
		if (diff === '') {
			diff = '<h2>'+JWB.msg('no-changes-made')+'</h2>';
		} else {
			diff = '<table class="diff">'+
				'<colgroup>'+
					'<col class="diff-marker">'+
					'<col class="diff-content">'+
					'<col class="diff-marker">'+
					'<col class="diff-content">'+
				'</colgroup>'+
				'<tbody>'+diff+'</tbody></table>';
		}
		$('#resultWindow').html(diff);
		$('.diff-lineno').each(function() {
			var lineNumMatch = $(this).html().match(/\d+/);
			if (lineNumMatch) {
				$(this).parent().attr('data-line',parseInt(lineNumMatch[0])-1).addClass('lineheader');
			}
		});
		$('table.diff tr').each(function() { //add data-line attribute to every line, relative to the previous one. Used for click event.
			if (!$(this).next().is('[data-line]') && !$(this).next().has('td.diff-deletedline + td.diff-empty')) {
				$(this).next().attr('data-line',parseInt($(this).data('line'))+1);
			} else if ($(this).next().has('td.diff-deletedline + td.diff-empty')) {
				$(this).next().attr('data-line',$(this).data('line')); //copy over current data-line for deleted lines to prevent them from messing up counting.
			}
		});
		JWB.status('done', true);
		if (typeof(callback) === 'function') {
			callback();
		}
	}, function(err, type) {
		if (type == 'API' && err.error.code == 'missingtitle') {
			// missingtitle is to be expected when editing a page that doesn't exist; just show a message and move on.
			$('#resultWindow').html('<span style="font-weight:bold;color:red;">'+JWB.msg('page-not-exists')+'</span>');
			JWB.status('done', true);
			if (typeof(callback) === 'function') {
				callback();
			}
			return false; // stop propagation of error; do not show alerts.
		}
	});
};

//Retrieve page contents/info, process them, and store information in JWB.page object.
JWB.api.get = function(pagename) {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.pageCount();
	if (!JWB.list[0] || JWB.isStopped) {
		return JWB.stop();
	}
	if (pagename === '#PRE-PARSE-STOP') {
		var curval = $('#articleList').val();
		$('#articleList').val(curval.substr(curval.indexOf('\n') + 1));
		$('#preparse').prop('checked', false);
		JWB.stop();
		return;
	}
	let cgns = JWB.ns[14]['*'];
	let skipcg = $('#skipCategories').val();
	// prepend Category: before all categories and turn CSV(,) into CSV(|).
	skipcg = skipcg.replace(new RegExp('(^|,|\\|)('+cgns+':)?', 'gi'), '|'+cgns+':').substr(1);
	var redirect = $('input.redirects:checked').val();
	var data = {
		action: 'query',
		prop: 'info|revisions|categories',
		inprop: 'watched|protection',
		type: 'csrf|watch',
		titles: pagename,
		rvprop: 'content|timestamp|ids',
		rvlimit: '1',
		cllimit: 'max',
		clcategories: skipcg,
		indexpageids: true,
		meta: 'userinfo|tokens',
		uiprop: 'hasmsg'
	};
	if (redirect=='follow'||redirect=='skip') data.redirects = true;
	if (JWB.sysop) {
		data.list = 'deletedrevs';
	}
	JWB.status('load-page');
	JWB.api.call(data, function(response) {
		if (response.query.userinfo.hasOwnProperty('messages')) {
			var view = mw.config.get('wgScriptPath') + '?title=Special:MyTalk';
			var viewNew = view + '&diff=cur';
			JWB.status(
				'<span style="color:red;font-weight:bold;">'+
					JWB.msg('status-newmsg', 
						'<a href="'+view+'" target="_blank">'+JWB.msg('status-talklink')+'</a>',
						'<a href="'+viewNew+'" target="_blank">'+JWB.msg('status-difflink')+'</a>')+
				'</span>', true);
			alert(JWB.msg('new-message'));
			JWB.stop();
			return;
		}
		JWB.page = response.query.pages[response.query.pageids[0]];
		JWB.page.token = response.query.tokens.csrftoken;
		JWB.page.watchtoken = response.query.tokens.watchtoken;
		JWB.page.name = JWB.list[0].split('|')[0];
	 	var varOffset = JWB.list[0].indexOf('|') !== -1 ? JWB.list[0].indexOf('|') + 1 : 0;
	 	JWB.page.pagevar = JWB.list[0].substr(varOffset);
		JWB.page.content = JWB.page.revisions ? JWB.page.revisions[0]['*'] : '';
		JWB.page.exists = !response.query.pages["-1"];
		JWB.page.deletedrevs = response.query.deletedrevs;
		JWB.page.watched = JWB.page.hasOwnProperty('watched');
		JWB.page.protections = JWB.page.restrictiontypes;

		if (response.query.redirects) {
			JWB.page.name = response.query.redirects[0].to;
		}
		// check for skips that can be determined before replacing
		if (!JWB.fn.allowBots(JWB.page.content, JWB.username) || !JWB.fn.allowBots(JWB.page.content)) {
			// skip if {{bots}} template forbids editing on this page by user OR by JWB in general
			JWB.log('nobots', JWB.page.name);
			return JWB.next();
		} else if (JWB.page.categories !== undefined || // skip because of a matching category as passed via clcategories.
				($('#exists-no').prop('checked') && !JWB.page.exists) ||
				($('#exists-yes').prop('checked') && JWB.page.exists) ||
				(redirect==='skip' && response.query.redirects) // variable  redirect  is defined outside this callback function.
		) {
			// simple skip rules
			JWB.log('skip', JWB.page.name);
			return JWB.next();
		}
		// Check skip contains rules.
		var containRegex = $('#containRegex').prop('checked'),
			containFlags = $('#containFlags').val();
		var skipContains, skipNotContains;
		if (containRegex) {
			JWB.status('check-skips');
			var skipping = false; // for tracking if match is found in synchronous calls.
			if ($('#skipContains').val().length) {
				JWB.worker.match(JWB.page.content, $('#skipContains').val(), containFlags, function(result, err) {
					console.log('Contains', result, err);
					if (result !== null && err === undefined) {
						JWB.log('skip', JWB.page.name);
						JWB.next(); // next() also cancels the skipNotContains.
						skipping = true;
						return;
					} // else continue with the queued worker job that checks skipNotContains
				});
			}
			if (skipping) {
				console.log('skipped page before replaces');
				return;
			}
			if ($('#skipNotContains').val().length) {
				JWB.worker.match(JWB.page.content, $('#skipNotContains').val(), containFlags, function(result, err) {
					console.log('Not contains', result, err);
					if (result === null && err === undefined) {
						JWB.log('skip', JWB.page.name);
						JWB.next(); // also cancels the replace
						skipping = true;
						return;
					} // else move on to replacing
				});
			}
			if (skipping) {
				console.log('skipped page before replaces');
				return;
			}
		} else {
			skipContains = $('#skipContains').val();
			skipNotContains = $('#skipNotContains').val();
			if ((skipContains && JWB.page.content.includes(skipContains)) ||
				(skipNotContains && !JWB.page.content.includes(skipNotContains))) {
				console.log('skipped page before replaces');
				return JWB.next();
			}
			JWB.status('done', true);
		}
		JWB.replace(JWB.page.content, function(newContent) {
			if (JWB.isStopped === true) return;
			if ($('#skipNoChange').prop('checked') && JWB.page.content === newContent) { //skip if no changes are made
				JWB.log('skip', JWB.page.name);
				return JWB.next();
			} else {
				JWB.editPage(newContent);
			}
			JWB.updateButtons();
		});
	});
};

//Some functions with self-explanatory names:
JWB.api.submit = function(page) {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.status('submit');
	var summary = $('#summary').val();
	if ($('#summary').parent('label').hasClass('viaJWB')) summary += JWB.summarySuffix;
	if ((typeof page === 'string' && page !== JWB.page.name) || $('#currentpage a').html().replace(/&amp;/g, '&') !== JWB.page.name) {
		console.log(page, JWB.page.name, $('#currentpage a').html());
		JWB.stop();
		alert(JWB.msg('autosave-error', JWB.msg('tab-log')));
		$('#currentpage').html(JWB.msg('editbox-currentpage', ' ', ' '));
		return;
	}
	var newval = $('#editBoxArea').val();
	var diffsize = newval.length - JWB.page.content.length;
	if ($('#sizelimit').val() != 0 && Math.abs(diffsize) > parseInt($('#sizelimit').val())){
		alert(JWB.msg('size-limit-exceeded', diffsize > 0 ? '+'+diffsize : diffsize));
		JWB.status('done', true);
		return;
	}
	var data = {
		title: JWB.page.name,
		summary: summary,
		action: 'edit',
		//tags: 'JWB',
		basetimestamp: JWB.page.revisions ? JWB.page.revisions[0].timestamp : '',
		token: JWB.page.token,
		text: newval,
		watchlist: $('#watchPage').val()
	};
	if ($('#minorEdit').prop('checked')) data.minor = true;
	JWB.api.call(data, function(response) {
		JWB.log('edit', response.edit.title, response.edit.newrevid);
	}, function(error, errtype) {
		var cont = false;
		if (errtype == 'API') {
			cont = confirm("API error: " + error.error.info + "\n" + JWB.msg('confirm-continue'));
		} else {
			cont = confirm("AJAX error: " + error + "\n" + JWB.msg('confirm-continue'));
		}
		if (!cont) {
			JWB.stop();
		}
		return false; // do not fall back on default error handling
	});
	// While the edit is submitting, continue to the next page to edit.
	JWB.status('done', true);
	JWB.next();
};
JWB.api.preview = function() {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.status('preview');
	JWB.api.call({
		title: JWB.page.name,
		action: 'parse',
		pst: true,
		text: $('#editBoxArea').val()
	}, function(response) {
		$('#resultWindow').html(response.parse.text['*']);
		$('#resultWindow div.previewnote').remove();
		var cglist = response.parse.categories;
		if (cglist.length > 0) {
			var cgtext = mw.message('pagecategories', cglist.length).text(),
				cglink = mw.message('pagecategorieslink').text();
			// set defaults if MediaWiki:Pagecategories(link) have not loaded correctly:
			if (cgtext[0] == '\u29FC') cgtext = 'Categories';
			if (cglink[0] == '\u29FC') cglink = 'Special:Categories';
			var $footer = $('<footer/>').addClass('catlinks')
										.append('<a href="/wiki/'+encodeURIComponent(cglink)+'" title="'+cglink+'">'+cgtext+'</a>: <ul></ul>');
			var $ul = $footer.children('ul');
			for (var i=0;i<cglist.length;i++) {
				var redlink = cglist[i].missing === undefined ? '' : ' class="new"';
				var cg = cglist[i]['*'];
				$ul.append('<li><a href="/wiki/Category:' + encodeURIComponent(cg) + '" title="' + cg + '"' + redlink + '>' + cg + '</a></li>');
			}
			$footer.appendTo('#resultWindow');
		}
		JWB.status('done', true);
	});
};
JWB.api.move = function() {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.status('move');
	var topage = $('#moveTo').val().replace(/\$x/gi, JWB.page.pagevar);
	var summary = $('#summary').val();
	if ($('#summary').parent('label').hasClass('viaJWB')) summary += JWB.summarySuffix;
	var data = {
		action: 'move',
		from: JWB.page.name,
		to: topage,
		token: JWB.page.token,
		reason: summary,
		ignorewarnings: 'yes'
	};
	if ($('#moveTalk').prop('checked')) data.movetalk = true;
	if ($('#moveSubpage').prop('checked')) data.movesubpages = true;
	if ($('#suppressRedir').prop('checked')) data.noredirect = true;
	JWB.api.call(data, function(response) {
		JWB.log('move', response.move.from, response.move.to);
		JWB.status('done', true);
		if (!$('#moveTo').val().match(/\$x/i)) $('#moveTo').val('')[0].focus(); //clear entered move-to pagename if it's not based on the pagevar
		JWB.next(topage);
	});
};
JWB.api.del = function() {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	var del_action = (!JWB.page.exists ? 'un' : '') + 'delete';
	JWB.status(del_action);
	var summary = $('#summary').val();
	if ($('#summary').parent('label').hasClass('viaJWB')) summary += JWB.summarySuffix;
	var data = {
		action: del_action,
		title: JWB.page.name,
		token: JWB.page.token,
		reason: summary
	};
	if ($('#deleteTalk').prop('checked')) data[del_action + 'talk'] = true;
	JWB.api.call(data, function(response) {
		JWB.log(del_action, (response['delete']||response.undelete).title);
		JWB.status('done', true);
		JWB.next(response.undelete && response.undelete.title);
	});
};
JWB.api.protect = function() {
	if (JWB.isStopped) return; // prevent new API calls when stopped
	JWB.status('protect');
	var summary = $('#summary').val();
	if ($('#summary').parent('label').hasClass('viaJWB')) summary += JWB.summarySuffix;
	var editprot = $('#editProt').val();
	var moveprot = $('#moveProt').val() || editprot;
	var uploadprot = $('#uploadProt').val() || editprot;
	var protstring = 'edit='+editprot+'|move='+moveprot;
	if (!JWB.page.exists)
		protstring = 'create='+editprot;
	if (JWB.page.protections.includes('upload'))
		protstring += '|upload='+uploadprot;
	JWB.api.call({
		action: 'protect',
		title: JWB.page.name,
		token: JWB.page.token,
		reason: summary,
		expiry: $('#protectExpiry').val()!==''?$('#protectExpiry').val():'infinite',
		protections: protstring,
	}, function(response) {
		var protactions = '';
		var prots = response.protect.protections;
		for (var i=0;i<prots.length;i++) {
			if (typeof prots[i].edit == 'string') {
				protactions += ' edit: '+(prots[i].edit || 'all');
			} else if (typeof prots[i].move == 'string') {
				protactions += ' move: '+(prots[i].move || 'all');
			} else if (typeof prots[i].create == 'string') {
				protactions += ' create: '+(prots[i].create || 'all');
			} else if (typeof prots[i].upload == 'string') {
				protactions += ' upload: '+(prots[i].upload || 'all');
			}
		}
		protactions += ' expires: '+prots[0].expiry;
		JWB.log('protect', response.protect.title, protactions);
		JWB.status('done', false);
		JWB.next(response.protect.title);
	});
};

JWB.api.watch = function() {
	JWB.status('watch');
	var data = {
		action: 'watch',
		title: JWB.page.name,
		token: JWB.page.watchtoken
	};
	if (JWB.page.watched) data.unwatch = true;
	JWB.api.call(data, function(response) {
		JWB.status('<span style="color:green;">'+
			JWB.msg('status-watch-'+(JWB.page.watched ? 'removed' : 'added'), "'"+JWB.page.name+"'")+
		'</span>', true);
		JWB.page.watched = !JWB.page.watched;
		$('#watchNow').html( JWB.msg('watch-' + (JWB.page.watched ? 'remove' : 'add')) );
	});
};

/***** Pagelist functions *****/

JWB.pl.iterations = 0;
JWB.pl.done = true;

JWB.pl.stop = function() {
	if (JWB.pl.done) {
		JWB.pl.iterations = 0;
		$('#pagelistPopup [disabled]:not(fieldset [disabled]), #pagelistPopup legend input, #pagelistPopup button').prop('disabled', false);
		$('#pagelistPopup legend input').trigger('change');
		$('#pagelistPopup button img').remove();
	}
};

JWB.pl.getNSpaces = function() {
	var list = $('#pagelistPopup [name="namespace"]')[0];
	return $('#pagelistPopup [name="namespace"]').val().join('|'); //.val() returns an array of selected options.
};

JWB.pl.getList = function(abbrs, lists, data) {
	$('#pagelistPopup button, #pagelistPopup input, #pagelistPopup select, #pagelistPopup button').prop('disabled', true);
	JWB.pl.iterations++;
	if (data.ask !== undefined) {
		JWB.pl.SMW(data.ask); // execute SMW call in parallel
		JWB.pl.done = false;
		data.ask = undefined;
	}
	if (!abbrs.length) {
		JWB.pl.done = true;
		return; // don't execute the rest; only a SMW query was entered.
	}
	data.action = 'query';
	var nspaces = JWB.pl.getNSpaces();
	for (let i=0;i<abbrs.length;i++) {
		if (nspaces) data[abbrs[i]+'namespace'] = data[abbrs[i]+'namespace'] || nspaces; // if namespaces are already set, use that instead (for apnamespace)
		data[abbrs[i]+'limit'] = 'max';
	}
	let linksList = lists.indexOf('links');
	if (linksList !== -1) {
		data.prop = 'links';
		lists.splice(linksList, 1);
	}
	data.list = lists.join('|');
	console.log('generating:', data);
	JWB.api.call(data, function(response) {
		var maxiterate = 100; //allow up to 100 consecutive requests at a time to avoid overloading the server.
		if (!response.query) response.query = {};
		if (response.watchlistraw) response.query.watchlistraw = response.watchlistraw; //adding some consistency
		var plist = [];
		if (response.query.pages) {
			var links;
			for (var id in response.query.pages) {
				links = response.query.pages[id].links;
				for (let i=0;i<links.length;i++) {
					plist.push(links[i].title);
				}
			}
		}
		for (var l in response.query) {
			if (l === 'pages') continue;
			for (let i=0;i<response.query[l].length;i++) {
				plist.push(response.query[l][i].title);
			}
		}
		//add the result to the pagelist immediately, as opposed to saving it all up and adding in 1 go like AWB does
		$('#articleList').val($.trim($('#articleList').val()) + '\n' + plist.join('\n'));
		JWB.pageCount();
		var cont = response.continue;
		console.log("Continue",JWB.pl.iterations, cont);
		if (cont && JWB.pl.iterations <= maxiterate) {
			var lists = [];
			if (response.query) { //compatibility with the code I wrote for the old query-continue. TODO: make this unnecessary?
				for (var list in response.query) {
					lists.push(list); //add to the new array of &list= values
				}
			}
			var abbrs = [];
			for (var abbr in cont) {
				data[abbr] = cont[abbr]; //add the &xxcontinue= value to the data
				if (abbr != 'continue') {
					abbrs.push(abbr.replace('continue','')); //find out what xx is and add it to the list of abbrs
				}
			}
			JWB.pl.getList(abbrs, lists, data); //recursive function to get every page of a list
		} else {
			if (JWB.pl.iterations > maxiterate) {
				JWB.status('pl-over-lim', true);
			} else {
				JWB.status('done', true);
			}
			JWB.pl.stop(); // if JWB.pl.done == true show stopped interface. Otherwise mark as done.
			JWB.pl.done = true;
		}
	}, function() { //on error, simply reset and let the user work with what he has
		JWB.status('done', true);
		JWB.pl.stop();
		JWB.pl.done = true;
	});
};

JWB.pl.SMW = function(query) {
	var data = {
		action: 'ask',
		query: query
	};
	JWB.api.call(data, function(response) {
		console.log(response);
		let list = response.query.results;
		let pagevar = response.query.printrequests[1];
		let pagevar_type = pagevar && pagevar.typeid;
		if (pagevar) {
			// either pagevar === undefined, or it's the first printrequest.
			pagevar = pagevar.label;
		}
		let plist = [];
		for (let l in list) {
			let page = list[l];
			let name = page.fulltext;
			let suff;
			if (pagevar) try {
				let val = page.printouts[pagevar][0];
				if (!val) continue; // this page does not contain this property.
				switch (pagevar_type) {
					case '_boo':
						suff = val == 't'; // true if 't' else false;
						break;
					case '_wpg':
						suff = val.fulltext;
						break;
					case '_dat':
						// val.raw is also available but the unconventional format makes it a lot less convenient.
						suff = val.timestamp;
						break;
					case '_qty':
						suff = val.value + ' ' + val.unit;
						break;
					case '_mlt_rec':
						// I doubt this is used anywhere, but it's not too hard to support.
						suff = val.Text.item[0];
						break;
					case '_ref_rec':
						// not supported; references contain too many properties.
						break;
					default:
						suff = val;
				}
			} catch(e) {
				console.error(e); // show error but ignore. Something is wrong in SMW query/api.
			}
			if (suff) {
				plist.push(name + '|' + suff);
			} else {
				plist.push(name);
			}
		}
		$('#articleList').val($.trim($('#articleList').val()) + '\n' + plist.join('\n'));
		JWB.pageCount();
		JWB.pl.stop(); // if JWB.pl.done == true show stopped interface. Otherwise mark as done.
		JWB.pl.done = true;
	});
};

//JWB.pl.getList(['wr'], ['watchlistraw'], {}) for watchlists
JWB.pl.generate = function() {
	var $fields = $('#pagelistPopup fieldset').not('[disabled]');
	$('#pagelistPopup').find('button[type="submit"]').append('<img src="//upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif" width="15" height="15" alt="'+JWB.msg('status-alt')+'"/>');
	var abbrs = [],
		lists = [],
		data = {'continue': ''};
	$fields.each(function() {
		var list = $(this).find('legend input').attr('name');
		var abbr;
		if (list === 'linksto') { //Special case since this fieldset features 3 merged lists in 1 fieldset
			if (!$('[name="title"]').val()) return;
			$('[name="backlinks"], [name="embeddedin"], [name="imageusage"]').filter(':checked').each(function() {
				var val = this.value;
				abbrs.push(val);
				lists.push(this.name);
				data[val+'title'] = $('[name="title"]').val();
				data[val+'filterredir'] = $('[name="filterredir"]:checked').val();
				if ($('[name="redirect"]').prop('checked')) data[val+'redirect'] = true;
			});
		} else if (list === 'smwask') {
			data.ask = $(this).find('#smwquery').val();
		} else { //default input system
			if ($(this).find('#psstrict').prop('checked')) {
				// different list if prefixsearch is strict
				let $input = $(this).find('#psstrict');
				list = $input.attr('name');
				abbr = $input.val();
			} else {
				abbr = $(this).find('legend input').val();
			}
			lists.push(list);
			abbrs.push(abbr);
			$(this).find('input').not('legend input').each(function() {
				if ((this.type === 'checkbox' || this.type === 'radio') && this.checked === false) return;
				if (this.id == 'psstrict') return; // ignore psstrict; it only affects how pssearch is handled
				var name, val;
				if (this.id == 'cmtitle') {
					// making sure the page has a Category: prefix, in case the user left it out
					let cgns = JWB.ns[14]['*']; // name for Category: namespace
					if (!this.value.startsWith(cgns+':')) {
						this.value = cgns+':'+this.value;
					}
				}
				if (this.id == 'pssearch' && this.name == 'apprefix') {
					// apprefix needs namespace separate from pagename
					name = this.name;
					let split = this.value.split(':');
					val = split[1] || split[0];
					let nsid = 0;
					if (split[1]) { // if a namespace is given
						for (let ns in JWB.ns) {
							if (JWB.ns[ns]['*'] == split[0]) {
								nsid = JWB.ns[ns].id;
								break;
							}
						}
					}
					data.apnamespace = nsid;
				} else {
					name = this.name;
					val = this.value;
				}
				if (data.hasOwnProperty(name)) {
					data[name] += '|'+val;
				} else {
					data[name] = val;
				}
			});
			console.log(abbrs, lists, data);
		}
	});
	if (abbrs.length || data.ask) JWB.pl.getList(abbrs, lists, data);
	else JWB.pl.stop();
};

/***** Setup functions *****/

JWB.setup.save = function(name) {
	name = name || prompt(JWB.msg('setup-prompt', JWB.msg('setup-prompt-store')), $('#loadSettings').val());
	if (name === null) return;
	var self = JWB.settings[name] = {
		string: {},
		bool: {},
		replaces: []
	};
	//inputs with a text value
	$('textarea, input[type="text"], input[type="number"], select').not('.replaces input, #editBoxArea, #settings *').each(function() {
		if (typeof $(this).val() == 'string') { 
			self.string[this.id] = this.value.replace(/\n{2,}/g,'\n');
		} else {
			self.string[this.id] = $(this).val();
		}
	});
	self.replaces = [];
	$('.replaces').each(function() {
		if ($(this).find('.replaceText').val() || $(this).find('.replaceWith').val()) {
			self.replaces.push({
				replaceText: $(this).find('.replaceText').val(),
				replaceWith: $(this).find('.replaceWith').val(),
				useRegex: $(this).find('.useRegex').prop('checked'),
				regexFlags: $(this).find('.regexFlags').val(),
				ignoreNowiki: $(this).find('.ignoreNowiki').prop('checked')
			});
		}
	});
	$('input[type="radio"], input[type="checkbox"]').not('.replaces input').each(function() {
		self.bool[this.id] = this.checked;
	});
	if (!$('#loadSettings option[value="'+name+'"]').length) {
		$('#loadSettings').append('<option value="'+name+'">'+name+'</option>');
	}
	$('#loadSettings').val(name);
	console.log(self);
};

JWB.setup.apply = function(name) {
	name = name && JWB.settings[name] ? name : 'default';
	var self = JWB.settings[name];
	$('#loadSettings').val(name);
	$('.replaces + .replaces').remove(); //reset find&replace inputs
	$('.replaces input[type="text"]').val('');
	$('.useRegex').each(function() {this.checked = false;});
	$('#pagelistPopup legend input').trigger('change'); //fix checked state of pagelist generating inputs
	for (var a in self.string) {
		$('#'+a).val(self.string[a]);
	}
	for (var b in self.bool) {
		$('#'+b).prop('checked', self.bool[b]);
	}
	var cur;
	for (var c=0;c<self.replaces.length;c++) {
		if ($('.replaces').length <= c) $('.moreReplaces[data-insert="before"')[0].click();
		cur = self.replaces[c];
		for (var d in cur) {
			if (cur[d] === true || cur[d] === false) {
				$('.replaces').eq(c).find('.'+d).prop('checked', cur[d]);
			} else {
				$('.replaces').eq(c).find('.'+d).val(cur[d]);
			}
		}
	}
	JWB.listReplaces();
	$('.useRegex, #containRegex,'+
	  '#pagelistPopup legend input,'+
	  '#viaJWB, #enableRETF').trigger('change'); //reset disabled inputs
};

JWB.setup.getObj = function() {
	var settings = [];
	for (var i in JWB.settings) {
		if (i != '_blank') {
			settings.push('"' + i + '": ' + JSON.stringify(JWB.settings[i]));
		}
	}
	return '{\n\t' + settings.join(',\n\t').split('{{subst:').join('{{#JWB-SAFESUBST:#') + '\n}';
};

JWB.setup.submit = function() {
	var name = prompt(JWB.msg('setup-prompt', JWB.msg('setup-prompt-save')), $('#loadSettings').val());
	if (name === null) return;
	if ($.trim(name) === '') name = 'default';
	JWB.setup.save(name);
	JWB.status('setup-submit');
	JWB.api.call({
		action: 'query',
		meta: 'tokens',
	}, function(response) {
		let edittoken = response.query.tokens.csrftoken;
		JWB.api.call({
			title: 'User:'+JWB.username+'/'+JWB.settingspage,
			summary: JWB.msg(['setup-summary', JWB.contentLang]),
			action: 'edit',
			token: edittoken,
			text: JWB.setup.getObj(),
			minor: true
		}, function(response) {
			JWB.status('done', true);
			JWB.log('edit', response.edit.title, response.edit.newrevid);
		});
	});
};

//TODO: use blob uri
JWB.setup.download = function() {
	var name = prompt(JWB.msg('setup-prompt', JWB.msg('setup-prompt-save')), $('#loadSettings').val());
	if (name === null) return;
	if ($.trim(name) === '') name = 'default';
	JWB.setup.save(name);
	JWB.status('setup-dload');
	var url = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(JWB.setup.getObj())));
	var elem = $('#download-anchor')[0];
	if (HTMLAnchorElement.prototype.hasOwnProperty('download')) { //use download attribute when possible, for its ability to specify a filename
		elem.href = url;
		elem.click();
		setTimeout(function() {elem.removeAttribute('href');}, 2000);
	} else { //fallback to iframes for browsers with no support for download="" attributes
		elem = $('#download-iframe')[0];
		elem.src = url.replace('application/json', 'application/octet-stream');
		setTimeout(function() {elem.removeAttribute('src');}, 2000);
	}
	JWB.status('done', true);
};

JWB.setup.import = function(e) {
	e.preventDefault();
	file = (e.dataTransfer||this).files[0];
	if ($(this).is('#import')) { //reset input
		this.outerHTML = this.outerHTML;
		$('#import').change(JWB.setup.import);
	}
	if (!window.hasOwnProperty('FileReader')) {
		alert(JWB.msg('old-browser'));
		JWB.status('old-browser', '<a target="_blank" href="'+JWB.index_php+'?title=Special:MyPage/'+JWB.settingspage+'">/'+JWB.settingspage+'</a>');
		return;
	}
	if (file.name.split('.').pop().toLowerCase() !== 'json') {
		alert(JWB.msg('not-json'));
		return;
	}
	JWB.status('Processing file');
	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function(e) {
		JWB.status('done', true);
		try {
			//Exclusion regex based on http://stackoverflow.com/a/23589204/1256925
			//Removes all JS comments from the file, except when they're between quotes.
			var c = reader.result;
			var data = JSON.parse(c.replace(/("[^"]*")|(\/\*[\w\W]*\*\/|\/\/[^\n]*)/g, function(match, g1, g2) {
				if (g1) return g1;
			}));
			JWB.setup.extend(data);
		} catch(e) {
			alert(JWB.msg('json-err', e.message, JWB.msg('json-err-upload')));
			console.log(e); //also log the error for further info
			return;
		}
	};
	
	JWB.status('Processing file');
};

JWB.setup.load = function() {
	JWB.status('setup-load');
	var user = JWB.username||mw.config.get('wgUserName');
	var oldtitle = "User:" + user + '/'+JWB.settingspage; // page title for what was used before version 4.0
	var newtitle = "User:" + user + '/JWB-settings.json'; // new page title for all settings pages.
	var titles = oldtitle;
	// if the old title isn't JWB-settings.json, also query the new title.
	if (oldtitle !== newtitle && JWB.hasJSON) {
		titles += '|' + newtitle;
	}
	JWB.api.call({
		action: 'query',
		titles: titles,
		prop: 'info|revisions',
		meta: 'tokens',
		rvprop: 'content',
		indexpageids: true
	}, function(response) {
		if (JWB === false) return; //user is not allowed to use JWB
		var firstrun = !JWB.setup.initialised;
		JWB.setup.initialised = true;
		var edittoken = response.query.tokens.csrftoken;

		// determine correct page to get settings from
		var pages = response.query.pages,
			ids = response.query.pageids;
		var page, exists = true;
		if (ids.length == 2) {
			var page0 = pages[ids[0]],
				page1 = pages[ids[1]];
			var oldpage, newpage;
			if (page0.title == oldtitle) {
				oldpage = page0;
				newpage = page1;
			} else {
				oldpage = page1;
				newpage = page0;
			}
			if (oldpage.missing === undefined && oldpage.redirect === undefined) {
				// old page exists and is not a redirect
				if (newpage.missing === undefined) {
					// both old AND new page exist; throw error and load neither page.
					let jsredir = "https://www.mediawiki.org/wiki/Help:Redirects#JavaScript_page_redirect";
					prompt(JWB.msg('duplicate-settings', oldtitle, newtitle, jsredir), jsredir);
					exists = false;
				} else {
					// old page exists but new page doesn't; move the page to the new location.
					JWB.setup.moveNew(oldtitle, newtitle, edittoken);
					JWB.settingspage = 'JWB-settings.json';
					return;
				}
			} else {
				// Old page either doesn't exist or is a redirect. Don't bother with it.
				page = newpage;
				exists = (page.missing === undefined);
				JWB.settingspage = 'JWB-settings.json';
			}
		} else {
			page = pages[ids[0]];
			exists = (page.missing === undefined);
		}
		if (!exists) {
			// settings page does not exist; don't load anything
			if (JWB.allowed && firstrun) JWB.setup.save('default'); //this runs when this callback returns after the init has loaded.
			return;
		}
		var data = page.revisions[0]['*'].split('{{#JWB-SAFESUBST:#').join('{{subst:');
		if (!data) {
			// settings page is empty; don't load anything.
			if (JWB.allowed && firstrun) JWB.setup.save('default'); //this runs when this callback returns after the init has loaded.
			return;
		}
		try {
			data = JSON.parse(data);
		} catch(e) {
			alert(JWB.msg('json-err', e.message, JWB.msg('json-err-page', JWB.settingspage)) || 'JSON error:\n'+e.message);
			JWB.setup.save('default');
			return;
		}
		JWB.setup.extend(data);
		JWB.status('done', true);
	});
};

JWB.setup.moveNew = function(from, to, token) {
	(new mw.Api()).post({
		action: 'move',
		from: from,
		to: to,
		token: token,
		reason: JWB.msg(['setup-move-summary', JWB.contentLang]),
		noredirect: true, // if possible, suppress redirects; the old page will no longer be needed if the new page exists.
		movesubpages: true, // if any
		movetalk: true, // if any
		ignorewarnings: true,
	}).done(function(response) {
		if (response.error === undefined) {
			JWB.log('move', from, to);
			JWB.settingspage = to.split('/')[1];
			alert(JWB.msg('moved-settings', from, to, JWB.msg('tab-log')));
			JWB.setup.load(); // load settings from newly moved page.
		}
	});
};

JWB.setup.extend = function(obj) {
	$.extend(JWB.settings, obj);
	if (!JWB.settings.hasOwnProperty('default')) {
		JWB.setup.save('default');
	}
	for (var i in JWB.settings) {
		if ($('#loadSettings').find('option[value="'+i+'"]').length) continue;
		$('#loadSettings').append('<option value="'+i+'">'+i+'</option>');
	}
	JWB.setup.apply($('#loadSettings').val());
};

JWB.setup.del = function() {
	var name = $('#loadSettings').val();
	if (name === '_blank') return alert(JWB.msg('setup-delete-blank'));
	var temp = {};
	temp[name] = JWB.settings[name];
	JWB.setup.temp = $.extend({}, temp);
	delete JWB.settings[name];
	$('#loadSettings').val('default');
	if (name === 'default') {
		JWB.setup.apply('_blank');
		JWB.setup.save('default');
		JWB.status(['del-default', '<a href="javascript:JWB.setup.undelete();">'+JWB.msg('status-del-undo')+'</a>'], true);
	} else {
		$('#loadSettings').find('[value="'+name+'"]').remove();
		JWB.setup.apply();
		JWB.status(['del-setup', name, '<a href="javascript:JWB.setup.undelete();">'+JWB.msg('status-del-undo')+'</a>'], true);
	}
};
JWB.setup.undelete = function() {
	JWB.setup.extend(JWB.setup.temp);
	JWB.status('done', true);
};

/***** Main other functions *****/

//Show status message status-`action`, or status-`action[0]` with arguments `action[1:]`
JWB.status = function(action, done) {
	if (JWB.bot && $('#autosave').prop('checked') && !JWB.isStopped) {
		$('#summary, .editbutton, #movePage, #deletePage, #protectPage, #skipPage').prop('disabled', true); //Disable summary when auto-saving
	} else {
		$('#summary, .editbutton, #movePage, #deletePage, #protectPage, #skipPage').prop('disabled', !done); //Disable box when not done (so busy loading). re-enable when done loading.
	}
	var status;
	if (action instanceof Array) {
		action[0] = 'status-'+action[0];
		status = JWB.msg.apply(this, action);
	} else {
		status = JWB.msg('status-'+action);
	}
	if (status === false) return;
	if (status) {
		if (!done) { //spinner if not done
			status += ' <img src="//upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif" width="15" height="15" alt="'+JWB.msg('status-alt')+'"/>';
		}
	} else {
		status = action;
	}
	$('#status').html(status);
	JWB.pageCount();
	return action=='done';
};

JWB.pageCount = function() {
	if (JWB.allowed === false||!$('#articleList').length) return;
	$('#articleList').val(($('#articleList').val()||'').replace(/(^[ \t]*$\n)*/gm, ''));
	JWB.list = $('#articleList').val().split('\n');
	var count = JWB.list.length;
	if (count === 1 && JWB.list[0] === '') count = 0;
	$('#totPages').html(count);
};

//Generate list of replaces to be performed
JWB.listReplaces = function() {
	JWB.replaces = [];
	$('.replaces').each(function() {
		var $this = $(this);
		var r = [];
		r[0] = $this.find('.replaceText').val()
					.replace(/\$x/gi, JWB.page.pagevar) // fill in pagevar
					.replace(/\\{2}/g, '\\').replace(/\\n/g,'\n'); // handle \n -> newline;
		r[1] = $this.find('.replaceWith').val();
		if (r[0].length == 0 && r[1].length == 0) return; // don't bother replacing 2 empty strings.
		r[2] = $this.find('.regexFlags').val();
		r[3] = $this;
		JWB.replaces.push(r);
	});
	if (JWB.replaces.length > 1 || (
		JWB.replaces.length == 1 && $('.JWBtabc .replaceText').val() == '' && $('.JWBtabc .replaceWith').val() == ''
	)) {
		// There are replace rules in the replaces popup
		$('#replacesButton').addClass('replacesActive');
	} else {
		$('#replacesButton').removeClass('replacesActive');
	}
};

//Perform all specified find&replace actions
JWB.replace = function(input, callback) {
	JWB.status('replacing');
	if (!JWB.worker.isWorking() && JWB.worker.supported) {
		// if the worker is not already working, then re-init to make sure we've not got any broken leftovers from the previous page
		JWB.worker.init();
	}
	JWB.newContent = input;
	JWB.pageCount();
 	var varOffset = JWB.list[0].indexOf('|') !== -1 ? JWB.list[0].indexOf('|') + 1 : 0;
 	JWB.page.pagevar = JWB.list[0].substr(varOffset);
	$.each(JWB.replaces, function(i, r) {
		var replaceText = r[0], replaceWith = r[1], regexFlags = r[2];
		var $this = r[3];
		var useRegex = replaceText.length == 0 || $this.find('.useRegex').prop('checked');
		var replace = replaceText || '$'; // empty string => append (replace /$/ with text)
		if (useRegex && regexFlags.indexOf('_') !== -1) {
			replace = replace.replace(/[ _]/g, '[ _]'); //replaces any of [Space OR underscore] with a match for spaces or underscores.
			replace = replace.replace(/(\[[^\]]*)\[ _\]/g, '$1 _'); //in case a [ _] was placed inside another [] match, remove the [].
			regexFlags = regexFlags.replace('_', '');
		}
		//apply replaces where \n and \\ work in both regular text and regex mode.
		var rWith = replaceWith.replace(/\$x/gi, JWB.page.pagevar).replace(/\\{2}/g, '\\').replace(/\\n/g,'\n');
		if (rWith.length === 0 && replace === '$') return;
		try {
			let replaceDone = function(result, err) {
				console.log('done replacing', result, err);
				if (err === undefined) {
					JWB.newContent = result;
					if (JWB.worker.queue.length == 0 && JWB.worker.supported) {
						// all workers are done
						JWB.status('done', true);
						callback(JWB.newContent);
					}
				} else if (err == 'Timeout exceeded') {
					if (JWB.worker.queue.length == 0 && JWB.worker.supported) {
						// all workers have exceeded their time and/or have finished
						JWB.status('done', true);
						callback(JWB.newContent); // newContent remains unmodified due to timeout.
					}
				}
			};
			if ($this.find('.ignoreNowiki').prop('checked')) {
				if (!useRegex) {
					replace = replace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
					regexFlags = 'g';
				}
				JWB.worker.unparsedReplace("~"+"~~JWB.newContent", replace, regexFlags, rWith, replaceDone);
			} else if (useRegex) {
				JWB.worker.replace("~"+"~~JWB.newContent", replace, regexFlags, rWith, replaceDone);
			} else {
				JWB.newContent = JWB.newContent.split(replace).join(rWith); //global replacement without having to escape all special chars.
			}
		} catch(e) {
			console.log('Regex error:', e);
			JWB.stop();
			return JWB.status('regex-err', false);
		}
	});
	if ($('#enableRETF').prop('checked')) {
		JWB.newContent = RETF.replace(JWB.newContent);
	}
	if (!JWB.worker.isWorking()) {
		// no workers were called
		JWB.status('done', true);
		callback(JWB.newContent);
	}
};

JWB.skipRETF = function() {
	if (!$('#enableRETF').prop('checked')) return; // RETF is not enabled to begin with
	if (JWB.isStopped === true) return; // don't mess with the edit box when stopped
	$('#enableRETF').prop('checked', false);
	JWB.replace(JWB.page.content, function(newContent) {
		JWB.editPage(newContent);
		JWB.updateButtons();
		$('#enableRETF').prop('checked', true);
	});
};

// Edit the current page and pre-fill the newContent.
JWB.editPage = function(newContent) {
	$('#editBoxArea').val(newContent);
	$('#currentpage').html(JWB.msg('editbox-currentpage', JWB.page.name, encodeURIComponent(JWB.page.name)));
	if ($('#preparse').prop('checked')) {
		$('#articleList').val($.trim($('#articleList').val()) + '\n' + JWB.list[0]); //move current page to the bottom
		JWB.next();
		return;
	} else if (JWB.bot && $('#autosave').prop('checked')) {
		JWB.api.diff(function() {
			//timeout will take #throttle's value * 1000, if it's a number above 0. Currently defaults to 0.
			setTimeout(JWB.api.submit, Math.max(+$('#throttle').val() || 0, 0) * 1000, JWB.page.name);
		});
	} else {
		JWB.api.diff();
	}
};

//Adds a line to the logs tab.
JWB.log = function(action, page, info) {
	var d = new Date();
	var pagee = encodeURIComponent(page);
	var extraInfo = '', actionStat = '';
	switch (action) {
		case 'edit':
			if (typeof info === 'undefined') {
				action = 'null-edit';
				actionStat = 'nullEdits';
			} else {
				extraInfo = ' (<a target="_blank" href="'+JWB.index_php+'?title='+pagee+'&diff='+info+'">diff</a>)';
				actionStat = 'pagesSaved';
			}
			break;
		case 'nobots':
			action = 'bot-skip';
			extraInfo = ' (<a target="_blank" href="https://en.wikipedia.org/wiki/Template:Bots">{{bots}}</a>)';
			// no break;
		case 'skip':
			actionStat = 'pagesSkipped';
			break;
		case 'move':
			extraInfo = ' to <a target="_blank" href="/wiki/'+encodeURIComponent(info)+'" title="'+info+'">'+info+'</a>';
			break;
		case 'protect':
			extraInfo = info;
			break;
	}
	actionStat = '#' + (actionStat || 'otherActions');
	$(actionStat).html(+$(actionStat).html() + 1);
	$('#actionlog tbody')
		.append('<tr>'+
			'<td>'+(JWB.fn.pad0(d.getHours())+':'+JWB.fn.pad0(d.getMinutes())+':'+JWB.fn.pad0(d.getSeconds()))+'</td>'+
			'<th>'+action+'</th>'+
			'<td><a target="_blank" href="/wiki/'+pagee+'" title="'+page+'">'+page+'</a>'+ extraInfo +'</td>'+
		'</tr>')
		.parents('.JWBtabc').scrollTop($('#actionlog tbody').parents('.JWBtabc')[0].scrollHeight);
};

//Move to the next page in the list
JWB.next = function(nextPage) {
	// cancel any still ongoing regex match/replace functions, since we're moving on to another page.
	JWB.worker.cancelAll();
	if ($.trim(nextPage) && !$('#skipAfterAction').prop('checked')) {
		nextPage = $.trim(nextPage) + '\n';
	} else {
		nextPage = '';
	}
	$('#articleList').val($('#articleList').val().replace(/^.*\n?/, nextPage));
	JWB.list.splice(0,1);
	JWB.pageCount();
	JWB.api.get(JWB.list[0].split('|')[0]);
};

//Stop everything, reset inputs and editor
JWB.stop = function() {
	console.trace('stopped');
	$('#stopbutton,'+
	  '.editbutton,'+
	  '#watchNow,'+
	  '.JWBtabc[data-tab="2"] .editbutton,'+
	  '#watchNow'+
	  '.JWBtabc[data-tab="4"] button,'+
	  '#skipRETF').prop('disabled', true);
	$('#startbutton, #articleList,'+
	  '.JWBtabc[data-tab="1"] button,'+
	  '#replacesPopup button,'+
	  '#replacesPopup input,'+
	  '.JWBtabc input, select').prop('disabled', false);
	$('#resultWindow').html('');
	$('#editBoxArea').val('');
	$('#currentpage').html(JWB.msg('editbox-currentpage', ' ', ' '));
	JWB.pl.done = true;
	JWB.pl.stop();
	JWB.status('done', true);
	JWB.isStopped = true;
};

//Start AutoWikiBrowsing
JWB.start = function() {
	JWB.pageCount();
	JWB.listReplaces(); // generate list of replacements to make
	if (JWB.list.length === 0 || (JWB.list.length === 1 && !JWB.list[0])) {
		alert(JWB.msg('no-pages-listed'));
	} else if ($('#skipNoChange').prop('checked') && JWB.replaces.length === 0 && !$('#enableRETF').prop('checked')) {
		alert(JWB.msg('infinite-skip-notice'));
	} else {
		JWB.isStopped = false;
		if ($('#preparse').prop('checked')) {
			if (!$('#articleList').val().match('#PRE-PARSE-STOP')) {
				$('#articleList').val($.trim($('#articleList').val()) + '\n#PRE-PARSE-STOP'); //mark where to stop pre-parsing
			}
		} else {
			$('#preparse-reset').click();
		}
		$('#stopbutton, .editbutton, #watchNow, .JWBtabc[data-tab="2"] button, .JWBtabc[data-tab="4"] button, #skipRETF').prop('disabled', false);
		$('#startbutton, #articleList, .JWBtabc[data-tab="1"] button, #replacesPopup button, #replacesPopup input, .JWBtabc input, select').prop('disabled', true);
		if (!JWB.bot || !$('#autosave').prop('checked')) {
			// keep summary / watchlist options enabled when not in autosave mode
			$('#minorEdit, #summary, #viaJWB, #watchPage').prop('disabled', false);
		}
		JWB.api.get(JWB.list[0].split('|')[0]);
	}
};

JWB.updateButtons = function() {
	if (!JWB.page.exists && $('#deletePage').is('.delete')) {
		$('#deletePage').removeClass('delete').addClass('undelete').html(JWB.msg('editbutton-undelete'));
		JWB.fn.blink('#deletePage'); //Indicate the button has changed
	} else if (JWB.page.exists && $('#deletePage').is('.undelete')) {
		$('#deletePage').removeClass('undelete').addClass('delete').html(JWB.msg('editbutton-delete'));
		JWB.fn.blink('#deletePage'); //Indicate the button has changed
	}
	if (!JWB.page.exists) {
		$('#movePage').prop('disabled', true);
	} else {
		$('#movePage').prop('disabled', false);
	}
	$('#watchNow').html( JWB.msg('watch-' + (JWB.page.watched ? 'remove' : 'add')) );
};

/***** Web Worker functions *****/
JWB.worker.supported = !!window.Worker; // if window.Worker exists, we can use workers. Unless CSP blocks us.
JWB.worker.queue = [];

// Load function required to properly load the worker, since directly using `new Worker(url)` for cross-origin URLs does not work even with CORS/CSP rules all allowing it.
// See https://stackoverflow.com/q/66188950/1256925 for this exact question
JWB.worker.load = function(callback) {
	if (JWB.worker.blob) return callback(); // already successfully built
	$.getScript(JWB.imports['worker.js'], function() {
		// Firefox does not understand try..catch for content security policy violations, so define the worker functions regardless of the blob support.
		JWB.worker.functions = JWB.worker.function();
		// the loaded script just defined JWB.worker.function; convert it to a blob url
		// Based on https://stackoverflow.com/a/33432215/1256925
		if (JWB.worker.supported) try {
			let blob = new Blob(['('+JWB.worker.function.toString()+')()'], {type: 'text/javascript'});
			JWB.worker.blob = URL.createObjectURL(blob);
			callback();
		} catch(e) {
			if (e.code == 18) {
				JWB.worker.supported = false;
			}
		}
	});
};

// Create a worker to be able to preform regex operations without hanging the current process.
// Based on https://stackoverflow.com/q/66153487/1256925
JWB.worker.init = function() {
	JWB.worker.load(function() {
		JWB.worker.worker = new Worker(JWB.worker.blob);
		JWB.worker.callback = undefined; // explicitly set to the implicit value of undefined.
		JWB.worker.timeout = 0;
		JWB.worker.queue = [];
		JWB.worker.worker.onmessage = function(e) {
			clearTimeout(JWB.worker.timeout);
			JWB.worker.timeout = 0;
			if (JWB.isStopped) {
				// we're stopped; clear the queue and stop.
				JWB.worker.queue = [];
			} else if (JWB.worker.callback !== undefined) {
				JWB.worker.callback(e.data.result, e.data.err);
			} else {
				console.error("Worker finished without callback set:", e.data, e);
			}
			JWB.worker.next(true);
		};
	});
};

// Boolean; check if the worker is currently occupied. 
JWB.worker.isWorking = function() {
	return JWB.worker.callback !== undefined;
};

// Cancel current worker's task (e.g. due to timeout)
JWB.worker.terminate = function() {
	console.log('terminating');
	let w = JWB.worker;
	w.worker.terminate();
	w.callback(undefined, 'Timeout exceeded');
	let queue = w.queue; // save old queue
	w.init(); // re-init this worker, since the previous one is presumed dead (and terminated).
	w.queue = queue; // restore queue
};

// Cancel all workers (e.g. due to no longer needing the worker's queued services)
JWB.worker.cancelAll = function() {
	JWB.worker.queue = [];
	if (JWB.worker.worker) JWB.worker.worker.terminate(); // do not call the callback.
};

// Set worker to work, or queue the worker task.
JWB.worker.do = function(msg, callback) {
	if (JWB.worker.isWorking()) {
		JWB.worker.queue.push({msg: msg, callback: callback});
	} else {
		var timelimit = parseInt($('#timelimit').val()) || 3000;
		JWB.worker.callback = callback;
		// Expand "JWB.string" into JWB['string']; to allow the string to be loaded at execution time instead of queue time.
		// Start with 3x ~ because that cannot exist as the start of an actual page
		if (msg.str && msg.str.indexOf('~'+'~~JWB.') === 0) msg.str = JWB[msg.str.substr(7)]; // For now, 1-deep expansion is sufficient.
		JWB.worker.worker.postMessage(msg);
		JWB.worker.timeout = setTimeout(function() {
			if (!JWB.worker.isWorking()) {
				console.error('Worker error');
				JWB.worker.next(true);
				return;
			}
			JWB.worker.terminate();
			JWB.worker.next(true);
		}, timelimit);
	}
};

// Execute the next task in the queue
JWB.worker.next = function(force = false) {
	if (force) {
		// force means the function that's calling next() has handled the previous worker task. Clean up after it.
		JWB.worker.callback = undefined;
	} else if (JWB.worker.isWorking()) {
		// still working and the calling function did not specify proper exit of the previous task yet.
		return false;
	}
	if (JWB.worker.queue.length === 0) return true;
	var q = JWB.worker.queue.shift();
	JWB.worker.do(q.msg, q.callback);
};

/***** Functions using workers *****/
JWB.worker.match = function(str, pattern, flags, callback) {
	if (JWB.worker.supported) {
		JWB.worker.do({cmd: 'match', str, pattern, flags}, callback);
	} else {
		if (str && str.indexOf('~'+'~~JWB.') === 0) str = JWB[str.substr(7)]; // For now, 1-deep expansion is sufficient.
		JWB.worker.functions.match(str, pattern, flags, callback);
	}
};

JWB.worker.replace = function(str, pattern, flags, rWith, callback) {
	if (JWB.worker.supported) {
		JWB.worker.do({cmd: 'replace', str, pattern, flags, rWith}, callback);
	} else {
		if (str && str.indexOf('~'+'~~JWB.') === 0) str = JWB[str.substr(7)]; // For now, 1-deep expansion is sufficient.
		JWB.worker.functions.replace(str, pattern, flags, rWith, callback);
	}
};

JWB.worker.unparsedReplace = function(str, pattern, flags, rWith, callback) {
	if (JWB.worker.supported) {
		JWB.worker.do({cmd: 'unparsedreplace', str, pattern, flags, rWith}, callback);
	} else {
		if (str && str.indexOf('~'+'~~JWB.') === 0) str = JWB[str.substr(7)]; // For now, 1-deep expansion is sufficient.
		JWB.worker.functions.unparsedreplace(str, pattern, flags, rWith, callback);
	}
};

/***** General functions *****/
//Clear all existing timers to prevent them from getting errors
JWB.fn.clearAllTimeouts = function() {
	var i = setTimeout(function() {
		return void(0);
	}, 1000);
	for (var n=0;n<=i;n++) {
		clearTimeout(n);
		clearInterval(n);
	}
	console.log('Cleared all running intervals up to index',i);
};

//Filter an array to only contain unique values.
JWB.fn.uniques = function(arr) {
	var a = [];
	for (var i=0, l=arr.length; i<l; i++) {
		if (a.indexOf(arr[i]) === -1 && arr[i] !== '') {
			a.push(arr[i]);
		}
	}
	return a;
};

// code taken directly from [[Template:Bots]] and changed structurally (not functionally) for readability. The user in this case is "JWB" to deny this script.
// the user parameter is still kept as an optional parameter to maintain functionality as given on that template page.
JWB.fn.allowBots = function(text, user = "JWB") {
	var usr = user.replace(/([\(\)\*\+\?\.\-\:\!\=\/\^\$])/g, "\\$1");
	if (!new RegExp("\\{\\{\\s*(nobots|bots[^}]*)\\s*\\}\\}", "i").test(text))
		return true;
	if (new RegExp("\\{\\{\\s*bots\\s*\\|\\s*deny\\s*=\\s*([^}]*,\\s*)*" + usr + "\\s*(?=[,\\}])[^}]*\\s*\\}\\}", "i").test(text))
		return false;
	else
		return new RegExp("\\{\\{\\s*((?!nobots)|bots(\\s*\\|\\s*allow\\s*=\\s*((?!none)|([^}]*,\\s*)*" + usr +
			"\\s*(?=[,\\}])[^}]*|all))?|bots\\s*\\|\\s*deny\\s*=\\s*(?!all)[^}]*|bots\\s*\\|\\s*optout=(?!all)[^}]*)\\s*\\}\\}", "i").test(text);
};


//Prepends zeroes until the number has the desired length of len (default 2)
JWB.fn.pad0 = function(n, len = 2) {
	n = n.toString();
	return n.length < len ? Array(len-n.length+1).join('0')+n : n;
};

JWB.fn.blink = function(el,t) {
	t=t?t:500;
	$(el).prop('disabled', true)
	.children().animate({opacity:'0.1'},t-100)
	.animate({opacity:'1'},t)
	.animate({opacity:'0.1'},t-100)
	.animate({opacity:'1'},t);
	setTimeout("$('"+el+"').prop('disabled', false)",t*4-400);
};

JWB.fn.setSelection = function(el, start, end, dir) {
    dir = dir||'none'; //Default value
    end = end||start; //If no end is specified, assume the caret is placed without creating text selection.
    if (el.setSelectionRange) {
        el.focus();
        el.setSelectionRange(start, end, dir);
    } else if (el.createTextRange) {
        var rng = el.createTextRange();
        rng.collapse(true);
        rng.moveStart('character', start);
        rng.moveEnd('character', end);
        rng.select();
    }
};

JWB.fn.scrollSelection = function(el, index) { //function to fix scrolling to selection - doesn't do that automatically.
	var newEl = document.createElement('textarea'); //create a new textarea to simulate the same conditions
	var elStyle = getComputedStyle(el);
	newEl.style.height = elStyle.height; //copy over size-influencing styles
	newEl.style.width = elStyle.width;
	newEl.style.lineHeight = elStyle.lineHeight;
	newEl.style.fontSize = elStyle.fontSize;
	newEl.value = el.value.substr(0,index);
	document.body.appendChild(newEl); //needs to be added to the HTML for the scrollHeight and clientHeight to work.
	if (newEl.scrollHeight != newEl.clientHeight) {
		el.scrollTop = newEl.scrollHeight - 2;
	} else {
		el.scrollTop = 0;
	}
	newEl.remove(); //clean up the mess I've made
};

//i18n function
JWB.msg = function(message) {
	var args = arguments;
	var lang = JWB.lang;
	if (typeof message === 'object') {
		lang = message[1];
		message = message[0];
	}
	if (lang == 'qqx') return message;
	if (!JWB.messages || !JWB.messages.en) return '\u29FC'+message+'\u29FD'; // same surrounding <> as used in mw.msg();
	var msg;
	if (JWB.messages.hasOwnProperty(lang) && JWB.messages[lang].hasOwnProperty(message)) {
		msg = JWB.messages[lang][message];
	} else {
		msg = (JWB.messages.en.hasOwnProperty(message)) ? JWB.messages.en[message] : '\u29FC'+message+'\u29FD';
	}
	msg = msg.replace(/\$(\d+)/g, function(match, num) {
		return args[+num] || match;
	});
	return msg;
};

/***** Init *****/
// Check whether or not we are ready to init JWB. If not allowed, abort and delete JWB object to deny access.
JWB.checkInit = function() {
	if (JWB.allowed === false) {
		var msg = JWB.msg('not-on-list');
		JWB = false;
		delete JWB;
		alert(msg);
		return;
	}
	var allLoaded = true;
	for (var m in JWB.messages) if (JWB.messages[m] === null) allLoaded = false;
	if (JWB.allowed === true && allLoaded && Object.keys(JWB.messages).length == JWB.langs.length + 1) { // if there are two languages to load, wait for them both.
		console.log('langs loaded');
		JWB.init(); //init if verification has already returned true
	}
};

// Initialise JWB
JWB.init = function() {
	console.log(JWB.messages.en, !!JWB.messages.en);
	JWB.setup.load();
	JWB.worker.init();
	JWB.fn.clearAllTimeouts();

	var findreplace = '<div class="replaces">'+
		'<label style="display:block;">'+JWB.msg('label-replace')+' <input type="text" class="replaceText"/></label>'+
		'<label style="display:block;">'+JWB.msg('label-rwith')+' <input type="text" class="replaceWith"/></label>'+
		'<div class="regexswitch">'+
			'<label><input type="checkbox" class="useRegex"> '+JWB.msg('label-useregex')+'</label>'+
			'<a class="infoLink" href="http://regex101.com/#javascript" target="_blank" tabindex="-1">101</a>'+
			'<label class="divisor" title="'+JWB.msg('tip-regex-flags')+'" style="display:none;">'+
				JWB.msg('label-regex-flags')+' <input type="text" class="regexFlags" value="g"/>'+ //default: global replacement
			'</label>'+
			'<br/>'+
		'</div>'+
		'<label title="'+JWB.msg('tip-ignore-comment')+'">'+
			'<input type="checkbox" class="ignoreNowiki"> '+JWB.msg('label-ignore-comment')+
		'</label>'+
	'</div>';
	
	var NSList = '<select multiple name="namespace" id="namespacelist">';
	for (var i in JWB.ns) {
		if (parseInt(i) < 0) continue; //No Special: or Media: in the list
		NSList += '<option value="'+JWB.ns[i].id+'" selected>'+(JWB.ns[i]['*'] || '('+JWB.msg('namespace-main')+')')+'</option>';
	}
	NSList += '</select>';
	
	/***** Interface *****/
	
	document.title = 'AutoWikiBrowser Script'+(document.title.split('-')[1] ? ' -'+document.title.split('-')[1] : '');
	$('body').html(
		'<article id="resultWindow"></article>'+
		'<main id="inputsWindow">'+
			'<div id="inputsBox">'+
				'<aside id="articleBox">'+
					'<b>'+JWB.msg('pagelist-caption')+'</b>'+
					'<textarea id="articleList"></textarea>'+
				'</aside>'+
				'<section id="tabs">'+
					'<nav class="tabholder">'+
						'<span class="JWBtab active" data-tab="1">'+JWB.msg('tab-setup')+'</span> '+
						'<span class="JWBtab" data-tab="2">'+JWB.msg('tab-editing')+'</span> '+
						'<span class="JWBtab" data-tab="3">'+JWB.msg('tab-skip')+'</span> '+
						(JWB.sysop?'<span class="JWBtab" data-tab="4">'+JWB.msg('tab-other')+'</span> ':'')+
						' <span class="JWBtab log" data-tab="5">'+JWB.msg('tab-log')+'</span> '+
					'</nav>'+
					'<section class="JWBtabc active" data-tab="1"></section>'+
					'<section class="JWBtabc" data-tab="2"></section>'+
					'<section class="JWBtabc" data-tab="3"></section>'+
					(JWB.sysop?'<section class="JWBtabc" data-tab="4"></section>':'')+
					'<section class="JWBtabc log" data-tab="5"></section>'+
					'<footer id="status">done</footer>'+
				'</section>'+
				'<aside id="editBox">'+
					'<b>'+JWB.msg('editbox-caption')+' - <span id="currentpage">'+JWB.msg('editbox-currentpage', ' ', ' ')+'</span></b>'+
					'<textarea id="editBoxArea" accesskey=","></textarea>'+
				'</aside>'+
			'</div>'+
		'</main>'+
		'<footer id="stats">'+
			JWB.msg('stat-pages')+' <span id="totPages">0</span>;&emsp;'+
			JWB.msg('stat-save')+' <span id="pagesSaved">0</span>;&emsp;'+
			JWB.msg('stat-null')+' <span id="nullEdits">0</span>;&emsp;'+
			JWB.msg('stat-skip')+' <span id="pagesSkipped">0</span>;&emsp;'+
			JWB.msg('stat-other')+' <span id="otherActions">0</span>;&emsp;'+
		'</footer>'+
		'<div id="overlay" style="display:none;"></div>'+
		'<section class="JWBpopup" id="replacesPopup" style="display:none;">'+
			'<button class="moreReplaces" data-insert="after">'+JWB.msg('button-more-fields')+'</button>'+
			'<br>'+findreplace+
			'<button class="moreReplaces" data-insert="before">'+JWB.msg('button-more-fields')+'</button>'+
		'</section>'+
		'<section class="JWBpopup" id="pagelistPopup" style="display:none;">'+
			'<form action="#" id="pl-form"></form>'+
		'</section>'
	);
	
	$('.JWBtabc[data-tab="1"]').html(
		'<fieldset id="pagelist">'+
			'<legend>'+JWB.msg('label-pagelist')+'</legend>'+
			'<button id="removeDupes">'+JWB.msg('button-remove-dupes')+'</button> '+
			'<button id="sortArticles">'+JWB.msg('button-sort')+'</button>'+
			'<br>'+
			'<label title="'+JWB.msg('tip-preparse')+'">'+
				'<input type="checkbox" id="preparse"> '+JWB.msg('preparse')+
			'</label>'+
			'<span class="divisor"></span>'+
			'<button id="preparse-reset" title="'+JWB.msg('tip-preparse-reset')+'">'+JWB.msg('preparse-reset')+'</button>'+
			'<br>'+
			'<button id="pagelistButton">'+JWB.msg('pagelist-generate')+'</button>'+
		'</fieldset>'+
		'<fieldset id="settings">'+
			'<legend>'+JWB.msg('label-settings')+'</legend>'+
			'<button id="saveAs" title="'+JWB.msg('tip-store-setup')+'">'+JWB.msg('store-setup')+'</button>'+
			'<br>'+
			'<label>'+
				JWB.msg('load-settings') + ' '+
				'<select id="loadSettings">'+
					'<option value="default" selected>default</option>'+
					'<option value="_blank">'+JWB.msg('blank-setup')+'</option>'+
				'</select>'+
			'</label>'+
			'<span class="divisor"></span>'+
			'<button id="deleteSetup" title="'+JWB.msg('tip-delete-setup')+'">'+JWB.msg('delete-setup')+'</button>'+
			'<hr>'+
			'<button id="saveToWiki">'+JWB.msg('save-setup')+'</button>'+
			'<span class="divisor"></span>'+
			'<button id="download">'+JWB.msg('download-setup')+'</button>'+
			'<hr>'+
			'<label class="button" id="importLabel" title="'+JWB.msg('tip-import-setup')+'">'+
				'<input type="file" id="import" accept=".json">'+
				JWB.msg('import-setup')+
			'</label>'+
			'<span class="divisor"></span>'+
			'<button id="updateSetups" title="'+JWB.msg('tip-update-setup', JWB.settingspage)+'">'+JWB.msg('update-setup')+'</button>'+
			'<div id="downloads">'+
				'<a download="JWB-settings.json" target="_blank" id="download-anchor"></a>'+
				'<iframe id="download-iframe"></iframe>'+
			'</div>'+
		'</fieldset>'+
		'<fieldset id="limits">'+
			'<legend>'+JWB.msg('label-limits')+'</legend>'+
			'<label class="timelimit-label" title="'+JWB.msg('tip-time-limit')+'">'+
				JWB.msg('time-limit')+
				'<input type="number" id="timelimit" value="3000" min="0">'+
			'</label>'+
			'<label title="'+JWB.msg('tip-diff-size-limit')+'">'+
				JWB.msg('diff-size-limit')+
				'<input type="number" id="sizelimit" value="0" min="0">'+
			'</label>'+
		'</fieldset>'
	);
	$('.JWBtabc[data-tab="2"]').html(
		'<label class="minorEdit"><input type="checkbox" id="minorEdit" accesskey="i" checked> '+JWB.msg('minor-edit')+'</label>'+
		'<label class="editSummary viaJWB">'+JWB.msg('edit-summary')+'<br/> <input class="fullwidth" type="text" id="summary" maxlength="500" accesskey="b"></label>'+
		' <input type="checkbox" id="viaJWB" checked title="'+JWB.msg('tip-via-JWB')+'">'+
		'<select id="watchPage">'+
			'<option value="watch">'+JWB.msg('watch-watch')+'</option>'+
			'<option value="unwatch">'+JWB.msg('watch-unwatch')+'</option>'+
			'<option value="nochange" selected>'+JWB.msg('watch-nochange')+'</option>'+
			'<option value="preferences">'+JWB.msg('watch-preferences')+'</option>'+
		'</select>'+
		'<span class="divisor"></span>'+
		'<button id="watchNow" disabled accesskey="w">'+
			JWB.msg('watch-add')+
		'</button>'+
		'<br>'+
		(JWB.bot?
			'<label><input type="checkbox" id="autosave"> '+JWB.msg('auto-save')+'</label>'+
			'<label title="'+JWB.msg('tip-save-interval')+'" class="divisor">'+
				JWB.msg('save-interval', '<input type="number" min="0" value="0" style="width:50px" id="throttle" disabled>')+
			'</label>'+
			'<br>'
		:'')+
		'<span id="startstop">'+
			'<button id="startbutton" accesskey="a">'+JWB.msg('editbutton-start')+'</button>'+
			'<br>'+
			'<button id="stopbutton" disabled accesskey="q">'+JWB.msg('editbutton-stop')+'</button> '+
		'</span>'+
		'<button class="editbutton" id="skipButton" disabled accesskey="n">'+JWB.msg('editbutton-skip')+'</button>'+
		'<button class="editbutton" id="submitButton" disabled accesskey="s">'+JWB.msg('editbutton-save')+'</button>'+
		'<br>'+
		'<button class="editbutton" id="previewButton" disabled accesskey="p">'+JWB.msg('editbutton-preview')+'</button>'+
		'<button class="editbutton" id="diffButton" disabled accesskey="d">'+JWB.msg('editbutton-diff')+'</button>'+
		'<button id="replacesButton">'+JWB.msg('button-open-popup')+'</button>'+
		findreplace+
		'<hr>'+
		'<label><input type="checkbox" id="enableRETF"> '+
			JWB.msg('label-enable-RETF', 
				'<a href="/wiki/Project:AutoWikiBrowser/Typos" target="_blank">'+
					JWB.msg('label-RETF')+
				'</a>')+
		'</label>'+
		' <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Gnome-view-refresh.svg/20px-Gnome-view-refresh.svg.png"'+
		'id="refreshRETF" title="'+JWB.msg('tip-refresh-RETF')+'">'+
		'<br/>'+
		'<button id="skipRETF" title="'+JWB.msg('tip-skip-RETF')+'" disabled>'+JWB.msg('skip-RETF')+'</button>'
	);
	$('.JWBtabc[data-tab="3"]').html(
		'<fieldset>'+
			'<legend>'+JWB.msg('label-redirects')+'</legend>'+
			'<label title="'+JWB.msg('tip-redirects-follow')+'">'+
				'<input type="radio" class="redirects" value="follow" name="redir" id="redir-follow"> '+JWB.msg('redirects-follow')+' '+
			'</label>'+
			'<label title="'+JWB.msg('tip-redirects-skip')+'">'+
				 '<input type="radio" class="redirects" value="skip" name="redir" id="redir-skip"> '+JWB.msg('redirects-skip')+' '+
			'</label>'+
			'<label title="'+JWB.msg('tip-redirects-edit')+'">'+
				'<input type="radio" class="redirects" value="edit" name="redir" id="redir-edit" checked> '+JWB.msg('redirects-edit')+''+
			'</label>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend>'+JWB.msg('label-skip-when')+'</legend>'+
			'<label><input type="checkbox" id="skipNoChange"> '+JWB.msg('skip-no-change')+'</label>'+
			'<br>'+
			'<label><input type="radio" id="exists-yes" name="exists" value="yes"> '+JWB.msg('skip-exists-yes')+'</label> '+
			'<label><input type="radio" id="exists-no" name="exists" value="no" checked> '+JWB.msg('skip-exists-no')+'</label> '+
			'<label><input type="radio" id="exists-neither" name="exists" value="neither"> '+JWB.msg('skip-exists-neither')+'</label>'+
			(JWB.sysop?'<br><label><input type="checkbox" id="skipAfterAction" checked> '+JWB.msg('skip-after-action')+'</label>':'')+
			'<hr/>'+
		'<label>'+JWB.msg('skip-contains')+' <input class="fullwidth" type="text" id="skipContains"></label>'+
		'<label>'+JWB.msg('skip-not-contains')+' <input class="fullwidth" type="text" id="skipNotContains"></label>'+
		'<div class="regexswitch">'+
			'<label><input type="checkbox" id="containRegex"> '+JWB.msg('label-useregex')+'</label>'+
			'<a class="re101" href="http://regex101.com/#javascript" target="_blank">?</a>'+
			'<label class="divisor" title="'+JWB.msg('tip-regex-flags')+'" style="display:none;">'+
				JWB.msg('label-regex-flags')+' <input type="text" id="containFlags"/>'+
			'</label>'+
		'</div>'+
		'<hr/>'+
		'<label title="'+JWB.msg('skip-cg-prefix')+'">'+JWB.msg('skip-category')+' <input class="fullwidth" type="text" id="skipCategories"></label>'+
		'</fieldset>'
	);
	if (JWB.sysop) $('.JWBtabc[data-tab="4"]').html(
		'<fieldset>'+
			'<legend>'+JWB.msg('move-header')+'</legend>'+
			'<label><input type="checkbox" id="suppressRedir"> '+JWB.msg('move-redir-suppress')+'</label>'+
			'<br>'+
			JWB.msg('move-also')+' '+
			'<label><input type="checkbox" id="movetalk"> '+JWB.msg('move-talk-page')+'</label> '+
			'<label><input type="checkbox" id="movesubpage"> '+JWB.msg('move-subpage')+'</label>'+
			'<br>'+
			'<label>'+JWB.msg('move-new-name')+' <input type="text" id="moveTo"></label>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend>'+JWB.msg('delete-header')+'</legend>'+
			'<label><input type="checkbox" id="deleteTalk"> '+JWB.msg('delete-talk')+'</label>'+
		'</fieldset>'+
		'<fieldset>'+
		'<legend>'+JWB.msg('protect-header')+'</legend>'+
			JWB.msg('protect-edit')+
			' <select id="editProt">'+
				'<option value="all" selected>'+JWB.msg('protect-none')+'</option>'+
				'<option value="autoconfirmed">'+JWB.msg('protect-autoconf')+'</option>'+
				'<option value="sysop">'+JWB.msg('protect-sysop')+'</option>'+
			'</select> '+
			'<br>'+
			JWB.msg('protect-move')+
			' <select id="moveProt">'+
				'<option value="" selected>('+JWB.msg('protect-like-edit')+')</option>'+
				'<option value="all">'+JWB.msg('protect-none')+'</option>'+
				'<option value="autoconfirmed">'+JWB.msg('protect-autoconf')+'</option>'+
				'<option value="sysop">'+JWB.msg('protect-sysop')+'</option>'+
			'</select> '+
			'<br>'+
			JWB.msg('protect-upload')+
			' <select id="uploadProt">'+
				'<option value="" selected>('+JWB.msg('protect-like-edit')+')</option>'+
				'<option value="all">'+JWB.msg('protect-none')+'</option>'+
				'<option value="autoconfirmed">'+JWB.msg('protect-autoconf')+'</option>'+
				'<option value="sysop">'+JWB.msg('protect-sysop')+'</option>'+
			'</select> '+
			'<br>'+
			'<label>'+JWB.msg('protect-expiry')+'<a class="infoLink" href="https://www.mediawiki.org/w/api.php?action=help&modules=main#main/datatypes" target="_blank" tabindex="-1">?</a> <input type="text" id="protectExpiry"/></label>'+
		'</fieldset>'+
		'<button id="movePage" disabled accesskey="m">'+JWB.msg('editbutton-move')+'</button> '+
		'<button id="deletePage" class="delete" disabled accesskey="x">'+JWB.msg('editbutton-delete')+'</button> '+
		'<button id="protectPage" disabled accesskey="z">'+JWB.msg('editbutton-protect')+'</button> '+
		'<button id="skipPage" disabled title="['+JWB.tooltip+'n]">'+JWB.msg('editbutton-skip')+'</button>'+
		'<div class="logActionNote">'+JWB.msg('log-action-note')+'</div>'
	);
	$('.JWBtabc[data-tab="5"]').html('<table id="actionlog"><tbody></tbody></table>');
	$('#pagelistPopup form').html(
		'<div id="ns-filter" title="'+JWB.msg('tip-ns-select')+'">' + JWB.msg('label-ns-select') + NSList + '</div>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" id="categorymembers" name="categorymembers" value="cm"> '+JWB.msg('legend-cm')+'</label></legend>'+
			'<label title="'+JWB.msg('tip-cm')+'">'+JWB.msg('label-cm')+' <input type="text" name="cmtitle" id="cmtitle" class="fullwidth"></label>'+
			'<div>'+JWB.msg('cm-include')+' '+
				'<label><input type="checkbox" id="cmtype-page" name="cmtype" value="page" checked> '+JWB.msg('cm-include-pages')+'</label>'+
				'<label><input type="checkbox" id="cmtype-subcg" name="cmtype" value="subcat" checked> '+JWB.msg('cm-include-subcgs')+'</label>'+
				'<label><input type="checkbox" id="cmtype-file" name="cmtype" value="file" checked> '+JWB.msg('cm-include-files')+'</label>'+
			'</div>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" name="linksto" id="linksto"> '+JWB.msg('legend-linksto')+'</label></legend>'+
			'<label>'+JWB.msg('label-linksto')+' <input type="text" name="title" id="linksto-title" class="fullwidth"></label>'+
			'<div>'+JWB.msg('links-include')+' '+
				'<label><input type="checkbox" id="backlinks" name="backlinks" value="bl" checked> '+JWB.msg('links-include-links')+'</label>'+
				'<label><input type="checkbox" id="embeddedin" name="embeddedin" value="ei"> '+JWB.msg('links-include-templ')+'</label>'+
				'<label><input type="checkbox" id="imageusage" name="imageusage" value="iu"> '+JWB.msg('links-include-files')+'</label>'+
			'</div>'+
			'<div>'+JWB.msg('links-redir')+' '+
				'<label><input type="radio" id="rfilter-redir" name="filterredir" value="redirects"> '+JWB.msg('links-redir-redirs')+'</label>'+
				'<label><input type="radio" id="rfilter-nonredir" name="filterredir" value="nonredirects"> '+JWB.msg('links-redir-noredirs')+'</label>'+
				'<label><input type="radio" id="rfilter-all" name="filterredir" value="all" checked> '+JWB.msg('links-redir-all')+'</label>'+
			'</div>'+
			'<label title="'+JWB.msg('tip-link-redir')+'">'+
				'<input type="checkbox" name="redirect" value="true" checked id="linksto-redir"> '+JWB.msg('label-link-redir')+
			'</label>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" id="prefixsearch" name="prefixsearch" value="ps"> '+JWB.msg('legend-ps')+'</label></legend>'+
			'<label>'+JWB.msg('label-ps')+' <input type="text" name="pssearch" id="pssearch" class="fullwidth"></label>'+
			'<label title="'+JWB.msg('tip-ps-strict')+'"><input type="checkbox" name="allpages" value="ap" id="psstrict" checked> '+JWB.msg('label-ps-strict')+'</label>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" id="watchlistraw" name="watchlistraw" value="wr"> '+JWB.msg('legend-wr')+'</label></legend>'+
			JWB.msg('label-wr')+
		'</fieldset>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" id="proplinks" name="links" value="pl"> '+JWB.msg('legend-pl')+'</label></legend>'+
			'<label title="'+JWB.msg('tip-pl')+'">'+JWB.msg('label-pl')+' <input type="text" id="titles" name="titles" class="fullwidth"></label>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" id="proplinks" name="search" value="sr"> '+JWB.msg('legend-sr')+'</label></legend>'+
			'<label title="'+JWB.msg('tip-sr')+'\n'+JWB.msg('placeholder-sr', 'insource:', 'intitle:')+'">'+
				JWB.msg('label-sr')+
				' <input type="text" id="srsearch" name="srsearch" class="fullwidth" placeholder="'+JWB.msg('placeholder-sr', 'insource:', 'intitle:')+'">'+
			'</label>'+
		'</fieldset>'+
		'<fieldset class="listSMW">'+
			'<legend><label><input type="checkbox" id="smwask" name="smwask" value="smw"> '+JWB.msg('legend-smw', JWB.msg('smw-slow'))+'</label></legend>'+
			'<textarea id="smwquery" name="smwquery" placeholder="'+JWB.msg('label-smw', '\n|limit=500')+'"></textarea>'+
		'</fieldset>'+
		'<button type="submit">'+JWB.msg('pagelist-generate')+'</button>'
	);
	if (JWB.hasSMW) {
		$('#pagelistPopup').addClass('hasSMW');
	}
	$('body').addClass('AutoWikiBrowser').addClass('notheme'); //allow easier custom styling of JWB.
	$('[accesskey]').each(function() {
		let lbl = this.accessKeyLabel || this.accessKey; // few browsers support accessKeyLabel, so fallback to accessKey.
		$(this).attr('title', '['+lbl+']');
	});
	
	/***** Setup *****/
	JWB.setup.save('_blank'); //default setup
	if (JWB.settings.hasOwnProperty('default')) {
		JWB.setup.apply();
	} else if (JWB.setup.initialised) {
		// If we already initialised, create the default settings profile.
		JWB.setup.save('default');
	}
	JWB.setup.extend({});

	/***** Event handlers *****/
	
	//Alert user when leaving the tab, to prevent accidental closing.
	onbeforeunload = function() {
		return "Closing this tab will cause you to lose all progress.";
	};
	ondragover = function(e) {
		e.preventDefault();
	};
	document.addEventListener("securitypolicyviolation", function(e) {
		console.log('violated CSP:', e);
		if (e.blockedURI == 'blob') {
			JWB.worker.supported = false; // tell the next JWB.worker.init() that it shouldn't even try.
		} else if (JWB && JWB.msg) {
			alert(JWB.msg('csp-error', e.violatedDirective));
		}
	});
	
	$('.JWBtab').click(function() {
		$('.active').removeClass('active');
		$(this).addClass('active');
		$('.JWBtabc[data-tab="'+$(this).attr('data-tab')+'"]').addClass('active');
	});
	
	function showRegexFlags() {
		// >>this<< is the element that's triggered
		$(this).parent().nextAll('label').toggle(this.checked);
	}
	$('body').on('change', '#useRegex, #containRegex, .useRegex', showRegexFlags);
	
	$('#preparse-reset').click(function() {
		$('#articleList').val($('#articleList').val().replace(/#PRE-PARSE-STOP/g,'').replace(/\n\n/g, '\n'));
	});
	$('#saveAs').click(function() {
		JWB.setup.save();
	});
	$('#loadSettings').change(function() {
		JWB.setup.apply(this.value);
	});
	$('#download').click(JWB.setup.download);
	$('#saveToWiki').click(JWB.setup.submit);
	$('#import').change(JWB.setup.import);
	ondrop = JWB.setup.import;
	$('#updateSetups').click(JWB.setup.load);
	$('#deleteSetup').click(JWB.setup.del);
	
	if (window.RETF) {
		$('#refreshRETF').click(RETF.load);
		$('#skipRETF').click(JWB.skipRETF);
		$('#enableRETF').change(function() {
			$('#skipRETF').css('visibility', this.checked ? 'visible' : 'hidden');
		});
	}

	$('#replacesButton, #pagelistButton').click(function() {
		var popup = this.id.slice(0, -6); //omits the 'Button' in the id by cutting off the last 6 characters
		$('#'+popup+'Popup, #overlay').show();
	});
	$('#overlay').click(function() {
		$('#replacesPopup, #pagelistPopup, #overlay').hide();
		JWB.listReplaces();
		JWB.pl.done = true;
		JWB.pl.stop();
	});
	$('.moreReplaces').click(function() {
		var location = $(this).data('insert'); // either call $(this).before() or $(this).after()
		$(this)[location](findreplace);
	});
	$('#replacesPopup').on('keydown', '.replaces:last', function(e) {
		if (e.which === 9) $('.moreReplaces[data-insert="before"]')[0].click();
	});
	
	$('#pl-form').submit(function(e) {
		e.preventDefault();
		JWB.pl.generate();
		return false;
	});
	$('#pagelistPopup legend input').change(function() {
		//remove disabled attr when checked, add when not.
		$(this).parents('fieldset').find('input').not('legend input').prop('disabled', !this.checked);
		$(this).parents('fieldset').prop('disabled', !this.checked);
	}).trigger('change');
	$('#psstrict').change(function() {
		if (this.checked) {
			$('#pssearch').attr('name', 'apprefix');
		} else {
			$('#pssearch').attr('name', 'pssearch');
		}
	}).trigger('change');
	
	$('#resultWindow').on('click', 'tr[data-line]:not(.lineheader) *', function(e) {
		var line = +$(e.target).closest('tr[data-line]').data('line');
		var index = $('#editBoxArea').val().split('\n').slice(0, line-1).join('\n').length;
		$('#editBoxArea')[0].focus();
		JWB.fn.setSelection($('#editBoxArea')[0], index+1);
		JWB.fn.scrollSelection($('#editBoxArea')[0], index);
	});
	
	$('#removeDupes').click(function() {
		$('#articleList').val(JWB.fn.uniques($('#articleList').val().split('\n')).join('\n'));
		JWB.pageCount();
	});
	$('#sortArticles').click(function() {
		$('#articleList').val($('#articleList').val().split('\n').sort().join('\n'));
		JWB.pageCount();
	});
	
	$('#watchNow').click(JWB.api.watch);
	$('#autosave').change(function() {
		$('#throttle').prop('disabled', !this.checked);
	});
	
	$('#viaJWB').change(function() {
		$('#summary').parent('label')
			.toggleClass('viaJWB', this.checked)
			.attr('maxlength', 500 - this.checked*JWB.summarySuffix.length); // Change the max size of the allowed summary according to having a suffix or not.
	});
	$('#startbutton').click(JWB.start);
	$('#stopbutton').click(JWB.stop);
	$('#submitButton').click(JWB.api.submit);
	$('#previewButton').click(JWB.api.preview);
	$('#diffButton').click(JWB.api.diff);
	
	$('#skipButton, #skipPage').click(function() {
		JWB.log('skip', JWB.list[0].split('|')[0]);
		JWB.next();
	});
	
	if (JWB.sysop) {
		$('#movePage').click(function() {
			if ($('#moveTo').val().length === 0) {
				return alert(JWB.msg('alert-no-move'));
			}
			JWB.api.move();
		});
		$('#protectPage').click(JWB.api.protect);
		$('#deletePage').click(JWB.api.del);
	}
};

//Disable JWB altogether when it's loaded on a page other than Project:AutoWikiBrowser/Script. This script shouldn't be loaded on any other page in the first place.
if (JWB.allowed === false) JWB = false;
