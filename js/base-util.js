function baseUtil () {
	d20plus.ut = {};

	d20plus.ut.log = (...args) => {
		console.log("%cD20Plus > ", "color: #3076b9; font-size: large", ...args);
	};

	d20plus.ut.chatLog = (arg) => {
		d20.textchat.incoming(
			false,
			{
				who: "5e.tools",
				type: "general",
				content: (arg || "").toString(),
				playerid: window.currentPlayer.id,
				id: d20plus.ut.generateRowId(),
				target: window.currentPlayer.id,
				avatar: "https://5e.tools/icon.png"
			}
		);
	};

	d20plus.ut.ascSort = (a, b) => {
		if (b === a) return 0;
		return b < a ? 1 : -1;
	};

	d20plus.ut.disable3dDice = () => {
		d20plus.ut.log("Disabling 3D dice");
		const $cb3dDice = $(`#enable3ddice`);
		$cb3dDice.prop("checked", false).attr("disabled", true)
			.attr("title", "3D dice are incompatible with betteR20. We apologise for any inconvenience caused.");

		d20.tddice.canRoll3D = () => false;
	};

	d20plus.ut.checkVersion = () => {
		function cmpVersions (a, b) {
			const regExStrip0 = /(\.0+)+$/;
			const segmentsA = a.replace(regExStrip0, '').split('.');
			const segmentsB = b.replace(regExStrip0, '').split('.');
			const l = Math.min(segmentsA.length, segmentsB.length);

			for (let i = 0; i < l; i++) {
				const diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
				if (diff) {
					return diff;
				}
			}
			return segmentsA.length - segmentsB.length;
		}

		d20plus.ut.log("Checking current version");
		$.ajax({
			url: `https://get.5e.tools`,
			success: (data) => {
				const m = /<!--\s*(\d+\.\d+\.\d+)\s*-->/.exec(data);
				if (m) {
					const curr = d20plus.version;
					const avail = m[1];
					const cmp = cmpVersions(curr, avail);
					if (cmp < 0) {
						setTimeout(() => {
							d20plus.ut.sendHackerChat(`A newer version of the script is available. Get ${avail} <a href="https://get.5e.tools/">here</a>.`);
						}, 1000);
					}
				}
			},
			error: () => {
				d20plus.ut.log("Failed to check version");
			}
		})
	};

	d20plus.ut.chatTag = (message) => {
		const isStreamer = !!d20plus.cfg.get("interface", "streamerChatTag");
		d20plus.ut.sendHackerChat(`
				${isStreamer ? "Script" : message} initialised.
				${window.enhancementSuiteEnabled ? `<br><br>Roll20 Enhancement Suite detected.` : ""}
				${isStreamer ? "" : `
				<br>
				<br>
				Need help? Join our <a href="https://discord.gg/AzyBjtQ">Discord</a>.
				<br>
				<br>
				<span title="You'd think this would be obvious.">
				Please DO NOT post about this script or any related content in official channels, including the Roll20 forums.
				<br>
				<br>
				Before reporting a bug on the Roll20 forums, please disable the script and check if the problem persists.				
				`} 
				</span>
			`);
	};

	d20plus.ut.showLoadingMessage = (message) => {
		const isStreamer = !!d20plus.cfg.get("interface", "streamerChatTag");
		d20plus.ut.sendHackerChat(`
			${isStreamer ? "Script" : message} initialising, please wait...<br><br>
		`);
	};

	d20plus.ut.sendHackerChat = (message) => {
		d20.textchat.incoming(false, ({
			who: "system",
			type: "system",
			content: `<span class="hacker-chat">
				${message}
			</span>`
		}));
	};

	d20plus.ut.addCSS = (sheet, selector, rules) => {
		const index = sheet.cssRules.length;
		try {
			if ("insertRule" in sheet) {
				sheet.insertRule(selector + "{" + rules + "}", index);
			} else if ("addRule" in sheet) {
				sheet.addRule(selector, rules, index);
			}
		} catch (e) {
			console.error(e);
			console.error(`Selector was "${selector}"; rules were "${rules}"`)
		}
	};

	d20plus.ut.addAllCss = () => {
		d20plus.ut.log("Add CSS");
		const targetSheet =  [...window.document.styleSheets]
			.filter(it => it.href && (!it.href.startsWith("moz-extension") && !it.href.startsWith("chrome-extension")))
			.find(it => it.href.includes("app.css"));

		_.each(d20plus.css.baseCssRules, function (r) {
			d20plus.ut.addCSS(targetSheet, r.s, r.r);
		});
		if (!window.is_gm) {
			_.each(d20plus.css.baseCssRulesPlayer, function (r) {
				d20plus.ut.addCSS(targetSheet, r.s, r.r);
			});
		}
		_.each(d20plus.css.cssRules, function (r) {
			d20plus.ut.addCSS(targetSheet, r.s, r.r);
		});
	};

	d20plus.ut.getAntiCacheSuffix = () => {
		return "?" + (new Date()).getTime();
	};

	d20plus.ut.generateRowId = () => {
		return window.generateUUID().replace(/_/g, "Z");
	};

	d20plus.ut.randomRoll = (roll, success, error) => {
		d20.textchat.diceengine.process(roll, success, error);
	};

	d20plus.ut.getJournalFolderObj = () => {
		d20.journal.refreshJournalList();
		let journalFolder = d20.Campaign.get("journalfolder");
		if (journalFolder === "") {
			d20.journal.addFolderToFolderStructure("Characters");
			d20.journal.refreshJournalList();
			journalFolder = d20.Campaign.get("journalfolder");
		}
		return JSON.parse(journalFolder);
	};

	d20plus.ut._lastInput = null;
	d20plus.ut.getNumberRange = (promptText, min, max) => {
		function alertInvalid () {
			alert("Please enter a valid range.");
		}

		function isOutOfRange (num) {
			return num < min || num > max;
		}

		function addToRangeVal (range, num) {
			range.add(num);
		}

		function addToRangeLoHi (range, lo, hi) {
			for (let i = lo; i <= hi; ++i) {
				range.add(i);
			}
		}

		function alertOutOfRange () {
			alert(`Please enter numbers in the range ${min}-${max} (inclusive).`);
		}

		while (true) {
			const res =  prompt(promptText, d20plus.ut._lastInput || "E.g. 1-5, 8, 11-13");
			if (res && res.trim()) {
				d20plus.ut._lastInput = res;
				const clean = res.replace(/\s*/g, "");
				if (/^((\d+-\d+|\d+),)*(\d+-\d+|\d+)$/.exec(clean)) {
					const parts = clean.split(",");
					const out = new Set();
					let failed = false;

					for (const part of parts) {
						if (part.includes("-")) {
							const spl = part.split("-");
							const numLo = Number(spl[0]);
							const numHi = Number(spl[1]);

							if (isNaN(numLo) || isNaN(numHi) || numLo === 0 || numHi === 0 || numLo > numHi) {
								alertInvalid();
								failed = true;
								break;
							}

							if (isOutOfRange(numLo) || isOutOfRange(numHi)) {
								alertOutOfRange();
								failed = true;
								break;
							}

							if (numLo === numHi) {
								addToRangeVal(out, numLo);
							} else {
								addToRangeLoHi(out, numLo, numHi);
							}
						} else {
							const num = Number(part);
							if (isNaN(num) || num === 0) {
								alertInvalid();
								failed = true;
								break;
							} else {
								if (isOutOfRange(num)) {
									alertOutOfRange();
									failed = true;
									break;
								}
								addToRangeVal(out, num);
							}
						}
					}

					if (!failed) {
						d20plus.ut._lastInput = null;
						return out;
					}
				} else {
					alertInvalid();
				}
			} else {
				d20plus.ut._lastInput = null;
				return null;
			}
		}
	};

	d20plus.ut.getTokenFromId = (tokenId) => {
		const foundTokenArr = d20.Campaign.pages.models.map(model => model.thegraphics.models.find(it => it.id === tokenId)).filter(it => it);
		if (foundTokenArr.length) {
			return foundTokenArr[0];
		}
		return null;
	};

	d20plus.ut._BYTE_UNITS = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
	d20plus.ut.getReadableFileSizeString = (fileSizeInBytes) => {
		let i = -1;
		do {
			fileSizeInBytes = fileSizeInBytes / 1024;
			i++;
		} while (fileSizeInBytes > 1024);
		return Math.max(fileSizeInBytes, 0.1).toFixed(1) + d20plus.ut._BYTE_UNITS[i];
	};


	// based on:
	/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/src/FileSaver.js */
	d20plus.ut.saveAs = function() {
		const view = window;
		var
			doc = view.document
			// only get URL when necessary in case Blob.js hasn't overridden it yet
			, get_URL = function() {
				return view.URL || view.webkitURL || view;
			}
			, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
			, can_use_save_link = "download" in save_link
			, click = function(node) {
				var event = new MouseEvent("click");
				node.dispatchEvent(event);
			}
			, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
			, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
			, setImmediate = view.setImmediate || view.setTimeout
			, throw_outside = function(ex) {
				setImmediate(function() {
					throw ex;
				}, 0);
			}
			, force_saveable_type = "application/octet-stream"
			// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
			, arbitrary_revoke_timeout = 1000 * 40 // in ms
			, revoke = function(file) {
				var revoker = function() {
					if (typeof file === "string") { // file is an object URL
						get_URL().revokeObjectURL(file);
					} else { // file is a File
						file.remove();
					}
				};
				setTimeout(revoker, arbitrary_revoke_timeout);
			}
			, dispatch = function(filesaver, event_types, event) {
				event_types = [].concat(event_types);
				var i = event_types.length;
				while (i--) {
					var listener = filesaver["on" + event_types[i]];
					if (typeof listener === "function") {
						try {
							listener.call(filesaver, event || filesaver);
						} catch (ex) {
							throw_outside(ex);
						}
					}
				}
			}
			, auto_bom = function(blob) {
				// prepend BOM for UTF-8 XML and text/* types (including HTML)
				// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
				if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
					return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
				}
				return blob;
			}
			, FileSaver = function(blob, name, no_auto_bom) {
				if (!no_auto_bom) {
					blob = auto_bom(blob);
				}
				// First try a.download, then web filesystem, then object URLs
				var
					filesaver = this
					, type = blob.type
					, force = type === force_saveable_type
					, object_url
					, dispatch_all = function() {
						dispatch(filesaver, "writestart progress write writeend".split(" "));
					}
					// on any filesys errors revert to saving with object URLs
					, fs_error = function() {
						if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
							// Safari doesn't allow downloading of blob urls
							var reader = new FileReader();
							reader.onloadend = function() {
								var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
								var popup = view.open(url, '_blank');
								if(!popup) view.location.href = url;
								url=undefined; // release reference before dispatching
								filesaver.readyState = filesaver.DONE;
								dispatch_all();
							};
							reader.readAsDataURL(blob);
							filesaver.readyState = filesaver.INIT;
							return;
						}
						// don't create more object URLs than needed
						if (!object_url) {
							object_url = get_URL().createObjectURL(blob);
						}
						if (force) {
							view.location.href = object_url;
						} else {
							var opened = view.open(object_url, "_blank");
							if (!opened) {
								// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
								view.location.href = object_url;
							}
						}
						filesaver.readyState = filesaver.DONE;
						dispatch_all();
						revoke(object_url);
					};
				filesaver.readyState = filesaver.INIT;

				if (can_use_save_link) {
					object_url = get_URL().createObjectURL(blob);
					setImmediate(function() {
						save_link.href = object_url;
						save_link.download = name;
						click(save_link);
						dispatch_all();
						revoke(object_url);
						filesaver.readyState = filesaver.DONE;
					}, 0);
					return;
				}

				fs_error();
			}
			, FS_proto = FileSaver.prototype
			, saveAs = function(blob, name, no_auto_bom) {
				return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
			};
		// IE 10+ (native saveAs)
		if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
			return function(blob, name, no_auto_bom) {
				name = name || blob.name || "download";

				if (!no_auto_bom) {
					blob = auto_bom(blob);
				}
				return navigator.msSaveOrOpenBlob(blob, name);
			};
		}
		FS_proto.abort = function(){};
		FS_proto.readyState = FS_proto.INIT = 0;
		FS_proto.WRITING = 1;
		FS_proto.DONE = 2;
		FS_proto.error =
			FS_proto.onwritestart =
				FS_proto.onprogress =
					FS_proto.onwrite =
						FS_proto.onabort =
							FS_proto.onerror =
								FS_proto.onwriteend =
									null;

		return saveAs;
	}();
}

SCRIPT_EXTENSIONS.push(baseUtil);
