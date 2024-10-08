/**
 * Internationalisation file for AutoWikiBrowser script
 * See https://en.wikipedia.org/wiki/User:Joeytje50/JWB.js for the full script, as well as licensing.
 * Licensed under GNU GPL 2. http://www.gnu.org/copyleft/gpl.html
 */

/** Galego (Galician)
 * @author Elisardojm
 */

JWB.messages.gl = {
	// General interface
	'tab-setup':			'Config.',
	'tab-editing':			'Edición',
	'tab-skip':		        'Saltar',
	'tab-other':			'Outros',
	'tab-log':				'Rexistro',
	'pagelist-caption':		'Indicar lista de páxinas:',
	'editbox-caption':		'Área de edición',
	'editbox-currentpage':	'Está a editar: <a href="$2" target="_blank" title="$1" accesskey="c">$1</a>',
	'no-changes-made':		'Non se fixeron cambios. Prema Saltar para pasar á seguinte páxina da lista.',
	'page-not-exists':		'A páxina non existe, non se poden xerar as diferenzas.',
	
	// Stats
	'stat-pages':			'Páxinas listadas:',
	'stat-save':			'Páxinas gardadas:',
	'stat-null':			'Edicións nulas:',
	'stat-skip':			'Páxinas saltadas:',
	'stat-other':			'Outro:',
	
	// Tab 1
	'label-pagelist':		'Lista de páxinas',
	'button-remove-dupes':	'Eliminar duplicados',
	'button-sort':			'Ordenar',
	'preparse':				'Usar modo pre-análise',
	'tip-preparse':			'Revisar a lista de páxinas, filtrándoa ata a páxina que non se saltará coas actuais regras de Salto.',
	'preparse-reset':		'reiniciar',
	'tip-preparse-reset':	'Limpar a etiqueta #PRE-PARSE-STOP na lista de páxinas, para pre-analizar a lista de páxinas completa de novo',
	'pagelist-generate':	'Xerar',
	'label-settings':		'Axustes',
	'store-setup':			'Gardar axustes',
	'tip-store-setup':		'Gardar os axustes actuais no menú despregable, para posterior acceso.\n'+
							'Para poder acceder a isto noutra sesión, precisa gardalo na wiki, ou descargalo.',
	'load-settings':		'Subir:',
	'blank-setup':			'Branquear axuste',
	'delete-setup':			'Borrar',
	'tip-delete-setup':		'Borrar o axuste que está seleccionado actualmente.',
	'save-setup':			'Gardar na wiki',
	'download-setup':		'Descargar',
	'import-setup':			'Importar',
	'tip-import-setup':		'Subir ficheiros de axustes (formato de ficheiro JSON) dende o seu ordenador.',
	'update-setup':			'Refrescar',
	'tip-update-setup':		'Refrescar os axustes almacenados na súa páxina /$1',
	
	// Tab 2
	'edit-summary':			'Resumo:',
	'minor-edit':			'Edición menor',
	'tip-via-JWB':			'Engadir (vía o programa JWB) ó final do seu resumo',
	'watch-add':			'engadir agora',
	'watch-remove':			'eliminar agora',
	'watch-nochange':		'Non modificar páxina de vixilancia',
	'watch-preferences':	'Vixiar baseado nas preferencias',
	'watch-watch':			'Engadir páxinas á lista de vixilancia',
	'watch-unwatch':		'Eliminar paxinas da lista de vixilancia',
	'auto-save':			'Gardar automaticamente',
	'save-interval':		'cada $1 sec', //$1 represents the throttle/interval input element
	'tip-save-interval':	'Cantidade de segundos de pausa entre cada edición',
	'editbutton-stop':		'Parar',
	'editbutton-start':		'Comezar',
	'editbutton-save':		'Gardar',
	'editbutton-preview':	'Vista previa',
	'editbutton-skip':		'Saltar', // This message is also used in tab 4
	'editbutton-diff':		'Diferenzas',
	'button-open-popup':	'Máis campos de substitución',
	'button-more-fields':	'Engadir máis campos',
	'label-replace':		'Substituír:',
	'label-rwith':			'Con:',
	'label-useregex':		'Expresión Regular',
	'label-regex-flags':	'marcas:',
	'tip-regex-flags':		'Calquera marca para expresións regulares, por exemplo i para ignorar maiúsculas.\n'+
					'Nesta aplicación JWB, a marca _ trata os subliñados e espazos como a mesma entidade. Usar con coidado.',
	'label-ignore-comment':	'Ignorar contido sen analizar',
	'tip-ignore-comment':	'Ignorar comentarios e texto dentro das etiquetas nowiki, source, math, ou pre.',
	'label-enable-RETF':	'Activar $1',
	'label-RETF':			'Arranxos de Erros de RegEx',
	'tip-refresh-RETF':		'Refrescar a lista de erros para novas modificacións.',
	
	// Tab 3
	'label-redirects':		'Redireccións:',
	'redirects-follow':		'Seguir',
	'tip-redirects-follow':	'Editar a páxina á que leva a redirección',
	'redirects-skip':		'Saltar',
	'tip-redirects-skip':	'Saltar redireccións',
	'redirects-edit':		'Editar',
	'tip-redirects-edit':	'Editar a redirección no canto da páxina á que redirixe',
	'label-skip-when':		'Saltar cando:',
	'skip-no-change':		'Non se fixeron cambios',
	'skip-exists-yes':		'existe',
	'skip-exists-no':		'non existe',
	'skip-exists-neither':	'ningún',
	'skip-after-action':	'Saltar a edición despois de mover/protexer',
	'skip-contains':		'Cando a páxina contén:',
	'skip-not-contains':	'Cando a páxina non contén:',
	
	// Tab 4
	'editbutton-move':		'Mover',
	'editbutton-delete':	'Borrar',
	'editbutton-protect':	'Protexer',
	'move-header':			'Opcións ó mover',
	'move-redir-suppress':	'Suprimir redireccións',
	'move-also':			'Tamén mover:',
	'move-talk-page':		'páxina de conversa',
	'move-subpage':			'subpáxinas',
	'move-new-name':		'Novo nome de páxina:',
	'protect-header':		'Opcións de protección',
	'protect-edit':			'Editar:',
	'protect-move':			'Mover:',
	'protect-none':			'Sen protección', // This is the default label. It should indicate that the dropdown menu is used for selecting protection levels
	'protect-autoconf':		'Autoconfirmado',
	'protect-sysop':		'Só Admins',
	'protect-expiry':		'Remata:',

	//Dialog boxes
	'confirm-leave':		'Se pechas esta pestana perderás todos os cambios.',
	'alert-no-move':		'Por favor indica o novo nome de páxina antes de premer en mover.',
	'not-on-list':			'O teu nome de usuario non se atopou na lista de control de JWB. Por favor, solicita acceso contactando cun administrador.',
	'verify-error':			'Houbo un erro ó cargar a páxina de control de JWB:',
	'new-message':			'Tes novas mensaxes. Consulta a barra de estado para consultalas.',
	'no-pages-listed':		'Por favor, indica algúns artigos para revisar antes de premer en Comezar.',
	'infinite-skip-notice':	"Non se indicaron regras de substitución, con JWB con salto automático cando non se fan cambios.\n"+
							"Por favor, revisa esta configuración nas pestanas 'Contido' e 'Saltar'",
	'autosave-error':		"Houbo un problema ó enviar a páxina anterior. Por favor, revisa a pestana '$1' e verifica se as edicións anteriores funcionaron correctamente.",
	
	//Statuses
	'status-alt':			'cargando...',
	'status-done':			'Feito',
	'status-newmsg':		'Tes $1 ($2)',
	'status-talklink':		'novas mensaxes',
	'status-difflink':		'último cambio',
	'status-load-page':		'Obtendo contidos de páxina',
	'status-submit':		'Enviando edición',
	'status-preview':		'Obtendo vista previa',
	'status-diff':			'Obtendo as diferenzas de edición',
	'status-move':			'Movendo páxina',
	'status-delete':		'Borrando páxina',
	'status-undelete':		'Restaurando páxina',
	'status-protect':		'Protexendo páxina',
	'status-watch':			'Modificando lista de vixilancia',
	'status-watch-added':	'$1 engadiuse á túa páxina de vixilancia',
	'status-watch-removed':	'$1 eliminouse da túa páxina de vixilancia',
	'status-regex-err':		'Erro de Regex. Por favor, cambia a expresión regular a <i>substituír</i>',
	'status-setup-load':	'Cargando axustes de JWB',
	'status-setup-submit':	'Enviando axustes á wiki',
	'status-setup-dload':	'Descargando axustes',
	'status-old-browser':	'Por favor, use $1 para importar.',
	'status-del-setup':		"'$1' foi borrado. $2.",
	'status-del-default':	'Os teus axustes por defecto foron reiniciados. $1.',
	'status-del-undo':		'Desfacer',
	'status-pl-over-lim':	'Alcanzada a lonxitude máxima da lista.', //TODO: re-translate from "Server request limit reached."
	//TODO:	'status-unexpected':	'Unexpected error. See the developers console for technical details.',

	//Setup
	'setup-prompt':			'Baixo que nome queres $1 a túa configuración actual?',
	'setup-prompt-store':	'almacenar',
	'setup-prompt-save':	'gardar',
	'setup-summary':		'Actualizando axustes de JWB /*semi-automatico*/', //this is based on wgContentLanguage, not wgUserLanguage.
	'old-browser':			'O teu navegador non soporta importar ficheiros, Por favor, actualízate a un novo navegador, ou carga os contidos do ficheiro na wiki. Consulta a barra de estado para ver ligazóns.',
	'not-json':		        'Só se poden importar ficheiros JSON. Por favor, asegúrate de que os teus ficheiros usan extensión .json, ou modifica a extensión do ficheiro se é necesario.',
	'json-err':				'Atopouse un erro nos teus axustes de JWB:\n$1\nPor favor, revisa os teus axustes $2.',
	'json-err-upload':		'ficheiro',
	'json-err-page':		"indo a 'Special:MyPage/$1'",
	'setup-delete-blank':	'Non podes borrar os axustes en branco.',
	
	//Pagelist generating
	'namespace-main':		'principal',
	'label-ns-select':		'Espazo de nomes:',
	'tip-ns-select':		'Ctrl+clic para seleccionar varios espazos de nomes.',
	'legend-cm':			'Categoría',
	'label-cm':			'Categoría:',
	'cm-include':			'Inclúe:',
	'cm-include-pages':		'páxinas',
	'cm-include-subcgs':	'subcategorías',
	'cm-include-files':		'ficheiros',
	'legend-linksto':		'Ligazóns a páxina',
	'label-linksto':		'Ligazóns a:',
	'links-include':		'Inclúe:',
	'links-include-links':	'ligazóns wiki',
	'links-include-templ':	'transclusións',
	'links-include-files':	'uso de ficheiro',
	'links-redir':			'Redireccións:',
	'links-redir-redirs':	'redireccións',
	'links-redir-noredirs':	'non redireccións',
	'links-redir-all':		'ambas',
	'label-link-redir':		'Incluír ligazóns a redireccións',
	'tip-link-redir':		'Incluír ligazóns dirixidas cara a unha destas redireccións de páxinas',
	'legend-ps':			'Páxinas con prefixo',
	'label-ps':				'Prefixo:',
	'legend-wr':			'Lista de vixilancia',
	'label-wr':				'Incluír contidos da páxina de vixilancia',
	'legend-pl':			'Ligazóns na páxina',
	'label-pl':				'Na páxina:',
	'tip-pl':				'Buscar unha lista de ligazóns na(s) páxina(s).\n Separar valores con barras verticais |.',
};
