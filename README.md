This repository contains the files required to run the JavaScript Wiki Browser developed by Joeytje50. The live version that can be used for importing into your wiki can be found at [English Wikipedia (User:Joeytje50/JWB)](http://en.wikipedia.org/wiki/User:Joeytje50/JWB).

Because of a different structure of files on Wikipedia, here's an overview of which Wikipedia page a certain file corresponds to:

| (Git file)           | ENWP/User:Joeytje50/$1                                                                             |
|----------------------|----------------------------------------------------------------------------------------------------|
| JWB.js               | [JWB.js](http://en.wikipedia.org/wiki/User:Joeytje50/JWB.js)                                       |
| JWB.css              | [JWB.css](http://en.wikipedia.org/wiki/User:Joeytje50/JWB.css)                                     |
| i18n.js              | [JWB.js/i18n.js](http://en.wikipedia.org/wiki/User:Joeytje50/JWB.js/i18n.js)                       |
| i18n/XX.js           | [JWB.js/i18n-XX.js](https://en.wikipedia.org/wiki/Special:PrefixIndex/User:Joeytje50/JWB.js/i18n-) |
| load.js              | [JWB.js/load.js](http://en.wikipedia.org/wiki/User:Joeytje50/JWB.js/load.js)                       |
| worker.js            | [JWB.js/worker.js](http://en.wikipedia.org/wiki/User:Joeytje50/JWB.js/load.js)                     |
| README.wikitext      | [JWB](http://en.wikipedia.org/wiki/User:Joeytje50/JWB)                                             |
| Changelog.wikitext   | [JWB/Changelog](https://en.wikipedia.org/wiki/User:Joeytje50/JWB/Changelog)                        |
| RETF/RETF.js         | [RETF.js](http://en.wikipedia.org/wiki/User:Joeytje50/RETF.js)                                     |
| RETF/README.wikitext | [RETF](http://en.wikipedia.org/wiki/User:Joeytje50/RETF)                                           |
| README.md            | *N/A*                                                                                              |

Author attribution can be found in the **JWB.js** file, and for the i18n contributions, authors are listed in the respective **i18n/XX.js** file for the language(s) they translated. For a comprehensive file history of each of the files starting at version 2.0, see [the history of the JWB.js page](https://en.wikipedia.org/w/index.php?title=User:Joeytje50/JWB.js&action=history) on the English Wikipedia. For version 1.0, see [the original version history on the RuneScape Wiki](https://runescape.wiki/w/User:Joeytje50/AWB.js?action=history).

If you want to modify this script and test it, you may need to modify some of the hardcoded URLs in the scripts. These URLs are conveniently placed at the top of the JWB.js file. Please do revert the urls back to the hardcoded wikipedia URLs when making a pull request into the master branch, in order to have a working version on this branch at all time.

A change log for changes made after version 4.0.0 can be found on Wikipedia, at [User:Joeytje50/JWB/Changelog](https://en.wikipedia.org/wiki/User:Joeytje50/JWB/Changelog).
