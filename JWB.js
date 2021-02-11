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
 * @version 3.2.2
 * @author Joeytje50
 * </nowiki>
 */

window.JWBdeadman = false; // ADMINS: in case of fire, set this variable to true to disable this entire tool for all users

//TODO: more advanced pagelist-generating options
//TODO: generate page list based on images on a page
//TODO: Split up i18n to separate files per language (in the same way MediaWiki does it)
//TODO: Add feature to perform general cleanup (<table> to {|, fullurl-links to wikilinks, removing underscores from wikilinks)
//TODO: Store JWB settings in localStorage before committing to the wiki or downloading
//BUG: Storing to the wiki does not always work because edit token is not refreshed
//TODO: Keep an eye on https://stackoverflow.com/q/66153487/1256925

window.JWB = {}; //The main global object for the script.

/***** User verification *****/

(function() {
	if (mw.config.get('wgCanonicalNamespace')+':'+mw.config.get('wgTitle') !== 'Project:AutoWikiBrowser/Script' || JWB.allowed === false || mw.config.get('wgUserName') === null) {
		JWB.allowed = false;
		return;
	}
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Joeytje50/JWB.css&action=raw&ctype=text/css', 'text/css');
	mw.loader.load('mediawiki.diff.styles');
	
	$.getScript('//en.wikipedia.org/w/index.php?title=User:Joeytje50/JWB.js/i18n.js&action=raw&ctype=text/javascript', function() {
		if (JWB.allowed === true) {
			JWB.init(); //init if verification has already returned true
		} else if (JWB.allowed === false) {
			alert(JWB.msg('not-on-list'));
		}
	});
	
	//RegEx Typo Fixing
	$.getScript('//en.wikipedia.org/w/index.php?title=User:Joeytje50/RETF.js&action=raw&ctype=text/javascript', function() {
			$('#refreshRETF').click(RETF.load);
	});

	if (window.JWBdeadman === true) {
		window.JWB = false; // disable all access
		alert("This tool has been temporarily been disabled by Wikipedia admins due to issues it would otherwise cause. Please check back soon to see if it is working again.")
		return false;
	}

	(new mw.Api()).get({
		action: 'query',
		titles: 'Project:AutoWikiBrowser/CheckPage',
		prop: 'revisions',
		meta: 'userinfo|siteinfo',
		rvprop: 'content',
		rvlimit: 1,
		uiprop: 'groups',
		siprop: 'namespaces',
		indexpageids: true,
		format: 'json',
	}).done(function(response) {
		if (response.error) {
			alert('API error: ' + response.error.info);
			JWB = false; //preventing further access. No verification => no access.
			return;
		}
		JWB.ns = response.query.namespaces; //saving for later
		
		JWB.username = response.query.userinfo.name; //preventing any "hacks" that change wgUserName or mw.config.wgUserName
		var groups = response.query.userinfo.groups;
		var page = response.query.pages[response.query.pageids[0]];
		var users, bots;
		if (response.query.pageids[0] !== '-1' && /<!--\s*enabledusersbegins\s*-->/.test(page.revisions[0]['*'])) {
			var cont = page.revisions[0]['*'];
			users = cont.substring(
				cont.search(/<!--\s*enabledusersbegins\s*-->/),
				cont.search(/<!--\s*enabledusersends\s*-->/)
			).split('\n');
			if (/<!--\s*enabledbots\s*-->/.test(cont)) {
				bots = cont.substring(
					cont.search(/<!--\s*enabledbots\s*-->/),
					cont.search(/<!--\s*enabledbotsends\s*-->/)
				).split('\n');
			} else bots = [];
			var i=0;
			while (i<users.length) {
			    if (users[i].charAt(0) !== '*') {
			    	users.splice(i,1);
			    } else {
			    	users[i] = $.trim(users[i].substr(1));
			    	i++;
			    }
			}
			i=0;
			while (i<bots.length) {
			    if (bots[i].charAt(0) !== '*') {
			    	bots.splice(i,1);
			    } else {
			    	bots[i] = $.trim(bots[i].substr(1));
			    	i++;
			    }
			}
		} else {
			users = false; //fallback when page doesn't exist
		}
		// Temporary global debugging variables
		JWB.debug = [groups.indexOf('bot'), users === false, bots && bots.indexOf(JWB.username)];
		JWB.bot = groups.indexOf('bot') !== -1 && (users === false || bots.indexOf(JWB.username) !== -1);
		JWB.sysop = groups.indexOf('sysop') !== -1;
		if (JWB.username === "Joeytje50" && response.query.userinfo.id === 13299994) {//TEMP: Dev full access to entire interface.
			JWB.bot = true;
			users.push("Joeytje50");
		}
		if (JWB.sysop || response.query.pageids[0] === '-1' || users.indexOf(JWB.username) !== -1 || users === false) {
			JWB.allowed = true;
			if (JWB.messages.en) JWB.init(); //init if messages have already loaded
		} else {
			if (JWB.messages.en) {
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

/***** Global object/variables *****/

var objs = ['page', 'api', 'fn', 'pl', 'messages', 'setup', 'settings', 'ns'];
for (var i=0;i<objs.length;i++) {
	JWB[objs[i]] = {};
}
JWB.summarySuffix = ' (via JWB)';
if (document.location.hostname == 'en.wikipedia.org') JWB.summarySuffix = ' (via [[WP:JWB]])'
JWB.lang = mw.config.get('wgUserLanguage');
JWB.index_php = mw.config.get('wgScript');
JWB.isStopped = true;
JWB.tooltip = window.tooltipAccessKeyPrefix || '';
JWB.configext = 'js';
if (document.location.hostname.split('.').slice(-2).join('.') == 'wikia.com' || document.location.hostname.split('.').slice(-2).join('.') == 'fandom.com') {
	//it makes no sense, but Wikia does not allow users to create .js subpages of their userpage.
	//Because the settings should REALLY be protected from vandalism automatically, the backup is .css
	//even though this has nothing to do with CSS.
	JWB.configext = 'css';
}
JWB.settingspage = 'JWB';
if (window.hasOwnProperty('JWBSETTINGS')) {
	JWB.settingspage = JWBSETTINGS;
	delete window.JWBSETTINGS; //clean up the global variable
}

/***** API functions *****/

//Main template for API calls
JWB.api.call = function(data, callback, onerror) {
	data.format = 'json';
	if (data.action !== 'query') data.bot = true;
	$.ajax({
		data: data,
		dataType: 'json',
		url: mw.config.get('wgScriptPath') + '/api.php',
		type: 'POST',
		success: function(response) {
			if (response.error) {
				alert('API error: ' + response.error.info);
				JWB.stop();
			} else {
				callback(response);
			}
		},
		error: function(xhr, error) {
			alert('AJAX error: ' + error);
			JWB.stop();
			if (onerror) onerror();
		}
	});
};

//Get page diff, and process it for more interactivity
JWB.api.diff = function(callback) {
	JWB.status('diff');
	var editBoxInput = $('#editBoxArea').val();
	var redirect = $('input.redirects:checked').val();
	var data = {
		'action': 'query',
		'prop': 'info|revisions',
		'indexpageids': true,
		'titles': JWB.page.name,
		'rvlimit': '1',
		'rvdifftotext': editBoxInput,
	};
	if (redirect=='follow') data.redirects = true;
	JWB.api.call(data, function(response) {
		var pageExists = response.query.pageids[0] !== '-1';
		var diff;
		if (pageExists) {
			var diffpage = response.query.pages[response.query.pageids[0]];
			diff = diffpage.revisions[0].diff['*'];
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
		} else {
			diff = '<span style="font-weight:bold;color:red;">'+JWB.msg('page-not-exists')+'</span>';
		}
		$('#resultWindow').html(diff);
		$('.diff-lineno').each(function() {
			$(this).parent().attr('data-line',parseInt($(this).html().match(/\d+/)[0])-1).addClass('lineheader');
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
	});
};

//Retrieve page contents/info, process them, and store information in JWB.page object.
JWB.api.get = function(pagename) {
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
	var redirect = $('input.redirects:checked').val();
	var data = {
		'action': 'query',
		'prop': 'info|revisions',
		'inprop': 'watched',
		'intoken': 'edit|delete|protect|move|watch',
		'titles': pagename,
		'rvprop': 'content|timestamp|ids',
		'rvlimit': '1',
		'indexpageids': true,
		'meta': 'userinfo',
		'uiprop': 'hasmsg'
	};
	if (redirect=='follow'||redirect=='skip') data.redirects = true;
	if (JWB.sysop) {
		data.list = 'deletedrevs';
		data.drprop = 'token';
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
		JWB.page.name = JWB.list[0].split('|')[0];
	 	var varOffset = JWB.list[0].indexOf('|') !== -1 ? JWB.list[0].indexOf('|') + 1 : 0;
	 	JWB.page.pagevar = JWB.list[0].substr(varOffset);
		JWB.page.content = JWB.page.revisions ? JWB.page.revisions[0]['*'] : '';
		JWB.page.exists = !response.query.pages["-1"];
		JWB.page.deletedrevs = response.query.deletedrevs;
		JWB.page.watched = JWB.page.hasOwnProperty('watched');
		if (response.query.redirects) {
			JWB.page.name = response.query.redirects[0].to;
		}
		var newContent = JWB.replace(JWB.page.content);
		if (JWB.stopped === true) return;
		JWB.status('done', true);
		var containRegex = $('#containRegex').prop('checked'), containFlags = $('#containFlags').val();
		var skipContains = containRegex ? new RegExp($('#skipContains').val(), containFlags) : $('#skipContains').val();
		var skipNotContains = containRegex ? new RegExp($('#skipNotContains').val(), containFlags) : $('#skipContains').val();
		if (!JWB.fn.allowBots(JWB.page.content, JWB.username) || !JWB.fn.allowBots(JWB.page.content)) {
			// skip if {{bots}} template forbids editing on this page by user OR by JWB in general
			JWB.log('nobots', JWB.page.name);
			return JWB.next();
		} else if (
			($('#skipNoChange').prop('checked') && JWB.page.content === newContent) || //skip if no changes are made
			($('#skipContains').val() && JWB.page.content.match(skipContains)) ||
			($('#skipNotContains').val() && !JWB.page.content.match(skipNotContains)) ||
			($('#exists-no').prop('checked') && !JWB.page.exists) ||
			($('#exists-yes').prop('checked') && JWB.page.exists) ||
			(redirect==='skip' && response.query.redirects) // variable  redirect  is defined outside this callback function.
		) {
			JWB.log('skip', JWB.page.name);
			return JWB.next();
		} else {
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
		}
		JWB.updateButtons();
	});
};

//Some functions with self-explanatory names:
JWB.api.submit = function(page) {
	JWB.status('submit');
	var summary = $('#summary').val();
	if ($('#summary').parent('label').hasClass('viaJWB')) summary += JWB.summarySuffix;
	if ((typeof page === 'text' && page !== JWB.page.name) || $('#currentpage a').html().replace(/&amp;/g, '&') !== JWB.page.name) {
		console.log(page, JWB.page.name, $('#currentpage a').html())
		JWB.stop();
		alert(JWB.msg('autosave-error', JWB.msg('tab-log')));
		$('#currentpage').html(JWB.msg('editbox-currentpage', ' ', ' '));
		return;
	}
	var data = {
		'title': JWB.page.name,
		'summary': summary,
		'action': 'edit',
		'basetimestamp': JWB.page.revisions ? JWB.page.revisions[0].timestamp : '',
		'token': JWB.page.edittoken,
		'text': $('#editBoxArea').val(),
		'watchlist': $('#watchPage').val()
	};
	if ($('#minorEdit').prop('checked')) data.minor = true;
	JWB.api.call(data, function(response) {
		JWB.log('edit', response.edit.title, response.edit.newrevid);
		JWB.status('done', true);
		JWB.next();
	});
};
JWB.api.preview = function() {
	JWB.status('preview');
	JWB.api.call({
		'title': JWB.page.name,
		'action': 'parse',
		'text': $('#editBoxArea').val()
	}, function(response) {
		$('#resultWindow').html(response.parse.text['*']);
		$('#resultWindow div.previewnote').remove();
		JWB.status('done', true);
	});
};
JWB.api.move = function() {
	JWB.status('move');
	var topage = $('#moveTo').val().replace(/\$x/gi, JWB.page.pagevar);
	var summary = $('#summary').val();
	if ($('#summary').parent('label').hasClass('viaJWB')) summary += JWB.summarySuffix;
	var data = {
		'action':'move',
		'from': JWB.page.name,
		'to': topage,
		'token': JWB.page.movetoken,
		'reason': summary,
		'ignorewarnings': 'yes'
	};
	if ($('#moveTalk').prop('checked')) data.movetalk = true;
	if ($('#moveSubpage').prop('checked')) data.movesubpages = true;
	if ($('#suppressRedir').prop('checked')) data.noredirect = true;
	JWB.api.call(data, function(response) {
		JWB.log('move', response.move.from, reponse.move.to);
		JWB.status('done', true);
		if (!$('#moveTo').val().match(/\$x/i)) $('#moveTo').val('')[0].focus(); //clear entered move-to pagename if it's not based on the pagevar
		JWB.next(topage);
	});
};
JWB.api.del = function() {
	JWB.status(($('#deletePage').is('.undelete') ? 'un' : '') + 'delete');
	var summary = $('#summary').val();
	if ($('#summary').parent('label').hasClass('viaJWB')) summary += JWB.summarySuffix;
	var undeltoken = JWB.page.deletedrevs && JWB.page.deletedrevs[0] ? JWB.page.deletedrevs[0].token : '';
	JWB.api.call({
		'action': (!JWB.page.exists ? 'un' : '') + 'delete',
		'title': JWB.page.name,
		'token': JWB.page.exists ? JWB.page.deletetoken : undeltoken,
		'reason': summary
	}, function(response) {
		JWB.log((!JWB.page.exists ? 'un' : '') + 'delete', (response['delete']||response.undelete).title);
		JWB.status('done', true);
		JWB.next(response.undelete && response.undelete.title);
	});
};
JWB.api.protect = function() {
	JWB.status('protect');
	var summary = $('#summary').val();
	if ($('#summary').parent('label').hasClass('viaJWB')) summary += JWB.summarySuffix;
	var editprot = $('#editProt').val();
	var moveprot = $('#moveProt').val();
	JWB.api.call({
		'action':'protect',
		'title': JWB.page.name,
		'token': JWB.page.protecttoken,
		'reason': summary,
		'expiry': $('#protectExpiry').val()!==''?$('#protectExpiry').val():'infinite',
		'protections': (JWB.page.exists?'edit='+editprot+'|move='+moveprot:'create='+editprot)
	}, function(response) {
		var protactions = '';
		var prots = response.protect.protections;
		for (var i=0;i<prots.length;i++) {
			if (typeof prots[i].edit == 'string') {
				protactions += ' edit: '+(prots[i].edit?prots[i].edit:'all');
			} else if (typeof prots[i].move == 'string') {
				protactions += ' move: '+(prots[i].move?prots[i].move:'all');
			} else if (typeof prots[i].create == 'string') {
				protactions += ' create: '+(prots[i].create?prots[i].create:'all');
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
		'action':'watch',
		'title':JWB.page.name,
		'token':JWB.page.watchtoken
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

JWB.pl.list = [];
JWB.pl.iterations = 0;

JWB.pl.stop = function() {
	JWB.pl.iterations = 0;
	$('#pagelistPopup [disabled]:not(fieldset [disabled]), #pagelistPopup legend input').prop('disabled', false);
	$('#pagelistPopup legend input').trigger('change');
	$('#pagelistPopup button img').remove();
}

JWB.pl.getNSpaces = function() {
	var list = $('#pagelistPopup [name="namespace"]')[0];
	if (list.selectedOptions.length == list.options.length) {
		return ''; //return empty string if every namespace is selected; this will make the request default to having no filter
	} else {
		return $('#pagelistPopup [name="namespace"]').val().join('|'); //.val() returns an array of selected options.
	}
};

JWB.pl.getList = function(abbrs, lists, data) {
	$('#pagelistPopup button, #pagelistPopup input, #pagelistPopup select').prop('disabled', true);
	JWB.pl.iterations++;
	data.action = 'query';
	var nspaces = JWB.pl.getNSpaces();
	for (var i=0;i<abbrs.length;i++) {
		if (nspaces) data[abbrs[i]+'namespace'] = nspaces;
		data[abbrs[i]+'limit'] = 'max';
	}
	if (lists.indexOf('links') !== -1) {
		data.prop = 'links';
	}
	data.list = lists.join('|');
	JWB.api.call(data, function(response) {
		var maxiterate = 100; //allow up to 100 consecutive requests at a time to avoid overloading the server.
		if (!response.query) response.query = {};
		if (response.watchlistraw) response.query.watchlistraw = response.watchlistraw; //adding some consistency
		var plist = [];
		if (response.query.pages) {
			var links;
			for (var id in response.query.pages) {
				links = response.query.pages[id].links;
				for (var i=0;i<links.length;i++) {
					plist.push(links[i].title);
				}
			}
		}
		for (var l in response.query) {
			if (l === 'pages') continue;
			for (var i=0;i<response.query[l].length;i++) {
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
			JWB.pl.stop();
		}
	}, function() { //on error, simply reset and let the user work with what he has
		JWB.status('done', true);
		JWB.pl.stop();
	});
};

//JWB.pl.getList(['wr'], ['watchlistraw'], {}) for watchlists
JWB.pl.generate = function() {
	var $fields = $('#pagelistPopup fieldset').not('[disabled]');
	$('#pagelistPopup').find('button[type="submit"]').append('<img src="//upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif" width="15" height="15" alt="'+JWB.msg('status-alt')+'"/>');
	var abbrs = [], lists = [], data = {'continue': ''};
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
		} else { //default input system
			abbr = $(this).find('legend input').val();
			lists.push(list);
			abbrs.push(abbr);
			$(this).find('input').not('legend input').each(function() {
				if ((this.type === 'checkbox' || this.type === 'radio') && this.checked === false) return;
				if ($(this).is('[name="cmtitle"]')) {
					//making sure every page has a Category: prefix, in case the user left it out
					var newval = $(this).val().replace(new RegExp(JWB.ns[14]['*']+':', 'gi'), '').split('|')[0];
					$(this).val(JWB.ns[14]['*']+':'+newval);
				}
				var name = this.name;
				var val = this.value;
				if (data.hasOwnProperty(name)) {
					data[name] += '|'+val;
				} else {
					data[name] = val;
				}
			});
			console.log(abbrs, lists, data);
		}
	});
	if (abbrs.length) JWB.pl.getList(abbrs, lists, data);
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
		if ($('.replaces').length <= c) $('#moreReplaces')[0].click();
		cur = self.replaces[c];
		for (var d in cur) {
			if (cur[d] === true || cur[d] === false) {
				$('.replaces').eq(c).find('.'+d).prop('checked', cur[d]);
			} else {
				$('.replaces').eq(c).find('.'+d).val(cur[d]);
			}
		}
	}
	$('.useRegex, #containRegex,'+
	  '#pagelistPopup legend input,'+
	  '#viaJWB').trigger('change'); //reset disabled inputs
};

JWB.setup.getObj = function() {
	var settings = [];
	for (var i in JWB.settings) {
		if (i != '_blank') {
			settings.push('"' + i + '": ' + JSON.stringify(JWB.settings[i]));
		}
	}
	return '{\n\t' + settings.join(',\n\t') + '\n}';
};

JWB.setup.submit = function() {
	var name = prompt(JWB.msg('setup-prompt', JWB.msg('setup-prompt-save')), $('#loadSettings').val());
	if (name === null) return;
	if ($.trim(name) === '') name = 'default';
	JWB.setup.save(name);
	JWB.status('setup-submit');
	JWB.api.call({
		'title': 'User:'+JWB.username+'/'+JWB.settingspage+'-settings.'+JWB.configext,
		'summary': JWB.msg(['setup-summary', mw.config.get('wgContentLanguage')]),
		'action': 'edit',
		'token': JWB.setup.edittoken,
		'text': JWB.setup.getObj(),
		'minor': true
	}, function(response) {
		JWB.status('done', true);
	});
};

//TODO: use blob uri
JWB.setup.download = function() {
	var name = prompt(JWB.msg('setup-prompt', JWB.msg('setup-prompt-save')), $('#loadSettings').val());
	if (name === null) return;
	if ($.trim(name) === '') name = 'default';
	JWB.setup.save(name);
	JWB.status('setup-dload');
	var url = 'data:application/json;base64,' + btoa(JWB.setup.getObj());
	var elem = $('#download-anchor')[0];
	if (elem.download !== undefined) { //use download attribute when possible, for its ability to specify a filename
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
		JWB.status('old-browser', '<a target="_blank" href="'+JWB.index_php+'?title=Special:MyPage/'+JWB.settingspage+'-settings.'+JWB.configext+'">/'+JWB.settingspage+'-settings.'+JWB.configext+'</a>');
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
			var data = JSON.parse(reader.result.replace(/("[^"]*")|(\/\*[\w\W]*\*\/|\/\/[^\n]*)/g, function(match, g1, g2) {
				if (g1) return g1;
			}));
		} catch(e) {
			alert(JWB.msg('json-err', e.message, JWB.msg('json-err-upload')));
			console.log(e); //also log the error for further info
			return;
		}
		JWB.setup.extend(data);
	};
	
	JWB.status('Processing file');
};

JWB.setup.load = function() {
	JWB.status('setup-load');
	JWB.api.call({
		'action': 'query',
		'titles': 'User:' + (JWB.username||mw.config.get('wgUserName')) + '/'+JWB.settingspage+'-settings.'+JWB.configext,
		'prop': 'info|revisions',
		'intoken': 'edit',
		'rvprop': 'content',
		'indexpageids': true
	}, function(response) {
		JWB.status('done', true);
		if (JWB === false) return; //user is not allowed to use JWB
		var firstrun = JWB.setup.edittoken ? false : true;
		var page = response.query.pages[response.query.pageids[0]];
		JWB.setup.edittoken = page.edittoken;
		if (response.query.pageids[0] === '-1') {
			if (JWB.allowed && firstrun) JWB.setup.save('default'); //this runs when this callback returns after the init has loaded.
			return;
		}
		var data = page.revisions[0]['*'];
		if (!data) {
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
		JWB.status(JWB.msg('status-del-default', '<a href="javascript:JWB.setup.undelete();">'+JWB.msg('status-del-undo')+'</a>'), true);
	} else {
		$('#loadSettings').find('[value="'+name+'"]').remove();
		JWB.setup.apply();
		JWB.status(JWB.msg('status-del-setup', name, '<a href="javascript:JWB.setup.undelete();">'+JWB.msg('status-del-undo')+'</a>'), true);
	}
};
JWB.setup.undelete = function() {
	JWB.setup.extend(JWB.setup.temp);
	JWB.status('done', true);
};

/***** Main other functions *****/

//Show status message
JWB.status = function(action, done) {
	if (JWB.bot && $('#autosave').prop('checked') && !JWB.isStopped) {
		$('#summary, .editbutton').prop('disabled', true); //Disable summary when auto-saving
	} else {
		$('#summary, .editbutton').prop('disabled', !done); //Disable box when not done (so busy loading). re-enable when done loading.
	}

	var status = JWB.msg('status-'+action);
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

//Perform all specified find&replace actions
JWB.replace = function(input) {
	JWB.pageCount();
 	var varOffset = JWB.list[0].indexOf('|') !== -1 ? JWB.list[0].indexOf('|') + 1 : 0;
 	JWB.page.pagevar = JWB.list[0].substr(varOffset);
	$('.replaces').each(function() {
		var $this = $(this);
		var regexFlags = $this.find('.regexFlags').val();
		var replace = $this.find('.replaceText').val().replace(/\$x/gi, JWB.page.pagevar).replace(/\\{2}/g, '\\').replace(/\\n/g,'\n') || '$';
		var useRegex = replace === '$' || $this.find('.useRegex').prop('checked');
		if (useRegex && regexFlags.indexOf('_') !== -1) {
			replace = replace.replace(/[ _]/g, '[ _]'); //replaces any of [Space OR underscore] with a match for spaces or underscores.
			replace = replace.replace(/(\[[^\]]*)\[ _\]/g, '$1 _'); //in case a [ _] was placed inside another [] match, remove the [].
			regexFlags = regexFlags.replace('_', '');
		}
		//apply replaces where \n and \\ work in both regular text and regex mode.
		var rWith = $this.find('.replaceWith').val().replace(/\$x/gi, JWB.page.pagevar).replace(/\\{2}/g, '\\').replace(/\\n/g,'\n');
		try {
			if ($this.find('.ignoreNowiki').prop('checked')) {
				if (!useRegex) {
					replace = replace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
					regexFlags = 'g';
				}
				input = JWB.replaceParsed(input, replace, regexFlags, rWith);
			} else if (useRegex) {
				replace = new RegExp(replace, regexFlags);
				input = input.replace(replace, rWith);
			} else {
				input = input.split(replace).join(rWith); //global replacement without having to escape all special chars.
			}
		} catch(e) {
			JWB.stop();
			return JWB.status('regex-err', false);
		}
	});
	if ($('#enableRETF').prop('checked')) {
		input = RETF.replace(input);
	}
	return input;
};

//function to *only* replace the parsed wikitext
//It excludes comments (<!-- -->), and nowiki, math, source, syntaxhighlight, pre, code, gallery and timeline tags)
//Based on http://stackoverflow.com/a/23589204/1256925
JWB.replaceParsed = function(str, replace, flags, rwith) {
	var exclude = '(<!--[\\s\\S]*?-->|<(nowiki|math|source|syntaxhighlight|pre|gallery|timeline)[^>]*?>[\\s\\S]*?<\\/\\2>)';
	//add /i flag, to exclude the correct tags regardless of casing.
	//This won't matter for the actual replacing, as the specified flags are used there.
	var replacements = 0;
	var global = flags.indexOf('g') !== -1;
	// build regex with exclusion list.
	// This re will be case insensitive, but the actual replacement done will still be case sensitive if the 'i' flag is not given.
	// This re will also be executed globally on the string, but the separate tracker will only allow one replacement to be done if 'g' is not given.
	var re = new RegExp(exclude + '|(' + replace + ')', flags.replace(/i|$/, 'i').replace(/g|$/, 'g'));
	return str.replace(re, function(match, g1, g2, g3) {
		if (!global && replacements > 0) { // a replacement has already been made in non-global mode
			return match;
		} else if (g3 !== undefined) { //continue to perform replacement if the match is the group that's supposed to be the match
			replacements++; // keep track of the amount of replacements made.
			return match.replace(new RegExp(replace, flags), rwith);
		} else { //do nothing if the match is one of the excluded groups
			return match;
		}
	});
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
	$('#stopbutton,'+
	  '.editbutton,'+
	  '#watchNow,'+
	  '.JWBtabc[data-tab="2"] .editbutton,'+
	  '#watchNow'+
	  '.JWBtabc[data-tab="4"] button').prop('disabled', true);
	$('#startbutton, #articleList,'+
	  '.JWBtabc[data-tab="1"] button,'+
	  '#replacesPopup button,'+
	  '#replacesPopup input,'+
	  '.JWBtabc input, select').prop('disabled', false);
	$('#resultWindow').html('');
	$('#editBoxArea').val('');
	$('#currentpage').html(JWB.msg('editbox-currentpage', ' ', ' '));
	JWB.pl.stop();
	JWB.status('done', true);
	JWB.isStopped = true;
};

//Start AutoWikiBrowsing
JWB.start = function() {
	JWB.pageCount();
	if (JWB.list.length === 0 || (JWB.list.length === 1 && !JWB.list[0])) {
		alert(JWB.msg('no-pages-listed'));
	} else if ($('#skipNoChange').prop('checked') && !$('.replaceText').val() && !$('.replaceWith').val() && !$('#enableRETF').prop('checked')) {
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
		$('#stopbutton, .editbutton, #watchNow, .JWBtabc[data-tab="2"] button, .JWBtabc[data-tab="4"] button').prop('disabled', false);
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
		$('#deletePage').removeClass('delete').addClass('undelete').html('Undelete');
		JWB.fn.blink('#deletePage'); //Indicate the button has changed
	} else if (JWB.page.exists && $('#deletePage').is('.undelete')) {
		$('#deletePage').removeClass('undelete').addClass('delete').html('Delete');
		JWB.fn.blink('#deletePage'); //Indicate the button has changed
	}
	if (!JWB.page.exists) {
		$('#movePage').prop('disabled', true);
	} else {
		$('#movePage').prop('disabled', false);
	}
	$('#watchNow').html( JWB.msg('watch-' + (JWB.page.watched ? 'remove' : 'add')) );
};

/***** General functions *****/

//Clear all existing timers to prevent them from getting errors
JWB.fn.clearAllTimeouts = function() {
	var i = setTimeout(function() {
		return void(0);
	}, 1000);
	for (var n=0;n<=i;n++) {
		clearTimeout(n);
		clearInterval(i);
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
		return false
	else
		return new RegExp("\\{\\{\\s*((?!nobots)|bots(\\s*\\|\\s*allow\\s*=\\s*((?!none)|([^}]*,\\s*)*" + usr +
			"\\s*(?=[,\\}])[^}]*|all))?|bots\\s*\\|\\s*deny\\s*=\\s*(?!all)[^}]*|bots\\s*\\|\\s*optout=(?!all)[^}]*)\\s*\\}\\}", "i").test(text);
}


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
	if (!JWB.messages || !JWB.messages.en) return message;
	var msg;
	if (JWB.messages.hasOwnProperty(lang) && JWB.messages[lang].hasOwnProperty(message)) {
		msg = JWB.messages[lang][message];
	} else {
		msg = (JWB.messages.en.hasOwnProperty(message)) ? JWB.messages.en[message] : '';
	}
	msg = msg.replace(/\$(\d+)/g, function(match, num) {
		return args[+num] || match;
	});
	return msg;
};

/***** Init *****/

JWB.init = function() {
	console.log(JWB.messages.en, !!JWB.messages.en);
	JWB.setup.load();
	JWB.fn.clearAllTimeouts();
	if (!JWB.messages[JWB.lang] && JWB.lang != 'qqx') JWB.lang = 'en';
	
	var findreplace = '<div class="replaces">'+
		'<label style="display:block;">'+JWB.msg('label-replace')+' <input type="text" class="replaceText"/></label>'+
		'<label style="display:block;">'+JWB.msg('label-rwith')+' <input type="text" class="replaceWith"/></label>'+
		'<div class="regexswitch">'+
			'<label><input type="checkbox" class="useRegex"> '+JWB.msg('label-useregex')+'</label>'+
			'<a class="re101" href="http://regex101.com/#javascript" target="_blank">?</a>'+
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
						'<span class="JWBtab" data-tab="1">'+JWB.msg('tab-setup')+'</span> '+
						'<span class="JWBtab active" data-tab="2">'+JWB.msg('tab-editing')+'</span> '+
						'<span class="JWBtab" data-tab="3">'+JWB.msg('tab-skip')+'</span> '+
						(JWB.sysop?'<span class="JWBtab" data-tab="4">'+JWB.msg('tab-other')+'</span> ':'')+
						' <span class="JWBtab log" data-tab="5">'+JWB.msg('tab-log')+'</span> '+
					'</nav>'+
					'<section class="JWBtabc" data-tab="1"></section>'+
					'<section class="JWBtabc active" data-tab="2"></section>'+
					'<section class="JWBtabc" data-tab="3"></section>'+
					(JWB.sysop?'<section class="JWBtabc" data-tab="4"></section>':'')+
					'<section class="JWBtabc log" data-tab="5"></section>'+
					'<footer id="status">done</footer>'+
				'</section>'+
				'<aside id="editBox">'+
					'<b>'+JWB.msg('editbox-caption')+' - <span id="currentpage">'+JWB.msg('editbox-currentpage', ' ', ' ')+'</span></b>'+
					'<textarea id="editBoxArea"></textarea>'+
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
			'<button id="moreReplaces">'+JWB.msg('button-more-fields')+'</button>'+
			'<br>'+findreplace+
		'</section>'+
		'<section class="JWBpopup" id="pagelistPopup" style="display:none;">'+
			'<form action="#" onsubmit="JWB.pl.generate();event.preventDefault();"></form>'+
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
		'</fieldset>'
	);
	$('.JWBtabc[data-tab="2"]').html(
		'<label class="minorEdit"><input type="checkbox" id="minorEdit" checked> '+JWB.msg('minor-edit')+'</label>'+
		'<label class="editSummary viaJWB">'+JWB.msg('edit-summary')+' <input class="fullwidth" type="text" id="summary" maxlength="500"></label>'+
		' <input type="checkbox" id="viaJWB" checked title="'+JWB.msg('tip-via-JWB')+'">'+
		'<select id="watchPage">'+
			'<option value="watch">'+JWB.msg('watch-watch')+'</option>'+
			'<option value="unwatch">'+JWB.msg('watch-unwatch')+'</option>'+
			'<option value="nochange" selected>'+JWB.msg('watch-nochange')+'</option>'+
			'<option value="preferences">'+JWB.msg('watch-preferences')+'</option>'+
		'</select>'+
		'<span class="divisor"></span>'+
		'<button id="watchNow" disabled accesskey="w" title="['+JWB.tooltip+'w]">'+
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
			'<button id="startbutton" accesskey="a" title="['+JWB.tooltip+'a]">'+JWB.msg('editbutton-start')+'</button>'+
			'<br>'+
			'<button id="stopbutton" disabled accesskey="q" title="['+JWB.tooltip+'q]">'+JWB.msg('editbutton-stop')+'</button> '+
		'</span>'+
		'<button class="editbutton" id="skipButton" disabled accesskey="n" title="['+JWB.tooltip+'n]">'+JWB.msg('editbutton-skip')+'</button>'+
		'<button class="editbutton" id="submitButton" disabled accesskey="s" title="['+JWB.tooltip+'s]">'+JWB.msg('editbutton-save')+'</button>'+
		'<br>'+
		'<button class="editbutton" id="previewButton" disabled accesskey="p" title="['+JWB.tooltip+'p]">'+JWB.msg('editbutton-preview')+'</button>'+
		'<button class="editbutton" id="diffButton" disabled accesskey="d" title="['+JWB.tooltip+'d]">'+JWB.msg('editbutton-diff')+'</button>'+
		'<button id="replacesButton">'+JWB.msg('button-open-popup')+'</button>'+
		findreplace+
		'<hr>'+
		'<label><input type="checkbox" id="enableRETF">'+
			JWB.msg('label-enable-RETF', 
				'<a href="/wiki/Project:AutoWikiBrowser/Typos" target="_blank">'+
					JWB.msg('label-RETF')+
				'</a>')+
		'</label>'+
		' <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Gnome-view-refresh.svg/20px-Gnome-view-refresh.svg.png"'+
		'id="refreshRETF" title="'+JWB.msg('tip-refresh-RETF')+'">'
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
			'<label><input type="radio" id="exists-yes" name="exists" value="yes"> '+JWB.msg('skip-exists-yes')+'</label>'+
			'<label><input type="radio" id="exists-no" name="exists" value="no" checked> '+JWB.msg('skip-exists-no')+'</label>'+
			'<label><input type="radio" id="exists-neither" name="exists" value="neither">'+JWB.msg('skip-exists-neither')+'</label>'+
			'<br>'+
			(JWB.sysop?'<label><input type="checkbox" id="skipAfterAction" checked> '+JWB.msg('skip-after-action')+'</label>':'')+
		'</fieldset>'+
		'<label>'+JWB.msg('skip-contains')+' <input class="fullwidth" type="text" id="skipContains"></label>'+
		'<label>'+JWB.msg('skip-not-contains')+' <input class="fullwidth" type="text" id="skipNotContains"></label>'+
		'<div class="regexswitch">'+
			'<label><input type="checkbox" id="containRegex"> '+JWB.msg('label-useregex')+'</label>'+
			'<a class="re101" href="http://regex101.com/#javascript" target="_blank">?</a>'+
			'<label class="divisor" title="'+JWB.msg('tip-regex-flags')+'" style="display:none;">'+
				JWB.msg('label-regex-flags')+' <input type="text" id="containFlags"/>'+
			'</label>'+
		'</div>'
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
		'<legend>'+JWB.msg('protect-header')+'</legend>'+
			JWB.msg('protect-edit')+
			'<select id="editProt">'+
				'<option value="all" selected>'+JWB.msg('protect-none')+'</option>'+
				'<option value="autoconfirmed">'+JWB.msg('protect-autoconf')+'</option>'+
				'<option value="sysop">'+JWB.msg('protect-sysop')+'</option>'+
			'</select> '+
			'<br>'+
			JWB.msg('protect-move')+
			'<select id="moveProt">'+
				'<option value="all" selected>'+JWB.msg('protect-none')+'</option>'+
				'<option value="autoconfirmed">'+JWB.msg('protect-autoconf')+'</option>'+
				'<option value="sysop">'+JWB.msg('protect-sysop')+'</option>'+
			'</select> '+
			'<br>'+
			'<label>'+JWB.msg('protect-expiry')+' <input type="text" id="protectExpiry"/></label>'+
		'</fieldset>'+
		'<button id="movePage" disabled accesskey="m" title="['+JWB.tooltip+'m]">'+JWB.msg('editbutton-move')+'</button> '+
		'<button id="deletePage" disabled accesskey="x" title="['+JWB.tooltip+'x]">'+JWB.msg('editbutton-delete')+'</button> '+
		'<button id="protectPage" disabled accesskey="z" title="['+JWB.tooltip+'z]">'+JWB.msg('editbutton-protect')+'</button> '+
		'<button id="skipPage" disabled title="['+JWB.tooltip+'n]">'+JWB.msg('editbutton-skip')+'</button>'
	);
	$('.JWBtabc[data-tab="5"]').html('<table id="actionlog"><tbody></tbody></table>');
	$('#pagelistPopup form').html(
		'<div id="ns-filter" title="'+JWB.msg('tip-ns-select')+'">' + JWB.msg('label-ns-select') + NSList + '</div>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" id="categorymembers" name="categorymembers" value="cm"> '+JWB.msg('legend-cm')+'</label></legend>'+
			'<label title="Namespace prefix not required.">'+JWB.msg('label-cm')+' <input type="text" name="cmtitle" id="cmtitle"></label>'+
			'<div>'+JWB.msg('cm-include')+' '+
				'<label><input type="checkbox" id="cmtype-page" name="cmtype" value="page" checked> '+JWB.msg('cm-include-pages')+'</label>'+
				'<label><input type="checkbox" id="cmtype-subcg" name="cmtype" value="subcat" checked> '+JWB.msg('cm-include-subcgs')+'</label>'+
				'<label><input type="checkbox" id="cmtype-file" name="cmtype" value="file" checked> '+JWB.msg('cm-include-files')+'</label>'+
			'</div>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" name="linksto" id="linksto"> '+JWB.msg('legend-linksto')+'</label></legend>'+
			'<label>'+JWB.msg('label-linksto')+' <input type="text" name="title" id="linksto-title"></label>'+
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
			'<label>'+JWB.msg('label-ps')+' <input type="text" name="pssearch" id="pssearch"></label>'+
		'</fieldset>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" id="watchlistraw" name="watchlistraw" value="wr"> '+JWB.msg('legend-wr')+'</label></legend>'+
			JWB.msg('label-wr')+
		'</fieldset>'+
		'<fieldset>'+
			'<legend><label><input type="checkbox" id="proplinks" name="links" value="pl"> '+JWB.msg('legend-pl')+'</label></legend>'+
			'<label title="'+JWB.msg('tip-pl')+'">'+JWB.msg('label-pl')+' <input type="text" id="pltitles" name="titles"></label>'+
		'</fieldset>'+
		'<button type="submit">'+JWB.msg('pagelist-generate')+'</button>'
	);
	$('body').addClass('AutoWikiBrowser'); //allow easier custom styling of JWB.
	
	/***** Setup *****/
	JWB.setup.save('_blank'); //default setup
	if (JWB.settings.hasOwnProperty('default')) {
		JWB.setup.apply();
	} else if (JWB.setup.hasOwnProperty('edittoken')) {
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
	document.onsecuritypolicyviolation = function(e) {
		if (JWB && JWB.msg) {
			alert(JWB.msg('csp-error', e.violatedDirective))
		}
	}
	
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
	
	if (window.RETF) $('#refreshRETF').click(RETF.load);

	$('#replacesButton, #pagelistButton').click(function() {
		var popup = this.id.slice(0, -6); //omits the 'Button' in the id by cutting off the last 6 characters
		$('#'+popup+'Popup, #overlay').show();
	});
	$('#overlay').click(function() {
		$('#replacesPopup, #pagelistPopup, #overlay').hide();
	});
	$('#moreReplaces').click(function() {
		$('#replacesPopup').append(findreplace);
	});
	$('#replacesPopup').on('keydown', '.replaces:last', function(e) {
		if (e.which === 9) $('#moreReplaces')[0].click();
	});
	
	$('#pagelistPopup legend input').change(function() {
		//remove disabled attr when checked, add when not.
		$(this).parents('fieldset').find('input').not('legend input').prop('disabled', !this.checked);
		$(this).parents('fieldset').prop('disabled', !this.checked);
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
