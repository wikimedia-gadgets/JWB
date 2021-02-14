/**
 * Internationalisation file for AutoWikiBrowser script
 * See https://en.wikipedia.org/wiki/User:Joeytje50/JWB.js for the full script, as well as licensing.
 * Licensed under GNU GPL 2. http://www.gnu.org/copyleft/gpl.html
 */

/* Chinese (Simplified)
	* @author YFdyh000
	*/

JWB.messages.zh_hans = {
	// General interface
	'tab-setup': '初始设置',
	'tab-editing': '编辑',
	'tab-skip': '跳过',
	'tab-other': '其他',
	'tab-log': '日志',
	'pagelist-caption': '在下方输入页面列表:',
	'editbox-caption': '编辑区域',
	'editbox-currentpage': '正在编辑: <a href="/wiki/$2" target="_blank" title="$1">$1</a>',
	'no-changes-made': '没有可应用更改。按“跳过”转至列表中的下一项。',
	'page-not-exists': '页面不存在，无法展示差异。',

	// Stats
	'stat-pages': '列出页面:',
	'stat-save': '保存页面:',
	'stat-null': '空编辑:',
	'stat-skip': '跳过页面:',
	'stat-other': '其他:',

	// Tab 1
	'label-pagelist': '页面列表',
	'button-remove-dupes': '移除重复项',
	'button-sort': '排序',
	'preparse': '使用预解析模式',
	'tip-preparse': '筛一遍页面列表，将其过滤为仅存当前跳过规则不会跳过的页面。',
	'preparse-reset': '重置',
	'tip-preparse-reset': '清除页面列表中的 #PRE-PARSE-STOP（预解析停止处）标签，以重新预解析整个页面列表',
	'pagelist-generate': '生成',
	'label-settings': '设置',
	'store-setup': '储存初始设置',
	'tip-store-setup': '储存当前设置到下拉菜单以备后用。\n' +
		'您需要将它保存到在线的 wiki 页面，或者下载到本地计算机。',
	'load-settings': '加载:',
	'blank-setup': '空白初始设置',
	'delete-setup': '删除',
	'tip-delete-setup': '删除目前选中的初始设置。',
	'save-setup': '保存到 wiki',
	'download-setup': '下载',
	'import-setup': '导入',
	'tip-import-setup': '上传在本地计算机上储存的设置文件（.json 文件）。',
	'update-setup': '刷新',
	'tip-update-setup': '刷新您在 /$1 页面中存储的设置',

	// Tab 2
	'edit-summary': '编辑摘要:',
	'minor-edit': '小修改',
	'tip-via-JWB': '添加 (via JWB script) 到编辑摘要结尾',
	'watch-add': '现在添加',
	'watch-remove': '现在移除',
	'watch-nochange': '不修改监视列表',
	'watch-preferences': '基于首选项监视',
	'watch-watch': '页面加入监视列表',
	'watch-unwatch': '页面移出监视列表',
	'auto-save': '自动保存',
	'save-interval': '每$1秒', //$1 represents the throttle/interval input element
	'tip-save-interval': '每次编辑之间暂停秒数',
	'editbutton-stop': '停止',
	'editbutton-start': '开始',
	'editbutton-save': '保存',
	'editbutton-preview': '预览',
	'editbutton-skip': '跳过', // This message is also used in tab 4
	'editbutton-diff': '差异',
	'button-open-popup': '更多替换字段',
	'button-more-fields': '添加更多字段',
	'label-replace': '替换:',
	'label-rwith': '为:',
	'label-useregex': '正则表达式',
	'label-regex-flags': '模式标志:',
	'tip-regex-flags': '正则表达式的标志（flags），例如 i 表示忽视大小写差别，g 表示全局替换。\n' +
		'在此 JWB 脚本中，_ 标志会将下划线（_）与空格视为相同。慎重使用。',
	'label-ignore-comment': '忽略不解析的内容',
	'tip-ignore-comment': '忽略 nowiki, source, math 和 pre 标签内的注释和文本。',
	'label-enable-RETF': '启用 $1',
	'label-RETF': '用正则纠正错字',
	'tip-refresh-RETF': '刷新错字纠正列表以用于之后的编辑。',

	// Tab 3
	'label-redirects': '重定向:',
	'redirects-follow': '跟随',
	'tip-redirects-follow': '编辑重定向的目标',
	'redirects-skip': '跳过',
	'tip-redirects-skip': '跳过重定向',
	'redirects-edit': '编辑',
	'tip-redirects-edit': '编辑重定向本身而非重定向目标',
	'label-skip-when': '跳过条件:',
	'skip-no-change': '没有更改',
	'skip-exists-yes': '页面存在',
	'skip-exists-no': '不存在',
	'skip-exists-neither': '均否',
	'skip-after-action': '移动/保护后跳过编辑',
	'skip-contains': '当页面包含:',
	'skip-not-contains': '当页面不含:',

	// Tab 4
	'editbutton-move': '移动',
	'editbutton-delete': '删除',
	'editbutton-protect': '保护',
	'move-header': '移动选项',
	'move-redir-suppress': '不建重定向',
	'move-also': '同时移动:',
	'move-talk-page': '讨论页',
	'move-subpage': '子页面',
	'move-new-name': '新页面名:',
	'protect-header': '保护选项',
	'protect-edit': '编辑:',
	'protect-move': '移动:',
	'protect-none': '不保护', // This is the default label. It should indicate that the dropdown menu is used for selecting protection levels
	'protect-autoconf': '自动确认',
	'protect-sysop': '仅管理员',
	'protect-expiry': '过期时间:',

	//Dialog boxes
	'confirm-leave': '关闭此标签页将丢失现有进度。',
	'alert-no-move': '点击“移动”前，请输入新的页面名称。',
	'not-on-list': '您的用户名未列于 JWB 用户名录（checkpage），不能提交。需由任一管理员授权。',
	'verify-error': '加载 AutoWikiBrowser checkpage 出错:',
	'new-message': '您有新消息，可从状态栏访问。',
	'no-pages-listed': '点击“开始”前，需要先输入一些页面到处理列表。',
	'infinite-skip-notice': "没有指定任何替换规则，JWB 已设置为没有更改时自动跳过。\n" +
		"请复查“内容”和“跳过”选项卡中的内容。",
	'autosave-error': "提交上一页时有问题。请检查“$1”选项卡验证上一次编辑是否正确完成。",

	//Statuses
	'status-alt': '加载中...',
	'status-done': '完成',
	'status-newmsg': '您有 $1 ($2)',
	'status-talklink': '条新消息',
	'status-difflink': '最后更改',
	'status-load-page': '获取页面内容',
	'status-submit': '提交编辑',
	'status-preview': '获取预览',
	'status-diff': '获取编辑差异',
	'status-move': '移动页面',
	'status-delete': '删除页面',
	'status-undelete': '反删除页面',
	'status-protect': '保护页面',
	'status-watch': '修改监视列表',
	'status-watch-added': '$1 已加入您的监视列表',
	'status-watch-removed': '$1 已移出您的监视列表移除',
	'status-regex-err': '正则表达式错误。请更改<b>替换</b>中填写的正则表达式',
	'status-setup-load': '加载 JWB 设置',
	'status-setup-submit': '提交设置到 wiki',
	'status-setup-dload': '下载设置',
	'status-old-browser': '请使用 $1 来导入。',
	'status-del-setup': "$1 已删除。$2。",
	'status-del-default': '您的默认设置已重置。$1。',
	'status-del-undo': '撤销',
	'status-pl-over-lim': '达到服务器请求限制。',
	'status-unexpected': '意外错误。技术细节见开发者控制台。',

	//Setup
	'setup-prompt': '将当前初始设置保存到 $1 时如何命名？',
	'setup-prompt-store': '临时空间',
	'setup-prompt-save': '本地文件/页面',
	'setup-summary': '更新 JWB 设置 /*半自动*/', //this is based on wgContentLanguage, not wgUserLanguage.
	'old-browser': '您的浏览器不支持导入文件。请升级使用较新款浏览器，或将文件内容上传到 wiki。链接见状态栏。',
	'not-json': '仅可导入 JSON 文件。请确保您的文件使用 .json 扩展名，或在必要时更改其扩展名。',
	'json-err': '您的 JWB 设置中有错误：\n$1\n请检查您的设置 $2。',
	'json-err-upload': '文件',
	'json-err-page': "见 'Special:MyPage/$1'",
	'setup-delete-blank': '您不能删除此空白初始设置。',

	//Pagelist generating
	'namespace-main': '主',
	'label-ns-select': '命名空间:',
	'tip-ns-select': 'Ctrl+单击来选中多个命名空间。',
	'legend-cm': '分类',
	'label-cm': '分类:',
	'cm-include': '包括:',
	'cm-include-pages': '页面',
	'cm-include-subcgs': '子分类',
	'cm-include-files': '文件',
	'legend-linksto': '链向指定页面',
	'label-linksto': '链向:',
	'links-include': '包括:',
	'links-include-links': 'wiki格式内链',
	'links-include-templ': '模板式引入',
	'links-include-files': '文件用途',
	'links-redir': '重定向:',
	'links-redir-redirs': '重定向',
	'links-redir-noredirs': '非重定向',
	'links-redir-all': '均可',
	'label-link-redir': '包括链向重定向',
	'tip-link-redir': '包括指向此页面的重定向',
	'legend-ps': '特定前缀的页面',
	'label-ps': '前缀:',
	'legend-wr': '监视列表',
	'label-wr': '包括监视列表内容',
	'legend-pl': '指定页面上的链接',
	'label-pl': '指定页面:',
	'tip-pl': '获取特定页面上的链接列表。\n支持用竖线“|”字符分隔多个值。',
};

JWB.messages.zh = JWB.messages.zh_hans;
JWB.messages.zh_cn = JWB.messages.zh_hans;
JWB.messages.zh_my = JWB.messages.zh_hans;
JWB.messages.zh_sg = JWB.messages.zh_hans;
