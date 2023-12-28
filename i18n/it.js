/**
 * Internationalisation file for AutoWikiBrowser script
 * See https://en.wikipedia.org/wiki/User:Joeytje50/JWB.js for the full script, as well as licensing.
 * Licensed under GNU GPL 2. http://www.gnu.org/copyleft/gpl.html
 */

/** Italian
 * @author valepert; fixes Mannivu
 */

JWB.messages.it = {
	// General interface
	'tab-setup':			'Configura',
	'tab-editing':			'Modifica',
	'tab-skip':			'Salta',
	'tab-other':			'Altro',
	'tab-log':			'Log',
	'pagelist-caption':		'Lista di pagine:',
	'editbox-caption':		'Area di modifica',
	'editbox-currentpage':		'Modifica di <a href="/wiki/$2" target="_blank" title="$1">$1</a>',
	'no-changes-made':		'Nessuna modifica effettuata. Premere salta per andare alla pagina seguente della lista.',
	'page-not-exists':		'Pagina non esistente, non è possibile effettuare il confronto.',
	
	// Stats
	'stat-pages':			'Pagine elencate:',
	'stat-save':			'Pagine salvate:',
	'stat-null':			'Null edit:',
	'stat-skip':			'Pagine saltate:',
	'stat-other':			'Altro:',
	
	// Tab 1
	'label-pagelist':		'Lista di pagine',
	'button-remove-dupes':		'Elimina duplicati',
	'button-sort':			'Ordina',
	'preparse':			'Usa modalità pre-parse',
	'tip-preparse':			'Filtra tra la lista di pagine quelle che non sarebbero saltate dalle attuali regole Salta.',
	'preparse-reset':		'azzera',
	'tip-preparse-reset':		'Elimina il tag #PRE-PARSE-STOP nell\'elenco per riprocessare l\'intera lista di pagine',
	'pagelist-generate':		'Genera',
	'label-settings':		'Impostazioni',
	'store-setup':			'Salva impostazioni',
	'tip-store-setup':		'Salva le impostazioni attuali nel menu a tendina per accedervi successivamente.\n'+
					'Per accedervi in una sessione successiva, è necessario salvare su wiki o effettuare il download.',
	'load-settings':		'Carica:',
	'blank-setup':			'configurazione vuota',
	'delete-setup':			'Elimina',
	'tip-delete-setup':		'Elimina le impostazioni attualmente selezionate.',
	'save-setup':			'Salva su wiki',
	'download-setup':		'Download',
	'import-setup':			'Importa',
	'tip-import-setup':		'Carica il file delle impostazioni (formato JSON) dal tuo computer.',
	'update-setup':			'Ricarica',
	'tip-update-setup':		'Ricarica le impostazioni salvate nella tua pagina /$1',
	'label-limits':			'Limiti',
	'tip-time-limit':		'Il limite di tempo d\'esecuzione per ogni regola di corrispondenza (RegEx); si applica sia in Modifica che in Salta.',
	'time-limit':			'Limite di tempo RegEx',
	'tip-diff-size-limit':		'Il numero massimo di caratteri aggiunti/rimossi. 0 significa nessun limite. Può essere utilizzato come verifica per evitare grandi rimozioni/aggiunte.',
	'diff-size-limit':		'Limite dimensione modifica',
	'size-limit-exceeded':		'La dimensione della tua modifica ($1 caratteri) eccede il limite impostato nella scheda "Configura". Per ignorare il limite impostalo a 0.',

	// Tab 2
	'edit-summary':			'Oggetto:',
	'minor-edit':			'Modifica minore',
	'tip-via-JWB':			'Aggiunge (via JWB) alla fine dell\'oggetto',
	'watch-add':			'aggiungi adesso',
	'watch-remove':			'rimuovi adesso',
	'watch-nochange':		'Non modificare gli osservati speciali',
	'watch-preferences':		'Segui rispettando le preferenze',
	'watch-watch':			'Aggiungi pagine agli osservati speciali',
	'watch-unwatch':		'Rimuovi pagine dagli osservati speciali',
	'auto-save':			'Salva automaticamente',
	'save-interval':		'ogni $1 sec', //$1 represents the throttle/interval input element
	'tip-save-interval':		'Secondi di pausa tra ogni modifica',
	'editbutton-stop':		'Interrompi',
	'editbutton-start':		'Avvia',
	'editbutton-save':		'Salva',
	'editbutton-preview':		'Anteprima',
	'editbutton-skip':		'Salta', // This message is also used in tab 4
	'editbutton-diff':		'Diff',
	'button-open-popup':		'Più campi sostituzione',
	'button-more-fields':		'Aggiungi campi',
	'label-replace':		'Sostituisci:',
	'label-rwith':			'Con:',
	'label-useregex':		'Espressione regolare',
	'label-regex-flags':		'opzioni:',
	'tip-regex-flags':		'Opzioni per espressioni regolari, per esempio i per case insensitive o g per sostituzione globale.\n'+
					'Su JWB l\'opzione _ tratta underscore e spazi allo stesso modo. Usare con cautela.',
	'label-ignore-comment':		'Ignora il contenuto non interpretato',
	'tip-ignore-comment':		'Ignora i commenti e il testo tra i tag nowiki, source, math o pre.',
	'label-enable-RETF':		'Abilita $1',
	'label-RETF':			'RegEx Typo Fixing',
	'tip-refresh-RETF':		'Aggiorna la lista di typo.',
	'skip-RETF':			'Disabilita RETF',
	'tip-skip-RETF':		'Ricarica il contenuto della pagina senza RegEx Typo Fixing abilitato solamente per questa pagina.',
	
	// Tab 3
	'label-redirects':		'Redirect:',
	'redirects-follow':		'Segui',
	'tip-redirects-follow':		'Modifica la pagina cui il redirect punta',
	'redirects-skip':		'Salta',
	'tip-redirects-skip':		'Salta i redirect',
	'redirects-edit':		'Modifica',
	'tip-redirects-edit':		'Modifica il redirect invece che la pagina a cui punta',
	'label-skip-when':		'Salta quando:',
	'skip-no-change':		'Nessuna modifica da effettuare',
	'skip-exists-yes':		'esiste',
	'skip-exists-no':		'non esiste',
	'skip-exists-neither':		'non saltare',
	'skip-after-action':		'Salta la modifica dopo sposta/proteggi',
	'skip-contains':		'Quando la pagina contiene:',
	'skip-not-contains':		'Quando la pagina non contiene:',
	'skip-category':		'Fa parte delle categorie:',
	'skip-cg-prefix':		'Namespace non necessario; elementi separati da barra verticale `|` o virgola.',
	
	// Tab 4
	'editbutton-move':		'Sposta',
	'editbutton-delete':		'Cancella',
	'editbutton-protect':		'Proteggi',
	'move-header':			'Spostamento',
	'move-redir-suppress':		'Senza lasciare redirect',
	'move-also':			'Sposta anche:',
	'move-talk-page':		'pagina di discussione',
	'move-subpage':			'sottopagine',
	'move-new-name':		'Nuovo titolo:',
	'protect-header':		'Protezione',
	'protect-edit':			'Modifica:',
	'protect-move':			'Spostamento:',
	'protect-upload':		'Carica:',
	'protect-like-edit':		'Come Modifica',
	'protect-none':			'Nessuna protezione', // This is the default label. It should indicate that the dropdown menu is used for selecting protection levels
	'protect-autoconf':		'Autoconvalidati',
	'protect-sysop':		'Amministratori',
	'protect-expiry':		'Durata:',

	//Dialog boxes
	'confirm-leave':		'Chiudere questa scheda farà perdere tutti i progressi.',
	'alert-no-move':		'Inserire un nuovo titolo prima di cliccare su sposta.',
	'not-on-list':			'Il tuo nome utente non è stato trovato nella lista JWB. Richiedi accesso contattando un amministratore.',
	'verify-error':			'Si è verificato un errore nel caricamento della pagina di AutoWikiBrowser:',
	'new-message':			'Hai nuovi messaggi. Controlla i link nella barra di stato per visualizzarli.',
	'no-pages-listed':		'Inserisci pagine nella lista prima di premere avvia.',
	'infinite-skip-notice':	"Nessuna regola di sostituzione specificata, nessuna modifica verrà effettuata con le attuali impostazioni di JWB.\n"+
					"Controlla le impostazioni nelle schede 'Contenuto' e 'Salta'.",
	'autosave-error':		"Si è verificato un problema nella pubblicazione della pagina precedente. Controlla la scheda '$1' e verifica se le modifiche precedenti sono state effettuate correttamente.",
	'csp-error':			'Impossibile effettuare l\'azione precedente: violata Content Security Policy "$1".',
	'confirm-continue':		'Continua?',
	
	//Statuses
	'status-alt':			'caricamento...',
	'status-done':			'Fatto',
	'status-newmsg':		'Hai $1 ($2)',
	'status-talklink':		'nuovi messaggi',
	'status-difflink':		'ultima modifica',
	'status-load-page':		'Recupero contenuto delle pagine',
	'status-replacing':		'Applico regole di sostituzione',
	'status-check-skips':		'Controllo regole saltate',
	'status-submit':		'Pubblico modifiche',
	'status-preview':		'Recupero anteprima',
	'status-diff':			'Recupero diff',
	'status-move':			'Sposto pagina',
	'status-delete':		'Cancello pagina',
	'status-undelete':		'Recupero pagina',
	'status-protect':		'Proteggo pagina',
	'status-watch':			'Aggiorno osservati speciali',
	'status-watch-added':		'$1 è stata aggiunta agli osservati speciali',
	'status-watch-removed':		'$1 è stata rimossa agli osservati speciali',
	'status-regex-err':		'Errore nella regex. Modifica l\'espressione regolare di <i>sostituzione</i> inserita',
	'status-setup-load':		'Carico impostazioni JWB',
	'status-setup-submit':		'Pubblico impostazioni su wiki',
	'status-setup-dload':		'Scarico impostazioni',
	'status-old-browser':		'Usa $1 per importare.',
	'status-del-setup':		"'$1' è stato rimosso. $2.",
	'status-del-default':		'Le tue impostazioni predefinite sono state reimpostate. $1.',
	'status-del-undo':		'Annulla',
	'status-pl-over-lim':		'Raggiunto limite di richieste al server.',
	'status-unexpected':		'Errore inatteso. Controlla la console degli sviluppatori per dettagli tecnici.',

	//Setup
	'setup-prompt':			'Con che nome salvare $1 le tue impostazioni correnti?',
	'setup-prompt-store':		'registra',
	'setup-prompt-save':		'salva',
	'setup-summary':		'Aggiorno configurazioni JWB  /*semi-automatico*/', //this is based on wgContentLanguage, not wgUserLanguage.
	'old-browser':			'Il tuo browser non supporta l\'import di file. Aggiorna il browser o carica il contenuto del file sulla wiki. Controlla i link nella barra di stato.',
	'not-json':			'Possono essere importati solo file JSON. Controlla che il file abbia l\'estensione .json e modifica se necessario.',
	'json-err':			'Riscontrato un errore nelle impostazioni JWB:\n$1\nVerifica le tue impostazioni $2.',
	'json-err-upload':		'file',
	'json-err-page':		"visitando 'Special:MyPage/$1'",
	'setup-delete-blank':		'Non puoi cancellare la configurazione vuota.',
	'duplicate-settings':		'Conflitto tra pagine di configurazione. Sposta tutte le impostazioni da "$1" a "$2", trasformandolo in redirect (vedi $3 per maggiori dettagli sui redirect in JavaScript).',
	'setup-move-summary':		'Sposto pagina di configurazione JWB verso nuova destinazione /*automatico all\'avvio di JWB*/', // this is based on wgContentLanguage, not wgUserLanguage.
	'moved-settings':		'La tua pagina di configurazione è stata automaticamente spostata da "$1" alla più appropriata "$2" come funzionalità di JWB. Questa azione è stata registrata nella scheda "$3".\n'+ // receives JWB message 'tab-log' as $3.
					'Richiedi che il modello del contenuto della pagina sia aggiornato a JSON da un amministratore.',
	
	//Pagelist generating
	'namespace-main':		'principale',
	'label-ns-select':		'Namespace:',
	'tip-ns-select':		'Ctrl+click per selezionare namespace multipli.',
	'legend-cm':			'Categoria',
	'label-cm':			'Categoria:',
	'tip-cm':			'Namespace non richiesto; elenca il nome di una categoria.',
	'cm-include':			'Includi:',
	'cm-include-pages':		'pagine',
	'cm-include-subcgs':		'sottocategorie',
	'cm-include-files':		'file',
	'legend-linksto':		'Puntano qui',
	'label-linksto':		'Collegamenti a:',
	'links-include':		'Includi:',
	'links-include-links':		'wikilink',
	'links-include-templ':		'inclusioni',
	'links-include-files':		'uso del file',
	'links-redir':			'Redirect:',
	'links-redir-redirs':		'redirect',
	'links-redir-noredirs':		'non redirect',
	'links-redir-all':		'entrambi',
	'label-link-redir':		'Includi collegamenti a redirect',
	'tip-link-redir':		'Includi collegamenti verso uno dei redirect di questa pagina',
	'legend-ps':			'Pagine con prefisso',
	'label-ps':			'Prefisso:',
	'label-ps-strict':		'Ricerca precisa',
	'tip-ps-strict':		'Effettua una ricerca precisa per prefisso; se disabilitato effettua una ricerca fuzzy.',
	'legend-wr':			'Osservati speciali',
	'label-wr':			'Include il contenuto degli osservati speciali',
	'legend-pl':			'Collegamenti nella pagina',
	'label-pl':			'Nella pagina:',
	'tip-pl':			'Produce una lista di link alle pagine.\nLe pagine sono separate da barra verticale `|`.',
	'legend-sr':			'Ricerca su wiki',
	'tip-sr':			'Cerca usando la normale funzione di ricerca.',
	'label-sr':			'Termine della ricerca:',
	'placeholder-sr':		'Consigliato: $1/example/ o $2/example/',
	'legend-smw':			'Ricerca Semantic MediaWiki (<i>$1</i>)', // $1 == 'smw-slow'
	'smw-slow':			'lenta',
	'label-smw':			"Inserisci una ricerca Semantic MediaWiki. Ricorda di specificare un limite, es.:$1", // $1 == "\n|limit=500"
};
