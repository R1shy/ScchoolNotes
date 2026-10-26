"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  clickHandlerFor: () => clickHandlerFor,
  default: () => AuthorsToolbox,
  selectionWatcherFor: () => selectionWatcherFor
});
module.exports = __toCommonJS(main_exports);
var import_obsidian30 = require("obsidian");
var import_view11 = require("@codemirror/view");

// src/constants.ts
var MARK = /^(\s{0,3}(?:#{1,6}[ \t]+)?)%%(center|right|left|justify)%%/;
var MODES = {
  center: { label: "Center", icon: "align-center" },
  right: { label: "Align right", icon: "align-right" },
  left: { label: "Align left", icon: "align-left" },
  justify: { label: "Justify", icon: "align-justify" }
};
var IMG_EXT = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"];
var VIEW_WRITING = "authors-toolbox-writing";
var DEFAULTS = {
  imageFolder: "",
  defaultWidth: 400,
  defaultAlign: "center",
  // writing panel
  panelTab: "overview",
  panelAutoOpened: false,
  defaultLang: "auto",
  readingWpm: 230,
  speakingWpm: 150,
  longSentence: 35,
  echoWindow: 40,
  crutchEn: "",
  crutchEs: "",
  defaultGoal: 0,
  daily: {},
  // grammar
  ltConsent: false,
  ltServer: "https://api.languagetool.org",
  ltUser: "",
  ltKey: "",
  ltPicky: false,
  ltDictionary: "",
  ltDisabledRules: "WHITESPACE_RULE",
  checkScope: "section",
  // screenplay
  panelTabScript: "sp-stats",
  scriptsFolder: "Scripts",
  smartEnter: true,
  authorName: "",
  // stories
  autoRaya: true,
  storyFolders: "",
  // manuscript export
  exportLayout: "manuscript",
  exportFormats: "docx,pdf",
  exportKeepJustify: false,
  exportSceneBreak: "#",
  exportCoverPage: false,
  exportPresets: {},
  linesAsParagraphs: false,
  dailyGoal: 0,
  writingFolders: "",
  sprintMinutes: 25,
  sprintTarget: 500,
  sprints: [],
  habitsRange: "30",
  exportFont: "times",
  exportSpacing: "2",
  exportPage: "letter",
  exportContact: "",
  exportPseudonym: "",
  exportChapterBreaks: false,
  autoDrafts: true,
  autoDraftDays: 30,
  draftsFolder: ".authors-toolbox/drafts",
  revisionShow: "changes",
  contestsFolder: "",
  submissionsFolder: ".authors-toolbox/submissions",
  noticeDays: 14,
  showNextDeadline: true,
  noticeDay: ""
};

// src/commands/index.ts
var import_obsidian5 = require("obsidian");

// src/editor/alignment.ts
var import_obsidian = require("obsidian");
var import_view = require("@codemirror/view");
var import_state = require("@codemirror/state");
var SKIP_START = /^(\s*)(>|\||```|~~~|<|---\s*$|\*\*\*\s*$|[-+*]\s|\d+[.)]\s|!\[\[[^\]]*\]\]\s*$|\$\$)/;
function frontmatterEnd(editor) {
  if (editor.getLine(0) !== "---") return -1;
  for (let i = 1; i <= editor.lastLine(); i++) if (editor.getLine(i) === "---") return i;
  return -1;
}
function applyAlign(editor, target) {
  const sel = editor.listSelections()[0];
  const a = sel.anchor, h = sel.head;
  let from = Math.min(a.line, h.line), to = Math.max(a.line, h.line);
  const end = a.line > h.line || a.line === h.line && a.ch > h.ch ? a : h;
  if (to > from && end.ch === 0) to--;
  while (from > 0 && editor.getLine(from - 1).trim() !== "") from--;
  while (to < editor.lastLine() && editor.getLine(to + 1).trim() !== "") to++;
  const fmEnd = frontmatterEnd(editor);
  const starts = [];
  let inFence = false;
  for (let i = 0; i <= to; i++) {
    const t2 = editor.getLine(i);
    if (/^\s*(```|~~~)/.test(t2)) {
      inFence = !inFence;
      continue;
    }
    if (inFence || i <= fmEnd || i < from) continue;
    if (t2.trim() === "") continue;
    const prevBlank = i === 0 || editor.getLine(i - 1).trim() === "";
    if (!prevBlank) continue;
    if (SKIP_START.test(t2) && !MARK.test(t2)) continue;
    starts.push(i);
  }
  if (!starts.length) {
    new import_obsidian.Notice("Click inside a paragraph or select some text first.");
    return;
  }
  const current2 = (i) => {
    const m = MARK.exec(editor.getLine(i));
    return m ? m[2] : "none";
  };
  let newMode = target;
  if (target !== "none" && starts.every((i) => current2(i) === target)) newMode = "none";
  for (const i of starts) {
    const t2 = editor.getLine(i);
    const m = MARK.exec(t2);
    const prefix = m ? m[1] : (/^(\s{0,3}#{1,6}[ \t]+)/.exec(t2) || ["", ""])[1];
    const rest = m ? t2.slice(m[0].length) : t2.slice(prefix.length);
    const out = prefix + (newMode === "none" ? "" : `%%${newMode}%%`) + rest;
    if (out !== t2) editor.replaceRange(out, { line: i, ch: 0 }, { line: i, ch: t2.length });
  }
}
function buildDecorations(view) {
  const b = new import_state.RangeSetBuilder();
  const state = view.state;
  const doc = state.doc;
  let live2 = false;
  try {
    live2 = !!state.field(import_obsidian.editorLivePreviewField, false);
  } catch {
    live2 = false;
  }
  const headLine = doc.lineAt(state.selection.main.head).number;
  let cur = null, first = true;
  for (let n = 1; n <= doc.lines; n++) {
    const line = doc.line(n);
    const t2 = line.text;
    if (t2.trim() === "") {
      first = true;
      cur = null;
      continue;
    }
    let m = null;
    if (first) {
      m = MARK.exec(t2);
      cur = m ? m[2] : null;
      first = false;
    }
    if (!cur) continue;
    b.add(line.from, line.from, import_view.Decoration.line({ class: `at-line-${cur}` }));
    if (m && live2 && n !== headLine) {
      const from = line.from + m[1].length;
      b.add(from, from + `%%${cur}%%`.length, import_view.Decoration.replace({}));
    }
  }
  return b.finish();
}
var alignView = import_view.ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = buildDecorations(view);
    }
    update(u) {
      if (u.docChanged || u.selectionSet || u.viewportChanged) this.decorations = buildDecorations(u.view);
    }
  },
  { decorations: (v) => v.decorations }
);

// src/editor/raya.ts
var import_obsidian2 = require("obsidian");
var import_view2 = require("@codemirror/view");

// src/text/analysis.ts
var WORD_RE = /[\p{L}\p{M}\p{N}]+(?:[-'’][\p{L}\p{M}\p{N}]+)*/gu;
var LETTER_RE = /[\p{L}\p{M}\p{N}]/u;
var HR_RE = /^\s{0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
var SCENE_RE = /^\s{0,3}(?:%%\w+%%)?\s*(?:([-*_])(?:[ \t]*\1){2,}|⁂|#|§|~{3,}|\*\s\*\s\*)[ \t]*$/;
var HEADING_RE = /^(\s{0,3})(#{1,6})[ \t]+(.*)$/;
var LIST_RE = /^(\s*)([-+*]|\d+[.)])[ \t]+(\[[ xX]\][ \t]+)?/;
var STOP = {
  en: new Set("the a an and or but if then so of to in on at by for with from as is was were be been being are am it its it's this that these those i me my mine you your yours he him his she her hers we us our ours they them their theirs not no nor do did does done doing have has had having there here what which who whom whose when where why how all any some can could would should will shall may might must just than too very into out up down over under again about said one only i'm i'd i'll i've don't didn't doesn't can't couldn't wasn't weren't isn't aren't won't wouldn't it'll that's there's what's he's she's let's you're we're they're you'll we'll they'll you've we've they've also more most such each own same other both few through during before after above below off once because while until against between among himself herself itself myself yourself themselves ourselves get got like back even still well way much many now".split(" ")),
  es: new Set("el la los las lo un una unos unas y e o u ni pero sino si no de del a al en con por para sin sobre entre hasta desde hacia contra seg\xFAn tras que qu\xE9 quien qui\xE9n quienes cual cu\xE1l cuales como c\xF3mo cuando cu\xE1ndo donde d\xF3nde cuanto cu\xE1nto es era eran fue fueron ser sido siendo soy eres somos son est\xE1 estaba estaban estar estoy est\xE1s estamos est\xE1n estuvo estado ha hab\xEDa hab\xEDan han he has hemos haber hay habr\xE1 ser\xEDa ser\xEDan yo me mi mis m\xED t\xFA te tu tus ti \xE9l le les se su sus s\xED ella ellos ellas nos nosotros nosotras vosotros os usted ustedes nuestro nuestra nuestros nuestras vuestro este esta esto estos estas ese esa eso esos esas aquel aquella aquello aquellos aquellas muy m\xE1s menos ya tambi\xE9n tampoco porque pues as\xED todo toda todos todas otro otra otros otras cada mismo misma mismos mismas s\xF3lo solo tan tanto tanta tantos algo nada dijo mientras aunque luego entonces cuando ah\xED all\xED aqu\xED bien mal sea fuera hacer hizo hace tener ten\xEDa tiene tienen poder pod\xEDa puede pueden decir dice iba ir va".split(" "))
};
var ABBR = /* @__PURE__ */ new Set(["mr", "mrs", "ms", "dr", "st", "sr", "sra", "srta", "dra", "lic", "ing", "prof", "vs", "etc", "e.g", "i.e", "p", "pp", "no", "n\xFAm", "ud", "uds", "av", "col", "jr"]);
var ADVERB_EXC_EN = new Set("only family early reply apply supply imply comply holy ugly july italy lily belly fly rely ally bully jelly silly lonely friendly lovely daily likely assembly butterfly curly elderly jolly melancholy monopoly oily rally sly smelly wily chilly hilly ply anomaly emily molly sally kelly billy polly holly dolly folly gully tally woolly homily costly deadly lively lowly manly orderly timely worldly ghostly cowardly scholarly unlikely unruly burly surly bubbly cuddly prickly wrinkly sickly bodily hourly weekly monthly yearly nightly kindly".split(" "));
var ADVERB_EXC_ES = /* @__PURE__ */ new Set(["mente", "demente", "clemente", "simiente", "vehemente"]);
var DEFAULT_CRUTCH = {
  en: "very, really, just, actually, suddenly, quite, somehow, seemed, started to, began to, rather, literally, basically, simply, a little, kind of, sort of",
  es: "muy, realmente, de repente, de pronto, simplemente, b\xE1sicamente, solamente, empez\xF3 a, comenz\xF3 a, como que, un poco, algo, totalmente, en realidad, literalmente"
};
function words(s) {
  return s.match(WORD_RE) || [];
}
function proseMap(text2) {
  const pieces = [];
  const paras = [];
  let cur = null;
  const pushM = (s, from, ia) => {
    if (!s) return;
    const last = pieces[pieces.length - 1];
    if (last && last.k === "m" && last.from + last.s.length === from) {
      last.s += s;
      if (ia) last.i = (last.i || "") + ia;
      return;
    }
    const p = { k: "m", s, from };
    if (ia) p.i = ia;
    pieces.push(p);
  };
  const pushT = (s, from) => {
    if (!s) return;
    const last = pieces[pieces.length - 1];
    if (last && last.k === "t" && last.from + last.s.length === from) last.s += s;
    else pieces.push({ k: "t", s, from });
    if (cur) {
      if (cur.gap && cur.plain.length) cur.plain += "\n";
      cur.gap = false;
      const lastSeg = cur.segs[cur.segs.length - 1];
      if (lastSeg && lastSeg.d + lastSeg.n === from && lastSeg.p + lastSeg.n === cur.plain.length) lastSeg.n += s.length;
      else cur.segs.push({ p: cur.plain.length, d: from, n: s.length });
      cur.plain += s;
    }
  };
  const endPara = (line) => {
    if (cur && cur.plain.trim()) {
      cur.toLine = line;
      delete cur.gap;
      paras.push(cur);
    }
    cur = null;
  };
  const startPara = (kind, line) => {
    if (cur && cur.kind === kind) return;
    endPara(line);
    cur = { kind, fromLine: line, toLine: line, plain: "", segs: [], gap: false };
  };
  const st = { comment: false };
  const inline = (s, from) => {
    let i = 0, buf = "", bufFrom = from;
    const flush = () => {
      if (buf) pushT(buf, bufFrom);
      buf = "";
    };
    const mark2 = (len, ia) => {
      flush();
      pushM(s.slice(i, i + len), from + i, ia);
      i += len;
      bufFrom = from + i;
    };
    while (i < s.length) {
      const c = s[i], rest = s.slice(i);
      if (rest.startsWith("%%")) {
        const j = s.indexOf("%%", i + 2);
        if (j < 0) {
          mark2(s.length - i);
          st.comment = true;
          break;
        }
        mark2(j + 2 - i);
        continue;
      }
      if (rest.startsWith("![[")) {
        const j = s.indexOf("]]", i);
        mark2(j < 0 ? s.length - i : j + 2 - i);
        continue;
      }
      if (rest.startsWith("![")) {
        const m = /^!\[[^\]]*\]\([^)]*\)/.exec(rest);
        if (m) {
          mark2(m[0].length);
          continue;
        }
      }
      if (rest.startsWith("[[")) {
        const j = s.indexOf("]]", i);
        if (j > 0) {
          const inner = s.slice(i + 2, j), bar = inner.indexOf("|");
          if (bar >= 0) {
            mark2(2 + bar + 1);
            flush();
            pushT(inner.slice(bar + 1), from + i);
            i += inner.length - bar - 1;
            bufFrom = from + i;
            mark2(2);
          } else {
            const hash2 = inner.indexOf("#");
            mark2(2);
            const shown = hash2 >= 0 ? inner.slice(0, hash2) : inner;
            pushT(shown, from + i);
            i += shown.length;
            bufFrom = from + i;
            if (hash2 >= 0) mark2(inner.length - hash2);
            mark2(2);
          }
          continue;
        }
      }
      if (rest.startsWith("[^")) {
        const j = s.indexOf("]", i);
        if (j > 0) {
          mark2(j + 1 - i);
          continue;
        }
      }
      if (c === "[") {
        const m = /^\[([^\]]*)\]\(([^)]*)\)/.exec(rest);
        if (m) {
          mark2(1);
          pushT(m[1], from + i);
          i += m[1].length;
          bufFrom = from + i;
          mark2(2 + m[2].length + 1);
          continue;
        }
      }
      if (c === "`") {
        const j = s.indexOf("`", i + 1);
        if (j > 0) {
          mark2(j + 1 - i);
          continue;
        }
      }
      if (c === "<") {
        const tag = /^<\/?[a-zA-Z][^>]*>/.exec(rest);
        if (tag) {
          mark2(tag[0].length);
          continue;
        }
      }
      if (c === "\\" && i + 1 < s.length && /[!-/:-@[-`{-~]/.test(s[i + 1])) {
        mark2(1);
        buf += s[i];
        i++;
        continue;
      }
      if (/^(\*\*|__|~~|==)/.test(rest)) {
        mark2(2);
        continue;
      }
      if (c === "*") {
        mark2(1);
        continue;
      }
      if (c === "_") {
        const pv = i > 0 ? s[i - 1] : " ", nx = i + 1 < s.length ? s[i + 1] : " ";
        if (!(LETTER_RE.test(pv) && LETTER_RE.test(nx))) {
          mark2(1);
          continue;
        }
      }
      if (i === 0 || /\s/.test(s[i - 1])) {
        const url = /^https?:\/\/\S+/.exec(rest);
        if (url) {
          mark2(url[0].length);
          continue;
        }
      }
      const bid = /^\s\^[\w-]+\s*$/.exec(rest);
      if (bid) {
        mark2(bid[0].length);
        continue;
      }
      if (!buf) bufFrom = from + i;
      buf += c;
      i++;
    }
    flush();
  };
  const lines = text2.split("\n");
  let off = 0, front = lines[0] === "---", fence = false, callout = false;
  for (let n = 0; n < lines.length; n++) {
    const L = lines[n], from = off;
    if (front) {
      pushM(L, from);
      if (n > 0 && /^(---|\.\.\.)\s*$/.test(L)) front = false;
    } else if (st.comment) {
      const j = L.indexOf("%%");
      if (j < 0) pushM(L, from);
      else {
        pushM(L.slice(0, j + 2), from);
        st.comment = false;
        if (L.slice(j + 2).trim()) {
          startPara("para", n);
          inline(L.slice(j + 2), from + j + 2);
        }
      }
    } else if (fence) {
      pushM(L, from);
      if (/^\s*(```|~~~)/.test(L)) fence = false;
    } else if (/^\s*(```|~~~)/.test(L)) {
      endPara(n);
      fence = true;
      pushM(L, from);
    } else if (L.trim() === "") {
      endPara(n);
      callout = false;
      pushM(L, from);
    } else if (callout && /^\s*>/.test(L)) {
      pushM(L, from);
    } else if (/^\s*>\s*\[!/.test(L)) {
      endPara(n);
      callout = true;
      pushM(L, from);
    } else if (HR_RE.test(L) || SCENE_RE.test(L)) {
      endPara(n);
      pushM(L, from);
    } else if (/^\s*\|/.test(L) || /^\s*\$\$/.test(L)) {
      endPara(n);
      pushM(L, from);
    } else {
      callout = false;
      let m;
      if (m = HEADING_RE.exec(L)) {
        endPara(n);
        startPara("heading", n);
        const pre = m[1].length + m[2].length + (L.length - m[1].length - m[2].length - m[3].length);
        pushM(L.slice(0, pre), from);
        inline(L.slice(pre), from + pre);
        endPara(n + 1);
      } else if (m = /^(\s*>+\s?)/.exec(L)) {
        startPara("quote", n);
        pushM(m[1], from);
        inline(L.slice(m[1].length), from + m[1].length);
      } else if (m = LIST_RE.exec(L)) {
        endPara(n);
        startPara("list", n);
        pushM(m[0], from);
        inline(L.slice(m[0].length), from + m[0].length);
      } else {
        startPara("para", n);
        inline(L, from);
      }
      if (cur) cur.gap = true;
    }
    off += L.length;
    if (n < lines.length - 1) {
      pushM("\n", off, "\n");
      off += 1;
    }
  }
  endPara(lines.length);
  return { pieces, paras };
}
function plainToDoc(para2, p) {
  const segs = para2.segs;
  for (let k = 0; k < segs.length; k++) {
    const g2 = segs[k], nx = segs[k + 1];
    if (p < g2.p) return g2.d;
    if (p < g2.p + g2.n) return g2.d + (p - g2.p);
    if (p === g2.p + g2.n && (!nx || nx.p > p)) return g2.d + g2.n;
  }
  const g = segs[segs.length - 1];
  return g ? g.d + g.n : 0;
}
function detectLang(sample) {
  let en2 = 0, es2 = 0;
  for (const w of words(sample.slice(0, 2e4).toLowerCase())) {
    if (STOP.en.has(w)) en2++;
    if (STOP.es.has(w)) es2++;
  }
  if (/[ñáéíóú¿¡]/i.test(sample)) es2 += 3;
  return es2 > en2 ? "es" : "en";
}
function baseLang(code) {
  return String(code || "").toLowerCase().startsWith("es") ? "es" : "en";
}
function syllablesEn(w) {
  w = w.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}
function syllablesEs(w) {
  w = w.toLowerCase().replace(/qu(?=[eiéí])/g, "q").replace(/gu(?=[eiéí])/g, "g").replace(/y$/, "i").replace(/[^a-záéíóúüñ]/g, "");
  if (!w) return 0;
  const V = "aeiou\xE1\xE9\xED\xF3\xFA\xFC", STRONG2 = "aeo\xE1\xE9\xF3\xED\xFA";
  let n = 0, prev = null;
  for (const ch of w) {
    if (!V.includes(ch)) {
      prev = null;
      continue;
    }
    if (prev === null) n++;
    else if (STRONG2.includes(prev) && STRONG2.includes(ch)) n++;
    prev = ch;
  }
  return Math.max(1, n);
}
function readability(lang, nWords, nSent, nSyl) {
  if (!nWords || !nSent) return null;
  const wps = nWords / nSent, spw = nSyl / nWords;
  if (lang === "es") {
    const v2 = 206.835 - 62.3 * spw - wps;
    const label2 = v2 < 40 ? "Very difficult" : v2 < 55 ? "Somewhat difficult" : v2 < 65 ? "Normal" : v2 < 80 ? "Fairly easy" : "Very easy";
    return { name: "INFLESZ", score: v2, label: label2 };
  }
  const v = 206.835 - 1.015 * wps - 84.6 * spw;
  const grade = 0.39 * wps + 11.8 * spw - 15.59;
  const label = v >= 90 ? "Very easy" : v >= 80 ? "Easy" : v >= 70 ? "Fairly easy" : v >= 60 ? "Standard" : v >= 50 ? "Fairly difficult" : v >= 30 ? "Difficult" : "Very difficult";
  return { name: "Flesch", score: v, label, grade };
}
function splitSentences(s) {
  const out = [];
  const re = /(?:[.!?]+|…|\.\.\.)+[”"’'»)\]]*(?=\s|$)/g;
  let start = 0, m;
  while (m = re.exec(s)) {
    const end = m.index + m[0].length;
    const before = s.slice(start, m.index);
    const lastWord = (before.match(/(\S+)$/) || ["", ""])[1].toLowerCase().replace(/^[¿¡"“«(—–-]+/, "");
    if (/^\.$/.test(m[0]) && (ABBR.has(lastWord) || /^\p{L}$/u.test(lastWord))) continue;
    const after = s.slice(end).replace(/^\s+/, "");
    const nx = after.replace(/^[—–\-"“”«»'’(]+/, "");
    if (nx && /^\p{Ll}/u.test(nx)) continue;
    out.push([start, end]);
    start = end;
    while (start < s.length && /\s/.test(s[start])) start++;
  }
  if (start < s.length && s.slice(start).trim()) out.push([start, s.length]);
  return out.filter(([a, b]) => words(s.slice(a, b)).length > 0);
}
function dialogueRanges(s) {
  const out = [];
  let lineStart = 0;
  for (const line of s.split("\n")) {
    const t2 = line.replace(/^\s+/, ""), lead = line.length - t2.length;
    if (/^[—–]/.test(t2) || /^-(?=\S)/.test(t2)) {
      let on = true, start = lead + 1;
      for (let i = lead + 1; i < line.length; i++) {
        if (line[i] === "\u2014" || line[i] === "\u2013") {
          if (on) out.push([lineStart + start, lineStart + i]);
          else start = i + 1;
          on = !on;
        }
      }
      if (on) out.push([lineStart + start, lineStart + line.length]);
    } else {
      let open = -1;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === "\u201C" || c === "\xAB") {
          if (open < 0) open = i;
        } else if (c === "\u201D" || c === "\xBB") {
          if (open >= 0) {
            out.push([lineStart + open, lineStart + i]);
            open = -1;
          }
        } else if (c === '"') {
          if (open < 0) open = i;
          else {
            out.push([lineStart + open, lineStart + i]);
            open = -1;
          }
        }
      }
    }
    lineStart += line.length + 1;
  }
  return out;
}
function mattr(list, win) {
  if (!list.length) return 0;
  if (list.length <= win) return new Set(list).size / list.length;
  const cnt = /* @__PURE__ */ new Map();
  let uniq = 0, sum = 0, n = 0;
  for (let i = 0; i < list.length; i++) {
    const w = list[i];
    const c = (cnt.get(w) || 0) + 1;
    cnt.set(w, c);
    if (c === 1) uniq++;
    if (i >= win) {
      const o = list[i - win];
      const oc = (cnt.get(o) ?? 0) - 1;
      cnt.set(o, oc);
      if (oc === 0) uniq--;
    }
    if (i >= win - 1) {
      sum += uniq / win;
      n++;
    }
  }
  return sum / n;
}
function parseCrutch(str2) {
  return String(str2 || "").split(/[,\n]/).map((x) => x.trim().toLowerCase()).filter(Boolean);
}
function analyze(text2, opts) {
  opts = opts || {};
  const { paras } = proseMap(text2);
  const prose = paras.filter((p) => p.kind !== "heading").map((p) => Object.assign(p, { words: 0 }));
  const sample = prose.map((p) => p.plain).join("\n");
  const lang = opts.lang && opts.lang !== "auto" ? baseLang(opts.lang) : detectLang(sample);
  const stop = STOP[lang];
  const sylF = lang === "es" ? syllablesEs : syllablesEn;
  const W = [];
  const S = [];
  let chars = 0, charsNoSp = 0, syl = 0, dlgWords = 0;
  prose.forEach((p, pi) => {
    p.words = 0;
    chars += p.plain.length;
    charsNoSp += p.plain.replace(/\s/g, "").length;
    const dr = dialogueRanges(p.plain);
    let m;
    WORD_RE.lastIndex = 0;
    while (m = WORD_RE.exec(p.plain)) {
      const w = m[0], a = m.index;
      W.push({ w, lw: w.toLowerCase(), para: pi, a, b: a + w.length });
      p.words++;
      syl += sylF(w);
      if (dr.some(([x, y]) => a >= x && a < y)) dlgWords++;
    }
    for (const [a, b] of splitSentences(p.plain)) {
      const ws = words(p.plain.slice(a, b));
      S.push({ para: pi, a, b, n: ws.length, opener: (ws[0] || "").toLowerCase() });
    }
  });
  const nW = W.length, nS = S.length;
  const lens = S.map((s) => s.n);
  const avgS = nS ? nW / nS : 0;
  const sd = nS ? Math.sqrt(lens.reduce((t2, x) => t2 + (x - avgS) ** 2, 0) / nS) : 0;
  const capStat = /* @__PURE__ */ new Map();
  for (const x of W) {
    const p = prose[x.para].plain;
    const pre = p.slice(Math.max(0, x.a - 8), x.a);
    const initial = /^[\s—–\-"“«¿¡(']*$/.test(p.slice(0, x.a)) || /[.!?…:]["”’»)]*\s+[—–\-"“«¿¡(']*$/.test(pre);
    if (initial) continue;
    const c = capStat.get(x.lw) || { cap: 0, n: 0, shown: x.w };
    c.n++;
    if (/^\p{Lu}/u.test(x.w)) {
      c.cap++;
      c.shown = x.w;
    }
    capStat.set(x.lw, c);
  }
  const proper = new Set([...capStat.entries()].filter(([w, c]) => c.cap >= 1 && c.cap / c.n >= 0.8 && !stop.has(w)).map(([w]) => w));
  const nameCount = /* @__PURE__ */ new Map();
  for (const x of W) if (proper.has(x.lw)) nameCount.set(x.lw, (nameCount.get(x.lw) || 0) + 1);
  const names = [...nameCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([w, n]) => ({ word: w, shown: capStat.get(w)?.shown ?? w, count: n }));
  const content = W.filter((x) => !stop.has(x.lw) && x.lw.length >= 3 && !/^\d+$/.test(x.lw) && !proper.has(x.lw));
  const freq = /* @__PURE__ */ new Map();
  for (const x of content) freq.set(x.lw, (freq.get(x.lw) || 0) + 1);
  const top = [...freq.entries()].filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const win = opts.echoWindow || 40;
  const lastAt = /* @__PURE__ */ new Map(), echoes = /* @__PURE__ */ new Map();
  W.forEach((x, idx) => {
    if (stop.has(x.lw) || x.lw.length < 4 || /^\d+$/.test(x.lw) || proper.has(x.lw)) return;
    const prev = lastAt.get(x.lw);
    if (prev !== void 0 && idx - prev <= win) {
      const e = echoes.get(x.lw) || { word: x.lw, count: 0, idx: /* @__PURE__ */ new Set() };
      e.count++;
      e.idx.add(prev);
      e.idx.add(idx);
      echoes.set(x.lw, e);
    }
    lastAt.set(x.lw, idx);
  });
  const echoList = [...echoes.values()].sort((a, b) => b.count - a.count).slice(0, 12).map((e) => ({ word: e.word, count: e.count, idx: [...e.idx].sort((a, b) => a - b) }));
  const adv = /* @__PURE__ */ new Map();
  W.forEach((x, idx) => {
    const isAdv = lang === "es" ? /mente$/.test(x.lw) && x.lw.length > 6 && !ADVERB_EXC_ES.has(x.lw) : /ly$/.test(x.lw) && x.lw.length > 4 && !ADVERB_EXC_EN.has(x.lw);
    if (isAdv) {
      const e = adv.get(x.lw) || { word: x.lw, idx: [] };
      e.idx.push(idx);
      adv.set(x.lw, e);
    }
  });
  const advList = [...adv.values()].sort((a, b) => b.idx.length - a.idx.length);
  const advCount = advList.reduce((t2, e) => t2 + e.idx.length, 0);
  const crutch = [];
  for (const ph of parseCrutch((opts.crutch || DEFAULT_CRUTCH)[lang])) {
    const re = new RegExp(ph.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"), "giu");
    const hits = [];
    prose.forEach((p, pi) => {
      let m;
      re.lastIndex = 0;
      while (m = re.exec(p.plain)) {
        const a = m.index, b = a + m[0].length;
        if (a > 0 && LETTER_RE.test(p.plain[a - 1]) || b < p.plain.length && LETTER_RE.test(p.plain[b])) continue;
        hits.push({ para: pi, a, b });
      }
    });
    if (hits.length) crutch.push({ word: ph, hits });
  }
  crutch.sort((a, b) => b.hits.length - a.hits.length);
  const longT = opts.longSentence || 35;
  const longS = S.filter((s) => s.n > longT).sort((a, b) => b.n - a.n);
  const openers = [];
  for (let i = 0; i < S.length; ) {
    let j = i + 1;
    while (j < S.length && S[j].opener && S[j].opener === S[i].opener) j++;
    if (j - i >= 3 && S[i].opener) openers.push({ word: S[i].opener, sents: S.slice(i, j) });
    i = j;
  }
  const paraWords = opts.linesAsParagraphs ? prose.flatMap((p, i) => {
    const out = [];
    let a = 0;
    for (const line of p.plain.split("\n")) {
      const n = words(line).length;
      if (n > 0) out.push({ i, n, a, b: a + line.length });
      a += line.length + 1;
    }
    return out;
  }) : prose.map((p, i) => ({ i, n: p.words })).filter((x) => x.n > 0);
  const longestParas = [...paraWords].sort((a, b) => b.n - a.n).slice(0, 3);
  const r = readability(lang, nW, nS, syl);
  return {
    lang,
    paras: prose,
    allParas: paras,
    W,
    S,
    words: nW,
    chars,
    charsNoSp,
    paragraphs: paraWords.length,
    sentences: nS,
    avgSentence: avgS,
    sentenceSD: sd,
    lens,
    avgPara: paraWords.length ? nW / paraWords.length : 0,
    syllables: syl,
    readability: r,
    dialogue: nW ? dlgWords / nW : 0,
    variety: mattr(W.map((x) => x.lw), 100),
    top,
    echoes: echoList,
    adverbs: advList,
    adverbCount: advCount,
    crutch,
    longSentences: longS,
    longThreshold: longT,
    openers,
    longestParas,
    names
  };
}
function lengthCategory(n) {
  if (n < 1e3) return "Flash fiction";
  if (n < 7500) return "Short story";
  if (n < 17500) return "Novelette";
  if (n < 4e4) return "Novella";
  return "Novel";
}
function bodyStart(lines) {
  if (lines[0] !== "---") return 0;
  for (let i = 1; i < lines.length; i++) if (/^(---|\.\.\.)\s*$/.test(lines[i])) return i + 1;
  return 0;
}
function plainTitle(s) {
  return s.replace(/%%[^%]*%%/g, "").replace(/!\[\[[^\]]*\]\]/g, "").replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, "$2").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_~=`]/g, "").replace(/\s+/g, " ").trim();
}
function buildOutline(text2) {
  const lines = text2.split("\n");
  const start = bodyStart(lines);
  const heads = [], breaks = [];
  let fence = false, comment = false;
  for (let i = start; i < lines.length; i++) {
    const L = lines[i];
    const cnt = (L.match(/%%/g) || []).length;
    if (comment) {
      if (cnt % 2 === 1) comment = false;
      continue;
    }
    if (/^\s*(```|~~~)/.test(L)) {
      fence = !fence;
      continue;
    }
    if (fence) continue;
    if (cnt % 2 === 1) {
      comment = true;
      continue;
    }
    if (/^\s*>/.test(L)) continue;
    const h = HEADING_RE.exec(L);
    if (h) {
      heads.push({ line: i, level: h[2].length, title: plainTitle(h[3]) || "(untitled)" });
      continue;
    }
    if (SCENE_RE.test(L) && (i === start || lines[i - 1].trim() === "")) breaks.push(i);
  }
  const root = { id: "", level: 0, start, contentStart: start, end: lines.length, children: [], scenes: [], title: "" };
  const stack = [root];
  for (const h of heads) {
    while (stack[stack.length - 1].level >= h.level) stack.pop();
    const parent = stack[stack.length - 1];
    const node = { id: parent.id + "/h" + parent.children.length, level: h.level, title: h.title, start: h.line, contentStart: h.line + 1, end: lines.length, children: [], scenes: [], parent };
    parent.children.push(node);
    stack.push(node);
  }
  const all = [];
  (function walk(n) {
    all.push(n);
    n.children.forEach(walk);
  })(root);
  for (const n of all) {
    if (n === root) continue;
    const nxt = heads.find((h) => h.line > n.start && h.level <= n.level);
    n.end = nxt ? nxt.line : lines.length;
  }
  const nonBlank = (a, b) => {
    for (let i = a; i < b; i++) if (lines[i].trim()) return true;
    return false;
  };
  for (const n of all) {
    const ownEnd = n.children.length ? n.children[0].start : n.end;
    const bs = breaks.filter((b) => b >= n.contentStart && b < ownEnd);
    if (!bs.length) continue;
    const segs = [];
    let a = n.contentStart;
    for (const b of bs) {
      segs.push({ start: a, end: b, hasBreak: a !== n.contentStart });
      a = b;
    }
    segs.push({ start: a, end: ownEnd, hasBreak: true });
    let k = 0;
    for (const s of segs) {
      const from = s.hasBreak ? s.start + 1 : s.start;
      if (!nonBlank(from, s.end)) {
        s.empty = true;
        continue;
      }
      let first = from;
      while (first < s.end && !lines[first].trim()) first++;
      const title = plainTitle(lines[first]).split(/\s+/).slice(0, 7).join(" ") + "\u2026";
      const scene = Object.assign(s, { title, id: n.id + "/s" + k++, parent: n });
      n.scenes.push(scene);
    }
    n.sceneSep = lines[bs[0]].trim();
    n.leadingEmpty = segs[0].empty;
  }
  return { lines, root, all };
}
function trimBlank(arr) {
  let a = 0, b = arr.length;
  while (a < b && !arr[a].trim()) a++;
  while (b > a && !arr[b - 1].trim()) b--;
  return arr.slice(a, b);
}
function reorder(outline, parentId, kind, fromIdx, toIdx) {
  const parent = outline.all.find((n) => n.id === parentId);
  if (!parent) return null;
  const L = outline.lines;
  const count = kind === "h" ? parent.children.length : parent.scenes.length;
  if (fromIdx < 0 || fromIdx >= count || toIdx < 0 || toIdx >= count || fromIdx === toIdx) return null;
  const order = Array.from({ length: count }, (_, i) => i);
  const [mv] = order.splice(fromIdx, 1);
  order.splice(toIdx, 0, mv);
  let chunks, regionStart, regionEnd;
  if (kind === "h") {
    const items2 = parent.children;
    chunks = items2.map((n) => trimBlank(L.slice(n.start, n.end)).join("\n"));
    regionStart = items2[0].start;
    regionEnd = items2[items2.length - 1].end;
    const text3 = order.map((i) => chunks[i]).join("\n\n");
    while (regionEnd > regionStart && !L[regionEnd - 1].trim()) regionEnd--;
    return { fromLine: regionStart, toLine: regionEnd - 1, text: text3 };
  }
  const items = parent.scenes;
  const sceneSep = parent.sceneSep ?? "";
  chunks = items.map((s) => trimBlank(L.slice(s.hasBreak ? s.start + 1 : s.start, s.end)).join("\n"));
  const sep = "\n\n" + sceneSep + "\n\n";
  regionStart = items[0].hasBreak ? items[0].start : items[0].start;
  while (!items[0].hasBreak && regionStart < items[0].end && !L[regionStart].trim()) regionStart++;
  regionEnd = items[items.length - 1].end;
  while (regionEnd > regionStart && !L[regionEnd - 1].trim()) regionEnd--;
  let text2 = order.map((i) => chunks[i]).join(sep);
  if (parent.leadingEmpty) text2 = sceneSep + "\n\n" + text2;
  return { fromLine: regionStart, toLine: regionEnd - 1, text: text2 };
}
function utf8len(s) {
  let n = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0) ?? 0;
    n += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
  }
  return n;
}
function ltChunks(pieces, from, to, maxBytes) {
  const sel = [];
  for (const p of pieces) {
    const a = p.from, b = p.from + p.s.length;
    if (b <= from || a >= to) continue;
    const s = p.s.slice(Math.max(0, from - a), Math.min(p.s.length, to - a));
    const q = { k: p.k, s, from: Math.max(a, from) };
    if (p.i) q.i = p.s === s ? p.i : s.includes("\n") ? "\n" : "";
    sel.push(q);
  }
  const chunks = [];
  let cur = [], bytes = 0;
  const close = () => {
    if (cur.some((x) => x.k === "t" && x.s.trim())) chunks.push(cur);
    cur = [];
    bytes = 0;
  };
  for (const p of sel) {
    const b = utf8len(p.s);
    if (bytes + b > maxBytes && cur.length) {
      let cut = -1;
      for (let i = cur.length - 1; i > 0; i--) if (cur[i].k === "m" && /\n\s*\n|\n$/.test(cur[i].s)) {
        cut = i + 1;
        break;
      }
      if (cut > 0 && cut < cur.length) {
        const keep = cur.slice(cut);
        cur = cur.slice(0, cut);
        close();
        cur = keep;
        bytes = keep.reduce((t2, x) => t2 + utf8len(x.s), 0);
      } else close();
    }
    if (b > maxBytes && p.k === "t") {
      let s = p.s, f = p.from;
      while (utf8len(s) > maxBytes) {
        let cut = Math.floor(maxBytes / 2);
        const m = s.slice(0, cut).match(/[\s\S]*[.!?…]\s/);
        if (m) cut = m[0].length;
        cur.push({ k: "t", s: s.slice(0, cut), from: f });
        close();
        s = s.slice(cut);
        f += cut;
      }
      cur.push({ k: "t", s, from: f });
      bytes += utf8len(s);
      continue;
    }
    cur.push(p);
    bytes += b;
  }
  close();
  return chunks.map((c) => ({
    base: c[0].from,
    text: c.map((x) => x.s).join(""),
    bytes: c.reduce((t2, x) => t2 + utf8len(x.s), 0),
    annotation: c.map((x) => x.k === "t" ? { text: x.s } : x.i ? { markup: x.s, interpretAs: x.i } : { markup: x.s })
  }));
}
function issueKind(m) {
  const t2 = m.rule && m.rule.issueType || "";
  const cat = m.rule && m.rule.category && m.rule.category.id || "";
  if (t2 === "misspelling" || cat === "TYPOS") return "spelling";
  if (t2 === "grammar" || cat === "GRAMMAR") return "grammar";
  if (t2 === "typographical" || t2 === "whitespace" || cat === "PUNCTUATION" || cat === "TYPOGRAPHY" || cat === "CASING") return "punctuation";
  return "style";
}
function chunkPlainToDoc(chunk, off) {
  let p = 0, d = chunk.base;
  for (const a of chunk.annotation) {
    if (a.text !== void 0) {
      if (off <= p + a.text.length) return d + (off - p);
      p += a.text.length;
      d += a.text.length;
    } else {
      const ia = a.interpretAs || "";
      if (off < p + ia.length) return d;
      p += ia.length;
      d += a.markup.length;
    }
  }
  return d;
}
function mapMatches(json, chunk, docText) {
  const out = [];
  for (const m of json && json.matches || []) {
    const ctx = m.context;
    const expected = ctx && typeof ctx.text === "string" ? ctx.text.slice(ctx.offset, ctx.offset + ctx.length) : chunk.text.slice(m.offset, m.offset + m.length);
    const len = expected.length;
    if (!len) continue;
    const cands = [chunk.base + m.offset, chunkPlainToDoc(chunk, m.offset)];
    let from = -1;
    for (const c of cands) if (docText.slice(c, c + len) === expected) {
      from = c;
      break;
    }
    for (let dd = 1; dd < 400 && from < 0; dd++) {
      for (const c of cands) {
        if (docText.slice(c - dd, c - dd + len) === expected) {
          from = c - dd;
          break;
        }
        if (docText.slice(c + dd, c + dd + len) === expected) {
          from = c + dd;
          break;
        }
      }
    }
    if (from < 0) continue;
    out.push({
      from,
      to: from + len,
      text: expected,
      message: m.message || "",
      short: m.shortMessage || "",
      replacements: (m.replacements || []).slice(0, 6).map((r) => r.value),
      kind: issueKind(m),
      rule: m.rule && m.rule.id || "",
      ruleName: m.rule && m.rule.description || "",
      sentence: m.sentence || "",
      id: ""
    });
  }
  return out;
}

// src/screenplay/fountain.ts
var SP_SCENE = /^(?:INT\.?\/EXT|EXT\.?\/INT|INT|EXT|EST|I\/E|E\/I)[.\s]/i;
var SP_TRANS_WORDS = /^(FADE (IN|OUT)[:.]?|FADE TO BLACK\.?|CUT TO BLACK\.?|SMASH CUT TO:|MATCH CUT TO:|JUMP CUT TO:|FUNDIDO (A NEGRO|DE ENTRADA|DE SALIDA)[.:]?|CORTE A NEGRO[.:]?|ABRE A:|ENTRA[.:]?)$/;
var SP_WIDTH = { action: 61, scene: 61, transition: 61, centered: 61, dialogue: 35, paren: 26, character: 38, lyric: 35, section: 61 };
var SP_LINES_PER_PAGE = 55;
function isUpperLine(s) {
  return /\p{L}/u.test(s) && !/\p{Ll}/u.test(s);
}
function cueName(line) {
  return line.replace(/^\s*@/, "").replace(/\^\s*$/, "").replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim().toUpperCase();
}
function isScriptText(text2) {
  const m = /^---\n([\s\S]*?)\n---/.exec(text2);
  if (!m) return false;
  return /^type:\s*["']?(\[\[)?(script|screenplay|guion|guión)(\]\])?["']?\s*$/mi.test(m[1]) || /^cssclass(es)?:.*screenplay/m.test(m[1]) || /^\s*-\s*["']?screenplay["']?\s*$/m.test(m[1]);
}
function isScriptFM(fm) {
  if (!fm) return false;
  const ty = fm.type;
  const first = Array.isArray(ty) ? ty[0] : ty || "";
  const t2 = String(first).toLowerCase().replace(/\[\[|\]\]/g, "");
  if (["script", "screenplay", "guion", "gui\xF3n"].includes(t2)) return true;
  const c = fm.cssclasses || fm.cssclass;
  const cArr = Array.isArray(c) ? c.map((x) => String(x ?? "")) : typeof c === "string" ? c.split(/[,\s]+/) : [];
  return cArr.includes("screenplay");
}
function classifyScript(text2) {
  const lines = text2.split("\n");
  const out = new Array(lines.length).fill(null);
  let i = 0;
  if (lines[0] === "---") {
    i = 1;
    while (i < lines.length && !/^(---|\.\.\.)\s*$/.test(lines[i])) i++;
    i++;
  }
  let comment = false, fence = false, block = 0;
  const blocks = [];
  let cur = null;
  for (; i < lines.length; i++) {
    const L = lines[i];
    const cnt = (L.match(/%%/g) || []).length;
    if (comment) {
      if (cnt % 2 === 1) comment = false;
      cur = null;
      continue;
    }
    if (/^\s*(```|~~~)/.test(L)) {
      fence = !fence;
      out[i] = { t: "meta" };
      cur = null;
      continue;
    }
    if (fence) {
      out[i] = { t: "meta" };
      continue;
    }
    if (/^\s*%%/.test(L) && cnt % 2 === 1) {
      comment = true;
      cur = null;
      continue;
    }
    if (/^\s*%%.*%%\s*$/.test(L) && !/^\s*%%(center|right|left|justify)%%\S/.test(L)) {
      out[i] = { t: "meta" };
      continue;
    }
    if (L.trim() === "") {
      cur = null;
      continue;
    }
    if (!cur) {
      cur = [];
      blocks.push(cur);
    }
    cur.push(i);
  }
  for (const b of blocks) {
    block++;
    let k = 0;
    while (k < b.length) {
      const n = b[k], L = lines[n], t2 = L.trim();
      const rest = b.length - k;
      const set = (type, mark2, markEnd) => {
        out[n] = { t: type, mark: mark2 || 0, markEnd: markEnd || 0, block };
      };
      if (/^\s*>\s*\[!/.test(L)) {
        for (let j = k; j < b.length && /^\s*>/.test(lines[b[j]]); j++) {
          out[b[j]] = { t: "meta", block };
          k = j;
        }
        k++;
        continue;
      }
      if (/^#{1,6}\s/.test(t2)) {
        set("section");
        k++;
        continue;
      }
      if (/^!?\[\[.*\]\]$/.test(t2) || /^!\[.*\]\(.*\)$/.test(t2)) {
        set("meta");
        k++;
        continue;
      }
      if (/^={3,}\s*$/.test(t2)) {
        set("pagebreak");
        k++;
        continue;
      }
      if (/^=(?!=)/.test(t2)) {
        set("synopsis", L.indexOf("=") + 1);
        k++;
        continue;
      }
      if (/^\.(?![.\s])/.test(t2) || SP_SCENE.test(t2)) {
        set("scene", /^\./.test(t2) ? L.indexOf(".") + 1 : 0);
        k++;
        continue;
      }
      if (/^>.*<\s*$/.test(t2)) {
        set("centered", L.indexOf(">") + 1, L.length - L.lastIndexOf("<"));
        k++;
        continue;
      }
      if (rest === 1 && k === 0 && (/^>(?!.*<\s*$)/.test(t2) || isUpperLine(t2) && (/(TO|A):$/.test(t2) || SP_TRANS_WORDS.test(t2)))) {
        set("transition", /^>/.test(t2) ? L.indexOf(">") + 1 : 0);
        k++;
        continue;
      }
      if (k === 0 && rest >= 2 && !/^!/.test(t2) && (/^@/.test(t2) || isUpperLine(t2.replace(/\([^)]*\)/g, "")) && !/:$/.test(t2) && t2.length <= 50)) {
        set("character", /^@/.test(t2) ? L.indexOf("@") + 1 : 0, /\^\s*$/.test(L) ? L.length - L.lastIndexOf("^") : 0);
        for (let j = 1; j < b.length; j++) {
          const lj = lines[b[j]].trim();
          out[b[j]] = { t: /^\(.*\)$/.test(lj) ? "paren" : "dialogue", mark: 0, markEnd: 0, block };
        }
        k = b.length;
        continue;
      }
      if (/^~/.test(t2)) {
        set("lyric", L.indexOf("~") + 1);
        k++;
        continue;
      }
      set("action", /^!/.test(t2) ? L.indexOf("!") + 1 : 0);
      k++;
    }
  }
  return { lines, types: out };
}
function wrapCount(s, width) {
  const words2 = s.trim().split(/\s+/).filter(Boolean);
  if (!words2.length) return 1;
  let lines = 1, len = 0;
  for (const w of words2) {
    const l = w.length;
    if (len === 0) len = l;
    else if (len + 1 + l <= width) len += 1 + l;
    else {
      lines++;
      len = l;
    }
    while (len > width) {
      lines++;
      len -= width;
    }
  }
  return lines;
}
function stripInline(s) {
  return s.replace(/%%[^%]*%%/g, "").replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, "$2").replace(/(\*\*\*|\*\*|\*|__|_|~~|==)/g, "");
}
function parseHeading(t2) {
  let s = t2.replace(/^\./, "").replace(/#[^#]+#\s*$/, "").trim();
  const m = /^(INT\.?\/EXT\.?|EXT\.?\/INT\.?|INT\.?|EXT\.?|EST\.?|I\/E\.?|E\/I\.?)\s*/i.exec(s);
  let ie = "";
  if (m) {
    ie = m[1].toUpperCase().replace(/\.$/, "").replace(/\.\//, "/");
    s = s.slice(m[0].length);
  }
  let time = "";
  const dash = s.split(/\s+[-–—]\s+/);
  if (dash.length > 1) {
    time = (dash.pop() ?? "").trim().toUpperCase();
    s = dash.join(" - ");
  }
  return { ie: ie.startsWith("INT/") || ie.startsWith("EXT/") || ie === "I/E" || ie === "E/I" ? "INT/EXT" : ie, location: s.trim().toUpperCase(), time };
}
function analyzeScript(text2, lang) {
  const { lines, types } = classifyScript(text2);
  const scenes = [], chars = /* @__PURE__ */ new Map(), locs = /* @__PURE__ */ new Map(), notes = [];
  let total = 0, curScene = null, dlgWords = 0, actWords = 0, prevBlock = -1, lastCue = null, speechLines = 0, speechStart = -1;
  let actionLines = 0, actionStart = -1;
  const sections = [];
  const camera = lang === "es" ? /\b(vemos|veremos|la cámara|cámara|primer plano|plano general|zoom|paneo|panea|close up|travelling)\b/i : /\b(we see|we hear|we watch|camera|close on|close-up|closeup|pan to|pans|zoom|zooms|angle on|tracking shot)\b/i;
  const unfilm = lang === "es" ? /\b(piensa|pensaba|recuerda|recordaba|se da cuenta|siente que|sabe que|sabía que|se pregunta|imagina|desea)\b/i : /\b(thinks|thought|remembers|remembered|realizes|realised|realized|wonders|knows that|feels that|recalls|wishes)\b/i;
  const closeAction = () => {
    if (actionStart >= 0 && actionLines > 4) notes.push({ kind: "dense", line: actionStart, msg: `Action paragraph runs ${actionLines} lines \u2014 keep action to 3\u20134 lines so the page reads fast.` });
    actionLines = 0;
    actionStart = -1;
  };
  const closeSpeech = () => {
    if (speechStart >= 0 && speechLines > 6 && lastCue) notes.push({ kind: "speech", line: speechStart, msg: `${lastCue} speaks for ${speechLines} lines \u2014 long speeches slow a scene; consider breaking it up.` });
    speechLines = 0;
    speechStart = -1;
  };
  for (let n = 0; n < lines.length; n++) {
    const x = types[n];
    if (!x || x.t === "meta") continue;
    const raw = lines[n], body = stripInline(raw.slice(x.mark || 0, raw.length - (x.markEnd || 0))).trim();
    if (x.block !== prevBlock) {
      if (prevBlock >= 0) total += 1;
      if (x.t !== "action") closeAction();
      if (x.t !== "dialogue" && x.t !== "paren") closeSpeech();
      prevBlock = x.block;
    }
    const w = SP_WIDTH[x.t] || 61;
    const h = x.t === "pagebreak" ? 0 : x.t === "section" || x.t === "synopsis" ? 0 : wrapCount(body, w);
    if (x.t === "pagebreak") total = Math.ceil(total / SP_LINES_PER_PAGE) * SP_LINES_PER_PAGE;
    total += h;
    if (x.t === "section") {
      const lvl = (/^#+/.exec(raw.trim()) || ["#"])[0].length;
      sections.push({ line: n, level: lvl, title: plainTitle(raw.replace(/^#+\s*/, "")) });
      continue;
    }
    if (curScene && x.t !== "scene") {
      curScene.lines += h + (x.block !== curScene.lastBlock ? 1 : 0);
      curScene.lastBlock = x.block;
    }
    switch (x.t) {
      case "scene": {
        if (curScene) curScene.end = n;
        const hd = parseHeading(body);
        curScene = { line: n, end: lines.length, heading: body.toUpperCase(), ...hd, lines: h, startLine: total - h, lastBlock: x.block, cast: /* @__PURE__ */ new Set(), words: 0, eighths: 0 };
        scenes.push(curScene);
        if (hd.location) {
          const l = locs.get(hd.location) || { name: hd.location, scenes: 0, ie: /* @__PURE__ */ new Set(), times: /* @__PURE__ */ new Set() };
          l.scenes++;
          if (hd.ie) l.ie.add(hd.ie);
          if (hd.time) l.times.add(hd.time);
          locs.set(hd.location, l);
        }
        if (!hd.ie && !/^\./.test(raw.trim())) notes.push({ kind: "heading", line: n, msg: `Scene heading "${body}" should start with INT. or EXT.` });
        else if (hd.ie && !hd.time) notes.push({ kind: "heading", line: n, msg: `Scene heading "${body}" has no time of day (e.g. - DAY / - NOCHE).` });
        if (/\p{Ll}/u.test(body)) notes.push({ kind: "heading", line: n, msg: `Scene headings are written in CAPITALS: "${body}".` });
        break;
      }
      case "character": {
        const name = cueName(raw.slice(x.mark || 0));
        lastCue = name;
        const c = chars.get(name) || { name, speeches: 0, words: 0, scenes: /* @__PURE__ */ new Set(), firstLine: n };
        c.speeches++;
        if (curScene) {
          c.scenes.add(curScene.line);
          curScene.cast.add(name);
        }
        chars.set(name, c);
        break;
      }
      case "dialogue":
      case "paren": {
        if (speechStart < 0) speechStart = n;
        speechLines += h;
        if (x.t === "dialogue") {
          const wc = words(body).length;
          dlgWords += wc;
          if (lastCue) {
            const cc = chars.get(lastCue);
            if (cc) cc.words += wc;
          }
          if (curScene) curScene.words += wc;
        } else if (words(body).length > 6) notes.push({ kind: "paren", line: n, msg: `Long parenthetical \u2014 parentheticals are for brief delivery notes; put actions in the action lines.` });
        break;
      }
      case "action": {
        if (actionStart < 0) actionStart = n;
        actionLines += h;
        const wc = words(body).length;
        actWords += wc;
        if (curScene) curScene.words += wc;
        let m;
        if (m = camera.exec(body)) notes.push({ kind: "camera", line: n, msg: `\u201C${m[0]}\u201D \u2014 camera directions are usually left to the director in a spec script.` });
        if (m = unfilm.exec(body)) notes.push({ kind: "unfilmable", line: n, msg: `\u201C${m[0]}\u201D \u2014 only write what the audience can see or hear.` });
        break;
      }
      default:
        break;
    }
  }
  closeAction();
  closeSpeech();
  if (curScene) curScene.end = lines.length;
  for (const c of chars.values()) {
    const first = c.firstLine;
    const nameWords = c.name.split(/\s+/).filter((w) => w.length > 1);
    let introduced = false;
    for (let n = 0; n < first && !introduced; n++) {
      const x = types[n];
      if (!x || x.t !== "action") continue;
      if (nameWords.some((w) => new RegExp("(^|[^\\p{L}])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^\\p{L}]|$)", "u").test(lines[n]))) introduced = true;
    }
    if (!introduced) notes.push({ kind: "intro", line: first, msg: `${c.name} speaks before being introduced \u2014 introduce new characters in action, name in CAPS, with a short description (e.g. "ANA (30s), tired but sharp").` });
  }
  const pages = total / SP_LINES_PER_PAGE;
  for (const s of scenes) s.eighths = Math.max(1, Math.round(s.lines / SP_LINES_PER_PAGE * 8));
  const ie = { INT: 0, EXT: 0, "INT/EXT": 0 }, times = {};
  const isIEKey = (k) => k in ie;
  for (const s of scenes) {
    if (isIEKey(s.ie)) ie[s.ie]++;
    if (s.time) times[s.time] = (times[s.time] || 0) + 1;
  }
  notes.sort((a, b) => a.line - b.line);
  return {
    lines,
    types,
    pages,
    minutes: pages,
    scenes,
    sections,
    characters: [...chars.values()].sort((a, b) => b.speeches - a.speeches),
    locations: [...locs.values()].sort((a, b) => b.scenes - a.scenes),
    dialogueWords: dlgWords,
    actionWords: actWords,
    ie,
    times,
    notes
  };
}
function fmtEighths(e) {
  const p = Math.floor(e / 8), r = e % 8;
  return (p ? p + (r ? " " : "") : "") + (r ? `${r}/8` : "") || "0";
}
function buildScriptOutline(text2) {
  const { lines, types } = classifyScript(text2);
  const start = bodyStart(lines);
  const root = { id: "", level: 0, start, end: lines.length, children: [], scenes: [], title: "" };
  const stack = [root];
  const all = [root];
  for (let n = start; n < lines.length; n++) {
    const x = types[n];
    if (!x) continue;
    if (x.t === "section") {
      const lvl = (/^#+/.exec(lines[n].trim()) || ["#"])[0].length;
      while (stack[stack.length - 1].level >= lvl) stack.pop();
      const parent = stack[stack.length - 1];
      const node = { id: parent.id + "/h" + parent.children.length, level: lvl, title: plainTitle(lines[n].replace(/^\s*#+\s*/, "")) || "(untitled)", start: n, end: lines.length, children: [], scenes: [], parent };
      parent.children.push(node);
      stack.push(node);
      all.push(node);
    }
  }
  for (const n of all) {
    if (n === root) continue;
    const nxt = all.find((m) => m !== root && m.start > n.start && m.level <= n.level);
    n.end = nxt ? nxt.start : lines.length;
  }
  for (const n of all) {
    const ownEnd = n.children.length ? n.children[0].start : n.end;
    const heads = [];
    for (let i = n === root ? start : n.start + 1; i < ownEnd; i++) if (types[i]?.t === "scene") heads.push(i);
    heads.forEach((h, k) => {
      const end = k + 1 < heads.length ? heads[k + 1] : ownEnd;
      n.scenes.push({ id: n.id + "/c" + k, start: h, end, title: stripInline(lines[h].replace(/^\s*\./, "")).trim().toUpperCase(), parent: n, kind: "c" });
    });
  }
  return { lines, root, all };
}
function reorderScenes(outline, parentId, fromIdx, toIdx) {
  const parent = outline.all.find((n) => n.id === parentId);
  if (!parent) return null;
  const items = parent.scenes, L = outline.lines;
  if (fromIdx < 0 || fromIdx >= items.length || toIdx < 0 || toIdx >= items.length || fromIdx === toIdx) return null;
  const order = items.map((_, i) => i);
  const [mv] = order.splice(fromIdx, 1);
  order.splice(toIdx, 0, mv);
  const chunks = items.map((s) => trimBlank(L.slice(s.start, s.end)).join("\n"));
  let regionEnd = items[items.length - 1].end;
  while (regionEnd > items[0].start && !L[regionEnd - 1].trim()) regionEnd--;
  return { fromLine: items[0].start, toLine: regionEnd - 1, text: order.map((i) => chunks[i]).join("\n\n") };
}
function toFountain(text2, fm) {
  fm = fm || {};
  const lines = text2.split("\n");
  const body = lines.slice(bodyStart(lines)).join("\n");
  const tp = [];
  const val = (v) => {
    if (Array.isArray(v)) return v.map((item) => String(item ?? "")).join(", ").replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, "$2");
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      return String(v).replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, "$2");
    }
    return "";
  };
  const add = (k, v) => {
    const s = val(v);
    if (s.trim()) tp.push(`${k}: ${s}`);
  };
  add("Title", fm.title);
  add("Credit", fm.credit);
  add("Author", fm.author);
  add("Source", fm.source || (fm.adapted_from ? "Based on " + val(fm.adapted_from) : ""));
  add("Draft date", fm.draft_date);
  add("Contact", fm.contact);
  const out = body.replace(/^\s*>\s*\[![^\n]*(\n\s*>[^\n]*)*/gm, "").replace(/%%(center|right|left|justify)%%/g, "").replace(/!\[\[[^\]]*\]\]/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, "$2").replace(/%%([\s\S]*?)%%/g, (m, c) => c.trim() ? "[[" + c.trim() + "]]" : "").replace(/\n{3,}/g, "\n\n").trim();
  return (tp.length ? tp.join("\n") + "\n\n" : "") + out + "\n";
}

// src/editor/raya.ts
function isStoryState(state, folders) {
  const head = state.doc.sliceString(0, Math.min(state.doc.length, 3e3));
  if (isScriptText(head)) return false;
  const m = /^---\n([\s\S]*?)\n---/.exec(head);
  if (m && /^type:\s*["']?(\[\[)?(story|relato|cuento|novel|novela|novella|chapter|capítulo)(\]\])?["']?\s*$/mi.test(m[1])) return true;
  if (m && /^type:\s*\n\s*-\s*["']?(story|relato|cuento|novela?)["']?\s*$/mi.test(m[1])) return true;
  let path = "";
  try {
    const info = state.field(import_obsidian2.editorInfoField, false);
    path = info?.file?.path ?? "";
  } catch {
  }
  return !!path && folders.some((f) => f && path.startsWith(f.replace(/\/+$/, "") + "/"));
}
function rayaExtension(plugin) {
  return import_view2.EditorView.inputHandler.of((view, from, to, text2) => {
    if (text2 !== "-" || from !== to || !plugin.prefs.autoRaya) return false;
    const folders = String(plugin.prefs.storyFolders || "").split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
    if (!isStoryState(view.state, folders)) return false;
    const line = view.state.doc.lineAt(from);
    const before = line.text.slice(0, from - line.from);
    if (/^\s*(\||```|~~~|>)/.test(line.text)) return false;
    if (/^\s*(%%\w+%%)?\s*$/.test(before)) {
      view.dispatch({ changes: { from, insert: "\u2014" }, selection: { anchor: from + 1 }, userEvent: "input.type" });
      return true;
    }
    if (before.endsWith("-") && !before.endsWith("--") && !/-{3,}$/.test(line.text)) {
      view.dispatch({ changes: { from: from - 1, to: from, insert: "\u2014" }, selection: { anchor: from }, userEvent: "input.type" });
      return true;
    }
    return false;
  });
}
function convertDialogueDashes(text2) {
  const lines = text2.split("\n");
  let i = 0, n = 0, fence = false;
  if (lines[0] === "---") {
    i = 1;
    while (i < lines.length && !/^(---|\.\.\.)\s*$/.test(lines[i])) i++;
    i++;
  }
  for (; i < lines.length; i++) {
    const L = lines[i];
    if (/^\s*(```|~~~)/.test(L)) {
      fence = !fence;
      continue;
    }
    if (fence || /^\s*>/.test(L) || HR_RE.test(L)) continue;
    const m = /^(\s*(?:%%\w+%%)?)(?:\\?[-–])[ \t]?(?=\S)/.exec(L);
    if (m && !/^\s*-\s*\[[ xX]\]/.test(L)) {
      lines[i] = m[1] + "\u2014" + L.slice(m[0].length);
      n++;
    }
  }
  return { text: lines.join("\n"), changed: n };
}

// src/modals/insert-image.ts
var import_obsidian3 = require("obsidian");
var InsertImageModal = class extends import_obsidian3.Modal {
  constructor(app, plugin, editor, view) {
    super(app);
    this.plugin = plugin;
    this.editor = editor;
    this.view = view;
    this.file = null;
    this.upload = null;
    this.width = plugin.prefs.defaultWidth;
    this.align = plugin.prefs.defaultAlign;
    this.caption = "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("at-modal");
    contentEl.createEl("h3", { text: "Insert image" });
    const up = new import_obsidian3.Setting(contentEl).setName("From your computer").setDesc("No file chosen");
    const input = createEl("input", { type: "file" });
    input.accept = "image/*";
    input.addClass("at-hidden");
    input.onchange = () => {
      if (input.files && input.files[0]) {
        this.upload = input.files[0];
        this.file = null;
        up.setDesc(this.upload.name);
        this.list.value = "";
      }
    };
    up.addButton((b) => b.setButtonText("Choose file\u2026").onClick(() => input.click()));
    contentEl.appendChild(input);
    contentEl.createDiv({ text: "\u2026or pick an image already in the vault", cls: "setting-item-description" });
    const bar = contentEl.createDiv({ cls: "at-browse-bar" });
    const upBtn = bar.createEl("button", { text: "\u2191", attr: { "aria-label": "Parent folder" } });
    const where = bar.createSpan({ cls: "at-browse-path" });
    const search = contentEl.createEl("input", { type: "text", placeholder: "Filter this folder" });
    search.addClass("at-full");
    this.list = contentEl.createEl("select");
    this.list.size = 8;
    this.list.addClass("at-full");
    let folder = this.app.vault.getRoot();
    const show = () => {
      where.setText(folder.isRoot() ? "/" : folder.path);
      upBtn.disabled = folder.isRoot();
      const q = search.value.toLowerCase();
      this.list.empty();
      const kids = folder.children.filter((c) => c.name.toLowerCase().includes(q));
      kids.filter((c) => c instanceof import_obsidian3.TFolder).sort((a, b) => a.name.localeCompare(b.name)).forEach((c) => this.list.createEl("option", { text: "\u{1F4C1} " + c.name, value: "d:" + c.path }));
      kids.filter((c) => c instanceof import_obsidian3.TFile && IMG_EXT.includes(c.extension.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)).forEach((c) => this.list.createEl("option", { text: c.name, value: "f:" + c.path }));
    };
    const go = (f) => {
      if (f instanceof import_obsidian3.TFolder) {
        folder = f;
        search.value = "";
        show();
      }
    };
    upBtn.onclick = () => go(folder.parent);
    search.oninput = () => show();
    this.list.onchange = () => {
      const v = this.list.value;
      const target = this.app.vault.getAbstractFileByPath(v.slice(2));
      if (v.startsWith("d:")) {
        if (target instanceof import_obsidian3.TFolder) go(target);
        return;
      }
      this.file = target instanceof import_obsidian3.TFile ? target : null;
      this.upload = null;
      up.setDesc("No file chosen");
    };
    show();
    void this.startFolder().then(go);
    new import_obsidian3.Setting(contentEl).setName("Width (px)").setDesc("Leave empty for original size").addText((t2) => t2.setValue(String(this.width || "")).onChange((v) => this.width = parseInt(v, 10) || 0));
    new import_obsidian3.Setting(contentEl).setName("Alignment").addDropdown((d) => d.addOptions({ none: "Inline (no wrapper)", center: "Centered", left: "Left", right: "Right" }).setValue(this.align).onChange((v) => this.align = v));
    new import_obsidian3.Setting(contentEl).setName("Caption").setDesc("Optional, shown in italics under the image").addText((t2) => t2.onChange((v) => this.caption = v));
    new import_obsidian3.Setting(contentEl).addButton((b) => b.setButtonText("Insert").setCta().onClick(() => {
      void this.insert();
    }));
  }
  /** The image folder from settings, else the folder Obsidian uses for this note's attachments. */
  async startFolder() {
    const byPath = (p) => {
      const f = this.app.vault.getAbstractFileByPath(p);
      return f instanceof import_obsidian3.TFolder ? f : null;
    };
    if (this.plugin.prefs.imageFolder) {
      const f = byPath(this.plugin.prefs.imageFolder);
      if (f) return f;
    }
    try {
      const src = this.view && this.view.file ? this.view.file.path : "";
      const p = await this.app.fileManager.getAvailablePathForAttachment("image.png", src);
      const dir = p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "";
      const f = dir ? byPath(dir) : this.app.vault.getRoot();
      if (f) return f;
    } catch {
    }
    return (this.view && this.view.file ? this.view.file.parent : this.app.vault.getRoot()) ?? this.app.vault.getRoot();
  }
  async insert() {
    try {
      let tfile = this.file;
      if (this.upload) tfile = await this.plugin.saveUpload(this.upload, this.view && this.view.file ? this.view.file.path : "");
      if (!tfile) {
        new import_obsidian3.Notice("Choose an image first.");
        return;
      }
      const src = this.view && this.view.file ? this.view.file.path : "";
      const link = this.app.metadataCache.fileToLinktext(tfile, src);
      const embed = `![[${link}${this.width ? "|" + this.width : ""}]]`;
      const cap = this.caption.trim();
      const ed = this.editor;
      if (this.align === "none" && !cap) {
        ed.replaceSelection(embed);
      } else {
        const tag = this.align !== "none" ? `%%${this.align}%%` : "";
        const lines = [tag + embed];
        if (cap) lines.push("", `${tag}*${cap}*`);
        const ln = ed.getCursor("to").line;
        const cur = ed.getLine(ln);
        const prefix = cur.trim() === "" ? "" : "\n\n";
        ed.replaceRange(prefix + lines.join("\n") + "\n", { line: ln, ch: cur.length });
      }
      this.close();
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      new import_obsidian3.Notice("Authors Toolbox: could not insert image \u2014 " + msg);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/i18n.ts
var import_obsidian4 = require("obsidian");

// src/locales/en.ts
var en = {
  // writing panel tabs
  "tab.stats": "Stats",
  "tab.outline": "Outline",
  "tab.style": "Style",
  "tab.check": "Check",
  "tab.revise": "Revise",
  "tab.poem": "Poem",
  "tab.script": "Script",
  "tab.scenes": "Scenes",
  "tab.cast": "Cast",
  "tab.notes": "Notes",
  // command palette
  "cmd.align-mode": "{label} selected text",
  "cmd.script-el": "Screenplay: format line as {label}",
  "cmd.align-clear": "Clear alignment of selected text",
  "cmd.insert-image": "Insert image\u2026",
  "cmd.open-writing-panel": "Open writing panel",
  "cmd.raya-convert": "Convert dialogue dashes (- \u2192 \u2014) in this note",
  "cmd.check-selection": "Check spelling & grammar: selection",
  "cmd.check-section": "Check spelling & grammar: current section",
  "cmd.check-note": "Check spelling & grammar: whole note",
  "cmd.check-clear": "Clear spelling & grammar underlines",
  "cmd.script-new": "Screenplay: new script\u2026",
  "cmd.script-adapt": "Screenplay: adapt this story into a script",
  "cmd.script-export": "Screenplay: export as .fountain",
  "cmd.script-toggle": "Screenplay: turn script formatting on/off for this note",
  "cmd.script-pagebreak": "Screenplay: insert page break",
  "cmd.manuscript-export": "Export manuscript as a document or PDF\u2026",
  "cmd.substack-copy": "Copy for Substack\u2026",
  "cmd.lang-es": "Set note language: Espa\xF1ol",
  "cmd.lang-en": "Set note language: English",
  "cmd.lang-auto": "Set note language: auto-detect",
  "cmd.habits-open": "Open writing habits",
  "cmd.sprint-start": "Start a writing sprint\u2026",
  "cmd.sprint-stop": "Stop the writing sprint",
  "cmd.genre-set": "Set genre of this note\u2026",
  "cmd.draft-save": "Save a draft of this note\u2026",
  "cmd.revision-open": "Compare drafts of this note",
  "cmd.revision-marks": "Show or hide changes since the last draft in the editor",
  "cmd.revision-word": "Export the changes since the last draft with tracked changes (.docx)",
  "cmd.revision-goal": "Set a revision goal for this note\u2026",
  "cmd.submissions-open": "Open submissions",
  "cmd.contest-new": "New contest note\u2026",
  "cmd.contest-import": "Import contests from a CSV\u2026",
  "cmd.submission-add": "Add a submission for this note\u2026",
  "cmd.contest-export": "Export for a contest\u2026",
  "cmd.contest-ics": "Export contest deadlines as a calendar file"
};

// src/locales/es.ts
var es = {};

// src/i18n.ts
var tables = { en, es };
var current = "en";
function t(key, vars) {
  const raw = tables[current]?.[key] ?? en[key];
  return vars ? raw.replace(/\{(\w+)\}/g, (m, k) => k in vars ? String(vars[k]) : m) : raw;
}

// src/commands/index.ts
function mdFile(p, run2) {
  return (checking) => {
    const f = p.app.workspace.getActiveFile();
    if (!f || f.extension !== "md") return false;
    if (!checking) run2(f);
    return true;
  };
}
function registerCommands(p) {
  writingCommands(p);
  checkCommands(p);
  scriptCommands(p);
  exportCommands(p);
  languageCommands(p);
  habitCommands(p);
  revisionCommands(p);
  submissionCommands(p);
}
function writingCommands(p) {
  for (const [mode, info] of Object.entries(MODES)) {
    p.addCommand({ id: `align-${mode}`, name: t("cmd.align-mode", { label: info.label }), icon: info.icon, editorCallback: (editor) => applyAlign(editor, mode) });
  }
  p.addCommand({ id: "align-clear", name: t("cmd.align-clear"), editorCallback: (editor) => applyAlign(editor, "none") });
  p.addCommand({ id: "insert-image", name: t("cmd.insert-image"), icon: "image-plus", editorCallback: (editor, view) => {
    if (view instanceof import_obsidian5.MarkdownView) new InsertImageModal(p.app, p, editor, view).open();
  } });
  p.addCommand({ id: "open-writing-panel", name: t("cmd.open-writing-panel"), icon: "pen-line", callback: () => {
    void p.activatePanel();
  } });
  p.addCommand({ id: "raya-convert", name: t("cmd.raya-convert"), icon: "minus", editorCallback: (editor) => {
    const r = convertDialogueDashes(editor.getValue());
    if (!r.changed) {
      new import_obsidian5.Notice("No lines starting with a dash found.");
      return;
    }
    const last = editor.lastLine();
    editor.replaceRange(r.text, { line: 0, ch: 0 }, { line: last, ch: editor.getLine(last).length });
    new import_obsidian5.Notice(`${r.changed} dialogue line${r.changed === 1 ? "" : "s"} now start with a raya (\u2014).`);
  } });
}
function checkCommands(p) {
  p.addCommand({ id: "check-selection", name: t("cmd.check-selection"), icon: "spell-check", editorCallback: () => {
    void p.runCheck("selection");
  } });
  p.addCommand({ id: "check-section", name: t("cmd.check-section"), icon: "spell-check", editorCallback: () => {
    void p.runCheck("section");
  } });
  p.addCommand({ id: "check-note", name: t("cmd.check-note"), icon: "spell-check", editorCallback: () => {
    void p.runCheck("note");
  } });
  p.addCommand({ id: "check-clear", name: t("cmd.check-clear"), callback: () => p.clearCheck() });
}
function scriptCommands(p) {
  p.addCommand({ id: "script-new", name: t("cmd.script-new"), icon: "clapperboard", callback: () => p.newScript() });
  p.addCommand({ id: "script-adapt", name: t("cmd.script-adapt"), icon: "clapperboard", callback: () => {
    void p.adaptStory();
  } });
  p.addCommand({ id: "script-export", name: t("cmd.script-export"), icon: "file-output", callback: () => {
    void p.exportFountain();
  } });
  p.addCommand({ id: "script-toggle", name: t("cmd.script-toggle"), icon: "film", callback: () => {
    void p.toggleScriptMode();
  } });
  for (const [k, label, icon] of [["scene", "Scene heading", "clapperboard"], ["action", "Action", "pilcrow"], ["character", "Character", "user"], ["paren", "Parenthetical", "parentheses"], ["transition", "Transition", "arrow-right"], ["centered", "Centered", "align-center"]]) {
    p.addCommand({ id: "script-el-" + k, name: t("cmd.script-el", { label }), icon, editorCallback: (editor) => p.formatLine(editor, k) });
  }
  p.addCommand({ id: "script-pagebreak", name: t("cmd.script-pagebreak"), icon: "separator-horizontal", editorCallback: (editor) => {
    const c = editor.getCursor();
    editor.replaceRange("\n===\n\n", { line: c.line, ch: editor.getLine(c.line).length });
  } });
}
function exportCommands(p) {
  p.addCommand({ id: "manuscript-export", name: t("cmd.manuscript-export"), icon: "file-down", callback: () => {
    void p.exportManuscript();
  } });
  p.addCommand({ id: "substack-copy", name: t("cmd.substack-copy"), icon: "clipboard-copy", callback: () => {
    void p.copyForSubstack();
  } });
}
function languageCommands(p) {
  p.addCommand({ id: "lang-es", name: t("cmd.lang-es"), callback: () => {
    void p.setNoteLang("es");
  } });
  p.addCommand({ id: "lang-en", name: t("cmd.lang-en"), callback: () => {
    void p.setNoteLang("en-US");
  } });
  p.addCommand({ id: "lang-auto", name: t("cmd.lang-auto"), callback: () => {
    void p.setNoteLang("auto");
  } });
}
function habitCommands(p) {
  p.addCommand({ id: "habits-open", name: t("cmd.habits-open"), icon: "flame", callback: () => {
    void p.openHabits();
  } });
  p.addCommand({ id: "sprint-start", name: t("cmd.sprint-start"), icon: "timer", callback: () => p.openSprint() });
  p.addCommand({ id: "sprint-stop", name: t("cmd.sprint-stop"), icon: "timer-off", checkCallback: (checking) => {
    if (!p.sprint) return false;
    if (!checking) p.finishSprint(true);
    return true;
  } });
  p.addCommand({ id: "genre-set", name: t("cmd.genre-set"), icon: "tags", checkCallback: mdFile(p, (f) => p.openGenre(f)) });
}
function revisionCommands(p) {
  p.addCommand({ id: "draft-save", name: t("cmd.draft-save"), icon: "save", checkCallback: mdFile(p, (f) => {
    void p.revision.saveDraft(f);
  }) });
  p.addCommand({ id: "revision-open", name: t("cmd.revision-open"), icon: "git-compare", checkCallback: mdFile(p, (f) => {
    void p.revision.open(f);
  }) });
  p.addCommand({ id: "revision-marks", name: t("cmd.revision-marks"), icon: "diff", checkCallback: mdFile(p, (f) => {
    void p.revision.toggleMarks(f.path);
  }) });
  p.addCommand({ id: "revision-word", name: t("cmd.revision-word"), icon: "file-diff", checkCallback: mdFile(p, (f) => {
    void p.revision.exportTracked(f.path);
  }) });
  p.addCommand({ id: "revision-goal", name: t("cmd.revision-goal"), icon: "target", checkCallback: mdFile(p, (f) => p.revision.setGoal(f.path)) });
}
function submissionCommands(p) {
  p.addCommand({ id: "submissions-open", name: t("cmd.submissions-open"), icon: "send", callback: () => {
    void p.submissions.openView();
  } });
  p.addCommand({ id: "contest-new", name: t("cmd.contest-new"), icon: "trophy", callback: () => p.submissions.newContestDialog() });
  p.addCommand({ id: "contest-import", name: t("cmd.contest-import"), icon: "file-input", callback: () => p.submissions.importDialog() });
  p.addCommand({ id: "submission-add", name: t("cmd.submission-add"), icon: "send", checkCallback: mdFile(p, (f) => p.submissions.addDialog(f)) });
  p.addCommand({ id: "contest-export", name: t("cmd.contest-export"), icon: "file-check", checkCallback: mdFile(p, (f) => p.submissions.exportFor(f)) });
  p.addCommand({ id: "contest-ics", name: t("cmd.contest-ics"), icon: "calendar-plus", callback: () => {
    void p.submissions.exportIcs();
  } });
}

// src/menus.ts
var import_obsidian6 = require("obsidian");
function registerMenus(p) {
  p.registerEvent(p.app.workspace.on("file-menu", (menu, file) => {
    if (file instanceof import_obsidian6.TFolder) {
      menu.addItem((i) => i.setTitle("Export folder as one manuscript\u2026").setIcon("book-down").setSection("action").onClick(() => {
        void p.exportProject(file);
      }));
      return;
    }
    if (!(file instanceof import_obsidian6.TFile) || file.extension !== "md") return;
    menu.addItem((i) => i.setTitle("Export manuscript\u2026").setIcon("file-down").setSection("action").onClick(() => {
      void p.exportManuscript(file);
    }));
    menu.addItem((i) => i.setTitle("Copy for Substack\u2026").setIcon("clipboard-copy").setSection("action").onClick(() => {
      void p.copyForSubstack(file);
    }));
    menu.addItem((i) => i.setTitle("Save a draft\u2026").setIcon("save").setSection("action").onClick(() => {
      void p.revision.saveDraft(file);
    }));
    menu.addItem((i) => i.setTitle("Compare drafts").setIcon("git-compare").setSection("action").onClick(() => {
      void p.revision.open(file);
    }));
  }));
  p.registerEvent(p.app.workspace.on("editor-menu", (menu, editor, view) => {
    menu.addSeparator();
    for (const [mode, info] of Object.entries(MODES)) {
      menu.addItem((i) => i.setTitle(info.label).setIcon(info.icon).setSection("authors-toolbox").onClick(() => applyAlign(editor, mode)));
    }
    menu.addItem((i) => i.setTitle("Clear alignment").setIcon("eraser").setSection("authors-toolbox").onClick(() => applyAlign(editor, "none")));
    menu.addItem((i) => i.setTitle("Insert image\u2026").setIcon("image-plus").setSection("authors-toolbox").onClick(() => new InsertImageModal(p.app, p, editor, view instanceof import_obsidian6.MarkdownView ? view : null).open()));
    if (view instanceof import_obsidian6.MarkdownView && view.file && isScriptText(editor.getValue())) {
      for (const [k, label, icon] of [["scene", "Scene heading", "clapperboard"], ["character", "Character", "user"], ["paren", "Parenthetical", "parentheses"], ["transition", "Transition", "arrow-right"], ["action", "Action", "pilcrow"]]) {
        menu.addItem((i) => i.setTitle("Format as " + label).setIcon(icon).setSection("authors-toolbox-script").onClick(() => p.formatLine(editor, k)));
      }
    }
    if (editor.somethingSelected()) menu.addItem((i) => i.setTitle("Check spelling & grammar").setIcon("spell-check").setSection("authors-toolbox").onClick(() => {
      void p.runCheck("selection");
    }));
  }));
}

// src/editor/issues.ts
var import_view3 = require("@codemirror/view");
var import_state2 = require("@codemirror/state");
var setIssues = import_state2.StateEffect.define();
var removeIssue = import_state2.StateEffect.define();
var setFind = import_state2.StateEffect.define();
function issueIdOf(d) {
  const spec = d.spec;
  return spec ? spec.issueId : void 0;
}
var issueField = import_state2.StateField.define({
  create: () => ({ issues: import_view3.Decoration.none, find: import_view3.Decoration.none }),
  update(v, tr) {
    let issues = v.issues, find = v.find;
    if (tr.docChanged) {
      issues = issues.map(tr.changes);
      const touched = [];
      tr.changes.iterChangedRanges((fA, tA, fB, tB) => touched.push([fB, tB]));
      issues = issues.update({ filter: (f, t2) => t2 > f && !touched.some(([a, b]) => a <= t2 && b >= f) });
      find = import_view3.Decoration.none;
    }
    for (const e of tr.effects) {
      if (e.is(setIssues)) {
        issues = import_view3.Decoration.set(e.value.filter((x) => x.to > x.from).map((x) => import_view3.Decoration.mark({ class: `at-issue at-issue-${x.kind}`, issueId: x.id, attributes: { "data-at-issue": x.id } }).range(x.from, x.to)), true);
      } else if (e.is(removeIssue)) {
        const id = e.value;
        issues = issues.update({ filter: (f, t2, d) => issueIdOf(d) !== id });
      } else if (e.is(setFind)) {
        const { ranges, current: current2 } = e.value;
        find = import_view3.Decoration.set(ranges.filter((x) => x.to > x.from).map((x, i) => import_view3.Decoration.mark({ class: i === current2 ? "at-find at-find-current" : "at-find" }).range(x.from, x.to)), true);
      }
    }
    return { issues, find };
  },
  provide: (f) => [import_view3.EditorView.decorations.from(f, (v) => v.issues), import_view3.EditorView.decorations.from(f, (v) => v.find)]
});
function issueRange(cm, id) {
  let res = null;
  try {
    const st = cm.state.field(issueField, false);
    if (!st) return null;
    st.issues.between(0, cm.state.doc.length, (f, t2, d) => {
      if (issueIdOf(d) === id) {
        res = { from: f, to: t2 };
        return false;
      }
      return void 0;
    });
  } catch {
  }
  return res;
}
function issueAt(cm, pos) {
  let res = null;
  try {
    const st = cm.state.field(issueField, false);
    if (!st) return null;
    st.issues.between(pos, pos, (f, t2, d) => {
      const id = issueIdOf(d);
      if (f <= pos && t2 >= pos && id !== void 0) {
        res = { from: f, to: t2, id };
        return false;
      }
      return void 0;
    });
  } catch {
  }
  return res;
}

// src/modals/prompts.ts
var import_obsidian7 = require("obsidian");
var NumberPrompt = class extends import_obsidian7.Modal {
  constructor(app, title, value, onDone) {
    super(app);
    this.t = title;
    this.v = value;
    this.onDone = onDone;
  }
  onOpen() {
    this.contentEl.createEl("h3", { text: this.t });
    const input = this.contentEl.createEl("input", { type: "number", attr: { inputmode: "numeric", min: "0" } });
    input.value = this.v ? String(this.v) : "";
    input.addClass("at-full");
    const row = this.contentEl.createDiv({ cls: "at-modal-btns" });
    const save = () => {
      this.onDone(parseInt(input.value, 10) || 0);
      this.close();
    };
    row.createEl("button", { text: "Remove" }).onclick = () => {
      this.onDone(0);
      this.close();
    };
    row.createEl("button", { text: "Save", cls: "mod-cta" }).onclick = save;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") save();
    });
    window.setTimeout(() => input.focus(), 30);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var TextPrompt = class extends import_obsidian7.Modal {
  constructor(app, title, value, onDone, hint) {
    super(app);
    this.t = title;
    this.v = value;
    this.onDone = onDone;
    this.hint = hint;
  }
  onOpen() {
    this.contentEl.createEl("h3", { text: this.t });
    if (this.hint) this.contentEl.createDiv({ cls: "setting-item-description", text: this.hint });
    const input = this.contentEl.createEl("input", { type: "text" });
    input.value = this.v || "";
    input.addClass("at-full");
    const row = this.contentEl.createDiv({ cls: "at-modal-btns" });
    const ok = () => {
      const v = input.value.trim();
      if (v) {
        this.close();
        this.onDone(v);
      }
    };
    row.createEl("button", { text: "Cancel" }).onclick = () => this.close();
    row.createEl("button", { text: "Create", cls: "mod-cta" }).onclick = ok;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") ok();
    });
    window.setTimeout(() => {
      input.focus();
      input.select();
    }, 30);
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/poetry/editor.ts
var import_view5 = require("@codemirror/view");

// src/screenplay/editor.ts
var import_obsidian8 = require("obsidian");
var import_view4 = require("@codemirror/view");
var import_state3 = require("@codemirror/state");
var SCRIPTS_FOLDER_DEFAULT = "Scripts";
function docIsScript(state) {
  return isScriptText(state.doc.sliceString(0, Math.min(state.doc.length, 3e3)));
}
function buildSpDecorations(view) {
  const b = new import_state3.RangeSetBuilder();
  const state = view.state;
  if (!docIsScript(state)) return b.finish();
  const doc = state.doc;
  const { types } = classifyScript(doc.toString());
  let live2 = false;
  try {
    live2 = !!state.field(import_obsidian8.editorLivePreviewField, false);
  } catch {
    live2 = false;
  }
  const head = doc.lineAt(state.selection.main.head).number - 1;
  for (const { from, to } of view.visibleRanges) {
    let n = doc.lineAt(from).number - 1;
    const last = doc.lineAt(to).number - 1;
    for (; n <= last; n++) {
      const x = types[n];
      if (!x || x.t === "meta") continue;
      const line = doc.line(n + 1);
      b.add(line.from, line.from, import_view4.Decoration.line({ class: `sp-line sp-${x.t}` }));
      if (live2 && n !== head) {
        if (x.mark) b.add(line.from + x.mark - 1, line.from + x.mark, import_view4.Decoration.replace({}));
        if (x.markEnd && x.markEnd < line.length) b.add(line.to - x.markEnd, line.to, import_view4.Decoration.replace({}));
      }
    }
  }
  return b.finish();
}
var spView = import_view4.ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = buildSpDecorations(view);
    }
    update(u) {
      if (u.docChanged || u.selectionSet || u.viewportChanged) this.decorations = buildSpDecorations(u.view);
    }
  },
  { decorations: (v) => v.decorations }
);
var spAttrs = import_view4.EditorView.editorAttributes.compute(["doc"], (state) => docIsScript(state) ? { class: "sp-script" } : {});
function smartEnter(view) {
  const st = view.state;
  if (!docIsScript(st)) return false;
  const sel = st.selection.main;
  if (!sel.empty) return false;
  const line = st.doc.lineAt(sel.head);
  if (sel.head !== line.to) return false;
  const t2 = line.text.trim();
  if (!t2 || /^(\s*[-*+]\s|\s*\d+[.)]\s|\s*>|\s*#|---)/.test(line.text) || /^\s*%%/.test(line.text)) return false;
  const { types } = classifyScript(st.doc.toString());
  const x = types[line.number - 1];
  if (!x || x.t === "meta" || x.t === "section") return false;
  const prevBlank = line.number === 1 || !st.doc.line(line.number - 1).text.trim();
  let insert = "\n\n";
  if (x.t === "character" || x.t === "paren") insert = "\n";
  else if (prevBlank && isUpperLine(t2.replace(/\([^)]*\)/g, "")) && !SP_SCENE.test(t2) && !/:$/.test(t2) && !/^[.!>~=]/.test(t2)) insert = "\n";
  else if (x.t === "dialogue") insert = "\n\n";
  view.dispatch({ changes: { from: sel.head, insert }, selection: { anchor: sel.head + insert.length }, scrollIntoView: true, userEvent: "input" });
  return true;
}
var spKeymap = import_state3.Prec.high(import_view4.keymap.of([{ key: "Enter", run: smartEnter }]));
function renderInlineInto(parent, s) {
  s = s.replace(/%%[^%]*%%/g, "").replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, "$2");
  const re = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0;
  let m;
  while (m = re.exec(s)) {
    if (m.index > last) parent.appendText(s.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("***")) {
      const b = parent.createEl("strong");
      b.createEl("em", { text: tok.slice(3, -3) });
    } else if (tok.startsWith("**")) parent.createEl("strong", { text: tok.slice(2, -2) });
    else if (tok.startsWith("*")) parent.createEl("em", { text: tok.slice(1, -1) });
    else parent.createEl("u", { text: tok.slice(1, -1) });
    last = m.index + tok.length;
  }
  if (last < s.length) parent.appendText(s.slice(last));
}
var spCache = null;
function classifyCached(text2) {
  if (!spCache || spCache.text !== text2) spCache = { text: text2, res: classifyScript(text2) };
  return spCache.res;
}
function spPostProcess(el, ctx) {
  const fm = ctx.frontmatter;
  if (!isScriptFM(fm)) return;
  const info = ctx.getSectionInfo(el);
  if (!info) return;
  const { lines, types } = classifyCached(info.text);
  const rows = [];
  for (let n = info.lineStart; n <= info.lineEnd; n++) if (types[n] && types[n]?.t !== "meta" && types[n]?.t !== "section") rows.push(n);
  if (!rows.length) return;
  if (el.querySelector(".callout, .frontmatter, .metadata-container, img, .internal-embed, ul, ol, pre, table")) return;
  el.empty();
  el.addClass("sp-sec");
  let block = null, blockId = -1;
  for (const n of rows) {
    const x = types[n];
    if (!x) continue;
    if (x.block !== blockId) {
      blockId = x.block ?? -1;
      const dlg = x.t === "character";
      block = el.createDiv({ cls: "sp-block" + (dlg ? " sp-block-dialogue" : "") });
    }
    const raw = lines[n];
    let body = raw;
    if (x.markEnd) body = body.slice(0, body.length - x.markEnd);
    if (x.mark) body = body.slice(x.mark);
    body = body.trim();
    if (!block) continue;
    const d = block.createDiv({ cls: `sp-el sp-${x.t}` });
    if (x.t === "pagebreak") continue;
    renderInlineInto(d, body);
  }
}
var ScriptSuggest = class extends import_obsidian8.EditorSuggest {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.limit = 12;
  }
  onTrigger(cursor, editor, file) {
    if (!file) return null;
    const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter;
    if (!isScriptFM(fm)) return null;
    const line = editor.getLine(cursor.line);
    if (cursor.ch !== line.length || !line.trim()) return null;
    const prev = cursor.line > 0 ? editor.getLine(cursor.line - 1) : "";
    if (prev.trim()) return null;
    if (/^\.?(INT|EXT|EST|I\/E)[./ ]/i.test(line)) return { start: { line: cursor.line, ch: 0 }, end: cursor, query: line };
    const t2 = line.trim();
    if (t2.length >= 1 && /\p{L}/u.test(t2) && !/\p{Ll}/u.test(t2.replace(/^@/, "")) && !/:/.test(t2)) return { start: { line: cursor.line, ch: 0 }, end: cursor, query: line };
    return null;
  }
  getSuggestions(ctx) {
    const text2 = ctx.editor.getValue();
    const { lines, types } = classifyScript(text2);
    const q = ctx.query.toUpperCase();
    if (/^\.?(INT|EXT|EST|I\/E)/.test(q)) {
      const heads = /* @__PURE__ */ new Set(), times = /* @__PURE__ */ new Set(["DAY", "NIGHT"]);
      types.forEach((x, n) => {
        if (x && x.t === "scene" && n !== ctx.start.line) {
          const h = parseHeading(stripInline(lines[n]));
          if (h.location) heads.add(h.location);
          if (h.time) times.add(h.time);
        }
      });
      if (/[-–—]\s*\S*$/.test(q) && / [-–—] /.test(q)) {
        const base = q.replace(/\s*[-–—]\s*\S*$/, "");
        const typed = (/[-–—]\s*(\S*)$/.exec(q) || ["", ""])[1];
        return [...times].filter((t2) => t2.startsWith(typed)).map((t2) => `${base} - ${t2}`);
      }
      const m = /^(\.?(?:INT\.?\/EXT|EXT\.?\/INT|INT|EXT|EST|I\/E)\.?)\s*(.*)$/.exec(q);
      if (!m) return [];
      const prefix = m[1].replace(/^\./, "").replace(/([A-Z])$/, "$1.");
      return [...heads].filter((h) => h.startsWith(m[2])).sort().map((h) => `${prefix} ${h} - `);
    }
    const names = /* @__PURE__ */ new Set();
    types.forEach((x, n) => {
      if (x && x.t === "character" && n !== ctx.start.line) names.add(cueName(lines[n]));
    });
    const qn = q.replace(/^@/, "").trim();
    const out = [...names].filter((n) => n.startsWith(qn) && n !== qn).sort();
    if (names.has(qn)) out.unshift(...["(V.O.)", "(O.S.)", "(CONT'D)"].map((e) => `${qn} ${e}`));
    return out;
  }
  renderSuggestion(v, el) {
    el.setText(v);
  }
  selectSuggestion(v) {
    const ctx = this.context;
    if (!ctx) return;
    ctx.editor.replaceRange(v, ctx.start, ctx.end);
    ctx.editor.setCursor({ line: ctx.start.line, ch: v.length });
  }
};
function scriptTemplate(o) {
  const y = (v) => '"' + (v != null ? String(v) : "").replace(/"/g, '\\"') + '"';
  const es2 = o.lang === "es";
  return [
    "---",
    "type: script",
    "cssclasses:",
    "  - screenplay",
    "status: drafting",
    `format: ${o.format || "short"}`,
    `title: ${y(o.title)}`,
    `credit: ${y(es2 ? "Escrito por" : "Written by")}`,
    `author: ${y(o.author || "")}`,
    o.adapted ? `adapted_from: ${y("[[" + o.adapted + "]]")}` : "adapted_from:",
    o.lang ? `lang: ${o.lang}` : null,
    `draft_date: ${o.date}`,
    `date_created: ${o.date}`,
    "logline: ",
    "---",
    "",
    es2 ? "> [!abstract]- Logline y notas" : "> [!abstract]- Logline & notes",
    es2 ? "> **Logline:** En una frase: qui\xE9n, qu\xE9 quiere, qu\xE9 se lo impide." : "> **Logline:** One sentence: who, what they want, what stands in the way.",
    o.adapted ? es2 ? `> **Basado en:** [[${o.adapted}]] \u2014 \xE1brelo al lado para adaptarlo escena por escena.` : `> **Based on:** [[${o.adapted}]] \u2014 keep it open alongside and adapt it scene by scene.` : ">",
    o.guide ? es2 ? "> **Formato:** ver [[Screenplay Format Guide]]." : "> **Format:** see [[Screenplay Format Guide]]." : null,
    "",
    es2 ? "FUNDIDO DE ENTRADA:" : "FADE IN:",
    "",
    es2 ? "INT. LUGAR - NOCHE" : "INT. LOCATION - NIGHT",
    "",
    es2 ? "Describe lo que vemos y o\xEDmos, en presente. Presenta a cada personaje la primera vez en MAY\xDASCULAS: ANA (30), cansada pero l\xFAcida." : "Describe what we see and hear, in the present tense. Introduce each character the first time in CAPS: ANA (30s), tired but sharp.",
    "",
    "ANA",
    es2 ? "(en voz baja)" : "(quietly)",
    es2 ? "El di\xE1logo va debajo del nombre del personaje." : "Dialogue goes under the character's name.",
    "",
    es2 ? "CORTE A:" : "CUT TO:",
    ""
  ].filter((l) => l !== null).join("\n");
}

// src/poetry/poem.ts
var TYPES = ["poem", "poema", "poes\xEDa", "poesia", "verse", "verso"];
function isPoemText(text2) {
  const m = /^---\n([\s\S]*?)\n---/.exec(text2);
  if (!m) return false;
  const fm = m[1];
  const types = TYPES.join("|");
  return new RegExp(`^type:\\s*["']?(\\[\\[)?(${types})(\\]\\])?["']?\\s*$`, "mi").test(fm) || new RegExp(`^type:\\s*\\n\\s*-\\s*["']?(${types})["']?\\s*$`, "mi").test(fm) || /^cssclass(es)?:.*\bpoem\b/m.test(fm) || /^\s*-\s*["']?poem["']?\s*$/m.test(fm);
}
function isPoemFM(fm) {
  if (!fm) return false;
  const first = (v) => Array.isArray(v) ? first(v[0]) : typeof v === "string" ? v : "";
  const t2 = first(fm.type).toLowerCase().replace(/\[\[|\]\]/g, "");
  if (TYPES.includes(t2)) return true;
  const c = fm.cssclasses ?? fm.cssclass;
  const list = Array.isArray(c) ? c.map(first) : first(c).split(/[,\s]+/);
  return list.includes("poem");
}

// src/poetry/editor.ts
function docIsPoem(state) {
  return isPoemText(state.doc.sliceString(0, Math.min(state.doc.length, 3e3)));
}
var poemAttrs = import_view5.EditorView.editorAttributes.compute(["doc"], (state) => docIsPoem(state) ? { class: "at-poem" } : {});
function poemPostProcess(el, ctx) {
  if (!isPoemFM(ctx.frontmatter)) return;
  const info = ctx.getSectionInfo(el);
  if (!info) return;
  if (el.querySelector(".callout, .frontmatter, .metadata-container, img, .internal-embed, h1, h2, h3, h4, h5, h6, ul, ol, table, hr")) return;
  const lines = info.text.split("\n").slice(info.lineStart, info.lineEnd + 1);
  const isComment = (l) => /^\s*%%/.test(l) && !MARK.test(l.trimStart());
  if (!lines.some((l) => l.trim()) || lines.some((l) => /^\s*(```|~~~)/.test(l) || isComment(l))) return;
  el.empty();
  el.addClass("at-poem-sec");
  const stanza = el.createDiv({ cls: "at-stanza" });
  for (const raw of lines) {
    if (!raw.trim()) continue;
    let line = raw.replace(/^\s*>\s?/, "");
    const lead = /^[ \t]*/.exec(line)?.[0] ?? "";
    line = line.slice(lead.length);
    const mk = MARK.exec(line);
    let align = "";
    if (mk) {
      align = mk[2];
      line = mk[1] + line.slice(mk[0].length);
    }
    const div = stanza.createDiv({ cls: "at-verse" + (align === "center" || align === "right" ? ` at-verse-${align}` : "") });
    div.setCssProps({ "--at-vi": `${(lead.replace(/\t/g, "    ").length * 0.5).toFixed(1)}em` });
    renderInlineInto(div, line);
  }
}

// src/poetry/metrics.ts
var STRONG = "aeo\xE1\xE9\xF3\xED\xFA";
var VOWELS = "aeiou\xE1\xE9\xED\xF3\xFA\xFC";
var ACCENTED = "\xE1\xE9\xED\xF3\xFA";
function prepEs(w) {
  return w.toLowerCase().replace(/[^a-záéíóúüñ]/g, "").replace(/h/g, "").replace(/qu(?=[eiéí])/g, "q").replace(/gu(?=[eiéí])/g, "g");
}
function nucleiEs(word) {
  const w = prepEs(word).replace(/y$/, "i");
  const out = [];
  let cur = "";
  for (const ch of w) {
    const isV = VOWELS.includes(ch) || ch === "y" && w.length === 1;
    if (!isV) {
      if (cur) {
        out.push(cur);
        cur = "";
      }
      continue;
    }
    if (cur) {
      const prev = cur[cur.length - 1];
      if (STRONG.includes(prev) && STRONG.includes(ch)) {
        out.push(cur);
        cur = ch;
        continue;
      }
    }
    cur += ch;
  }
  if (cur) out.push(cur);
  if (!out.length && w === "y") out.push("i");
  return out;
}
function stressFromEnd(word) {
  const n = nucleiEs(word);
  if (n.length <= 1) return 0;
  for (let k = n.length - 1; k >= 0; k--) if ([...n[k]].some((c) => ACCENTED.includes(c))) return n.length - 1 - k;
  const w = prepEs(word);
  return /[aeiouns]$/.test(w) ? 1 : 0;
}
var startsWithVowel = (w) => {
  const p = prepEs(w);
  return p === "y" || VOWELS.includes(p[0] ?? "");
};
var endsWithVowel = (w) => {
  const p = prepEs(w);
  return VOWELS.includes(p[p.length - 1] ?? "") || p === "y";
};
function metricEs(text2) {
  const words2 = text2.match(/[\p{L}]+/gu) ?? [];
  if (!words2.length) return { syllables: 0 };
  let raw = 0, sinalefas = 0;
  const yOnset = (k) => prepEs(words2[k] ?? "") === "y" && k + 1 < words2.length && startsWithVowel(words2[k + 1]) && prepEs(words2[k + 1]) !== "y";
  words2.forEach((w, k) => {
    if (yOnset(k)) return;
    raw += Math.max(1, nucleiEs(w).length);
    const next = words2[k + 1];
    if (next && !yOnset(k + 1) && endsWithVowel(w) && startsWithVowel(next)) sinalefas++;
  });
  const last = words2[words2.length - 1];
  const s = stressFromEnd(last);
  const finalStress = s === 0 ? "aguda" : s === 1 ? "llana" : "esdr\xFAjula";
  const adjust = s === 0 ? 1 : s >= 2 ? -1 : 0;
  return { syllables: raw - sinalefas + adjust, detail: { raw, sinalefas, finalStress, adjust } };
}
function rhymeEs(text2) {
  const words2 = text2.match(/[\p{L}]+/gu) ?? [];
  const last = words2[words2.length - 1];
  if (!last) return { rhyme: "", assonance: "" };
  const n = nucleiEs(last);
  const w = prepEs(last).replace(/y$/, "i");
  if (!n.length) return { rhyme: w, assonance: "" };
  const idx = n.length - 1 - stressFromEnd(last);
  let pos = 0;
  for (let k = 0; k < idx; k++) pos = w.indexOf(n[k], pos) + n[k].length;
  pos = w.indexOf(n[idx], pos);
  let nucleus = n[idx];
  const strongAt = [...nucleus].findIndex((c) => STRONG.includes(c));
  if (strongAt > 0) {
    pos += strongAt;
    nucleus = nucleus.slice(strongAt);
  }
  const plain = (s) => s.replace(/ñ/g, "\uE001").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\uE001/g, "\xF1").replace(/v/g, "b");
  const rhyme = plain(w.slice(pos));
  const vowels = [plain(nucleus)[0]];
  for (const nu of n.slice(idx + 1)) {
    const strong = [...plain(nu)].find((c) => "aeo".includes(c)) ?? plain(nu)[0];
    vowels.push(strong);
  }
  return { rhyme, assonance: vowels.join("-") };
}
function rhymeEn(text2) {
  const last = (text2.toLowerCase().match(/[a-z']+/g) ?? []).pop()?.replace(/'/g, "") ?? "";
  if (!last) return { rhyme: "", assonance: "" };
  let w = last, silentE = "";
  if (/[^aeiouy]e$/.test(w) && w.length > 3) {
    silentE = "e";
    w = w.slice(0, -1);
  }
  const m = /[aeiouy]+[^aeiouy]*$/.exec(w);
  const rhyme = (m ? m[0] : w) + silentE;
  return { rhyme, assonance: m ? m[0].replace(/[^aeiouy]/g, "") : "" };
}
var METER_ES = {
  2: "bis\xEDlabo",
  3: "tris\xEDlabo",
  4: "tetras\xEDlabo",
  5: "pentas\xEDlabo",
  6: "hexas\xEDlabo",
  7: "heptas\xEDlabo",
  8: "octos\xEDlabo",
  9: "eneas\xEDlabo",
  10: "decas\xEDlabo",
  11: "endecas\xEDlabo",
  12: "dodecas\xEDlabo",
  13: "tridecas\xEDlabo",
  14: "alejandrino"
};
function verseText(line) {
  return line.replace(/%%[^%]*%%/g, "").replace(/!\[\[[^\]]*\]\]/g, "").replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, "$2").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/(\*\*\*|\*\*|\*|__|_|~~|==)/g, "").replace(/\s\^[\w-]+\s*$/, "").trim();
}
function poemLines(text2) {
  const lines = text2.split("\n");
  const out = [];
  let stanza = 0, gap = true, fence = false, comment = false, callout = false;
  for (let n = bodyStart(lines); n < lines.length; n++) {
    const L = lines[n];
    if (comment) {
      if (L.includes("%%")) comment = false;
      continue;
    }
    if (/^\s*(```|~~~)/.test(L)) {
      fence = !fence;
      continue;
    }
    if (fence) continue;
    if (/^\s*%%/.test(L) && (L.match(/%%/g) || []).length % 2 === 1) {
      comment = true;
      continue;
    }
    if (!L.trim()) {
      gap = true;
      callout = false;
      continue;
    }
    if (/^\s*>\s*\[!/.test(L)) {
      callout = true;
      continue;
    }
    if (callout && /^\s*>/.test(L)) continue;
    if (/^\s{0,3}#{1,6}\s/.test(L) || /^\s*!\[\[[^\]]*\]\]\s*$/.test(L) || /^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(L)) {
      gap = true;
      continue;
    }
    const t2 = verseText(L.replace(/^\s*>\s?/, ""));
    if (!t2) continue;
    if (gap && out.length) stanza++;
    gap = false;
    out.push({ line: n, text: t2, stanza });
  }
  return out;
}
function analyzePoem(text2, lang) {
  const raw = poemLines(text2);
  const lines = raw.map((r) => {
    const m = lang === "es" ? metricEs(r.text) : { syllables: (r.text.match(/[a-zA-Z']+/g) ?? []).reduce((t2, w) => t2 + syllablesEn(w), 0) };
    const rh = lang === "es" ? rhymeEs(r.text) : rhymeEn(r.text);
    return { ...r, ...m, ...rh, letter: "-" };
  });
  const letters = /* @__PURE__ */ new Map();
  let next = 0;
  const letterFor = (key) => {
    if (!letters.has(key)) letters.set(key, String.fromCharCode(65 + next++ % 26));
    return letters.get(key) ?? "?";
  };
  const count = (key, v) => lines.filter((l) => key(l) === v).length;
  for (const l of lines) {
    if (l.rhyme && count((x) => x.rhyme, l.rhyme) > 1) l.letter = letterFor("c:" + l.rhyme);
    else if (lang === "es" && l.assonance && count((x) => x.assonance, l.assonance) > 1) l.letter = letterFor("a:" + l.assonance) + "\u2032";
  }
  if (lang === "es") {
    for (const l of lines) if (l.letter !== "-" && l.syllables <= 8) l.letter = l.letter.toLowerCase();
  }
  if (lang === "en") for (const l of lines) l.letter = l.letter.toLowerCase();
  const stanzas = lines.length ? lines[lines.length - 1].stanza + 1 : 0;
  const scheme = [];
  for (let s = 0; s < stanzas; s++) scheme.push(lines.filter((l) => l.stanza === s).map((l) => l.letter).join(""));
  const freq = /* @__PURE__ */ new Map();
  for (const l of lines) freq.set(l.syllables, (freq.get(l.syllables) ?? 0) + 1);
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1])[0];
  const meter = top ? { syllables: top[0], count: top[1], name: lang === "es" ? METER_ES[top[0]] ?? `${top[0]} s\xEDlabas` : `${top[0]} syllables` } : null;
  return {
    lang,
    lines,
    stanzas,
    scheme,
    meter,
    words: lines.reduce((t2, l) => t2 + (l.text.match(/[\p{L}\p{N}]+/gu) ?? []).length, 0),
    form: recogniseForm(lines, stanzas, lang)
  };
}
function recogniseForm(lines, stanzas, lang) {
  const n = lines.length;
  const es2 = lang === "es";
  if (!n) return es2 ? "Sin versos" : "No lines yet";
  const near = (v, target, tol = 1) => Math.abs(v - target) <= tol;
  const share = (pred) => lines.filter(pred).length / n;
  const scheme = lines.map((l) => l.letter.toUpperCase().replace("\u2032", "")).join("");
  if (n === 3 && near(lines[0].syllables, 5) && near(lines[1].syllables, 7) && near(lines[2].syllables, 5)) return "Haiku (5\u20117\u20115)";
  if (n === 14) {
    const hendeca = share((l) => near(l.syllables, es2 ? 11 : 10)) >= 0.7;
    if (hendeca) {
      if (es2) return /^ABBAABBA/.test(scheme) ? "Soneto (endecas\xEDlabos, ABBA ABBA\u2026)" : "Soneto (endecas\xEDlabos)";
      return /^ABABCDCDEFEFGG$/.test(scheme) ? "Shakespearean sonnet (abab cdcd efef gg)" : /^ABBAABBA/.test(scheme) ? "Petrarchan sonnet (abba abba\u2026)" : "Sonnet (14 lines)";
    }
    return es2 ? "Catorce versos (\xBFsoneto libre?)" : "Fourteen lines (free sonnet?)";
  }
  if (es2 && n === 10 && share((l) => l.syllables === 8) >= 0.8 && /^ABBAACCDDC$/.test(scheme)) return "D\xE9cima espinela (abbaaccddc)";
  if (es2 && n >= 8 && share((l) => near(l.syllables, 8, 0)) >= 0.75) {
    const even = lines.filter((_, k) => k % 2 === 1), odd = lines.filter((_, k) => k % 2 === 0);
    const asson = even[0]?.assonance;
    if (asson && even.every((l) => l.assonance === asson) && odd.every((l) => l.assonance !== asson)) return `Romance (octos\xEDlabos, asonancia ${asson} en los pares)`;
  }
  const sizes = /* @__PURE__ */ new Set();
  for (let s = 0; s < stanzas; s++) sizes.add(lines.filter((l) => l.stanza === s).length);
  if (stanzas > 1 && sizes.size === 1) {
    const size = [...sizes][0];
    const names = { 2: ["Pareados", "Couplets"], 3: ["Tercetos", "Tercets"], 4: ["Cuartetas / cuartetos", "Quatrains"], 5: ["Quintillas", "Quintains"], 6: ["Sextillas / sextetos", "Sestets"], 8: ["Octavas", "Octaves"] };
    if (names[size]) return names[size][es2 ? 0 : 1];
  }
  const iso = lines.length >= 4 && share((l) => l.syllables === lines[0].syllables) >= 0.8;
  if (iso && es2) return `Versos isom\xE9tricos (${METER_ES[lines[0].syllables] ?? lines[0].syllables + " s\xEDlabas"})`;
  return es2 ? "Verso libre" : "Free verse";
}

// src/habits/log.ts
var HISTORY_DAYS = 400;
function dayKey(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function addDays(key, n) {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}
var grew = (e) => Math.max(0, e.l - e.s);
function writtenOn(log, key) {
  const day = log[key];
  if (!day) return 0;
  let t2 = 0;
  for (const e of Object.values(day)) t2 += grew(e);
  return t2;
}
function lastDays(today, n) {
  const out = [];
  for (let k = n - 1; k >= 0; k--) out.push(addDays(today, -k));
  return out;
}
function prune(log, today, keep = HISTORY_DAYS) {
  const oldest = addDays(today, -keep);
  let changed = false;
  for (const k of Object.keys(log)) if (k < oldest) {
    delete log[k];
    changed = true;
  }
  return changed;
}
function renamePath(log, from, to) {
  let changed = false;
  for (const day of Object.values(log)) {
    if (day[from]) {
      day[to] = day[from];
      delete day[from];
      changed = true;
    }
  }
  return changed;
}
function streaks(log, today, goal) {
  const target = Math.max(1, goal);
  const ok = (k) => writtenOn(log, k) >= target;
  const keys = Object.keys(log).sort();
  let best = 0, run2 = 0, prev = "";
  for (const k of keys) {
    if (!ok(k)) {
      run2 = 0;
      prev = k;
      continue;
    }
    run2 = prev && addDays(prev, 1) === k && run2 > 0 ? run2 + 1 : 1;
    best = Math.max(best, run2);
    prev = k;
  }
  const todayDone = ok(today);
  let current2 = 0;
  for (let k = todayDone ? today : addDays(today, -1); ok(k); k = addDays(k, -1)) current2++;
  return { current: current2, best: Math.max(best, current2), todayDone };
}
function weekStart(key) {
  const [y, m, d] = key.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return addDays(key, -((day + 6) % 7));
}
function totals(log, today) {
  const ws = weekStart(today), ms = today.slice(0, 8) + "01", d30 = addDays(today, -29);
  const t2 = { today: 0, week: 0, month: 0, last30: 0, all: 0, days: 0 };
  for (const k of Object.keys(log)) {
    const w = writtenOn(log, k);
    if (w > 0) t2.days++;
    t2.all += w;
    if (k === today) t2.today += w;
    if (k >= ws && k <= today) t2.week += w;
    if (k >= ms && k <= today) t2.month += w;
    if (k >= d30 && k <= today) t2.last30 += w;
  }
  return t2;
}
function wordsByGroup(log, from, to, groupsOf) {
  const out = /* @__PURE__ */ new Map();
  for (const [k, day] of Object.entries(log)) {
    if (k < from || k > to) continue;
    for (const [path, e] of Object.entries(day)) {
      const w = grew(e);
      if (!w) continue;
      for (const g of groupsOf(path)) out.set(g, (out.get(g) ?? 0) + w);
    }
  }
  return out;
}
function series(log, today, days, weekly) {
  const keys = lastDays(today, days);
  if (!weekly) return keys.map((k) => ({ key: k, label: k.slice(5), words: writtenOn(log, k) }));
  const weeks = /* @__PURE__ */ new Map();
  for (const k of keys) {
    const w = weekStart(k);
    weeks.set(w, (weeks.get(w) ?? 0) + writtenOn(log, k));
  }
  return [...weeks.entries()].map(([k, w]) => ({ key: k, label: k.slice(5), words: w }));
}

// src/habits/view.ts
var import_obsidian10 = require("obsidian");

// src/habits/genres.ts
var NO_GENRE = "No genre";
var GENRE_KEYS = ["genre", "genres", "g\xE9nero", "genero", "g\xE9neros", "generos"];
function strings(v) {
  if (Array.isArray(v)) return v.flatMap(strings);
  if (typeof v !== "string") return [];
  return v.split(",").map((x) => x.replace(/^\[\[|\]\]$/g, "").replace(/^#/, "").trim()).filter(Boolean);
}
function normaliseGenre(g) {
  const t2 = g.trim().replace(/\s+/g, " ");
  return t2 ? t2[0].toLocaleUpperCase() + t2.slice(1).toLocaleLowerCase() : t2;
}
function genresOf(fm) {
  if (!fm) return [];
  const out = [];
  for (const k of GENRE_KEYS) for (const g of strings(fm[k])) {
    const n = normaliseGenre(g);
    if (n && !out.includes(n)) out.push(n);
  }
  return out;
}
var FORMS = {
  story: "Story",
  relato: "Story",
  cuento: "Story",
  novel: "Novel",
  novela: "Novel",
  novella: "Novella",
  chapter: "Chapter",
  poem: "Poem",
  poema: "Poem",
  "poes\xEDa": "Poem",
  poesia: "Poem",
  script: "Screenplay",
  screenplay: "Screenplay",
  guion: "Screenplay",
  "gui\xF3n": "Screenplay",
  article: "Article",
  "art\xEDculo": "Article",
  essay: "Essay",
  ensayo: "Essay"
};
function formOf(fm) {
  const t2 = strings(fm?.type)[0]?.toLowerCase() ?? "";
  if (!t2) return "Other";
  return FORMS[t2] ?? t2[0].toUpperCase() + t2.slice(1);
}
function projectsOf(fm) {
  return strings(fm?.anthology).map((x) => x.split("|")[0].split("#")[0].trim()).filter(Boolean);
}

// src/habits/sprint.ts
var import_obsidian9 = require("obsidian");
function sprintWords(log, s, today) {
  let w = writtenOn(log, s.startDay) - s.startWords;
  for (let k = addDays(s.startDay, 1); k <= today; k = addDays(k, 1)) w += writtenOn(log, k);
  return Math.max(0, w);
}
var fmtClock = (ms) => {
  const s = Math.max(0, Math.round(ms / 1e3));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
var StartSprintModal = class extends import_obsidian9.Modal {
  constructor(app, minutes, target, onStart) {
    super(app);
    this.onStart = onStart;
    this.minutes = minutes;
    this.target = target;
  }
  onOpen() {
    this.titleEl.setText("Writing sprint");
    const { contentEl } = this;
    contentEl.createEl("p", { cls: "setting-item-description", text: "Write without stopping until the timer ends. Words in any note count." });
    const presets = contentEl.createDiv({ cls: "at-seg" });
    let minutesInput = null;
    for (const m of [10, 15, 25, 45]) {
      const b = presets.createEl("button", { text: `${m} min`, cls: this.minutes === m ? "is-active" : "" });
      b.onclick = () => {
        this.minutes = m;
        if (minutesInput) minutesInput.value = String(m);
        presets.querySelectorAll("button").forEach((x) => x.toggleClass("is-active", x === b));
      };
    }
    new import_obsidian9.Setting(contentEl).setName("Minutes").addText((t2) => {
      minutesInput = t2.inputEl;
      t2.inputEl.type = "number";
      t2.setValue(String(this.minutes)).onChange((v) => {
        this.minutes = Math.max(1, parseInt(v, 10) || this.minutes);
      });
    });
    new import_obsidian9.Setting(contentEl).setName("Word target").setDesc("Leave at zero for no target.").addText((t2) => {
      t2.inputEl.type = "number";
      t2.setValue(String(this.target)).onChange((v) => {
        this.target = Math.max(0, parseInt(v, 10) || 0);
      });
    });
    new import_obsidian9.Setting(contentEl).addButton((b) => b.setButtonText("Start").setCta().onClick(() => {
      this.close();
      this.onStart(this.minutes, this.target);
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
var SprintSummaryModal = class extends import_obsidian9.Modal {
  constructor(app, r, best, early) {
    super(app);
    this.r = r;
    this.best = best;
    this.early = early;
  }
  onOpen() {
    const r = this.r;
    this.titleEl.setText(this.early ? "Sprint stopped" : "Sprint finished");
    const el = this.contentEl.createDiv({ cls: "at-sprint-summary" });
    el.createDiv({ cls: "at-hero-num", text: r.words.toLocaleString() });
    el.createDiv({ cls: "at-hero-sub", text: `words in ${Math.max(1, Math.round(r.elapsed))} min \xB7 ${(r.words / Math.max(1, r.elapsed)).toFixed(1)} words per minute` });
    if (r.target) {
      const pct3 = Math.min(100, Math.round(r.words / r.target * 100));
      const bar = el.createDiv({ cls: "at-bar" });
      bar.createDiv({ cls: "at-bar-fill" }).setCssProps({ "--at-pct": pct3 + "%" });
      el.createDiv({ cls: "at-hint", text: r.words >= r.target ? `Target of ${r.target.toLocaleString()} reached.` : `${pct3}% of the ${r.target.toLocaleString()}-word target.` });
    }
    if (r.words > 0 && r.words >= this.best) el.createDiv({ cls: "at-ok", text: "Your best sprint so far." });
    new import_obsidian9.Setting(this.contentEl).addButton((b) => b.setButtonText("Done").setCta().onClick(() => this.close()));
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/view/helpers.ts
var LANGS = { auto: "Auto-detect", "en-US": "English (US)", "en-GB": "English (UK)", es: "Espa\xF1ol" };
var KIND_LABEL = { spelling: "Spelling", grammar: "Grammar", punctuation: "Punctuation", style: "Style" };
function normLang(v) {
  if (v == null || v === "") return null;
  const first = Array.isArray(v) ? v[0] : v;
  const s = (typeof first === "string" || typeof first === "number" ? String(first) : "").trim().toLowerCase();
  if (!s || s === "auto") return null;
  if (/^es|span|españ|castell/.test(s)) return "es";
  if (/^en[-_]gb|british|uk$/.test(s)) return "en-GB";
  if (/^en|engl|ingl/.test(s)) return "en-US";
  return null;
}
var fmtN = (n) => Math.round(n).toLocaleString("en-US");
function fmtMin(words2, wpm) {
  const m = words2 / (wpm || 230);
  if (m < 1) return "< 1 min";
  if (m < 60) return Math.round(m) + " min";
  return Math.floor(m / 60) + " h " + Math.round(m % 60) + " min";
}
function todayKey() {
  const d = /* @__PURE__ */ new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function fmText(v) {
  if (Array.isArray(v)) return v.map(fmText).join(", ");
  return typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : "";
}
function watchWidth(el, limit = 560) {
  if (typeof ResizeObserver === "undefined") return () => {
  };
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) el.toggleClass("at-narrow", e.contentRect.width > 0 && e.contentRect.width < limit);
  });
  ro.observe(el);
  return () => ro.disconnect();
}

// src/habits/view.ts
var VIEW_HABITS = "authors-toolbox-habits";
var localTime = (iso) => {
  const d = new Date(iso);
  return `${dayKey(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
var fmt = (n) => Math.round(n).toLocaleString();
var pct = (a, b) => b ? Math.round(a / b * 100) : 0;
var HabitsView = class extends import_obsidian10.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.works = null;
    this.loading = false;
    this.stopWatching = null;
  }
  getViewType() {
    return VIEW_HABITS;
  }
  getDisplayText() {
    return "Writing habits";
  }
  getIcon() {
    return "flame";
  }
  async onOpen() {
    this.contentEl.addClass("at-habits");
    this.stopWatching = watchWidth(this.contentEl);
    this.render();
    await this.loadWorks();
  }
  async onClose() {
    this.stopWatching?.();
    this.stopWatching = null;
    this.contentEl.empty();
    await Promise.resolve();
  }
  /** Read the works in the writing folders (counts and properties). */
  async loadWorks() {
    if (this.loading) return;
    this.loading = true;
    try {
      const out = [];
      for (const f of this.plugin.writingFiles()) {
        const fm = this.app.metadataCache.getFileCache(f)?.frontmatter ?? {};
        if (typeof fm.type === "string" && ["hub", "anthology"].includes(fm.type)) continue;
        const text2 = await this.app.vault.cachedRead(f);
        const n = proseMap(text2).paras.reduce((t2, p) => t2 + (p.kind === "heading" ? 0 : words(p.plain).length), 0);
        out.push({ file: f, genres: genresOf(fm), form: formOf(fm), projects: projectsOf(fm), words: n });
      }
      this.works = out;
    } finally {
      this.loading = false;
    }
    this.render();
  }
  render() {
    const el = this.contentEl;
    const scroll = el.scrollTop;
    el.empty();
    const P = this.plugin, s = P.prefs, log = s.daily ?? {};
    const today = dayKey(/* @__PURE__ */ new Date());
    const range = s.habitsRange === "90" ? 90 : s.habitsRange === "365" ? 365 : 30;
    const from = addDays(today, -(range - 1));
    const head = el.createDiv({ cls: "at-h-head" });
    head.createEl("h2", { text: "Writing habits" });
    const actions = head.createDiv({ cls: "at-h-actions" });
    const seg = actions.createDiv({ cls: "at-seg" });
    for (const r of ["30", "90", "365"]) {
      const b = seg.createEl("button", { text: `${r} days`, cls: s.habitsRange === r || r === "30" && !["90", "365"].includes(s.habitsRange) ? "is-active" : "" });
      b.onclick = () => {
        s.habitsRange = r;
        P.saveSettingsSoon();
        this.render();
      };
    }
    const sprintBtn = actions.createEl("button", { cls: P.sprint ? "" : "mod-cta", text: P.sprint ? "Stop sprint" : "Start sprint" });
    sprintBtn.onclick = () => {
      if (P.sprint) P.finishSprint(true);
      else P.openSprint();
    };
    const refresh = actions.createEl("button", { attr: { "aria-label": "Refresh" } });
    (0, import_obsidian10.setIcon)(refresh, "refresh-cw");
    refresh.onclick = () => {
      this.works = null;
      this.render();
      void this.loadWorks();
    };
    if (P.sprint) {
      const sp = P.sprint;
      const box = el.createDiv({ cls: "at-sprint-live" });
      const w = sprintWords(log, sp, today);
      box.createSpan({ cls: "at-sprint-clock", text: fmtClock(sp.start + sp.minutes * 6e4 - Date.now()) });
      box.createSpan({ text: ` left \xB7 ${fmt(w)}${sp.target ? ` / ${fmt(sp.target)}` : ""} words` });
    }
    const t2 = totals(log, today);
    const st = streaks(log, today, s.dailyGoal);
    const grid = el.createDiv({ cls: "at-grid at-h-grid" });
    const tile = (label, value, hint) => {
      const d = grid.createDiv({ cls: "at-tile" });
      d.createDiv({ cls: "at-tile-v", text: value });
      d.createDiv({ cls: "at-tile-l", text: label });
      if (hint) d.setAttr("title", hint);
    };
    tile(s.dailyGoal ? `Today \xB7 goal ${fmt(s.dailyGoal)}` : "Today", s.dailyGoal ? `${fmt(t2.today)} (${pct(t2.today, s.dailyGoal)}%)` : fmt(t2.today));
    tile("Current streak", `${st.current} ${st.current === 1 ? "day" : "days"}${st.todayDone ? " \u2713" : ""}`, s.dailyGoal ? "Days in a row that reached the daily goal" : "Days in a row with some writing");
    tile("Best streak", `${st.best} ${st.best === 1 ? "day" : "days"}`);
    tile("This week", fmt(t2.week));
    tile("This month", fmt(t2.month));
    tile("Writing days", fmt(t2.days), "Days with any writing in the recorded history");
    if (!s.dailyGoal) el.createDiv({ cls: "at-hint", text: "Set a daily word goal in the settings to track streaks against it." });
    const weekly = range === 365;
    const data = series(log, today, range, weekly);
    const sec = this.section(el, weekly ? "Words per week" : "Words per day");
    const max = Math.max(1, ...data.map((d) => d.words), weekly ? 0 : s.dailyGoal);
    const chart = sec.createDiv({ cls: "at-h-chart" });
    if (s.dailyGoal && !weekly) chart.createDiv({ cls: "at-h-goal" }).setCssProps({ "--at-h": `${s.dailyGoal / max * 100}%` });
    for (const d of data) {
      const b = chart.createDiv({ cls: "at-h-bar" + (s.dailyGoal && !weekly && d.words >= s.dailyGoal ? " is-goal" : "") });
      b.setCssProps({ "--at-h": `${Math.max(d.words ? 2 : 0, d.words / max * 100)}%` });
      b.setAttr("title", `${weekly ? "Week of " : ""}${d.key}: ${fmt(d.words)} words`);
    }
    const axis = sec.createDiv({ cls: "at-h-axis" });
    axis.createSpan({ text: data[0]?.label ?? "" });
    axis.createSpan({ text: `${fmt(data.reduce((a, d) => a + d.words, 0))} words in ${range} days` });
    axis.createSpan({ text: data[data.length - 1]?.label ?? "" });
    if (!this.works) {
      el.createDiv({ cls: "at-hint", text: this.loading ? "Reading your works\u2026" : "" });
    } else {
      const byPath = new Map(this.works.map((w) => [w.file.path, w]));
      const groupOfPath = (pick) => (path) => {
        const w = byPath.get(path);
        if (w) return pick(w);
        const f = this.app.vault.getAbstractFileByPath(path);
        if (!(f instanceof import_obsidian10.TFile)) return [];
        const fm = this.app.metadataCache.getFileCache(f)?.frontmatter ?? {};
        return pick({ file: f, genres: genresOf(fm), form: formOf(fm), projects: projectsOf(fm), words: 0 });
      };
      this.renderGroups(el, "Genres", from, today, range, groupOfPath((w) => w.genres.length ? w.genres : [NO_GENRE]), (w) => w.genres.length ? w.genres : [NO_GENRE], true);
      this.renderGroups(el, "Forms", from, today, range, groupOfPath((w) => [w.form]), (w) => [w.form], false);
      this.renderProjects(el, from, today, range, groupOfPath((w) => w.projects));
    }
    this.renderSprints(el);
    el.scrollTop = scroll;
  }
  section(el, title, hint) {
    const s = el.createDiv({ cls: "at-section" });
    s.createDiv({ cls: "at-label", text: title });
    if (hint) s.createDiv({ cls: "at-hint", text: hint });
    return s;
  }
  /** Words written per group in the period, plus works and words per group overall. */
  renderGroups(el, title, from, today, range, groupsOfPath, groupsOfWork, isGenre) {
    const works = this.works ?? [];
    const recent = wordsByGroup(this.plugin.prefs.daily ?? {}, from, today, groupsOfPath);
    const lib = /* @__PURE__ */ new Map();
    for (const w of works) for (const g of groupsOfWork(w)) {
      const e = lib.get(g) ?? { works: 0, words: 0 };
      e.works++;
      e.words += w.words;
      lib.set(g, e);
    }
    const names = [.../* @__PURE__ */ new Set([...recent.keys(), ...lib.keys()])];
    const sec = this.section(el, title);
    if (!names.length) {
      sec.createDiv({ cls: "at-hint", text: "No works found in the writing folders yet." });
      return;
    }
    const totalRecent = [...recent.values()].reduce((a, b) => a + b, 0);
    const totalLib = [...lib.values()].reduce((a, b) => a + b.words, 0);
    const rankBy = totalRecent ? (n) => recent.get(n) ?? 0 : (n) => lib.get(n)?.words ?? 0;
    const ranked = names.filter((n) => !(isGenre && n === NO_GENRE)).sort((a, b) => rankBy(b) - rankBy(a));
    const top = ranked[0];
    if (top && rankBy(top) > 0) {
      const share = pct(rankBy(top), totalRecent || totalLib);
      sec.createDiv({ cls: "at-h-top", text: totalRecent ? `You write most ${isGenre ? "in" : "as"} ${top}: ${share}% of the words written in the last ${range} days.` : `Most of your work is ${top}: ${share}% of the words in your writing folders.` });
    }
    const max = Math.max(1, ...names.map((n) => recent.get(n) ?? 0));
    const table = sec.createDiv({ cls: "at-h-table" });
    const header = table.createDiv({ cls: "at-h-row at-h-row-head" });
    for (const h of [title.replace(/s$/, ""), `Last ${range} days`, "Works", "Words"]) header.createSpan({ text: h });
    for (const n of names.sort((a, b) => (recent.get(b) ?? 0) - (recent.get(a) ?? 0) || (lib.get(b)?.words ?? 0) - (lib.get(a)?.words ?? 0))) {
      const row = table.createDiv({ cls: "at-h-row" });
      row.createSpan({ cls: "at-h-name", text: n });
      const cell = row.createSpan({ cls: "at-h-barcell" });
      cell.createDiv({ cls: "at-h-hbar" }).setCssProps({ "--at-pct": `${(recent.get(n) ?? 0) / max * 100}%` });
      cell.createSpan({ cls: "at-h-num", text: fmt(recent.get(n) ?? 0) });
      row.createSpan({ cls: "at-h-num", text: fmt(lib.get(n)?.works ?? 0) });
      row.createSpan({ cls: "at-h-num", text: fmt(lib.get(n)?.words ?? 0) });
    }
    if (isGenre) {
      const untagged = works.filter((w) => !w.genres.length).sort((a, b) => b.file.stat.mtime - a.file.stat.mtime);
      if (untagged.length) {
        const box = sec.createEl("details", { cls: "at-h-untagged" });
        box.createEl("summary", { text: `${untagged.length} ${untagged.length === 1 ? "work has" : "works have"} no genre yet` });
        for (const w of untagged.slice(0, 40)) {
          const r = box.createDiv({ cls: "at-item" });
          r.createSpan({ cls: "at-item-n", text: w.form });
          const name = r.createSpan({ cls: "at-h-link", text: w.file.basename });
          name.onclick = () => {
            void this.app.workspace.getLeaf(false).openFile(w.file);
          };
          const b = r.createEl("button", { cls: "at-ghost", text: "Set genre" });
          b.onclick = () => this.plugin.openGenre(w.file, () => {
            this.works = null;
            void this.loadWorks();
          });
        }
      }
    }
  }
  renderProjects(el, from, today, range, groupsOfPath) {
    const works = this.works ?? [];
    const projects = /* @__PURE__ */ new Map();
    for (const w of works) for (const p of w.projects) projects.set(p, [...projects.get(p) ?? [], w]);
    if (!projects.size) return;
    const recent = wordsByGroup(this.plugin.prefs.daily ?? {}, from, today, groupsOfPath);
    const sec = this.section(el, "Projects", "Anthologies and collections, from each work's \u201Canthology\u201D property. Add a word_goal property to the project note to track progress.");
    for (const [name, ws] of [...projects.entries()].sort((a, b) => (recent.get(b[0]) ?? 0) - (recent.get(a[0]) ?? 0))) {
      const total = ws.reduce((a, w) => a + w.words, 0);
      const note = this.app.metadataCache.getFirstLinkpathDest(name, ws[0].file.path);
      const fm = note ? this.app.metadataCache.getFileCache(note)?.frontmatter ?? {} : {};
      const goal = typeof fm.word_goal === "number" ? fm.word_goal : typeof fm.word_goal === "string" ? parseInt(fm.word_goal, 10) || 0 : 0;
      const card = sec.createDiv({ cls: "at-h-project" });
      const top = card.createDiv({ cls: "at-h-project-top" });
      const title = top.createSpan({ cls: "at-h-link at-h-name", text: name });
      if (note) title.onclick = () => {
        void this.app.workspace.getLeaf(false).openFile(note);
      };
      top.createSpan({ cls: "at-h-num", text: `${ws.length} ${ws.length === 1 ? "work" : "works"} \xB7 ${fmt(total)} words \xB7 +${fmt(recent.get(name) ?? 0)} in ${range} days` });
      if (goal) {
        card.createDiv({ cls: "at-bar" }).createDiv({ cls: "at-bar-fill" }).setCssProps({ "--at-pct": `${Math.min(100, pct(total, goal))}%` });
        card.createDiv({ cls: "at-hint", text: `${pct(total, goal)}% of ${fmt(goal)} words` });
      }
    }
  }
  renderSprints(el) {
    const list = this.plugin.prefs.sprints ?? [];
    const sec = this.section(el, "Sprints");
    if (!list.length) {
      sec.createDiv({ cls: "at-hint", text: "No sprints yet. A sprint is a timed burst of writing with a word target." });
      return;
    }
    const words2 = list.reduce((a, r) => a + r.words, 0), minutes = list.reduce((a, r) => a + r.elapsed, 0);
    const best = list.reduce((a, r) => Math.max(a, r.words), 0);
    sec.createDiv({ cls: "at-hint", text: `${list.length} ${list.length === 1 ? "sprint" : "sprints"} \xB7 ${fmt(minutes)} min \xB7 ${fmt(words2)} words \xB7 ${(words2 / Math.max(1, minutes)).toFixed(1)} words per minute \xB7 best ${fmt(best)} words` });
    for (const r of list.slice(-6).reverse()) {
      const row = sec.createDiv({ cls: "at-item" });
      row.createSpan({ cls: "at-item-n", text: `${fmt(r.words)}w` });
      row.createSpan({ text: `${localTime(r.start)} \xB7 ${Math.round(r.elapsed)} min${r.target ? ` \xB7 target ${fmt(r.target)}${r.words >= r.target ? " \u2713" : ""}` : ""}` });
    }
  }
};
function filesIn(folders) {
  const out = [];
  const walk = (f) => {
    for (const c of f.children) {
      if (c instanceof import_obsidian10.TFile && c.extension === "md") out.push(c);
      else if (c instanceof import_obsidian10.TFolder && c.name !== "Exports") walk(c);
    }
  };
  folders.forEach(walk);
  return [...new Set(out)];
}

// src/settings.ts
var import_obsidian12 = require("obsidian");

// src/capabilities.ts
var import_obsidian11 = require("obsidian");
var live = () => window;
function canPickFile(env = live()) {
  return typeof env.File === "function" && typeof env.FileReader === "function" && typeof env.document?.createElement === "function";
}
function canCopy(env = live()) {
  return typeof env.navigator?.clipboard?.writeText === "function" || typeof env.document?.execCommand === "function";
}
function canParseXml(env = live()) {
  return typeof env.DOMParser === "function";
}
function deviceName() {
  const os = import_obsidian11.Platform.isIosApp ? "iOS" : import_obsidian11.Platform.isAndroidApp ? "Android" : import_obsidian11.Platform.isMacOS ? "macOS" : import_obsidian11.Platform.isWin ? "Windows" : import_obsidian11.Platform.isLinux ? "Linux" : "unknown system";
  const kind = import_obsidian11.Platform.isPhone ? "phone" : import_obsidian11.Platform.isTablet ? "tablet" : import_obsidian11.Platform.isMobile ? "mobile" : "desktop";
  return `${os}, ${kind}`;
}
function capabilityLines(env = live()) {
  const yn = (b) => b ? "yes" : "no";
  return [`Device: ${deviceName()}`, `File picker: ${yn(canPickFile(env))}`, `Clipboard: ${yn(canCopy(env))}`, `XML reader: ${yn(canParseXml(env))}`];
}

// src/settings.ts
var GROUPS = [
  {
    heading: "Images",
    fields: [
      { key: "imageFolder", kind: "folder", name: "Folder for uploaded images", desc: "Images chosen from your device are copied here. Leave empty to use the attachment location from Obsidian's own settings." },
      { key: "defaultWidth", kind: "number", name: "Default image width (px)", allowZero: true },
      { key: "defaultAlign", kind: "dropdown", name: "Default image alignment", options: { none: "Inline", center: "Centered", left: "Left", right: "Right" } }
    ]
  },
  {
    heading: "Writing panel",
    fields: [
      { key: "defaultLang", kind: "dropdown", name: "Default language", options: LANGS, desc: "Used when a note has no \u201Clang\u201D property. Auto-detect reads the text and picks the language." },
      { key: "defaultGoal", kind: "number", name: "Default word goal", desc: "Applies to notes without a \u201Cword_goal\u201D property. 0 = none.", allowZero: true },
      { key: "readingWpm", kind: "number", name: "Reading speed (words per minute)", fallback: 230 },
      { key: "speakingWpm", kind: "number", name: "Reading-aloud speed (words per minute)", fallback: 150 },
      { key: "longSentence", kind: "number", name: "Long sentence threshold (words)", fallback: 35 },
      { key: "echoWindow", kind: "number", name: "Repetition window (words)", desc: "Flag a word that appears again within this many words.", fallback: 40 },
      { key: "linesAsParagraphs", kind: "toggle", name: "Count each line as a paragraph", desc: "Lines without a blank line between them count as separate paragraphs, the way they read on screen. Off: Markdown paragraphs (separated by blank lines)." },
      { key: "crutchEn", kind: "textarea", name: "English crutch words", desc: "Comma-separated words or phrases.", emptyShows: DEFAULT_CRUTCH.en },
      { key: "crutchEs", kind: "textarea", name: "Spanish crutch words", desc: "Palabras o frases separadas por comas.", emptyShows: DEFAULT_CRUTCH.es }
    ]
  },
  {
    heading: "Stories",
    fields: [
      { key: "autoRaya", kind: "toggle", name: "Dialogue dash (raya)", desc: "In story notes, a - typed at the start of a line becomes \u2014 (so it doesn't turn into a bullet), and -- anywhere becomes \u2014. Undo right after gives you the plain hyphen back." },
      { key: "storyFolders", kind: "textarea", name: "Story folders", desc: "Notes in these folders (one per line), or any note with type: story, count as stories." }
    ]
  },
  {
    heading: "Writing habits",
    fields: [
      { key: "dailyGoal", kind: "number", name: "Daily word goal", desc: "Words to write each day, across all notes. Streaks count the days that reach it (any writing when it's 0).", allowZero: true },
      { key: "writingFolders", kind: "textarea", name: "Writing folders", desc: "Folders with your works, one per line, for the genre, form and project breakdowns. Empty: the story folders and the scripts folder." },
      { key: "sprintMinutes", kind: "number", name: "Default sprint length (minutes)", fallback: 25 },
      { key: "sprintTarget", kind: "number", name: "Default sprint word target", desc: "Leave at zero for no target.", allowZero: true }
    ]
  },
  {
    heading: "Revision",
    fields: [
      { key: "autoDrafts", kind: "toggle", name: "Keep a daily draft automatically", desc: "The first time you open a note in your writing folders each day, its text is kept as a draft if it changed since the last one, so you can always see what you changed today or go back." },
      { key: "autoDraftDays", kind: "number", name: "Keep automatic drafts for (days)", desc: "Named drafts are kept until you delete them.", fallback: 30 },
      { key: "draftsFolder", kind: "text", name: "Drafts folder", desc: "Where drafts are stored in your vault, one file per note. Folders starting with a dot are hidden from Obsidian (search, graph, Dataview) but sync with the vault.", fallback: DEFAULTS.draftsFolder }
    ]
  },
  {
    heading: "Submissions",
    fields: [
      { key: "contestsFolder", kind: "folder", name: "Contests folder", desc: "Where \u201CNew contest note\u201D puts notes. Contest notes are found anywhere in the vault (type: contest); this only says where new ones go. Empty: a folder called Contests." },
      { key: "noticeDays", kind: "number", name: "Announce deadlines (days ahead)", desc: "When Obsidian opens, a notice lists deadlines within this many days, once a day. 0 turns it off.", allowZero: true, fallback: 14 },
      { key: "showNextDeadline", kind: "toggle", name: "Next deadline in the status bar" },
      { key: "submissionsFolder", kind: "text", name: "Submissions folder", desc: "Where records of what you sent are stored, one file per story. Folders starting with a dot are hidden from Obsidian but sync with the vault.", fallback: DEFAULTS.submissionsFolder }
    ]
  },
  {
    heading: "Manuscript export",
    fields: [
      { key: "exportLayout", kind: "dropdown", name: "Default layout", desc: "Standard manuscript shows your name, contact details and word count. The contest layout is anonymous: only the title and your pseudonym.", options: { manuscript: "Standard manuscript", contest: "Contest (anonymous)" } },
      { key: "exportFont", kind: "dropdown", name: "Font", options: { times: "Times New Roman", courier: "Courier", arial: "Arial" } },
      { key: "exportSpacing", kind: "dropdown", name: "Line spacing", options: { "2": "Double", "1.5": "1.5 lines" } },
      { key: "exportPage", kind: "dropdown", name: "Page size", options: { letter: "Letter", a4: "A4" } },
      { key: "exportContact", kind: "textarea", name: "Contact details", desc: "Printed under your name on the first page of a standard manuscript, one item per line (city, email, phone\u2026)." },
      { key: "exportPseudonym", kind: "text", name: "Pseudonym", desc: "Used by the contest layout. A note's \u201Cpseudonym\u201D property overrides it." },
      { key: "exportChapterBreaks", kind: "toggle", name: "Start chapters on a new page", desc: "Each top-level heading begins a new page. In a project export every story or chapter note always starts a new page." },
      { key: "exportKeepJustify", kind: "toggle", name: "Keep justified paragraphs", desc: "Paragraphs marked as justified stay justified in the standard layout too. The contest layout always keeps them." },
      { key: "exportSceneBreak", kind: "dropdown", name: "Scene-break symbol", options: { "#": "#", "* * *": "* * *", "\u2014": "\u2014", blank: "Blank line" } },
      { key: "exportCoverPage", kind: "toggle", name: "Cover page", desc: "Title on a page of its own; the text starts on page 2." }
    ]
  },
  {
    heading: "Screenplays",
    fields: [
      { key: "scriptsFolder", kind: "folder", name: "Scripts folder", desc: "Folder where new scripts and story adaptations are created.", fallback: SCRIPTS_FOLDER_DEFAULT },
      { key: "authorName", kind: "text", name: "Author name", desc: "Written on the title page of new scripts and on exported manuscripts." },
      { key: "smartEnter", kind: "toggle", name: "Smart line breaks in scripts", desc: "After a character name or parenthetical, the return key starts the next dialogue line; after dialogue or action it starts a new element (blank line). Shift+Enter always inserts a plain line break. Reload the plugin after changing." }
    ]
  },
  {
    heading: "Spelling & grammar",
    fields: [
      { key: "ltConsent", kind: "toggle", name: "Allow sending text to the grammar service", desc: "Checks run only when you ask: from the panel, a command, or the editor's context menu. The text in the chosen scope is sent to the server below (LanguageTool). Obsidian's built-in spellcheck keeps working alongside it; on macOS and iOS it follows your keyboard languages." },
      { key: "ltServer", kind: "text", name: "Server", desc: "Default: https://api.languagetool.org (free). You can point this to your own LanguageTool server.", fallback: DEFAULTS.ltServer },
      { key: "ltUser", kind: "text", name: "Premium username (email)", desc: "Optional. A premium account gives higher limits and more checks." },
      { key: "ltKey", kind: "password", name: "Premium API key" },
      { key: "ltPicky", kind: "toggle", name: "Picky mode", desc: "Extra style and punctuation suggestions." },
      { key: "ltDictionary", kind: "textarea", name: "Personal dictionary", desc: "One word per line (character names, places, invented words). These are never flagged as misspelled." },
      { key: "ltDisabledRules", kind: "textarea", name: "Turned-off rules", desc: "Rule IDs from the grammar service, comma-separated." }
    ]
  }
];
var FIELDS = new Map(GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f])));
var ToolboxSettings = class extends import_obsidian12.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  get prefs() {
    return this.plugin.prefs;
  }
  /** The value a field shows. */
  shown(f) {
    const v = this.prefs[f.key];
    if (f.kind === "toggle") return v === true;
    if (f.kind === "number") return typeof v === "number" ? v : Number(DEFAULTS[f.key]);
    const s = typeof v === "string" ? v : "";
    return s || f.emptyShows || "";
  }
  /** Clean a value and store it. */
  async store(f, value) {
    let v;
    if (f.kind === "toggle") v = value === true;
    else if (f.kind === "number") {
      const n = typeof value === "number" ? value : parseInt(String(value), 10);
      const ok = Number.isFinite(n) && (n > 0 || f.allowZero === true && n === 0);
      v = ok ? Math.round(n) : typeof f.fallback === "number" ? f.fallback : 0;
    } else {
      const s = typeof value === "string" ? value : "";
      v = f.kind === "textarea" ? s : s.trim();
      if (!v && typeof f.fallback === "string") v = f.fallback;
    }
    this.prefs[f.key] = v;
    await this.plugin.saveSettings();
    this.plugin.settingChanged?.(f.key);
    this.plugin.refreshSoon();
  }
  /* ---------- Obsidian 1.13+: declarative, searchable settings ---------- */
  getSettingDefinitions() {
    const groups = GROUPS.map((g) => ({
      type: "group",
      heading: g.heading,
      items: g.fields.map((f) => this.definition(f))
    }));
    const device = {
      type: "group",
      heading: "This device",
      items: [{ name: "What this device can do", desc: capabilityLines().join(" \xB7 "), render: () => {
      } }]
    };
    return [...groups, device];
  }
  definition(f) {
    const base = { name: f.name, desc: f.desc };
    switch (f.kind) {
      case "toggle":
        return { ...base, control: { type: "toggle", key: f.key } };
      case "number":
        return { ...base, control: { type: "number", key: f.key, min: 0 } };
      case "dropdown":
        return { ...base, control: { type: "dropdown", key: f.key, options: f.options ?? {} } };
      case "folder":
        return { ...base, control: { type: "folder", key: f.key, placeholder: typeof f.fallback === "string" ? f.fallback : "" } };
      case "textarea":
        return { ...base, control: { type: "textarea", key: f.key, placeholder: f.emptyShows } };
      case "text":
        return { ...base, control: { type: "text", key: f.key } };
      case "password":
        return { ...base, render: (setting) => {
          this.addControl(setting, f);
        } };
    }
  }
  getControlValue(key) {
    const f = FIELDS.get(key);
    return f ? this.shown(f) : this.prefs[key];
  }
  async setControlValue(key, value) {
    const f = FIELDS.get(key);
    if (f) await this.store(f, value);
  }
  /* ---------- older Obsidian versions ---------- */
  display() {
    const { containerEl } = this;
    containerEl.empty();
    for (const g of GROUPS) {
      new import_obsidian12.Setting(containerEl).setName(g.heading).setHeading();
      for (const f of g.fields) {
        const s = new import_obsidian12.Setting(containerEl).setName(f.name);
        if (f.desc) s.setDesc(f.desc);
        this.addControl(s, f);
      }
    }
    new import_obsidian12.Setting(containerEl).setName("This device").setHeading();
    new import_obsidian12.Setting(containerEl).setName("What this device can do").setDesc(capabilityLines().join(" \xB7 "));
  }
  /** Classic control for one field (also renders the password field in the declarative layout). */
  addControl(s, f) {
    const v = this.shown(f);
    const save = (x) => {
      void this.store(f, x);
    };
    switch (f.kind) {
      case "toggle":
        s.addToggle((t2) => t2.setValue(v === true).onChange(save));
        break;
      case "dropdown":
        s.addDropdown((d) => d.addOptions(f.options ?? {}).setValue(String(v)).onChange(save));
        break;
      case "textarea":
        s.addTextArea((t2) => {
          if (f.emptyShows) t2.setPlaceholder(f.emptyShows);
          t2.setValue(String(v)).onChange(save);
        });
        break;
      case "password":
        s.addText((t2) => {
          t2.inputEl.type = "password";
          t2.setValue(String(v)).onChange(save);
        });
        break;
      default:
        s.addText((t2) => t2.setValue(String(v)).onChange(save));
        break;
    }
  }
};

// src/view/writing-view.ts
var import_obsidian16 = require("obsidian");

// src/poetry/panel.ts
function renderPoem(el, p, host) {
  const es2 = p.lang === "es";
  const hero = el.createDiv({ cls: "at-hero" });
  hero.createDiv({ cls: "at-hero-num at-poem-form", text: p.form });
  hero.createDiv({ cls: "at-hero-sub", text: es2 ? "forma estimada" : "estimated form" });
  if (!p.lines.length) {
    el.createDiv({ cls: "at-empty", text: es2 ? "Escribe algunos versos: cada l\xEDnea es un verso y una l\xEDnea en blanco separa las estrofas." : "Write a few lines: each line is a line of verse, and a blank line separates stanzas." });
    return;
  }
  const grid = el.createDiv({ cls: "at-grid" });
  const tile = (label, value, hint) => {
    const d = grid.createDiv({ cls: "at-tile" });
    d.createDiv({ cls: "at-tile-v", text: value });
    d.createDiv({ cls: "at-tile-l", text: label });
    if (hint) d.setAttr("title", hint);
  };
  tile(es2 ? "Versos" : "Lines", String(p.lines.length));
  tile(es2 ? "Estrofas" : "Stanzas", String(p.stanzas));
  tile(es2 ? "Palabras" : "Words", String(p.words));
  if (p.meter) tile(es2 ? "Metro m\xE1s com\xFAn" : "Most common length", `${p.meter.syllables}`, `${p.meter.name}: ${p.meter.count} / ${p.lines.length}`);
  const sch = el.createDiv({ cls: "at-section" });
  sch.createDiv({ cls: "at-label", text: es2 ? "Esquema de rima" : "Rhyme scheme" });
  sch.createDiv({ cls: "at-poem-scheme", text: p.scheme.join("  ") });
  sch.createDiv({ cls: "at-hint", text: es2 ? "May\xFAsculas: arte mayor (9 s\xEDlabas o m\xE1s); min\xFAsculas: arte menor. \u2032 = rima asonante. - = verso suelto." : "Letters group lines that rhyme; - = an unrhymed line." });
  const sec = el.createDiv({ cls: "at-section" });
  sec.createDiv({ cls: "at-label", text: es2 ? "Versos" : "Lines" });
  sec.createDiv({ cls: "at-hint", text: es2 ? "S\xEDlabas m\xE9tricas (con sinalefas y ley del acento final). Son estimaciones: toca un verso para ir a \xE9l." : "Approximate syllables per line. Tap a line to go to it." });
  const list = sec.createDiv({ cls: "at-poem-lines" });
  let stanza = -1;
  for (const l of p.lines) {
    if (l.stanza !== stanza && stanza >= 0) list.createDiv({ cls: "at-poem-gap" });
    stanza = l.stanza;
    const row = list.createDiv({ cls: "at-poem-line" });
    row.createSpan({ cls: "at-poem-syl", text: String(l.syllables) });
    row.createSpan({ cls: "at-poem-text", text: l.text });
    row.createSpan({ cls: "at-poem-letter", text: l.letter });
    row.setAttr("title", lineTip(l, es2));
    row.onclick = () => host.jumpToLine(l.line);
  }
}
function lineTip(l, es2) {
  if (!l.detail) return `${l.syllables} syllables \xB7 rhyme \u201C${l.rhyme}\u201D`;
  const d = l.detail;
  const adj = d.adjust > 0 ? " +1 (aguda)" : d.adjust < 0 ? " \u22121 (esdr\xFAjula)" : " (llana)";
  return es2 ? `${d.raw} s\xEDlabas${d.sinalefas ? ` \u2212 ${d.sinalefas} sinalefa${d.sinalefas > 1 ? "s" : ""}` : ""}${adj} = ${l.syllables} \xB7 rima \u201C-${l.rhyme}\u201D, asonante ${l.assonance}` : `${l.syllables} syllables \xB7 rhyme \u201C${l.rhyme}\u201D`;
}

// src/revision/modals.ts
var import_obsidian13 = require("obsidian");
var DraftModal = class extends import_obsidian13.Modal {
  constructor(app, opts) {
    super(app);
    this.opts = opts;
  }
  onOpen() {
    this.titleEl.setText(this.opts.title);
    const c = this.contentEl;
    c.addClass("at-draft-modal");
    if (this.opts.hint) c.createDiv({ cls: "setting-item-description", text: this.opts.hint });
    c.createEl("label", { cls: "at-field-label", text: "Name" });
    const name = c.createEl("input", { type: "text", cls: "at-full" });
    name.value = this.opts.name;
    c.createEl("label", { cls: "at-field-label", text: "Note (optional)" });
    const note = c.createEl("textarea", { cls: "at-full at-draft-note", attr: { rows: "3", placeholder: "What is this draft? Before the editor's notes, sent to the contest\u2026" } });
    note.value = this.opts.note ?? "";
    const row = c.createDiv({ cls: "at-modal-btns" });
    const ok = () => {
      const n = name.value.trim();
      if (!n) {
        name.focus();
        return;
      }
      this.close();
      this.opts.onDone(n, note.value.trim());
    };
    row.createEl("button", { text: "Cancel" }).onclick = () => this.close();
    row.createEl("button", { text: this.opts.action, cls: "mod-cta" }).onclick = ok;
    name.addEventListener("keydown", (e) => {
      if (e.key === "Enter") ok();
    });
    window.setTimeout(() => {
      name.focus();
      name.select();
    }, 30);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ConfirmModal = class extends import_obsidian13.Modal {
  constructor(app, opts) {
    super(app);
    this.opts = opts;
  }
  onOpen() {
    this.titleEl.setText(this.opts.title);
    this.contentEl.createEl("p", { text: this.opts.text });
    const row = this.contentEl.createDiv({ cls: "at-modal-btns" });
    row.createEl("button", { text: "Cancel" }).onclick = () => this.close();
    const yes = row.createEl("button", { text: this.opts.action, cls: this.opts.warning ? "mod-warning" : "mod-cta" });
    yes.onclick = () => {
      this.close();
      this.opts.onYes();
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};
var when = (d) => new Date(d.created).toLocaleDateString(void 0, { day: "numeric", month: "short", year: "numeric" });
var GoalModal = class extends import_obsidian13.Modal {
  constructor(app, opts) {
    super(app);
    this.opts = opts;
  }
  onOpen() {
    this.titleEl.setText("Revision goal");
    const c = this.contentEl;
    c.createDiv({ cls: "setting-item-description", text: "Measured from a draft, for example: cut 10% of the words, or bring the story to 5,000 words." });
    const g = this.opts.goal;
    c.createEl("label", { cls: "at-field-label", text: "Goal" });
    const row = c.createDiv({ cls: "at-goal-inputs" });
    const kind = row.createEl("select", { cls: "dropdown" });
    kind.createEl("option", { value: "cut", text: "Cut this percent of the words" });
    kind.createEl("option", { value: "words", text: "Reach this many words" });
    kind.value = g?.kind ?? "cut";
    const value = row.createEl("input", { type: "number", attr: { min: "1", inputmode: "numeric" } });
    value.value = String(g?.value ?? 10);
    c.createEl("label", { cls: "at-field-label", text: "Measured from" });
    const from = c.createEl("select", { cls: "dropdown at-full" });
    for (const d of [...this.opts.drafts].reverse()) from.createEl("option", { value: d.id, text: `${d.name} \xB7 ${when(d)} \xB7 ${d.words.toLocaleString()} words` });
    from.value = g && this.opts.drafts.some((d) => d.id === g.from) ? g.from : this.opts.drafts[this.opts.drafts.length - 1]?.id ?? "";
    const btns = c.createDiv({ cls: "at-modal-btns" });
    if (g) btns.createEl("button", { text: "Remove goal" }).onclick = () => {
      this.close();
      this.opts.onDone(null);
    };
    btns.createEl("button", { text: "Cancel" }).onclick = () => this.close();
    btns.createEl("button", { text: "Save", cls: "mod-cta" }).onclick = () => {
      const v = parseFloat(value.value);
      if (!(v > 0) || kind.value === "cut" && v >= 100 || !from.value) {
        value.focus();
        return;
      }
      this.close();
      this.opts.onDone({ kind: kind.value === "words" ? "words" : "cut", value: v, from: from.value });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};
function goalProgress(goal, baseWords, now) {
  const target = goal.kind === "cut" ? Math.round(baseWords * (1 - goal.value / 100)) : Math.round(goal.value);
  const span = target - baseWords;
  const done = span === 0 ? 1 : Math.max(0, Math.min(1, (now - baseWords) / span));
  const label = goal.kind === "cut" ? `Cut ${goal.value}%: ${baseWords.toLocaleString()} \u2192 ${target.toLocaleString()} words` : `Reach ${target.toLocaleString()} words (from ${baseWords.toLocaleString()})`;
  return { target, done, label };
}

// src/storage/sidecar.ts
var import_obsidian14 = require("obsidian");
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
function sidecarFileName(path) {
  const base = (path.split("/").pop() ?? path).replace(/\.md$/i, "");
  const slug = base.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).toLowerCase();
  return `${slug || "note"}-${hash(path)}.json`;
}
var SidecarStore = class {
  constructor(o) {
    this.o = o;
    this.cache = /* @__PURE__ */ new Map();
    this.locked = /* @__PURE__ */ new Set();
  }
  dir() {
    return (0, import_obsidian14.normalizePath)(this.o.folder().trim() || this.o.defaultFolder);
  }
  fileOf(path) {
    return `${this.dir()}/${sidecarFileName(path)}`;
  }
  /** True when the note's file comes from a newer version of the plugin and is therefore left alone. */
  isLocked(path) {
    return this.locked.has(path);
  }
  async parse(file, path) {
    let raw;
    try {
      raw = JSON.parse(await this.o.adapter.read(file));
    } catch {
      return null;
    }
    if (!raw || typeof raw !== "object") return null;
    const obj = raw;
    if (typeof obj.version === "number" && obj.version > this.o.version) return "newer";
    return this.o.normalize(obj, path);
  }
  async load(path) {
    const hit = this.cache.get(path);
    if (hit) return hit;
    const f = this.fileOf(path);
    let rec = this.o.empty(path);
    try {
      const a = this.o.adapter;
      let got = null;
      if (await a.exists(f)) {
        got = await this.parse(f, path);
        if (got === null) {
          const tmp = await this.recover(f, path);
          try {
            await a.write(f + ".corrupt", await a.read(f));
          } catch {
          }
          got = tmp;
        }
      } else if (await a.exists(f + ".tmp")) {
        got = await this.recover(f, path);
      }
      if (got === "newer") {
        this.locked.add(path);
        console.warn("Authors Toolbox: the data of", path, "was written by a newer version; leaving it unchanged.");
      } else if (got) rec = got;
    } catch (e) {
      console.error("Authors Toolbox: could not read", f, e);
    }
    this.cache.set(path, rec);
    return rec;
  }
  async recover(file, path) {
    const tmp = file + ".tmp";
    if (!await this.o.adapter.exists(tmp)) return null;
    const got = await this.parse(tmp, path);
    return got && got !== "newer" ? got : null;
  }
  async ensureDir() {
    let acc = "";
    for (const part of this.dir().split("/")) {
      acc = acc ? `${acc}/${part}` : part;
      if (!await this.o.adapter.exists(acc)) await this.o.adapter.mkdir(acc);
    }
  }
  async save(rec) {
    if (this.locked.has(rec.path)) return;
    const a = this.o.adapter;
    await this.ensureDir();
    const f = this.fileOf(rec.path);
    if (this.o.isEmpty(rec)) {
      if (await a.exists(f)) await a.remove(f);
      if (await a.exists(f + ".tmp")) await a.remove(f + ".tmp");
    } else {
      const json = JSON.stringify({ ...rec, version: this.o.version });
      await a.write(f + ".tmp", json);
      await a.write(f, json);
      await a.remove(f + ".tmp");
    }
    this.cache.set(rec.path, rec);
  }
  /** Every record in the folder (for dashboards). Files that cannot be read are skipped. */
  async all() {
    const a = this.o.adapter;
    const dir = this.dir();
    if (!await a.exists(dir)) return [];
    const out = [];
    for (const f of (await a.list(dir)).files) {
      if (!f.endsWith(".json")) continue;
      let path = "";
      try {
        const p = JSON.parse(await a.read(f)).path;
        if (typeof p === "string") path = p;
      } catch {
        continue;
      }
      if (!path) continue;
      const rec = await this.load(path);
      if (!this.o.isEmpty(rec)) out.push(rec);
    }
    return out;
  }
  /** A renamed note keeps its record. */
  async rename(from, to) {
    const a = this.o.adapter;
    const src = this.fileOf(from);
    if (!this.cache.has(from) && !await a.exists(src)) return;
    const rec = await this.load(from);
    if (this.locked.has(from)) return;
    this.cache.delete(from);
    await this.save({ ...rec, path: to });
    if (await a.exists(src)) await a.remove(src);
  }
  /** Forget cached records (after the folder setting changes). */
  clear() {
    this.cache.clear();
    this.locked.clear();
  }
};

// src/revision/store.ts
var DAY = 864e5;
function draftWhen(d, withTime = true) {
  const t2 = new Date(typeof d === "number" ? d : d.created);
  const date = t2.toLocaleDateString(void 0, { day: "numeric", month: "short", year: t2.getFullYear() === (/* @__PURE__ */ new Date()).getFullYear() ? void 0 : "numeric" });
  return withTime ? `${date}, ${t2.toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit" })}` : date;
}
var DraftStore = class {
  constructor(adapter, folder) {
    this.files = new SidecarStore({
      adapter,
      folder,
      defaultFolder: ".authors-toolbox/drafts",
      version: 1,
      empty: (path) => ({ version: 1, path, drafts: [] }),
      normalize: (raw, path) => {
        if (!Array.isArray(raw.drafts)) return null;
        const drafts = raw.drafts.slice().sort((x, y) => x.created - y.created);
        return { version: 1, path, drafts, goal: raw.goal };
      },
      isEmpty: (df) => !df.drafts.length && !df.goal
    });
  }
  load(path) {
    return this.files.load(path);
  }
  save(df) {
    return this.files.save(df);
  }
  async list(path) {
    return (await this.load(path)).drafts;
  }
  async latest(path) {
    const d = await this.list(path);
    return d.length ? d[d.length - 1] : null;
  }
  async get(path, id) {
    return (await this.list(path)).find((d) => d.id === id) ?? null;
  }
  async add(path, text2, words2, opts) {
    const df = await this.load(path);
    const created = opts.now ?? Date.now();
    const d = { id: created.toString(36) + Math.floor(Math.random() * 1296).toString(36).padStart(2, "0"), name: opts.name, created, words: words2, text: text2 };
    if (opts.note) d.note = opts.note;
    if (opts.auto) d.auto = true;
    df.drafts.push(d);
    df.drafts.sort((x, y) => x.created - y.created);
    await this.save(df);
    return d;
  }
  async update(path, id, change) {
    const df = await this.load(path);
    const d = df.drafts.find((x) => x.id === id);
    if (!d) return;
    Object.assign(d, change);
    if (!d.note) delete d.note;
    if (!d.auto) delete d.auto;
    await this.save(df);
  }
  async remove(path, id) {
    const df = await this.load(path);
    df.drafts = df.drafts.filter((d) => d.id !== id);
    if (df.goal && df.goal.from === id) delete df.goal;
    await this.save(df);
  }
  async setGoal(path, goal) {
    const df = await this.load(path);
    if (goal) df.goal = goal;
    else delete df.goal;
    await this.save(df);
  }
  /** Automatic drafts older than `days` are dropped (never the latest draft, never the goal's draft). */
  async pruneAuto(path, days, now = Date.now()) {
    const df = await this.load(path);
    const last = df.drafts[df.drafts.length - 1];
    const keep = df.drafts.filter((d) => !d.auto || d === last || d.id === df.goal?.from || now - d.created < days * DAY);
    const n = df.drafts.length - keep.length;
    if (n) {
      df.drafts = keep;
      await this.save(df);
    }
    return n;
  }
  /** A renamed note keeps its drafts. */
  rename(from, to) {
    return this.files.rename(from, to);
  }
  /** Forget cached files (after the folder setting changes). */
  clear() {
    this.files.clear();
  }
};

// src/submissions/model.ts
var STATUSES = ["planned", "sent", "accepted", "declined", "withdrawn", "no reply"];
var STATUS_LABEL = { planned: "Planned", sent: "Sent", accepted: "Accepted", declined: "Declined", withdrawn: "Withdrawn", "no reply": "No reply" };
var isOut = (s) => s.status === "sent";
var isDecided = (s) => s.status === "accepted" || s.status === "declined" || s.status === "withdrawn" || s.status === "no reply";
function withStatus(s, status, today) {
  const out = { ...s, status };
  if (status === "accepted" || status === "declined" || status === "withdrawn") out.decided = s.decided || today;
  else delete out.decided;
  if (status === "sent" && !out.sent) out.sent = today;
  return out;
}
function slot(map, key, make) {
  let v = map.get(key);
  if (v === void 0) {
    v = make();
    map.set(key, v);
  }
  return v;
}
var DAY_RE = /^(\d{4})-(\d{2})-(\d{2})/;
function parseDay(v) {
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  if (typeof v !== "string") return null;
  const m = DAY_RE.exec(v.trim());
  if (!m) return null;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  const t2 = new Date(Date.UTC(y, mo - 1, d));
  return t2.getUTCFullYear() === y && t2.getUTCMonth() === mo - 1 && t2.getUTCDate() === d ? `${m[1]}-${m[2]}-${m[3]}` : null;
}
var utc = (day) => {
  const m = DAY_RE.exec(day);
  return Date.UTC(+m[1], +m[2] - 1, +m[3]);
};
var pad = (n) => String(n).padStart(2, "0");
var daysBetween = (a, b) => Math.round((utc(b) - utc(a)) / 864e5);
function addDays2(day, n) {
  const t2 = new Date(utc(day) + n * 864e5);
  return `${t2.getUTCFullYear()}-${pad(t2.getUTCMonth() + 1)}-${pad(t2.getUTCDate())}`;
}
function addYears(day, n) {
  const m = DAY_RE.exec(day);
  const y = +m[1] + n, mo = +m[2];
  let d = +m[3];
  const last = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  if (d > last) d = last;
  return `${String(y).padStart(4, "0")}-${pad(mo)}-${pad(d)}`;
}
function shortDay(day, ref) {
  const m = DAY_RE.exec(day);
  if (!m) return day;
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+m[2] - 1];
  return `${+m[3]} ${mon}${ref && ref.slice(0, 4) === m[1] ? "" : " " + m[1]}`;
}
var str = (v) => {
  if (typeof v === "string") return v.trim() || void 0;
  if (typeof v === "number") return String(v);
  return void 0;
};
function parseNum(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : void 0;
  if (typeof v !== "string") return void 0;
  const s = v.replace(/[^\d.,]/g, "");
  if (!s) return void 0;
  const cleaned = /^\d{1,3}([.,]\d{3})+$/.test(s) ? s.replace(/[.,]/g, "") : s.replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : void 0;
}
function parseBool(v) {
  if (typeof v === "boolean") return v;
  if (typeof v !== "string") return void 0;
  const s = v.trim().toLowerCase();
  if (["true", "yes", "y", "s\xED", "si", "1", "allowed", "permitido"].includes(s)) return true;
  if (["false", "no", "n", "0", "not allowed", "no permitido"].includes(s)) return false;
  return void 0;
}
var LANG_NAMES = { es: "es", spanish: "es", espa\u00F1ol: "es", espanol: "es", castellano: "es", en: "en", english: "en", ingl\u00E9s: "en", ingles: "en" };
var langCode = (v) => LANG_NAMES[v.trim().toLowerCase()] ?? v.trim().toLowerCase();
var langName = (c) => c === "es" ? "Spanish" : c === "en" ? "English" : c;
function fontOf(v) {
  const s = (str(v) ?? "").toLowerCase();
  if (s.startsWith("times")) return "times";
  if (s.startsWith("courier")) return "courier";
  if (s.startsWith("arial") || s.startsWith("helvetica")) return "arial";
  return void 0;
}
function spacingOf(v) {
  const s = (str(v) ?? "").toLowerCase();
  if (s === "double" || s === "doble") return 2;
  if (s === "1.5" || s === "1,5" || s.startsWith("one and a half")) return 1.5;
  const n = parseNum(v);
  return n === 2 || n === 1.5 ? n : void 0;
}
function parseContest(path, name, fm) {
  const list = (v) => (Array.isArray(v) ? v : typeof v === "string" ? v.split(/[,;/]/) : []).map((x) => typeof x === "string" ? langCode(x) : "").filter(Boolean);
  const c = { path, name: str(fm.title) ?? name, languages: list(fm.languages ?? fm.language) };
  const set = (k, v) => {
    if (v !== void 0 && v !== null) c[k] = v;
  };
  set("deadline", parseDay(fm.deadline));
  set("opens", parseDay(fm.opens));
  if (str(fm.recurs)?.toLowerCase() === "yearly" || str(fm.recurs)?.toLowerCase() === "anual") c.recurs = "yearly";
  set("wordMin", parseNum(fm.word_min));
  set("wordMax", parseNum(fm.word_max));
  set("anonymous", parseBool(fm.anonymous));
  set("fee", parseNum(fm.fee));
  set("prize", str(fm.prize));
  set("url", str(fm.url));
  set("country", str(fm.country));
  set("theme", str(fm.theme));
  set("simultaneous", parseBool(fm.simultaneous));
  set("font", fontOf(fm.font));
  set("spacing", spacingOf(fm.spacing));
  const page2 = (str(fm.page_size) ?? "").toLowerCase();
  if (page2 === "letter" || page2 === "a4") c.page = page2;
  return c;
}
function rollContest(c, today) {
  if (c.recurs !== "yearly" || !c.deadline || c.deadline >= today) return c;
  let k = 1;
  while (addYears(c.deadline, k) < today && k < 200) k++;
  const out = { ...c, deadline: addYears(c.deadline, k) };
  if (c.opens) out.opens = addYears(c.opens, k);
  return out;
}
function upcoming(contests, today, window2) {
  const out = [];
  for (const c of contests) {
    if (c.deadline) {
      const d = daysBetween(today, c.deadline);
      if (d >= 0 && d <= window2) out.push({ contest: c, kind: "deadline", day: c.deadline, days: d });
    }
    if (c.opens) {
      const d = daysBetween(today, c.opens);
      if (d > 0 && d <= window2) out.push({ contest: c, kind: "opens", day: c.opens, days: d });
    }
  }
  return out.sort((a, b) => a.days - b.days || a.contest.name.localeCompare(b.contest.name));
}
function nextDeadline(contests, today) {
  let best = null;
  for (const c of contests) {
    if (!c.deadline) continue;
    const d = daysBetween(today, c.deadline);
    if (d >= 0 && (!best || d < best.days)) best = { contest: c, days: d };
  }
  return best;
}
var inDays = (n) => n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`;
var fmt2 = (n) => Math.round(n).toLocaleString("en-US");
var plural = (n, one, many = one + "s") => `${fmt2(n)} ${n === 1 ? one : many}`;
var fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function findIdentities(text2, identities) {
  const hay = fold(text2);
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const raw of identities) {
    const what = raw.trim();
    if (what.length < 3 || seen.has(what)) continue;
    seen.add(what);
    const needle = fold(what);
    let count = 0, at = 0;
    for (; ; ) {
      const i = hay.indexOf(needle, at);
      if (i < 0) break;
      const before = i === 0 ? "" : hay[i - 1], after = hay[i + needle.length] ?? "";
      if (!/[\p{L}\p{N}]/u.test(before) && !/[\p{L}\p{N}]/u.test(after)) count++;
      at = i + needle.length;
    }
    if (count) out.push({ what, count });
  }
  return out;
}
function preflight(c, p) {
  const rows = [];
  if (c.wordMin !== void 0 || c.wordMax !== void 0) {
    const lim = c.wordMax !== void 0 ? `${fmt2(c.wordMax)}` : "";
    if (c.wordMax !== void 0 && p.words > c.wordMax) rows.push({ id: "words", level: "fail", text: `${plural(p.words, "word")}: ${fmt2(p.words - c.wordMax)} over the limit of ${lim}.` });
    else if (c.wordMin !== void 0 && p.words < c.wordMin) rows.push({ id: "words", level: "fail", text: `${plural(p.words, "word")}: ${fmt2(c.wordMin - p.words)} under the minimum of ${fmt2(c.wordMin)}.` });
    else rows.push({ id: "words", level: "pass", text: c.wordMax !== void 0 ? `${fmt2(p.words)} of ${lim} words.` : `${plural(p.words, "word")}, above the minimum of ${fmt2(c.wordMin)}.` });
  }
  if (c.anonymous === true) {
    const found = findIdentities(p.text, p.identities);
    const inProps = found.length ? [] : findIdentities(p.props ?? "", p.identities);
    if (inProps.length) rows.push({ id: "anonymity", level: "warn", text: `Not in the text, but in the note's properties: ${inProps.map((f) => `\u201C${f.what}\u201D`).join(", ")}. They are not exported; remove them before sharing the note.` });
    else if (found.length) rows.push({ id: "anonymity", level: "fail", text: `Anonymous entry, but ${found.map((f) => `\u201C${f.what}\u201D appears ${f.count === 1 ? "once" : f.count + " times"}`).join(" and ")}.` });
    else if (!p.identities.some((x) => x.trim().length >= 3)) rows.push({ id: "anonymity", level: "warn", text: "Anonymous entry. Add your name in the settings so it can be searched for in the text." });
    else rows.push({ id: "anonymity", level: "pass", text: "Anonymous entry: your name and contact details are not in the text." });
    if (p.layout !== "contest") rows.push({ id: "anonymity", level: "warn", text: "Anonymous entry: use the contest layout, which leaves your name off every page.", fix: { layout: "contest" } });
  }
  if (c.languages.length) {
    if (c.languages.includes(p.lang)) rows.push({ id: "language", level: "pass", text: `Written in ${langName(p.lang)}, which the contest accepts.` });
    else rows.push({ id: "language", level: "fail", text: `Written in ${langName(p.lang)}; the contest accepts ${c.languages.map(langName).join(" or ")}.` });
  }
  const fix = {};
  const diffs = [];
  const FONT = { times: "Times New Roman", courier: "Courier", arial: "Arial" };
  if (c.font && c.font !== p.font) {
    fix.font = c.font;
    diffs.push(`font ${FONT[c.font]}`);
  }
  if (c.spacing && c.spacing !== p.spacing) {
    fix.spacing = c.spacing;
    diffs.push(c.spacing === 2 ? "double spacing" : "1.5 line spacing");
  }
  if (c.page && c.page !== p.page) {
    fix.page = c.page;
    diffs.push(`${c.page === "a4" ? "A4" : "Letter"} paper`);
  }
  if (c.font || c.spacing || c.page) {
    if (diffs.length) rows.push({ id: "layout", level: "warn", text: `The contest asks for ${diffs.join(", ")}.`, fix });
    else rows.push({ id: "layout", level: "pass", text: "Font, spacing and page size match the contest." });
  }
  if (c.deadline) {
    const d = daysBetween(p.today, c.deadline);
    if (d < 0) rows.push({ id: "deadline", level: "fail", text: `The deadline (${shortDay(c.deadline, p.today)}) passed ${plural(-d, "day")} ago.` });
    else if (d <= 7) rows.push({ id: "deadline", level: "warn", text: `Deadline ${shortDay(c.deadline, p.today)}, ${inDays(d)}.` });
    else rows.push({ id: "deadline", level: "pass", text: `Deadline ${shortDay(c.deadline, p.today)}, ${inDays(d)}.` });
  }
  if (c.opens) {
    const d = daysBetween(p.today, c.opens);
    if (d > 0) rows.push({ id: "opens", level: "warn", text: `Entries open ${shortDay(c.opens, p.today)}, ${inDays(d)}.` });
  }
  return rows;
}
function usualWait(entries) {
  const by = /* @__PURE__ */ new Map();
  for (const { sub } of entries) {
    if (!sub.sent || !sub.decided || sub.status !== "accepted" && sub.status !== "declined") continue;
    const key = sub.venuePath || sub.venue.toLowerCase();
    slot(by, key, () => []).push(Math.max(0, daysBetween(sub.sent, sub.decided)));
  }
  const out = /* @__PURE__ */ new Map();
  for (const [k, v] of by) {
    v.sort((a, b) => a - b);
    out.set(k, v[Math.floor((v.length - 1) / 2)]);
  }
  return out;
}
function pipeline(entries, today) {
  const usual = usualWait(entries);
  const planned = entries.filter((e) => e.sub.status === "planned").sort((a, b) => (a.sub.sent ?? "9").localeCompare(b.sub.sent ?? "9"));
  const waiting = entries.filter((e) => isOut(e.sub)).map((e) => ({ ...e, days: e.sub.sent ? Math.max(0, daysBetween(e.sub.sent, today)) : 0, usual: usual.get(e.sub.venuePath || e.sub.venue.toLowerCase()) })).sort((a, b) => b.days - a.days);
  const decided = entries.filter((e) => isDecided(e.sub)).sort((a, b) => (b.sub.decided ?? b.sub.sent ?? "").localeCompare(a.sub.decided ?? a.sub.sent ?? ""));
  return { planned, waiting, decided };
}
function storyWarnings(entries, simultaneous) {
  const out = [];
  const byStory = /* @__PURE__ */ new Map();
  for (const e of entries) slot(byStory, e.path, () => []).push(e);
  for (const [path, list] of byStory) {
    const title = list[0].title;
    const accepted = list.filter((e) => e.sub.status === "accepted");
    const open = list.filter((e) => isOut(e.sub));
    for (const a of accepted) {
      const others = open.filter((o) => o !== a);
      if (others.length) out.push({ path, title, text: `Accepted by ${a.sub.venue}, but still out at ${others.map((o) => o.sub.venue).join(", ")}. Withdraw?` });
    }
    if (open.length > 1) {
      for (const o of open) {
        if (simultaneous(o.sub.venuePath) === false) out.push({ path, title, text: `${o.sub.venue} does not allow simultaneous submissions, and \u201C${title}\u201D is also out at ${open.filter((x) => x !== o).map((x) => x.sub.venue).join(", ")}.` });
      }
    }
  }
  return out;
}
function totals2(entries) {
  const mk = () => ({ sent: 0, accepted: 0, declined: 0, fees: 0 });
  const all = mk();
  const byYear = /* @__PURE__ */ new Map();
  for (const { sub } of entries) {
    if (sub.status === "planned") continue;
    const year = (sub.sent ?? sub.decided ?? "").slice(0, 4) || "\u2014";
    const y = slot(byYear, year, mk);
    for (const t2 of [all, y]) {
      t2.sent++;
      if (sub.status === "accepted") t2.accepted++;
      if (sub.status === "declined") t2.declined++;
      t2.fees += sub.fee ?? 0;
    }
  }
  return { all, byYear };
}
function parseCsv(text2) {
  const src = text2.replace(/^\uFEFF/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const delim = (firstLine.match(/;/g) ?? []).length > (firstLine.match(/,/g) ?? []).length ? ";" : (firstLine.match(/\t/g) ?? []).length > (firstLine.match(/,/g) ?? []).length ? "	" : ",";
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"' && !cell) quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows.map((r) => r.map((x) => x.trim()));
}
var HEADERS = {
  name: ["name", "nombre", "contest", "concurso", "venue", "title", "titulo", "magazine", "revista"],
  deadline: ["deadline", "fecha_limite", "cierre", "closes", "closing", "due"],
  opens: ["opens", "open", "apertura", "opening", "opening_date"],
  recurs: ["recurs", "recurring", "anual", "repeats"],
  word_min: ["word_min", "min_words", "minimum_words", "palabras_minimas", "min"],
  word_max: ["word_max", "max_words", "maximum_words", "palabras_maximas", "max", "words"],
  languages: ["languages", "language", "idiomas", "idioma", "lang"],
  anonymous: ["anonymous", "anonimo", "blind"],
  fee: ["fee", "tarifa", "inscripcion", "entry_fee", "cuota"],
  prize: ["prize", "premio"],
  url: ["url", "web", "link", "website", "enlace", "sitio"],
  country: ["country", "pais"],
  theme: ["theme", "tema"],
  simultaneous: ["simultaneous", "simultaneas", "simultaneo", "simultaneous_submissions"],
  font: ["font", "fuente", "tipografia"],
  spacing: ["spacing", "interlineado", "line_spacing"],
  page_size: ["page_size", "page", "papel", "tamano_de_pagina", "paper"]
};
var headerKey = (h) => fold(h).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
function contestsFromCsv(text2) {
  const rows = parseCsv(text2);
  if (rows.length < 2) return { contests: [], skipped: 0, unknown: [] };
  const cols = rows[0].map((h) => {
    const k = headerKey(h);
    return Object.keys(HEADERS).find((p) => HEADERS[p].includes(k)) ?? null;
  });
  const unknown = rows[0].filter((_, i) => !cols[i] && rows[0][i]);
  const contests = [];
  let skipped = 0;
  for (const r of rows.slice(1)) {
    const props = {};
    cols.forEach((p, i) => {
      if (p && r[i]) props[p] = r[i];
    });
    if (!props.name) {
      skipped++;
      continue;
    }
    const out = { name: String(props.name) };
    const day = (k) => {
      const d = parseDay(props[k]);
      if (d) out[k] = d;
    };
    day("deadline");
    day("opens");
    const rec = str(props.recurs)?.toLowerCase();
    if (rec === "yearly" || rec === "anual" || rec === "yes" || rec === "true" || rec === "s\xED" || rec === "si") out.recurs = "yearly";
    for (const k of ["word_min", "word_max", "fee"]) {
      const n = parseNum(props[k]);
      if (n !== void 0) out[k] = n;
    }
    if (props.languages) out.languages = String(props.languages).split(/[,;/|]/).map(langCode).filter(Boolean);
    for (const k of ["anonymous", "simultaneous"]) {
      const b = parseBool(props[k]);
      if (b !== void 0) out[k] = b;
    }
    for (const k of ["prize", "url", "country", "theme"]) if (props[k]) out[k] = String(props[k]);
    const font = fontOf(props.font);
    if (font) out.font = font;
    const sp = spacingOf(props.spacing);
    if (sp) out.spacing = sp;
    const pg = (str(props.page_size) ?? "").toLowerCase();
    if (pg === "letter" || pg === "a4") out.page_size = pg;
    contests.push(out);
  }
  return { contests, skipped, unknown };
}
var PROP_ORDER = ["deadline", "opens", "recurs", "word_min", "word_max", "languages", "anonymous", "fee", "prize", "url", "country", "theme", "simultaneous", "font", "spacing", "page_size"];
function yamlValue(v) {
  if (Array.isArray(v)) return `[${v.map((x) => yamlValue(x)).join(", ")}]`;
  if (typeof v !== "string") return String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return /^[A-Za-z][\w .'/()-]*$/.test(v) && !/^(true|false|yes|no|null|on|off|y|n)$/i.test(v) && !/\s$/.test(v) ? v : JSON.stringify(v);
}
function contestNote(props, blank = false) {
  const lines = ["---", "type: contest"];
  for (const k of PROP_ORDER) {
    const v = props[k];
    if (v === void 0 || v === "") {
      if (blank) lines.push(`${k}:`);
      continue;
    }
    lines.push(`${k}: ${yamlValue(v)}`);
  }
  lines.push("---", "", "## Rules", "", "", "## Notes", "");
  return lines.join("\n");
}
var contestFileName = (name) => name.replace(/[\\/:*?"<>|#^[\]]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || "Contest";
var icsEscape = (s) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
function fold75(line) {
  const out = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}
function buildIcs(contests, nowIso, today) {
  const stamp = nowIso.replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Authors Toolbox//Contests//EN", "CALSCALE:GREGORIAN"];
  for (const c of contests) {
    for (const [kind, day] of [["deadline", c.deadline], ["opens", c.opens]]) {
      if (!day || day < today) continue;
      const compact = (d) => d.replace(/-/g, "");
      lines.push(
        "BEGIN:VEVENT",
        `UID:${hash(c.path)}-${kind}-${compact(day)}@authors-toolbox`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${compact(day)}`,
        `DTEND;VALUE=DATE:${compact(addDays2(day, 1))}`,
        `SUMMARY:${icsEscape(kind === "deadline" ? `Deadline: ${c.name}` : `Entries open: ${c.name}`)}`
      );
      if (c.url) lines.push(`URL:${c.url}`);
      if (kind === "deadline") lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEscape(`Deadline in a week: ${c.name}`)}`, "TRIGGER:-P7D", "END:VALARM");
      lines.push("END:VEVENT");
    }
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold75).join("\r\n") + "\r\n";
}
function submissionsCsv(entries) {
  const q = (v) => {
    const s = v === void 0 ? "" : typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ["story", "venue", "status", "sent", "decided", "fee", "notes"];
  const rows = entries.map((e) => [e.title, e.sub.venue, e.sub.status, e.sub.sent, e.sub.decided, e.sub.fee, e.sub.notes].map(q).join(","));
  return [head.join(","), ...rows].join("\n") + "\n";
}

// src/revision/panel.ts
var fmt3 = (n) => Math.round(n).toLocaleString();
function renderRevise(el, plugin, st) {
  const rev = plugin.revision;
  const path = st.file.path;
  const df = rev.cached(path);
  if (!df) {
    el.createDiv({ cls: "at-empty", text: "Loading drafts\u2026" });
    return;
  }
  const drafts = df.drafts;
  const last = drafts[drafts.length - 1];
  const btns = el.createDiv({ cls: "at-rev-btns" });
  const save = btns.createEl("button", { cls: "mod-cta", text: "Save draft" });
  save.onclick = () => {
    void rev.saveDraft(rev.file(path));
  };
  const open = btns.createEl("button", { text: "Compare\u2026" });
  open.onclick = () => {
    void rev.open(rev.file(path));
  };
  if (!last) {
    open.disabled = true;
    el.createDiv({ cls: "at-hint", text: "Save a draft before you start revising. Afterwards this tab shows what changed since: words added and cut, and rewritten paragraphs. The full comparison, chapter by chapter and with the style, opens with Compare." });
    return;
  }
  const base = [...drafts].reverse().find((d) => d.text !== st.text);
  const box = el.createDiv({ cls: "at-rev-since" });
  if (!base) {
    box.createDiv({ cls: "at-label", text: `Since \u201C${last.name}\u201D` });
    box.createDiv({ cls: "at-hint", text: "No changes since this draft." });
  } else {
    const cmp = rev.compareWith(base, st.text);
    const s = cmp.stats;
    box.createDiv({ cls: "at-label", text: `Since \u201C${base.name}\u201D \xB7 ${draftWhen(base)}` });
    const row = box.createDiv({ cls: "at-rev-since-row" });
    row.createSpan({ cls: "is-add", text: "+" + fmt3(s.added) });
    row.createSpan({ cls: "is-cut", text: "\u2212" + fmt3(s.removed) });
    row.createSpan({ text: `${fmt3(s.before)} \u2192 ${fmt3(s.after)} words` });
    const p = s.paras;
    box.createDiv({ cls: "at-hint", text: `Paragraphs: ${p.changed} rewritten \xB7 ${p.added} new \xB7 ${p.removed} cut \xB7 ${p.moved} moved` });
  }
  const out = plugin.submissions?.latestFor(path);
  if (out) {
    const sent = out.draftId ? drafts.find((d) => d.id === out.draftId) : void 0;
    const box2 = el.createDiv({ cls: "at-rev-since" });
    box2.createDiv({ cls: "at-label", text: `Latest submission: ${out.venue}` });
    box2.createDiv({ cls: "at-hint", text: `${STATUS_LABEL[out.status]}${out.sent ? ` \xB7 ${out.sent}` : ""}` });
    if (sent) {
      const cmp = box2.createEl("button", { text: "Compare with the version sent" });
      cmp.onclick = () => {
        void rev.open(rev.file(path), { base: sent.id, target: "current" });
      };
    }
  }
  const g = df.goal;
  const from = g ? drafts.find((d) => d.id === g.from) : void 0;
  if (g && from) {
    const now = rev.compareWith(from, st.text).stats.after;
    const pr = goalProgress(g, from.words, now);
    const goal = el.createDiv({ cls: "at-goal" });
    goal.createDiv({ cls: "at-bar" }).createDiv({ cls: "at-bar-fill" + (pr.done >= 1 ? " is-done" : "") }).setCssProps({ "--at-pct": Math.round(pr.done * 100) + "%" });
    const r = goal.createDiv({ cls: "at-goal-row" });
    r.createSpan({ text: `${pr.label} \xB7 ${Math.round(pr.done * 100)}%` });
  } else {
    const b = el.createEl("button", { cls: "at-link", text: "Set a revision goal\u2026" });
    b.onclick = () => rev.setGoal(path);
  }
  const marks = rev.marksBase(path);
  const tg = el.createDiv({ cls: "at-rev-marks" });
  const t2 = tg.createEl("button", { text: marks ? `Hide changes in the editor` : "Show changes in the editor" });
  t2.onclick = () => {
    void rev.toggleMarks(path);
  };
  if (marks) tg.createDiv({ cls: "at-hint", text: `Margin marks: new, rewritten and cut lines since \u201C${marks}\u201D.` });
  const sec = el.createDiv({ cls: "at-section" });
  sec.createDiv({ cls: "at-label", text: `Drafts (${drafts.length})` });
  for (const d of [...drafts].reverse().slice(0, 6)) {
    const row = sec.createDiv({ cls: "at-rev-mini" + (d.auto ? " is-auto" : "") });
    row.createSpan({ cls: "at-rev-mini-name", text: (d.auto ? "\u25E6 " : "") + d.name });
    row.createSpan({ cls: "at-rev-mini-meta", text: `${draftWhen(d)} \xB7 ${fmt3(d.words)}` });
    row.onclick = () => {
      void rev.open(rev.file(path), { base: d.id, target: "current" });
    };
  }
}

// src/screenplay/panel.ts
var import_obsidian15 = require("obsidian");
function renderScriptStats(view, el, st) {
  const sp = st.script, P = view.plugin;
  const hero = el.createDiv({ cls: "at-hero" });
  hero.createDiv({ cls: "at-hero-num", text: "\u2248 " + (sp.pages < 10 ? sp.pages.toFixed(1) : Math.round(sp.pages)) });
  const mins = Math.max(1, Math.round(sp.minutes));
  const kind = mins <= 40 ? "Short film" : mins < 70 ? "Medium-length film" : "Feature film";
  hero.createDiv({ cls: "at-hero-sub", text: `pages \xB7 \u2248 ${mins} min on screen \xB7 ${kind}` });
  const rawFmt = st.fm && st.fm.format;
  const fmt6 = typeof rawFmt === "string" || typeof rawFmt === "number" ? String(rawFmt).toLowerCase() : "";
  const ranges = { short: [5, 30], corto: [5, 30], feature: [90, 120], largo: [90, 120], pilot: [30, 60], piloto: [30, 60], tv: [30, 60] };
  if (ranges[fmt6]) {
    const [lo, hi] = ranges[fmt6];
    const g = el.createDiv({ cls: "at-goal" });
    const bar = g.createDiv({ cls: "at-bar" });
    bar.createDiv({ cls: "at-bar-fill" }).setCssProps({ "--at-pct": Math.min(100, sp.pages / hi * 100) + "%" });
    g.createDiv({ cls: "at-goal-row" }).createSpan({ text: `Typical ${fmt6}: ${lo}\u2013${hi} pages` });
  }
  el.createDiv({ cls: "at-hint", text: "One page of screenplay \u2248 one minute of screen time (Courier 12 pt, standard margins)." });
  if (st.selection && st.selection.words > 0) {
    const box = el.createDiv({ cls: "at-selection" });
    box.createDiv({ cls: "at-label", text: "Selection" });
    box.createDiv({ text: `${fmtN(st.selection.words)} words` });
  }
  const grid = el.createDiv({ cls: "at-grid" });
  const tile = (label, value, hint) => {
    const d = grid.createDiv({ cls: "at-tile" });
    d.createDiv({ cls: "at-tile-v", text: value });
    d.createDiv({ cls: "at-tile-l", text: label });
    if (hint) d.setAttr("title", hint);
  };
  const totalW = sp.dialogueWords + sp.actionWords;
  tile("Scenes", fmtN(sp.scenes.length));
  tile("Speaking characters", fmtN(sp.characters.length));
  tile("Locations", fmtN(sp.locations.length));
  tile("Avg. scene", sp.scenes.length ? fmtEighths(Math.round(sp.scenes.reduce((t2, s) => t2 + s.eighths, 0) / sp.scenes.length)) + " pg" : "\u2014", "Scene length in eighths of a page, as on a production board");
  tile("Dialogue", totalW ? Math.round(sp.dialogueWords / totalW * 100) + "%" : "\u2014", "Share of words spoken vs. action lines");
  tile("Words", fmtN(totalW));
  tile("INT / EXT", `${sp.ie.INT} / ${sp.ie.EXT}${sp.ie["INT/EXT"] ? " / " + sp.ie["INT/EXT"] : ""}`);
  tile("Format notes", fmtN(sp.notes.length), "See the Notes tab");
  const times = Object.entries(sp.times).sort((a, b) => b[1] - a[1]);
  if (times.length) {
    const s = el.createDiv({ cls: "at-section" });
    s.createDiv({ cls: "at-label", text: "Time of day" });
    const box = s.createDiv({ cls: "at-chips" });
    for (const [t2, n] of times) {
      const c = box.createEl("button", { cls: "at-chip" });
      c.createSpan({ text: t2 });
      c.createSpan({ cls: "at-chip-n", text: "\xD7" + n });
      c.onclick = () => view.cycleFind("time:" + t2, sp.scenes.filter((x) => x.time === t2).map((x) => P.lineRange(x.line)));
    }
  }
  if (sp.scenes.length > 1) {
    const s = el.createDiv({ cls: "at-section" });
    s.createDiv({ cls: "at-label", text: "Scene lengths" });
    s.createDiv({ cls: "at-hint", text: "Each bar is a scene, in order. Tap one to go there." });
    const chart = s.createDiv({ cls: "at-rhythm" });
    const max = Math.max(...sp.scenes.map((x) => x.eighths));
    sp.scenes.slice(0, 150).forEach((x) => {
      const b = chart.createDiv({ cls: "at-rbar" + (x.eighths > 24 ? " is-long" : "") });
      b.setCssProps({ "--at-h": Math.max(5, x.eighths / max * 100) + "%" });
      b.setAttr("title", `${x.heading} \u2014 ${fmtEighths(x.eighths)} pg`);
      b.onclick = () => P.jumpToLine(x.line);
    });
  }
  const ref = el.createEl("details", { cls: "at-section at-ref" });
  ref.createEl("summary", { text: "Format quick reference" });
  const rows = [
    ["Scene heading", "INT. CAF\xC9 - NIGHT   (or start a line with .)"],
    ["Action", "Plain paragraph, present tense"],
    ["Character", "NAME in caps, dialogue on the next line"],
    ["Extension", "ANA (V.O.) \xB7 (O.S.) \xB7 (CONT'D)"],
    ["Parenthetical", "(beat) on its own line under the name"],
    ["Transition", "CUT TO:   or   > any text"],
    ["Centered", "> THE END <"],
    ["Force action", "!Line in caps that isn't a name"],
    ["Force character", "@McCLANE"],
    ["Dual dialogue", "Add ^ after the second name"],
    ["Act / sequence", "# Act One  (not printed in Fountain)"],
    ["Page break", "==="],
    ["Notes", "%% invisible note %%"],
    ["Enter key", "After a name: new dialogue line. After dialogue: new element."]
  ];
  const tbl = ref.createDiv({ cls: "at-ref-grid" });
  for (const [a, b] of rows) {
    tbl.createDiv({ cls: "at-ref-k", text: a });
    tbl.createDiv({ cls: "at-ref-v", text: b });
  }
}
function renderScenes(view, el, st) {
  const o = st.sOutline, sp = st.script, P = view.plugin;
  const byLine = new Map(sp.scenes.map((s, i) => [s.line, { s, i }]));
  const rows = [];
  const walk = (n, depth) => {
    if (n.id) rows.push({ node: n, kind: "act", depth, siblings: [], idx: -1, parentId: n.id });
    n.scenes.forEach((s, i) => rows.push({ node: s, kind: "c", depth: depth + (n.id ? 1 : 0), siblings: n.scenes, idx: i, parentId: n.id }));
    n.children.forEach((c) => walk(c, depth + (n.id ? 1 : 0)));
  };
  walk(o.root, 0);
  if (!sp.scenes.length) {
    el.createDiv({ cls: "at-empty", text: "No scenes yet. Start a scene with a heading like INT. KITCHEN - NIGHT on its own line (blank line before and after)." });
    return;
  }
  el.createDiv({ cls: "at-hint", text: "Scenes numbered in order, with length in eighths of a page. Drag \u283F or use \u22EF to reorder scenes within an act (# headings)." });
  const list = el.createDiv({ cls: "at-outline" });
  view.listEl = list;
  const groups = /* @__PURE__ */ new Map();
  for (const r of rows) {
    const n = r.node;
    const row = list.createDiv({ cls: "at-orow " + (r.kind === "act" ? "at-orow-h" : "at-orow-sc") });
    row.setCssProps({ "--at-indent": 6 + r.depth * 14 + "px" });
    if (st.cursorLine != null && st.cursorLine >= n.start && st.cursorLine < n.end && r.kind === "c") row.addClass("is-here");
    const grip = row.createDiv({ cls: "at-grip" });
    if (r.kind === "c" && r.siblings.length > 1) {
      (0, import_obsidian15.setIcon)(grip, "grip-vertical");
      const key = r.parentId + "|c";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
      grip.addEventListener("pointerdown", (e) => view.startDrag(e, row, key, groups, r));
    } else grip.addClass("is-off");
    const t2 = row.createDiv({ cls: "at-otitle" });
    const info = byLine.get(n.start);
    if (r.kind === "c" && info) t2.createSpan({ cls: "at-scnum", text: String(info.i + 1) });
    t2.createSpan({ text: n.title });
    t2.onclick = () => P.jumpToLine(n.start);
    row.createDiv({ cls: "at-owords", text: r.kind === "c" && info ? fmtEighths(info.s.eighths) : "" });
    if (r.kind === "c") {
      const more = row.createDiv({ cls: "at-omore" });
      (0, import_obsidian15.setIcon)(more, "more-horizontal");
      more.onclick = (e) => {
        const m = new import_obsidian15.Menu();
        const mv = (to) => P.moveSection(r.parentId, "c", r.idx, to);
        if (r.idx > 0) m.addItem((i) => i.setTitle("Move up").setIcon("arrow-up").onClick(() => mv(r.idx - 1)));
        if (r.idx < r.siblings.length - 1) m.addItem((i) => i.setTitle("Move down").setIcon("arrow-down").onClick(() => mv(r.idx + 1)));
        if (r.idx > 1) m.addItem((i) => i.setTitle("Move to top").setIcon("chevrons-up").onClick(() => mv(0)));
        if (r.idx < r.siblings.length - 2) m.addItem((i) => i.setTitle("Move to bottom").setIcon("chevrons-down").onClick(() => mv(r.siblings.length - 1)));
        m.addItem((i) => i.setTitle("Select scene").setIcon("text-cursor").onClick(() => P.selectLines(n.start, n.end)));
        m.showAtMouseEvent(e);
      };
      if (info && info.s.cast.size) row.setAttr("title", "Cast: " + [...info.s.cast].join(", "));
    }
  }
}
function renderCast(view, el, st) {
  const sp = st.script, P = view.plugin;
  const sec = el.createDiv({ cls: "at-section" });
  sec.createDiv({ cls: "at-label", text: `Characters \u2014 ${sp.characters.length}` });
  sec.createDiv({ cls: "at-hint", text: "Speeches \xB7 words spoken \xB7 scenes. Tap a name to step through their lines." });
  if (!sp.characters.length) sec.createDiv({ cls: "at-hint", text: "No dialogue yet." });
  const maxW = Math.max(1, ...sp.characters.map((c) => c.words));
  for (const c of sp.characters) {
    const it = sec.createDiv({ cls: "at-cast" });
    const top = it.createDiv({ cls: "at-cast-top" });
    top.createSpan({ cls: "at-cast-name", text: c.name });
    top.createSpan({ cls: "at-cast-n", text: `${c.speeches} \xB7 ${fmtN(c.words)} w \xB7 ${c.scenes.size} sc` });
    it.createDiv({ cls: "at-bar" }).createDiv({ cls: "at-bar-fill" }).setCssProps({ "--at-pct": c.words / maxW * 100 + "%" });
    it.onclick = () => view.cycleFind("cast:" + c.name, sp.types.map((x, n) => x && x.t === "character" && cueName(sp.lines[n]) === c.name ? n : -1).filter((n) => n >= 0).map((n) => P.lineRange(n)));
  }
  const ls = el.createDiv({ cls: "at-section" });
  ls.createDiv({ cls: "at-label", text: `Locations \u2014 ${sp.locations.length}` });
  for (const l of sp.locations) {
    const it = ls.createDiv({ cls: "at-item" });
    it.createSpan({ cls: "at-item-n", text: "\xD7" + l.scenes });
    it.createSpan({ text: `${[...l.ie].join("/")} ${l.name}${l.times.size ? " \u2014 " + [...l.times].join(", ") : ""}` });
    it.onclick = () => view.cycleFind("loc:" + l.name, sp.scenes.filter((s) => s.location === l.name).map((s) => P.lineRange(s.line)));
  }
}
function renderNotes(view, el, st) {
  const sp = st.script, P = view.plugin;
  el.createDiv({ cls: "at-hint", text: "Screenwriting conventions worth checking \u2014 guidance, not rules. Tap one to go to the line." });
  if (!sp.notes.length) {
    el.createDiv({ cls: "at-ok", text: "Nothing to flag. \u2713" });
    return;
  }
  const LBL = { dense: "Dense action", speech: "Long speech", heading: "Scene heading", camera: "Camera direction", unfilmable: "Not filmable", intro: "Character introduction", paren: "Parenthetical" };
  const counts = {};
  sp.notes.forEach((n) => counts[n.kind] = (counts[n.kind] || 0) + 1);
  const filt = view.noteFilter || null;
  const chips = el.createDiv({ cls: "at-chips" });
  for (const [k, n] of Object.entries(counts)) {
    const c = chips.createEl("button", { cls: "at-chip" + (filt === k ? " is-active" : "") });
    c.createSpan({ text: LBL[k] || k });
    c.createSpan({ cls: "at-chip-n", text: String(n) });
    c.onclick = () => {
      view.noteFilter = filt === k ? null : k;
      view.render();
    };
  }
  const list = el.createDiv({ cls: "at-issues" });
  for (const n of sp.notes.filter((x) => !filt || x.kind === filt).slice(0, 120)) {
    const card = list.createDiv({ cls: "at-issue-card at-kind-style" });
    const top = card.createDiv({ cls: "at-ic-top" });
    top.createSpan({ cls: "at-dot" });
    top.createSpan({ cls: "at-ic-kind", text: LBL[n.kind] || n.kind });
    card.createDiv({ cls: "at-ic-msg", text: n.msg });
    card.createDiv({ cls: "at-ic-ctx", text: (sp.lines[n.line] || "").trim().slice(0, 90) });
    card.onclick = () => P.showRanges([P.lineRange(n.line)], 0);
  }
}

// src/view/writing-view.ts
var WritingView = class extends import_obsidian16.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.dragging = false;
    this.kindFilter = null;
    this.noteFilter = null;
    this.plugin = plugin;
    this.cycle = {};
  }
  getViewType() {
    return VIEW_WRITING;
  }
  getDisplayText() {
    return "Writing";
  }
  getIcon() {
    return "pen-line";
  }
  async onOpen() {
    this.contentEl.addClass("at-wp");
    this.render();
  }
  async onClose() {
    this.contentEl.empty();
  }
  render() {
    if (this.dragging) return;
    const el = this.contentEl;
    const scroll = el.scrollTop;
    el.empty();
    const st = this.plugin.state;
    const head = el.createDiv({ cls: "at-wp-head" });
    if (!st || !st.file) {
      head.createDiv({ cls: "at-wp-title", text: "Writing" });
      el.createDiv({ cls: "at-empty", text: "Open a note to see its statistics, outline and style insights." });
      return;
    }
    const titleRow = head.createDiv({ cls: "at-wp-titlerow" });
    titleRow.createDiv({ cls: "at-wp-title", text: st.file.basename });
    const sel = titleRow.createEl("select", { cls: "dropdown at-lang", attr: { "aria-label": "Language of this note" } });
    for (const [k, v] of Object.entries(LANGS)) {
      const label = k === "auto" ? `Auto (${st.analysis.lang === "es" ? "Espa\xF1ol" : "English"})` : v;
      sel.createEl("option", { value: k, text: label });
    }
    sel.value = st.langSource === "note" ? st.langCode : "auto";
    sel.onchange = () => {
      void this.plugin.setNoteLang(sel.value);
    };
    const tabs = head.createDiv({ cls: "at-tabs" });
    const isSp = !!st.script;
    const T = isSp ? [["sp-stats", "clapperboard", t("tab.script")], ["sp-scenes", "list-video", t("tab.scenes")], ["sp-cast", "users", t("tab.cast")], ["sp-notes", "lightbulb", t("tab.notes")], ["check", "spell-check", t("tab.check")], ["revise", "git-compare", t("tab.revise")]] : st.poem ? [["poem", "feather", t("tab.poem")], ["overview", "bar-chart-2", t("tab.stats")], ["style", "sparkles", t("tab.style")], ["check", "spell-check", t("tab.check")], ["revise", "git-compare", t("tab.revise")]] : [["overview", "bar-chart-2", t("tab.stats")], ["outline", "list-tree", t("tab.outline")], ["style", "sparkles", t("tab.style")], ["check", "spell-check", t("tab.check")], ["revise", "git-compare", t("tab.revise")]];
    const tabKey = isSp ? "panelTabScript" : "panelTab";
    let cur = String(this.plugin.prefs[tabKey] || "");
    if (!T.some((x) => x[0] === cur)) cur = T[0][0];
    for (const [id, icon, label] of T) {
      const b = tabs.createEl("button", { cls: "at-tab" + (cur === id ? " is-active" : ""), attr: { "aria-label": label } });
      (0, import_obsidian16.setIcon)(b.createSpan({ cls: "at-tab-icon" }), icon);
      b.createSpan({ text: label, cls: "at-tab-label" });
      if (id === "check" && this.plugin.check && this.plugin.check.path === st.file.path && this.plugin.check.issues.size)
        b.createSpan({ cls: "at-badge", text: String(this.plugin.check.issues.size) });
      b.onclick = () => {
        this.plugin.prefs[tabKey] = id;
        this.plugin.saveSettingsSoon();
        this.render();
      };
    }
    const sp = this.plugin.sprint;
    if (sp) {
      const bar = el.createDiv({ cls: "at-sprint-live" });
      bar.createSpan({ cls: "at-sprint-clock", text: "" });
      bar.createSpan({ text: " left \xB7 " });
      bar.createSpan({ cls: "at-sprint-words", text: "" });
      bar.createSpan({ text: " words" });
      const stop = bar.createEl("button", { cls: "at-link", text: "Stop" });
      stop.onclick = () => this.plugin.finishSprint(true);
    }
    const body = el.createDiv({ cls: "at-wp-body" });
    try {
      const spSt = st.script && st.sOutline ? { ...st, script: st.script, sOutline: st.sOutline } : null;
      if (spSt && cur === "sp-stats") renderScriptStats(this, body, spSt);
      else if (spSt && cur === "sp-scenes") renderScenes(this, body, spSt);
      else if (spSt && cur === "sp-cast") renderCast(this, body, spSt);
      else if (spSt && cur === "sp-notes") renderNotes(this, body, spSt);
      else if (st.poem && cur === "poem") renderPoem(body, st.poem, this.plugin);
      else if (cur === "revise") renderRevise(body, this.plugin, st);
      else if (cur === "outline") this.renderOutline(body, st);
      else if (cur === "style") this.renderStyle(body, st);
      else if (cur === "check") this.renderCheck(body, st);
      else this.renderOverview(body, st);
    } catch (e) {
      console.error("Authors Toolbox:", e);
      const msg = e instanceof Error ? e.message : String(e);
      body.createDiv({ cls: "at-empty", text: "Something went wrong rendering this tab: " + msg });
    }
    el.scrollTop = scroll;
  }
  /* ---------- Stats ---------- */
  renderOverview(el, st) {
    const a = st.analysis, s = this.plugin.prefs;
    const hero = el.createDiv({ cls: "at-hero" });
    hero.createDiv({ cls: "at-hero-num", text: fmtN(a.words) });
    hero.createDiv({ cls: "at-hero-sub", text: "words \xB7 " + lengthCategory(a.words) });
    const goal = st.goal;
    const g = el.createDiv({ cls: "at-goal" });
    if (goal > 0) {
      const pct3 = Math.min(100, a.words / goal * 100);
      const bar = g.createDiv({ cls: "at-bar" });
      bar.createDiv({ cls: "at-bar-fill" }).setCssProps({ "--at-pct": pct3 + "%" });
      const row = g.createDiv({ cls: "at-goal-row" });
      row.createSpan({ text: `${fmtN(a.words)} / ${fmtN(goal)} words (${Math.round(pct3)}%)` });
      const edit = row.createEl("button", { cls: "at-link", text: "Edit goal" });
      edit.onclick = () => this.plugin.editGoal();
    } else {
      const b = g.createEl("button", { cls: "at-link", text: "Set a word goal for this note" });
      b.onclick = () => this.plugin.editGoal();
    }
    if (st.selection && st.selection.words > 0) {
      const box = el.createDiv({ cls: "at-selection" });
      box.createDiv({ cls: "at-label", text: "Selection" });
      box.createDiv({ text: `${fmtN(st.selection.words)} words \xB7 ${fmtN(st.selection.chars)} characters \xB7 ${st.selection.sentences} sentence${st.selection.sentences === 1 ? "" : "s"}` });
    }
    const today = this.plugin.todayWords(st.file.path);
    const hs = this.plugin.habitSummary();
    const t2 = el.createDiv({ cls: "at-today" });
    const sign = (n) => (n > 0 ? "+" : "") + fmtN(n);
    if (today.total !== 0 || today.note !== 0) t2.createDiv({ text: `Today: ${sign(today.total)} words in all notes \xB7 ${sign(today.note)} in this one` });
    if (hs.goal) {
      const pctDone = Math.min(100, Math.round(hs.today / hs.goal * 100));
      t2.createDiv({ cls: "at-bar" }).createDiv({ cls: "at-bar-fill" }).setCssProps({ "--at-pct": pctDone + "%" });
      t2.createDiv({ text: `Daily goal: ${fmtN(hs.today)} / ${fmtN(hs.goal)} (${pctDone}%)` });
    }
    const habits = t2.createDiv({ cls: "at-today-row" });
    if (hs.streak) habits.createSpan({ text: `\u{1F525} ${hs.streak}-day streak${hs.todayDone ? "" : " \xB7 write today to keep it"}` });
    const open = habits.createEl("button", { cls: "at-link", text: "Writing habits" });
    open.onclick = () => {
      void this.plugin.openHabits();
    };
    if (!this.plugin.sprint) {
      const spr = habits.createEl("button", { cls: "at-link", text: "Start a sprint" });
      spr.onclick = () => this.plugin.openSprint();
    }
    const grid = el.createDiv({ cls: "at-grid" });
    const tile = (label, value, hint) => {
      const d = grid.createDiv({ cls: "at-tile" });
      d.createDiv({ cls: "at-tile-v", text: value });
      d.createDiv({ cls: "at-tile-l", text: label });
      if (hint) d.setAttr("title", hint);
    };
    tile("Characters", fmtN(a.chars));
    tile("Without spaces", fmtN(a.charsNoSp));
    tile("Paragraphs", fmtN(a.paragraphs));
    tile("Sentences", fmtN(a.sentences));
    tile("Words / sentence", a.avgSentence.toFixed(1), "Average sentence length");
    tile("Words / paragraph", a.avgPara.toFixed(0));
    tile("Reading time", fmtMin(a.words, Number(s.readingWpm) || 230));
    tile("Read aloud", fmtMin(a.words, Number(s.speakingWpm) || 150));
    tile("Dialogue", Math.round(a.dialogue * 100) + "%", "Share of words inside quotes or after a dialogue dash (\u2014)");
    tile("Lexical variety", Math.round(a.variety * 100) + "%", "Moving-average type/token ratio (100-word window). Higher = richer vocabulary.");
    if (a.readability) {
      const r = a.readability;
      tile(
        r.name === "INFLESZ" ? "Readability (INFLESZ)" : "Readability (Flesch)",
        `${Math.round(r.score)} \xB7 ${r.label}`,
        r.grade != null ? `Flesch\u2013Kincaid grade ${r.grade.toFixed(1)}` : "Szigriszt-Pazos / INFLESZ scale for Spanish"
      );
      if (r.grade != null) tile("Grade level", r.grade.toFixed(1), "Flesch\u2013Kincaid");
    }
    if (a.lens.length > 2) {
      const sec = el.createDiv({ cls: "at-section" });
      sec.createDiv({ cls: "at-label", text: "Sentence rhythm" });
      sec.createDiv({ cls: "at-hint", text: `Each bar is a sentence, in order. Variety keeps prose alive \u2014 spread here: \xB1${a.sentenceSD.toFixed(1)} words.` });
      const chart = sec.createDiv({ cls: "at-rhythm" });
      const max = Math.max(...a.lens), N = 90;
      const step = Math.max(1, Math.ceil(a.lens.length / N));
      for (let i = 0; i < a.lens.length; i += step) {
        const slice = a.lens.slice(i, i + step);
        const v = slice.reduce((x, y) => x + y, 0) / slice.length;
        const b = chart.createDiv({ cls: "at-rbar" + (v > a.longThreshold ? " is-long" : "") });
        b.setCssProps({ "--at-h": Math.max(4, v / max * 100) + "%" });
        const sIdx = i;
        b.onclick = () => this.plugin.highlightSentences([a.S[sIdx]]);
      }
    }
    el.createDiv({ cls: "at-foot", text: "Headings, comments, callouts, code and front matter are not counted." });
  }
  /* ---------- Outline ---------- */
  renderOutline(el, st) {
    const o = st.outline, a = st.analysis;
    const wordsIn = (from, to) => a.paras.reduce((t2, p) => t2 + (p.fromLine >= from && p.fromLine < to ? p.words ?? 0 : 0), 0);
    const rows = [];
    const walk = (n, depth) => {
      if (n.id && n.parent) {
        rows.push({ node: n, kind: "h", depth, siblings: n.parent.children, idx: n.parent.children.indexOf(n), parentId: n.parent.id });
      }
      n.scenes.forEach((s, i) => rows.push({ node: s, kind: "s", depth: depth + (n.id ? 1 : 0), siblings: n.scenes, idx: i, parentId: n.id }));
      n.children.forEach((c) => walk(c, depth + (n.id ? 1 : 0)));
    };
    walk(o.root, 0);
    if (!rows.length) {
      el.createDiv({ cls: "at-empty", text: "Add headings (#, ##, ###) for chapters or scene breaks (a line with ---, * * * or #) to see your story's structure here and reorder it." });
      return;
    }
    el.createDiv({ cls: "at-hint", text: import_obsidian16.Platform.isMobile ? "Tap a section to jump to it. Drag \u283F or use \u22EF to move it." : "Click a section to jump to it. Drag \u283F or use \u22EF to move chapters and scenes." });
    const list = el.createDiv({ cls: "at-outline" });
    this.listEl = list;
    const cursorLine = st.cursorLine;
    const groups = /* @__PURE__ */ new Map();
    for (const r of rows) {
      const n = r.node;
      const row = list.createDiv({ cls: "at-orow at-orow-" + r.kind });
      row.setCssProps({ "--at-indent": 6 + r.depth * 14 + "px" });
      const end = n.end;
      if (cursorLine != null && cursorLine >= n.start && cursorLine < end) row.addClass("is-here");
      const key = r.parentId + "|" + r.kind;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
      const grip = row.createDiv({ cls: "at-grip", attr: { "aria-label": "Drag to reorder" } });
      if (r.siblings.length > 1) (0, import_obsidian16.setIcon)(grip, "grip-vertical");
      else grip.addClass("is-off");
      const t2 = row.createDiv({ cls: "at-otitle" });
      if (r.kind === "s") (0, import_obsidian16.setIcon)(t2.createSpan({ cls: "at-oicon" }), "asterisk");
      t2.createSpan({ text: n.title });
      row.createDiv({ cls: "at-owords", text: fmtN(wordsIn(n.start, end)) });
      const more = row.createDiv({ cls: "at-omore", attr: { "aria-label": "More" } });
      (0, import_obsidian16.setIcon)(more, "more-horizontal");
      const isScene = r.kind === "s";
      const hasBreak = isScene && "hasBreak" in n && n.hasBreak;
      t2.onclick = () => this.plugin.jumpToLine(hasBreak ? n.start + 1 : n.start);
      more.onclick = (e) => {
        const m = new import_obsidian16.Menu();
        const mv = (to) => this.plugin.moveSection(r.parentId, r.kind, r.idx, to);
        if (r.idx > 0) m.addItem((i) => i.setTitle("Move up").setIcon("arrow-up").onClick(() => mv(r.idx - 1)));
        if (r.idx < r.siblings.length - 1) m.addItem((i) => i.setTitle("Move down").setIcon("arrow-down").onClick(() => mv(r.idx + 1)));
        if (r.idx > 1) m.addItem((i) => i.setTitle("Move to top").setIcon("chevrons-up").onClick(() => mv(0)));
        if (r.idx < r.siblings.length - 2) m.addItem((i) => i.setTitle("Move to bottom").setIcon("chevrons-down").onClick(() => mv(r.siblings.length - 1)));
        m.addItem((i) => i.setTitle("Select text").setIcon("text-cursor").onClick(() => this.plugin.selectLines(hasBreak ? n.start + 1 : n.start, end)));
        m.showAtMouseEvent(e);
      };
      if (r.siblings.length > 1) grip.addEventListener("pointerdown", (e) => this.startDrag(e, row, key, groups, r));
    }
  }
  startDrag(e, row, key, groups, r) {
    e.preventDefault();
    const grip = e.currentTarget;
    if (grip) {
      try {
        grip.setPointerCapture(e.pointerId);
      } catch {
      }
    }
    const sibs = groups.get(key) || [];
    const listRect = this.listEl.getBoundingClientRect();
    const rects = sibs.map((x) => x.getBoundingClientRect());
    const startY = e.clientY;
    let target = r.idx;
    this.dragging = true;
    row.addClass("is-dragging");
    const ind = this.listEl.createDiv({ cls: "at-drop" });
    const move = (ev) => {
      const y = ev.clientY;
      row.setCssProps({ "--at-dy": y - startY + "px" });
      let t2 = 0;
      rects.forEach((rc, k) => {
        if (k !== r.idx && rc.top + rc.height / 2 < y) t2++;
      });
      target = t2;
      const others = rects.filter((_, k) => k !== r.idx);
      const top = t2 === 0 ? others[0]?.top ?? 0 : others[t2 - 1]?.bottom ?? 0;
      ind.setCssProps({ "--at-top": top - listRect.top - 1 + "px" });
      ind.toggleClass("is-visible", target !== r.idx);
    };
    const up = () => {
      if (grip) {
        grip.removeEventListener("pointermove", move);
        grip.removeEventListener("pointerup", up);
        grip.removeEventListener("pointercancel", up);
      }
      this.dragging = false;
      row.removeClass("is-dragging");
      row.setCssProps({ "--at-dy": "0px" });
      ind.remove();
      if (target !== r.idx) this.plugin.moveSection(r.parentId, r.kind, r.idx, target);
      else this.render();
    };
    if (grip) {
      grip.addEventListener("pointermove", move);
      grip.addEventListener("pointerup", up);
      grip.addEventListener("pointercancel", up);
    }
  }
  /* ---------- Style ---------- */
  renderStyle(el, st) {
    const a = st.analysis, P = this.plugin;
    if (a.words < 30) {
      el.createDiv({ cls: "at-empty", text: "Write a little more to get style insights." });
      return;
    }
    const per1k = (n) => (a.words ? n / a.words * 1e3 : 0).toFixed(1);
    const section = (title, hint) => {
      const s = el.createDiv({ cls: "at-section" });
      s.createDiv({ cls: "at-label", text: title });
      if (hint) s.createDiv({ cls: "at-hint", text: hint });
      return s;
    };
    const chips = (parent, items) => {
      const box = parent.createDiv({ cls: "at-chips" });
      for (const it of items) {
        const c = box.createEl("button", { cls: "at-chip" });
        c.createSpan({ text: it.label });
        if (it.count != null) c.createSpan({ cls: "at-chip-n", text: "\xD7" + it.count });
        c.onclick = () => this.cycleFind(it.key, it.ranges());
      }
      return box;
    };
    const wordRanges = (idxs) => () => idxs.map((i) => P.wordDocRange(a.W[i]));
    const hitRanges = (hits) => () => hits.map((h) => P.plainDocRange(a.paras[h.para], h.a, h.b));
    const ls = section(
      `Long sentences (over ${a.longThreshold} words) \u2014 ${a.longSentences.length}`,
      a.longSentences.length ? "Tap one to find it. Long sentences aren't wrong, but check they're intentional." : "None. \u{1F44D}"
    );
    for (const s of a.longSentences.slice(0, 8)) {
      const it = ls.createDiv({ cls: "at-item" });
      it.createSpan({ cls: "at-item-n", text: s.n + "w" });
      it.createSpan({ text: a.paras[s.para].plain.slice(s.a, s.a + 70).trim() + "\u2026" });
      it.onclick = () => P.highlightSentences([s]);
    }
    const ec = section(`Repeated words nearby`, `The same word again within ${String(P.prefs.echoWindow)} words. Tap to step through them.`);
    if (a.echoes.length) chips(ec, a.echoes.map((e) => ({ key: "echo:" + e.word, label: e.word, count: e.count + 1, ranges: wordRanges(e.idx) })));
    else ec.createDiv({ cls: "at-hint", text: "None found." });
    if (a.openers.length) {
      const op = section("Repeated sentence openers", "Three or more sentences in a row that start with the same word.");
      chips(op, a.openers.map((o, k) => ({
        key: "op:" + k,
        label: o.word,
        count: o.sents.length,
        ranges: () => o.sents.map((s) => {
          const p = a.paras[s.para];
          const m = /[\p{L}\p{N}]+/u.exec(p.plain.slice(s.a));
          const st0 = s.a + (m ? m.index : 0);
          return P.plainDocRange(p, st0, st0 + (m ? m[0].length : 1));
        })
      })));
    }
    const adv = section(`Adverbs (${a.lang === "es" ? "-mente" : "-ly"}) \u2014 ${a.adverbCount} \xB7 ${per1k(a.adverbCount)} per 1,000 words`);
    if (a.adverbs.length) chips(adv, a.adverbs.slice(0, 20).map((x) => ({ key: "adv:" + x.word, label: x.word, count: x.idx.length, ranges: wordRanges(x.idx) })));
    const cr = section("Crutch words", "Edit the list in Settings \u2192 Authors Toolbox.");
    if (a.crutch.length) chips(cr, a.crutch.map((x) => ({ key: "cr:" + x.word, label: x.word, count: x.hits.length, ranges: hitRanges(x.hits) })));
    else cr.createDiv({ cls: "at-hint", text: "None found." });
    if (a.top.length) {
      const tp = section("Most used words", "Excluding common words and names.");
      chips(tp, a.top.map(([w, n]) => ({ key: "top:" + w, label: w, count: n, ranges: () => a.W.filter((x) => x.lw === w).map((x) => P.wordDocRange(x)) })));
    }
    if (a.names.length) {
      const nm = section("Names & places", "Capitalised words, by mentions.");
      chips(nm, a.names.map((x) => ({ key: "nm:" + x.word, label: x.shown, count: x.count, ranges: () => a.W.filter((y) => y.lw === x.word).map((y) => P.wordDocRange(y)) })));
    }
    const lp = section("Longest paragraphs");
    for (const p of a.longestParas) {
      const it = lp.createDiv({ cls: "at-item" });
      it.createSpan({ cls: "at-item-n", text: p.n + "w" });
      const pp = a.paras[p.i], from = p.a ?? 0, to = p.b ?? pp.plain.length;
      it.createSpan({ text: pp.plain.slice(from, Math.min(to, from + 70)).trim() + "\u2026" });
      it.onclick = () => {
        P.showRanges([P.plainDocRange(pp, from, to)], 0);
      };
    }
  }
  cycleFind(key, ranges) {
    if (!ranges.length) return;
    const i = this.cycle[key] == null ? 0 : (this.cycle[key] + 1) % ranges.length;
    this.cycle = { [key]: i };
    this.plugin.showRanges(ranges, i);
  }
  /* ---------- Check ---------- */
  renderCheck(el, st) {
    const P = this.plugin, s = P.prefs;
    const ltLangKey = st.ltLang;
    const langName2 = st.ltLang === "auto" ? `Auto-detect (likely ${st.analysis.lang === "es" ? "Espa\xF1ol" : "English"})` : LANGS[ltLangKey] || st.ltLang;
    el.createDiv({ cls: "at-hint", text: `Spelling & grammar in ${langName2}${st.langSource === "note" ? " \u2014 set for this note" : ""}. Change it with the language menu above.` });
    if (!s.ltConsent) {
      const box = el.createDiv({ cls: "at-consent" });
      box.createDiv({ cls: "at-label", text: "Before the first check" });
      box.createEl("p", { text: "Obsidian has no grammar checker of its own, so Authors Toolbox uses LanguageTool. When you tap Check, the text in the chosen scope is sent to " + (s.ltServer || "languagetool.org") + " and the suggestions come back here. Nothing is sent automatically." });
      box.createEl("p", { cls: "at-hint", text: "The free service allows roughly 20,000 characters per request and 75,000 per minute, so long notes are checked in parts. A premium key or your own server can be set in the plugin settings." });
      const b = box.createEl("button", { cls: "mod-cta", text: "Allow and continue" });
      b.onclick = async () => {
        s.ltConsent = true;
        await P.saveSettings();
        this.render();
      };
      return;
    }
    const scopeRow = el.createDiv({ cls: "at-seg" });
    const hasSel = st.selection && st.selection.words > 0;
    const scopes = [["selection", "Selection"], ["section", "This section"], ["note", "Whole note"]];
    let scope = String(s.checkScope || "section");
    if (scope === "selection" && !hasSel) scope = "section";
    for (const [id, label] of scopes) {
      const b = scopeRow.createEl("button", { text: label, cls: scope === id ? "is-active" : "" });
      if (id === "selection" && !hasSel) {
        b.disabled = true;
        b.title = "Select some text first";
      }
      b.onclick = () => {
        s.checkScope = id;
        P.saveSettingsSoon();
        this.render();
      };
    }
    const actions = el.createDiv({ cls: "at-actions" });
    const run2 = actions.createEl("button", { cls: "mod-cta", text: P.checking ? "Checking\u2026" : "Check" });
    run2.disabled = !!P.checking;
    run2.onclick = () => {
      void P.runCheck(scope);
    };
    const chk = P.check && P.check.path === st.file.path ? P.check : null;
    if (chk && chk.issues.size) {
      const clr = actions.createEl("button", { text: "Clear underlines" });
      clr.onclick = () => P.clearCheck();
    }
    if (P.checkStatus) el.createDiv({ cls: "at-status", text: P.checkStatus });
    if (!chk) return;
    const issues = [...chk.issues.values()];
    if (!issues.length) {
      el.createDiv({ cls: "at-ok", text: `No issues found in ${chk.scopeLabel}. \u2713` });
      return;
    }
    const counts = {};
    issues.forEach((i) => counts[i.kind] = (counts[i.kind] || 0) + 1);
    const filt = this.kindFilter || null;
    const sum = el.createDiv({ cls: "at-chips" });
    for (const k of Object.keys(KIND_LABEL)) {
      if (!counts[k]) continue;
      const c = sum.createEl("button", { cls: `at-chip at-kind-${k}` + (filt === k ? " is-active" : "") });
      c.createSpan({ cls: "at-dot" });
      c.createSpan({ text: KIND_LABEL[k] });
      c.createSpan({ cls: "at-chip-n", text: String(counts[k]) });
      c.onclick = () => {
        this.kindFilter = filt === k ? null : k;
        this.render();
      };
    }
    const cm = P.cmOf(P.target);
    const doc = cm ? cm.state.doc : null;
    const list = el.createDiv({ cls: "at-issues" });
    for (const it of issues.filter((i) => !filt || i.kind === filt).slice(0, 150)) {
      const rg = cm ? issueRange(cm, it.id) : null;
      const card = list.createDiv({ cls: `at-issue-card at-kind-${it.kind}` });
      const top = card.createDiv({ cls: "at-ic-top" });
      top.createSpan({ cls: "at-ic-kind", text: it.short || KIND_LABEL[it.kind] || it.kind });
      card.createDiv({ cls: "at-ic-msg", text: it.message });
      if (rg && doc) {
        const ctx = card.createDiv({ cls: "at-ic-ctx" });
        const a = Math.max(0, rg.from - 45), b = Math.min(doc.length, rg.to + 45);
        ctx.createSpan({ text: (a > 0 ? "\u2026" : "") + doc.sliceString(a, rg.from).replace(/\s+/g, " ") });
        ctx.createSpan({ cls: "at-ic-err", text: doc.sliceString(rg.from, rg.to) });
        ctx.createSpan({ text: doc.sliceString(rg.to, b).replace(/\s+/g, " ") + (b < doc.length ? "\u2026" : "") });
        ctx.onclick = () => P.showRanges([rg], 0, true);
      }
      const btns = card.createDiv({ cls: "at-ic-btns" });
      for (const rep of it.replacements.slice(0, 5)) {
        const b = btns.createEl("button", { cls: "at-fix", text: rep === "" ? "(delete)" : rep });
        b.onclick = () => P.applyFix(it.id, rep);
      }
      const ig = btns.createEl("button", { cls: "at-ghost", text: "Ignore" });
      ig.onclick = () => P.ignoreIssue(it.id);
      if (it.kind === "spelling") {
        const ad = btns.createEl("button", { cls: "at-ghost", text: "Add to dictionary" });
        ad.onclick = () => {
          void P.addToDictionary(it.id);
        };
      }
    }
    if (issues.length > 150) list.createDiv({ cls: "at-hint", text: `Showing 150 of ${issues.length}. Fix or ignore some to see more.` });
  }
};

// src/revision/controller.ts
var import_obsidian18 = require("obsidian");

// src/export/zip.ts
var CRC_TABLE = (() => {
  const t2 = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    t2[n] = c >>> 0;
  }
  return t2;
})();
function crc32(data) {
  let c = 4294967295;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 255] ^ c >>> 8;
  return (c ^ 4294967295) >>> 0;
}
function zip(entries) {
  const enc = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  const dosTime = 0, dosDate = 0 << 9 | 1 << 5 | 1;
  for (const e of entries) {
    const name = enc.encode(e.name);
    const crc = crc32(e.data), size = e.data.length;
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 67324752, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 2048, true);
    local.setUint16(8, 0, true);
    local.setUint16(10, dosTime, true);
    local.setUint16(12, dosDate, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, size, true);
    local.setUint32(22, size, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);
    parts.push(new Uint8Array(local.buffer), name, e.data);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 33639248, true);
    cen.setUint16(4, 20, true);
    cen.setUint16(6, 20, true);
    cen.setUint16(8, 2048, true);
    cen.setUint16(10, 0, true);
    cen.setUint16(12, dosTime, true);
    cen.setUint16(14, dosDate, true);
    cen.setUint32(16, crc, true);
    cen.setUint32(20, size, true);
    cen.setUint32(24, size, true);
    cen.setUint16(28, name.length, true);
    cen.setUint32(42, offset, true);
    central.push(new Uint8Array(cen.buffer), name);
    offset += 30 + name.length + size;
  }
  const cenSize = central.reduce((t2, p2) => t2 + p2.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 101010256, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, cenSize, true);
  end.setUint32(16, offset, true);
  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((t2, p2) => t2 + p2.length, 0));
  let p = 0;
  for (const a of all) {
    out.set(a, p);
    p += a.length;
  }
  return out;
}

// src/export/manuscript.ts
var breakText = (o) => o.sceneBreak === "blank" ? "" : o.sceneBreak;
var justifies = (o) => o.layout === "contest" || o.keepJustify;
function labels(lang) {
  return lang === "es" ? { by: "por", words: "palabras", about: "aprox.", pseudonym: "Seud\xF3nimo", end: "FIN" } : { by: "by", words: "words", about: "about", pseudonym: "Pseudonym", end: "END" };
}
function roundedWords(n) {
  if (n < 100) return Math.max(10, Math.round(n / 10) * 10);
  if (n < 1e3) return Math.round(n / 10) * 10;
  return Math.round(n / 100) * 100;
}
var ESC = "\uE000";
var LINK_OPEN = "\uE010";
var LINK_MID = "\uE011";
var LINK_CLOSE = "\uE012";
function cleanInline(s, links) {
  const link = (text2, url) => {
    if (!links) return text2;
    links.push(url);
    return LINK_OPEN + String(links.length - 1) + LINK_MID + text2 + LINK_CLOSE;
  };
  return s.replace(/\\([*_~=[\]#`\\|>-])/g, (_m, c) => ESC + c.charCodeAt(0).toString(16) + ";").replace(/%%[\s\S]*?%%/g, "").replace(/!\[\[[^\]]*\]\]/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[\[([^\]|#]*)(#[^\]|]*)?\|([^\]]*)\]\]/g, "$3").replace(/\[\[([^\]|#]*)(#[^\]]*)?\]\]/g, "$1").replace(/\[\^[^\]]*\]/g, "").replace(/\[([^\]]*)\]\(\s*<?([^)\s>]*)>?(?:\s+"[^"]*")?\s*\)/g, (_m, t2, u) => link(t2, u)).replace(/<((?:https?:\/\/|mailto:)[^>\s]+)>/g, (_m, u) => link(u.replace(/^mailto:/, ""), u)).replace(/`([^`]*)`/g, "$1").replace(/<\/?[a-zA-Z][^>]*>/g, "").replace(/==([^=]+)==/g, "$1").replace(/~~([^~]+)~~/g, "$1").replace(/\s\^[\w-]+\s*$/, "").replace(/[ \t]+/g, " ");
}
function unescape(s) {
  return s.replace(new RegExp(ESC + "([0-9a-f]+);", "g"), (_m, h) => String.fromCharCode(parseInt(h, 16)));
}
var EMPH = /(\*\*\*|___)(?=\S)([\s\S]*?\S)\1|(\*\*|__)(?=\S)([\s\S]*?\S)\3|(\*|_)(?=\S)([\s\S]*?\S)\5/;
function parseInline(s, b = false, i = false) {
  const out = [];
  let rest = s;
  while (rest) {
    const m = EMPH.exec(rest);
    if (!m) {
      out.push({ text: rest, b, i });
      break;
    }
    const marker = m[1] || m[3] || m[5];
    const before = rest.slice(0, m.index), after = rest.slice(m.index + m[0].length);
    if (marker.startsWith("_") && (/\p{L}$/u.test(before) || /^\p{L}/u.test(after))) {
      out.push({ text: rest.slice(0, m.index + marker.length), b, i });
      rest = rest.slice(m.index + marker.length);
      continue;
    }
    if (before) out.push({ text: before, b, i });
    if (m[1]) out.push(...parseInline(m[2], true, true));
    else if (m[3]) out.push(...parseInline(m[4], true, i));
    else out.push(...parseInline(m[6], b, true));
    rest = after;
  }
  return mergeRuns(out.map((r) => ({ ...r, text: unescape(r.text) })).filter((r) => r.text));
}
function mergeRuns(runs3) {
  const out = [];
  for (const r of runs3) {
    const last = out[out.length - 1];
    if (last && !!last.b === !!r.b && !!last.i === !!r.i && last.href === r.href) last.text += r.text;
    else out.push({ text: r.text, ...r.b ? { b: true } : {}, ...r.i ? { i: true } : {}, ...r.href ? { href: r.href } : {} });
  }
  return out;
}
var LINK_MARK = new RegExp(`${LINK_OPEN}(\\d+)${LINK_MID}|${LINK_CLOSE}`, "g");
function linkRuns(runs3, links) {
  const out = [];
  let href;
  const push = (r, text2) => {
    if (text2) out.push({ ...r, text: text2, ...href ? { href } : {} });
  };
  for (const r of runs3) {
    let last = 0;
    for (const m of r.text.matchAll(LINK_MARK)) {
      push(r, r.text.slice(last, m.index));
      href = m[1] !== void 0 ? links[Number(m[1])] || void 0 : void 0;
      last = m.index + m[0].length;
    }
    push(r, r.text.slice(last));
  }
  return mergeRuns(out);
}
var runsText = (runs3) => runs3.map((r) => r.text).join("");
function titleLines(ms, o) {
  const name = norm(o.author);
  const mentionsAuthor = !!ms.subtitle && !!name && norm(runsText(ms.subtitle)).includes(name);
  if (o.layout === "contest") return { subtitle: mentionsAuthor ? null : ms.subtitle, byline: null };
  return { subtitle: ms.subtitle, byline: o.author.trim() && !mentionsAuthor ? `${labels(o.lang).by} ${o.author.trim()}` : null };
}
var MARKER = /^(\s{0,3}(?:#{1,6}[ \t]+)?)%%(center|right|left|justify)%%/;
var norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
function buildManuscript(text2, opts) {
  const lines = text2.split("\n");
  const blocks = [];
  let title = opts.fmTitle?.trim() || "";
  let subtitle = null;
  let sawProse = false, titleTaken = false, subtitleSlot = false;
  let fence = false, comment = false, callout = false, blockAlign = "left";
  const authors = opts.authorNames.map(norm).filter(Boolean);
  const headingsAt = /* @__PURE__ */ new Map();
  for (const l of lines) {
    const h = HEADING_RE.exec(l);
    if (h) headingsAt.set(h[2].length, (headingsAt.get(h[2].length) ?? 0) + 1);
  }
  const inline = (s, trim) => {
    const urls = opts.links ? [] : void 0;
    const clean = cleanInline(s, urls);
    const runs3 = parseInline(trim === "both" ? clean.trim() : clean.trimEnd());
    return urls ? linkRuns(runs3, urls) : runs3;
  };
  for (let n = bodyStart(lines); n < lines.length; n++) {
    let L = lines[n];
    if (comment) {
      const j = L.indexOf("%%");
      if (j < 0) continue;
      comment = false;
      L = L.slice(j + 2);
      if (!L.trim()) continue;
    }
    const opens = (L.replace(/%%[^%\n]*%%/g, "").match(/%%/g) || []).length;
    if (opens % 2 === 1) {
      comment = true;
      L = L.slice(0, L.lastIndexOf("%%"));
      if (!L.trim()) continue;
    }
    if (/^\s*(```|~~~)/.test(L)) {
      fence = !fence;
      continue;
    }
    if (fence) continue;
    if (!L.trim()) {
      callout = false;
      blockAlign = "left";
      if (opts.poem && blocks.length && blocks[blocks.length - 1].kind === "verse") blocks.push({ kind: "stanza" });
      continue;
    }
    if (/^\s*>\s*\[!/.test(L)) {
      callout = true;
      continue;
    }
    if (callout && /^\s*>/.test(L)) continue;
    callout = false;
    if (/^\s*\|/.test(L) || /^\s*\$\$/.test(L)) continue;
    if (/^\s{0,3}\[\^[^\]]+\]:/.test(L)) continue;
    if (/^\s*!\[\[[^\]]*\]\]\s*$/.test(L) || /^\s*!\[[^\]]*\]\([^)]*\)\s*$/.test(L)) continue;
    const mk = MARKER.exec(L);
    let align = blockAlign;
    if (mk) {
      align = mk[2];
      blockAlign = align;
      L = mk[1] + L.slice(mk[0].length);
    }
    if (HR_RE.test(L) || SCENE_RE.test(L)) {
      if (sawProse && blocks.length && blocks[blocks.length - 1].kind !== "break") {
        if (blocks[blocks.length - 1].kind === "stanza") blocks.pop();
        blocks.push({ kind: "break" });
      }
      subtitleSlot = false;
      continue;
    }
    const h = HEADING_RE.exec(L);
    if (h) {
      const level = h[2].length;
      const runs4 = inline(h[3], "both");
      const plain = runsText(runs4).trim();
      if (!plain) continue;
      if (!sawProse && !titleTaken && level === 1) {
        if (!title) title = plain;
        titleTaken = true;
        subtitleSlot = true;
        continue;
      }
      if (!sawProse && subtitleSlot && !subtitle) {
        subtitleSlot = false;
        if (authors.includes(norm(plain))) continue;
        if ((headingsAt.get(level) ?? 0) < 2) {
          subtitle = runs4;
          continue;
        }
      }
      subtitleSlot = false;
      if (blocks.length && blocks[blocks.length - 1].kind === "stanza") blocks.pop();
      blocks.push({ kind: "heading", level, runs: runs4, align: mk ? align : "center" });
      continue;
    }
    subtitleSlot = false;
    if (opts.poem) {
      const lead = /^[ \t]*/.exec(L)?.[0] ?? "";
      const indent = lead.replace(/\t/g, "    ").length;
      const runs4 = inline(L.slice(lead.length), "end");
      if (!runsText(runs4).trim()) continue;
      blocks.push({ kind: "verse", runs: runs4, align: align === "justify" ? "left" : align, indent });
      sawProse = true;
      continue;
    }
    let quote = false;
    const q = /^\s*>+\s?/.exec(L);
    if (q) {
      quote = true;
      L = L.slice(q[0].length);
    }
    const li = LIST_RE.exec(L);
    if (li && li[2] !== "-") L = L.slice(li[0].length);
    const runs3 = inline(L, "both");
    if (!runsText(runs3).trim()) continue;
    blocks.push({ kind: "para", runs: runs3, align, ...quote ? { quote } : {} });
    sawProse = true;
  }
  while (blocks.length && (blocks[blocks.length - 1].kind === "break" || blocks[blocks.length - 1].kind === "stanza")) blocks.pop();
  if (!title) title = opts.fallbackTitle;
  return { title, subtitle, blocks, words: countWords(blocks) };
}
function countWords(blocks) {
  let count = 0;
  for (const b of blocks) if (b.kind !== "break" && b.kind !== "stanza") count += words(runsText(b.runs)).length;
  return count;
}
function compileProject(title, entries, authorNames) {
  const blocks = [];
  for (const e of entries) {
    const ms = buildManuscript(e.text, { fallbackTitle: e.title, fmTitle: e.fmTitle, authorNames, poem: e.poem });
    blocks.push({ kind: "heading", level: 0, runs: [{ text: ms.title }], align: "center", chapter: true }, ...ms.blocks);
  }
  return { title, subtitle: null, blocks, words: countWords(blocks) };
}

// src/export/docx.ts
var FONT_NAME = { times: "Times New Roman", courier: "Courier New", arial: "Arial" };
var PAGE = { letter: { w: 12240, h: 15840 }, a4: { w: 11906, h: 16838 } };
var MARGIN = 1440;
var INDENT = 720;
var xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
var track = null;
var revId = 0;
var revAttrs = () => `w:id="${++revId}" w:author="${xml(track?.author ?? "")}" w:date="${xml(track?.date ?? "")}"`;
function run(r) {
  const pr = (r.b ? "<w:b/>" : "") + (r.i ? "<w:i/>" : "");
  const rpr = pr ? `<w:rPr>${pr}</w:rPr>` : "";
  if (track && r.del) return `<w:del ${revAttrs()}><w:r>${rpr}<w:delText xml:space="preserve">${xml(r.text)}</w:delText></w:r></w:del>`;
  const plain = `<w:r>${rpr}<w:t xml:space="preserve">${xml(r.text)}</w:t></w:r>`;
  return track && r.ins ? `<w:ins ${revAttrs()}>${plain}</w:ins>` : plain;
}
function para(content, p = {}) {
  const ppr = [
    p.keepNext ? "<w:keepNext/>" : "",
    p.pageBreak ? "<w:pageBreakBefore/>" : "",
    p.tabRight ? `<w:tabs><w:tab w:val="right" w:pos="${p.tabRight}"/></w:tabs>` : "",
    p.single || p.before ? `<w:spacing${p.before ? ` w:before="${p.before}"` : ""}${p.single ? ' w:line="240" w:lineRule="auto"' : ""}/>` : "",
    p.hanging ? `<w:ind w:left="${p.left ?? 0}" w:hanging="${p.hanging}"/>` : p.firstLine !== void 0 || p.left ? `<w:ind${p.left ? ` w:left="${p.left}"` : ""} w:firstLine="${p.firstLine ?? 0}"/>` : "",
    p.align && p.align !== "left" ? `<w:jc w:val="${p.align}"/>` : "",
    // a paragraph added or cut as a whole: its paragraph mark is a tracked change too
    track && p.change ? `<w:rPr><w:${p.change} ${revAttrs()}/></w:rPr>` : ""
  ].join("");
  return `<w:p>${ppr ? `<w:pPr>${ppr}</w:pPr>` : ""}${content}</w:p>`;
}
var text = (s) => run({ text: s });
var PAGE_FIELD = '<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>';
function bodyXml(ms, o) {
  const out = [];
  const levels = ms.blocks.flatMap((b) => b.kind === "heading" && !b.chapter ? [b.level] : []);
  const topLevel = levels.length ? Math.min(...levels) : 9;
  const poem = ms.blocks.some((b) => b.kind === "verse");
  let first = true;
  for (const b of ms.blocks) {
    switch (b.kind) {
      case "break":
        out.push(para(run({ text: breakText(o), ins: b.change === "ins", del: b.change === "del" }), { align: "center", firstLine: 0, before: poem ? 180 : void 0, change: b.change }));
        break;
      case "stanza":
        out.push(para("", { firstLine: 0, single: true, change: b.change }));
        break;
      case "heading": {
        const align = b.align === "justify" ? "center" : b.align;
        out.push(para(b.runs.map((r) => run({ ...r, b: true })).join(""), {
          align,
          firstLine: 0,
          keepNext: true,
          before: b.chapter && !first ? 480 : void 0,
          pageBreak: !first && (b.chapter || o.chapterBreaks && b.level === topLevel),
          change: b.change
        }));
        if (b.chapter) out.push(para("", { firstLine: 0, single: true }));
        break;
      }
      case "verse": {
        const left = b.indent * 120 + 480;
        const align = b.align === "center" || b.align === "right" ? b.align : "left";
        out.push(para(b.runs.map(run).join(""), { align, left, hanging: 480, single: true, change: b.change }));
        break;
      }
      case "para": {
        const justify = b.align === "justify" && justifies(o);
        const align = b.align === "center" || b.align === "right" ? b.align : justify ? "both" : "left";
        out.push(para(b.runs.map(run).join(""), b.quote ? { left: INDENT, firstLine: 0, align, change: b.change } : { align, firstLine: align === "center" || align === "right" ? 0 : INDENT, change: b.change }));
        break;
      }
    }
    first = false;
  }
  out.push(para(text(labels(o.lang).end), { align: "center", firstLine: 0 }));
  return out.join("");
}
function titleBlock(ms, o, before) {
  const L = labels(o.lang);
  const { subtitle, byline } = titleLines(ms, o);
  const out = [para(text(ms.title), { align: "center", firstLine: 0, before, keepNext: true })];
  if (subtitle) out.push(para(subtitle.map(run).join(""), { align: "center", firstLine: 0, keepNext: true }));
  if (o.layout === "contest" && o.pseudonym.trim()) out.push(para(text(`${L.pseudonym}: ${o.pseudonym.trim()}`), { align: "center", firstLine: 0, keepNext: true }));
  if (byline) out.push(para(text(byline), { align: "center", firstLine: 0, keepNext: true }));
  return out.join("");
}
var PAGE_BREAK = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
function buildDocx(ms, o) {
  track = o.track ?? null;
  revId = 0;
  try {
    return docxParts(ms, o);
  } finally {
    track = null;
  }
}
function docxParts(ms, o) {
  const L = labels(o.lang);
  const page2 = PAGE[o.page];
  const textWidth2 = page2.w - 2 * MARGIN;
  const lineTwips = Math.round(240 * o.spacing);
  const lang = o.lang === "es" ? "es-MX" : "en-US";
  const contest = o.layout === "contest";
  const surname = o.author.trim().split(/\s+/).pop() || "";
  const count = `${L.about} ${roundedWords(ms.words).toLocaleString(o.lang === "es" ? "es-MX" : "en-US")} ${L.words}`;
  let front = "";
  if (!contest) {
    front = para(text(o.author.trim()) + "<w:r><w:tab/></w:r>" + text(count), { single: true, firstLine: 0, tabRight: textWidth2 });
    for (const line of o.contact.split("\n").map((x) => x.trim()).filter(Boolean)) front += para(text(line), { single: true, firstLine: 0 });
  }
  if (o.coverPage) {
    front += titleBlock(ms, o, Math.round(page2.h / 2 - 2 * MARGIN - 2 * lineTwips)) + (contest ? para(text(count), { align: "center", firstLine: 0 }) : "") + PAGE_BREAK;
  } else {
    front += titleBlock(ms, o, contest ? 0 : lineTwips) + para("", { firstLine: 0 });
  }
  const headerRef = contest ? '<w:footerReference w:type="default" r:id="rIdFooter"/>' : '<w:headerReference w:type="default" r:id="rIdHeader"/><w:titlePg/>';
  const sect = `<w:sectPr>${headerRef}<w:pgSz w:w="${page2.w}" w:h="${page2.h}"/><w:pgMar w:top="${MARGIN}" w:right="${MARGIN}" w:bottom="${MARGIN}" w:left="${MARGIN}" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>`;
  const sectFixed = sect.replace("<w:titlePg/>", "").replace("</w:sectPr>", contest ? "</w:sectPr>" : "<w:titlePg/></w:sectPr>");
  const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${NS}><w:body>${front}${bodyXml(ms, o)}${sectFixed}</w:body></w:document>`;
  const headerText = [surname, ms.title].filter(Boolean).join(" / ") + " / ";
  const header = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr ${NS}>${para(text(headerText) + PAGE_FIELD, { align: "right", firstLine: 0, single: true })}</w:hdr>`;
  const footer = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr ${NS}>${para(PAGE_FIELD, { align: "center", firstLine: 0, single: true })}</w:ftr>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${FONT_NAME[o.font]}" w:hAnsi="${FONT_NAME[o.font]}" w:cs="${FONT_NAME[o.font]}" w:eastAsia="${FONT_NAME[o.font]}"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="${lang}"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:before="0" w:after="0" w:line="${lineTwips}" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:widowControl/></w:pPr></w:style>
</w:styles>`;
  const settings = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${track ? "<w:trackRevisions/>" : ""}<w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/></w:settings>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
${contest ? '<Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>' : '<Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>'}
</Relationships>`;
  const types = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
${contest ? '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' : '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>'}
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`;
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`;
  const creator = contest ? o.pseudonym.trim() : o.author.trim();
  const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xml(ms.title)}</dc:title><dc:creator>${xml(creator)}</dc:creator><cp:lastModifiedBy>${xml(creator)}</cp:lastModifiedBy><dc:language>${lang}</dc:language></cp:coreProperties>`;
  const enc = new TextEncoder();
  const files = [
    ["[Content_Types].xml", types],
    ["_rels/.rels", rootRels],
    ["docProps/core.xml", core],
    ["word/document.xml", document],
    ["word/styles.xml", styles],
    ["word/settings.xml", settings],
    ["word/_rels/document.xml.rels", rels],
    contest ? ["word/footer1.xml", footer] : ["word/header1.xml", header]
  ];
  return zip(files.map(([name, s]) => ({ name, data: enc.encode(s) })));
}

// src/revision/diff.ts
var MAX_D = 1500;
function diffSeq(A, B) {
  const ids = /* @__PURE__ */ new Map();
  const id = (s) => {
    let v = ids.get(s);
    if (v === void 0) {
      v = ids.size;
      ids.set(s, v);
    }
    return v;
  };
  const a = A.map(id), b = B.map(id);
  let lo = 0;
  while (lo < a.length && lo < b.length && a[lo] === b[lo]) lo++;
  let ea = a.length, eb = b.length;
  while (ea > lo && eb > lo && a[ea - 1] === b[eb - 1]) {
    ea--;
    eb--;
  }
  const out = [];
  for (let i = 0; i < lo; i++) out.push({ op: 0, a: i, b: i });
  const mid = middle(a, b, lo, ea, lo, eb);
  for (const e of mid) out.push(e);
  for (let i = 0; ea + i < a.length; i++) out.push({ op: 0, a: ea + i, b: eb + i });
  return out;
}
function middle(a, b, aLo, aHi, bLo, bHi) {
  const N = aHi - aLo, M = bHi - bLo;
  const replaced = () => {
    const r = [];
    for (let i = aLo; i < aHi; i++) r.push({ op: -1, a: i, b: -1 });
    for (let j = bLo; j < bHi; j++) r.push({ op: 1, a: -1, b: j });
    return r;
  };
  if (!N || !M) return replaced();
  const max = Math.min(N + M, MAX_D);
  const off = max + 1;
  const V = new Int32Array(2 * max + 3);
  const trace = [];
  let found = -1;
  outer:
    for (let d = 0; d <= max; d++) {
      trace.push(V.slice(off - d - 1, off + d + 2));
      for (let k = -d; k <= d; k += 2) {
        let x2 = k === -d || k !== d && V[off + k - 1] < V[off + k + 1] ? V[off + k + 1] : V[off + k - 1] + 1;
        let y2 = x2 - k;
        while (x2 < N && y2 < M && a[aLo + x2] === b[bLo + y2]) {
          x2++;
          y2++;
        }
        V[off + k] = x2;
        if (x2 >= N && y2 >= M) {
          found = d;
          break outer;
        }
      }
    }
  if (found < 0) return replaced();
  const rev = [];
  let x = N, y = M;
  for (let d = found; d >= 0; d--) {
    const v = trace[d];
    const at = (k2) => v[k2 + d + 1];
    const k = x - y;
    const prevK = k === -d || k !== d && at(k - 1) < at(k + 1) ? k + 1 : k - 1;
    const prevX = d === 0 ? 0 : at(prevK);
    const prevY = d === 0 ? 0 : prevX - prevK;
    while (x > prevX && y > prevY) {
      x--;
      y--;
      rev.push({ op: 0, a: aLo + x, b: bLo + y });
    }
    if (d > 0) {
      if (x === prevX) {
        y--;
        rev.push({ op: 1, a: -1, b: bLo + y });
      } else {
        x--;
        rev.push({ op: -1, a: aLo + x, b: -1 });
      }
    }
  }
  return rev.reverse();
}
var TOKEN_RE = /[\p{L}\p{M}\p{N}]+(?:[-'’][\p{L}\p{M}\p{N}]+)*|\s+|[^\s\p{L}\p{M}\p{N}]/gu;
var tokenize = (s) => s.match(TOKEN_RE) || [];
var isWord = (t2) => /[\p{L}\p{N}]/u.test(t2);
function diffWords(oldText, newText) {
  const A = tokenize(oldText), B = tokenize(newText);
  const edits = diffSeq(A, B);
  const raw = edits.map((e) => ({ op: e.op, text: e.op === 1 ? B[e.b] : A[e.a] }));
  for (let i = 1; i < raw.length - 1; i++) {
    const s = raw[i];
    if (s.op === 0 && !isWord(s.text) && raw[i - 1].op !== 0 && raw[i + 1].op !== 0) {
      raw.splice(i, 1, { op: -1, text: s.text }, { op: 1, text: s.text });
      i++;
    }
  }
  const out = [];
  let del = "", ins = "";
  const flush = () => {
    if (del) out.push({ op: -1, text: del });
    if (ins) out.push({ op: 1, text: ins });
    del = ins = "";
  };
  for (const s of raw) {
    if (s.op === -1) del += s.text;
    else if (s.op === 1) ins += s.text;
    else {
      flush();
      const last = out[out.length - 1];
      if (last && last.op === 0) last.text += s.text;
      else out.push({ op: 0, text: s.text });
    }
  }
  flush();
  return out;
}
var countWords2 = (s) => words(s).length;
function similarity(a, b) {
  const wa = words(a.toLowerCase()), wb = words(b.toLowerCase());
  if (!wa.length && !wb.length) return 1;
  if (!wa.length || !wb.length) return 0;
  const bag = /* @__PURE__ */ new Map();
  for (const w of wa) bag.set(w, (bag.get(w) ?? 0) + 1);
  let shared = 0;
  for (const w of wb) {
    const n = bag.get(w) ?? 0;
    if (n > 0) {
      shared++;
      bag.set(w, n - 1);
    }
  }
  return 2 * shared / (wa.length + wb.length);
}
var ALIGN_MARK = /%%(?:center|right|left|justify)%%/g;
function notePars(text2) {
  const lines = text2.split("\n");
  const out = [];
  for (let i = bodyStart(lines); i < lines.length; i++) {
    const shown = lines[i].replace(ALIGN_MARK, "").trimEnd();
    if (!shown.trim()) continue;
    const h = HEADING_RE.exec(shown);
    const plain = h ? plainTitle(h[3]) : shown;
    out.push({ raw: lines[i], text: h ? plain : shown, key: shown.trim().replace(/\s+/g, " "), line: i, words: countWords2(plain.replace(/%%[^%]*%%/g, "")), heading: h ? h[2].length : 0 });
  }
  return out;
}
var PAIR_MIN = 0.45;
var PAIR_WINDOW = 40;
function diffParas(A, B) {
  const edits = diffSeq(A.map((p) => p.key), B.map((p) => p.key));
  const ops = [];
  let i = 0;
  while (i < edits.length) {
    if (edits[i].op === 0) {
      ops.push({ kind: "same", a: edits[i].a, b: edits[i].b });
      i++;
      continue;
    }
    const dels = [], ins = [];
    while (i < edits.length && edits[i].op !== 0) {
      const e = edits[i++];
      if (e.op === -1) dels.push(e.a);
      else ins.push(e.b);
    }
    const partner = /* @__PURE__ */ new Map();
    if (dels.length === 1 && ins.length === 1 && A[dels[0]].heading && A[dels[0]].heading === B[ins[0]].heading) partner.set(dels[0], 0);
    let from = 0;
    for (const d of dels) {
      if (partner.has(d)) continue;
      let best = -1, bestSim = PAIR_MIN;
      for (let j = from; j < ins.length && j < from + PAIR_WINDOW; j++) {
        if (A[d].heading !== B[ins[j]].heading && (A[d].heading === 0 || B[ins[j]].heading === 0)) continue;
        const s = similarity(A[d].text, B[ins[j]].text);
        if (s > bestSim) {
          bestSim = s;
          best = j;
        }
      }
      if (best >= 0) {
        partner.set(d, best);
        from = best + 1;
      }
    }
    let di = 0, ij = 0;
    while (di < dels.length || ij < ins.length) {
      const d = dels[di];
      const p = d === void 0 ? void 0 : partner.get(d);
      if (d !== void 0 && p === void 0) {
        ops.push({ kind: "removed", a: d });
        di++;
      } else if (d !== void 0 && p === ij) {
        const b = ins[ij];
        const segs = diffWords(A[d].text, B[b].text);
        let added = 0, removed = 0;
        for (const s of segs) {
          if (s.op === 1) added += countWords2(s.text);
          else if (s.op === -1) removed += countWords2(s.text);
        }
        ops.push({ kind: "changed", a: d, b, segs, added, removed });
        di++;
        ij++;
      } else {
        ops.push({ kind: "added", b: ins[ij] });
        ij++;
      }
    }
  }
  const cut = /* @__PURE__ */ new Map();
  ops.forEach((o, k) => {
    if (o.kind === "removed" && A[o.a].words > 0) {
      const key = A[o.a].key;
      const l = cut.get(key) ?? [];
      l.push(k);
      cut.set(key, l);
    }
  });
  ops.forEach((o, k) => {
    if (o.kind !== "added") return;
    const l = cut.get(B[o.b].key);
    const from = l?.shift();
    if (from === void 0) return;
    const a = ops[from].a;
    ops[k] = { kind: "moved", a, b: o.b };
    ops[from] = { kind: "moved-away", a, b: o.b };
  });
  return ops;
}
function sectionsOf(P) {
  const list = [{ title: "", level: 0, words: 0, first: 0 }];
  const of = [];
  P.forEach((p, i) => {
    if (p.heading) list.push({ title: plainTitle(HEADING_RE.exec(p.text)?.[3] ?? p.text), level: p.heading, words: 0, first: i });
    of.push(list.length - 1);
    if (!p.heading) list[list.length - 1].words += p.words;
  });
  if (!list[0].words && P.length && P[0].heading) return { list: list.slice(1), of: of.map((v) => v - 1) };
  return { list, of };
}
var sectionKey = (s) => s.title.toLowerCase().replace(/\s+/g, " ").trim();
function sectionRows(A, B, ops) {
  const sa = sectionsOf(A), sb = sectionsOf(B);
  const rows = sb.list.map((s) => ({ title: s.title, level: s.level, before: 0, after: s.words, added: 0, removed: 0, status: "same" }));
  const used = /* @__PURE__ */ new Set();
  const rowOfOld = sa.list.map((s) => {
    const k = sectionKey(s);
    const r = sb.list.findIndex((t2, j) => !used.has(j) && sectionKey(t2) === k);
    if (r >= 0) used.add(r);
    return r;
  });
  const renamed = /* @__PURE__ */ new Set();
  ops.forEach((o) => {
    if (o.kind !== "changed" || !A[o.a].heading || !B[o.b].heading) return;
    const oi = sa.of[o.a], ni = sb.of[o.b];
    if (rowOfOld[oi] < 0 && !used.has(ni)) {
      rowOfOld[oi] = ni;
      used.add(ni);
      renamed.add(ni);
    }
  });
  const extra = [];
  sa.list.forEach((s, i) => {
    if (rowOfOld[i] >= 0) rows[rowOfOld[i]].before = s.words;
    else extra.push({ title: s.title, level: s.level, before: s.words, after: 0, added: 0, removed: s.words, status: "cut" });
  });
  const oldRow = (a) => {
    const r = rowOfOld[sa.of[a]];
    return r >= 0 ? rows[r] : null;
  };
  for (const o of ops) {
    if (o.kind === "added") {
      if (!B[o.b].heading) rows[sb.of[o.b]].added += B[o.b].words;
    } else if (o.kind === "removed") {
      const r = oldRow(o.a);
      if (r && !A[o.a].heading) r.removed += A[o.a].words;
    } else if (o.kind === "changed" && !B[o.b].heading) {
      rows[sb.of[o.b]].added += o.added;
      const r = oldRow(o.a) ?? rows[sb.of[o.b]];
      r.removed += o.removed;
    }
  }
  const order = rowOfOld.filter((r) => r >= 0);
  const lis = longestIncreasing(order);
  rows.forEach((r, j) => {
    const existed = rowOfOld.includes(j);
    if (!existed) r.status = "new";
    else if (r.added || r.removed) r.status = "rewritten";
    else if (renamed.has(j)) r.status = "renamed";
    else if (!lis.has(j)) r.status = "moved";
  });
  const out = rows.slice();
  for (const e of extra) out.push(e);
  return out.filter((r) => r.title || r.before || r.after);
}
function longestIncreasing(xs) {
  const tails = [], prev = new Array(xs.length).fill(-1), idx = [];
  xs.forEach((x, i) => {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const m = lo + hi >> 1;
      if (tails[m] < x) lo = m + 1;
      else hi = m;
    }
    tails[lo] = x;
    idx[lo] = i;
    prev[i] = lo > 0 ? idx[lo - 1] : -1;
  });
  const out = /* @__PURE__ */ new Set();
  for (let i = idx[tails.length - 1] ?? -1; i >= 0; i = prev[i]) out.add(xs[i]);
  return out;
}
function compareTexts(oldText, newText) {
  const a = notePars(oldText), b = notePars(newText);
  const ops = diffParas(a, b);
  const st = { before: 0, after: 0, added: 0, removed: 0, moved: 0, changed: 0, paras: { added: 0, removed: 0, changed: 0, moved: 0, same: 0 } };
  for (const p of a) if (!p.heading) st.before += p.words;
  for (const p of b) if (!p.heading) st.after += p.words;
  for (const o of ops) {
    if (o.kind === "same") st.paras.same++;
    else if (o.kind === "added") {
      st.paras.added++;
      if (!b[o.b].heading) st.added += b[o.b].words;
    } else if (o.kind === "removed") {
      st.paras.removed++;
      if (!a[o.a].heading) st.removed += a[o.a].words;
    } else if (o.kind === "changed") {
      st.paras.changed++;
      if (!b[o.b].heading) {
        st.added += o.added;
        st.removed += o.removed;
      }
    } else if (o.kind === "moved") {
      st.paras.moved++;
      st.moved += b[o.b].words;
    }
  }
  st.changed = st.before + st.after ? Math.min(1, (st.added + st.removed) / (st.before + st.after)) : 0;
  return { a, b, ops, stats: st, sections: sectionRows(a, b, ops) };
}
function lineMarks(oldText, newText) {
  const A = oldText.split("\n").map((l) => l.trim()), B = newText.split("\n").map((l) => l.trim());
  const edits = diffSeq(A, B);
  const m = { added: [], changed: [], cutBefore: [] };
  let i = 0;
  while (i < edits.length) {
    if (edits[i].op === 0) {
      i++;
      continue;
    }
    const ins = [];
    let cut = 0;
    while (i < edits.length && edits[i].op !== 0) {
      const e = edits[i++];
      if (e.op === 1) {
        if (B[e.b]) ins.push(e.b);
      } else if (A[e.a]) cut++;
    }
    if (cut && ins.length) m.changed.push(...ins);
    else if (ins.length) m.added.push(...ins);
    else if (cut) m.cutBefore.push(i < edits.length ? edits[i].b : B.length);
  }
  return m;
}

// src/revision/editor.ts
var import_state4 = require("@codemirror/state");
var import_view6 = require("@codemirror/view");
var setRevisionBase = import_state4.StateEffect.define();
var revisionBaseField = import_state4.StateField.define({
  create: () => null,
  update(value, tr) {
    for (const e of tr.effects) if (e.is(setRevisionBase)) return e.value;
    return value;
  }
});
var ADD = import_view6.Decoration.line({ class: "at-rev-add", attributes: { title: "New since the draft" } });
var CHG = import_view6.Decoration.line({ class: "at-rev-chg", attributes: { title: "Rewritten since the draft" } });
var CUT = import_view6.Decoration.line({ class: "at-rev-cut", attributes: { title: "Text was cut above this line" } });
var CUT_END = import_view6.Decoration.line({ class: "at-rev-cut-end", attributes: { title: "Text was cut after this line" } });
function build(view) {
  const base = view.state.field(revisionBaseField, false);
  if (!base) return import_view6.Decoration.none;
  const doc = view.state.doc;
  const m = lineMarks(base.text, doc.toString());
  const marks = /* @__PURE__ */ new Map();
  for (const l of m.cutBefore) marks.set(l < doc.lines ? l : doc.lines - 1, l < doc.lines ? CUT : CUT_END);
  for (const l of m.changed) marks.set(l, CHG);
  for (const l of m.added) marks.set(l, ADD);
  const b = new import_state4.RangeSetBuilder();
  for (const l of [...marks.keys()].sort((x, y) => x - y)) {
    const deco = marks.get(l);
    if (deco && l >= 0 && l < doc.lines) {
      const line = doc.line(l + 1);
      b.add(line.from, line.from, deco);
    }
  }
  return b.finish();
}
var revisionMarks = import_view6.ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = build(view);
    }
    update(u) {
      const before = u.startState.field(revisionBaseField, false);
      const after = u.state.field(revisionBaseField, false);
      if (u.docChanged || before !== after) this.decorations = build(u.view);
    }
  },
  { decorations: (v) => v.decorations }
);
var showsMarks = import_view6.EditorView.editorAttributes.compute([revisionBaseField], (state) => state.field(revisionBaseField, false) ? { class: "at-rev-on" } : {});
var revisionExtension = [revisionBaseField, revisionMarks, showsMarks];

// src/revision/tracked.ts
var runsOf = (b) => "runs" in b ? b.runs : null;
function asPara(b, i) {
  const runs3 = runsOf(b);
  const text2 = b.kind === "break" ? "#" : b.kind === "stanza" ? "" : runs3 ? runs3.map((r) => (r.b ? "**" : "") + (r.i ? "_" : "") + r.text).join("") : "";
  const key = b.kind + (b.kind === "verse" ? `:${b.indent}` : "") + ":" + text2;
  return { raw: text2, text: runs3 ? runsText(runs3) : text2, key, line: i, words: runs3 ? countWords([b]) : 0, heading: b.kind === "heading" ? Math.max(1, b.level) : 0 };
}
function mark(b, change) {
  const runs3 = runsOf(b);
  const flag = change === "ins" ? { ins: true } : { del: true };
  if (runs3) return { ...b, change, runs: runs3.map((r) => ({ ...r, ...flag })) };
  return { ...b, change };
}
function trackRuns(oldRuns, newRuns) {
  const toks = (runs3) => runs3.flatMap((r) => tokenize(r.text).map((t2) => ({ text: t2, b: r.b, i: r.i })));
  const A = toks(oldRuns), B = toks(newRuns);
  const key = (r) => `${r.b ? 1 : 0}${r.i ? 1 : 0}${r.text}`;
  const out = [];
  const push = (r) => {
    const last = out[out.length - 1];
    if (last && !!last.b === !!r.b && !!last.i === !!r.i && !!last.ins === !!r.ins && !!last.del === !!r.del) last.text += r.text;
    else out.push({ ...r });
  };
  const steps = diffSeq(A.map(key), B.map(key)).map((e) => ({ op: e.op, r: e.op === -1 ? A[e.a] : B[e.b] }));
  for (let i = 1; i < steps.length - 1; i++) {
    if (steps[i].op === 0 && !steps[i].r.text.trim() && steps[i - 1].op !== 0 && steps[i + 1].op !== 0) {
      steps.splice(i, 1, { op: -1, r: steps[i].r }, { op: 1, r: steps[i].r });
      i++;
    }
  }
  let dels = [], adds = [];
  const flush = () => {
    for (const r of dels) push({ ...r, del: true });
    for (const r of adds) push({ ...r, ins: true });
    dels = [];
    adds = [];
  };
  for (const st of steps) {
    if (st.op === -1) dels.push(st.r);
    else if (st.op === 1) adds.push(st.r);
    else {
      flush();
      push({ ...st.r });
    }
  }
  flush();
  return out.map((r) => {
    const x = { text: r.text };
    if (r.b) x.b = true;
    if (r.i) x.i = true;
    if (r.ins) x.ins = true;
    if (r.del) x.del = true;
    return x;
  });
}
function trackedManuscript(oldText, newText, opts) {
  const A = buildManuscript(oldText, opts), B = buildManuscript(newText, opts);
  const ops = diffParas(A.blocks.map(asPara), B.blocks.map(asPara));
  const blocks = [];
  for (const o of ops) {
    if (o.kind === "same") blocks.push(B.blocks[o.b]);
    else if (o.kind === "added" || o.kind === "moved") blocks.push(mark(B.blocks[o.b], "ins"));
    else if (o.kind === "removed" || o.kind === "moved-away") blocks.push(mark(A.blocks[o.a], "del"));
    else {
      const nb = B.blocks[o.b], ob = A.blocks[o.a];
      const nr = runsOf(nb), or = runsOf(ob);
      blocks.push(nr && or ? { ...nb, runs: trackRuns(or, nr) } : nb);
    }
  }
  return { title: B.title, subtitle: B.subtitle, blocks, words: B.words };
}

// src/revision/view.ts
var import_obsidian17 = require("obsidian");
var VIEW_REVISION = "authors-toolbox-revision";
var fmt4 = (n) => Math.round(n).toLocaleString();
var signed = (n) => (n > 0 ? "+" : n < 0 ? "\u2212" : "\xB1") + fmt4(Math.abs(n));
var pct2 = (x) => Math.round(x * 100) + "%";
var CONTEXT = 1;
var RevisionView = class extends import_obsidian17.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.path = "";
    this.base = "";
    this.target = "current";
    this.df = null;
    this.current = null;
    this.cmp = null;
    this.stopWatching = null;
    this.styles = null;
  }
  getViewType() {
    return VIEW_REVISION;
  }
  getDisplayText() {
    return "Revision" + (this.path ? ": " + (this.path.split("/").pop() ?? "").replace(/\.md$/, "") : "");
  }
  getIcon() {
    return "git-compare";
  }
  getState() {
    return { path: this.path, base: this.base, target: this.target };
  }
  async setState(state, result) {
    const s = state ?? {};
    if (typeof s.path === "string" && s.path !== this.path) {
      this.path = s.path;
      this.base = "";
      this.target = "current";
    }
    if (typeof s.base === "string" && s.base) this.base = s.base;
    if (typeof s.target === "string" && s.target) this.target = s.target;
    await super.setState(state, result);
    await this.reload();
  }
  async onOpen() {
    this.contentEl.addClass("at-rev");
    this.stopWatching = watchWidth(this.contentEl);
    this.render();
  }
  async onClose() {
    this.stopWatching?.();
    this.stopWatching = null;
    this.contentEl.empty();
    await Promise.resolve();
  }
  get rev() {
    return this.plugin.revision;
  }
  /** Read the drafts and the note again, then compare. */
  async reload() {
    if (!this.path) {
      this.render();
      return;
    }
    this.df = await this.rev.store.load(this.path);
    this.current = await this.rev.text(this.path);
    const drafts = this.df.drafts;
    if (!drafts.some((d) => d.id === this.base)) {
      const tgt = this.targetText();
      const pick = [...drafts].reverse().find((d) => d.text !== tgt) ?? drafts[drafts.length - 1];
      this.base = pick?.id ?? "";
    }
    if (this.target !== "current" && !drafts.some((d) => d.id === this.target)) this.target = "current";
    this.compare();
    this.render();
  }
  draft(id) {
    return this.df?.drafts.find((d) => d.id === id) ?? null;
  }
  targetText() {
    return this.target === "current" ? this.current : this.draft(this.target)?.text ?? null;
  }
  compare() {
    const b = this.draft(this.base), t2 = this.targetText();
    if (!b || t2 === null) {
      this.cmp = null;
      this.styles = null;
      return;
    }
    this.cmp = compareTexts(b.text, t2);
    this.styles = [this.rev.analyze(b.text, this.path), this.rev.analyze(t2, this.path)];
  }
  /* ---------- drawing ---------- */
  render() {
    const el = this.contentEl;
    const scroll = el.scrollTop;
    el.empty();
    const name = (this.path.split("/").pop() ?? "").replace(/\.md$/, "");
    const head = el.createDiv({ cls: "at-h-head" });
    const h = head.createEl("h2");
    h.createSpan({ text: "Revision \xB7 " });
    const link = h.createEl("a", { text: name || "No note", cls: "at-rev-note" });
    link.onclick = () => {
      void this.rev.openAt(this.path, 0);
    };
    const actions = head.createDiv({ cls: "at-h-actions" });
    const save = actions.createEl("button", { text: "Save draft", cls: "mod-cta" });
    save.onclick = () => {
      void this.rev.saveDraft(this.rev.file(this.path));
    };
    const refresh = actions.createEl("button", { attr: { "aria-label": "Refresh" } });
    (0, import_obsidian17.setIcon)(refresh, "refresh-cw");
    refresh.onclick = () => {
      void this.reload();
    };
    if (!this.path || !this.df) {
      el.createDiv({ cls: "at-empty", text: "Open a note and choose Compare drafts." });
      return;
    }
    const drafts = this.df.drafts;
    if (!drafts.length) {
      const empty = el.createDiv({ cls: "at-rev-empty" });
      empty.createEl("p", { text: "No drafts of this note yet." });
      empty.createEl("p", { cls: "at-hint", text: "Save a draft before you start revising. Then this page shows what you changed since: words added and cut, rewritten and moved paragraphs, chapter by chapter, and how the style changed. A draft is also kept automatically the first time you open a writing note each day." });
      return;
    }
    this.renderPicker(el, drafts);
    const cmp = this.cmp;
    if (cmp && this.styles) {
      this.renderSummary(el, cmp);
      this.renderGoal(el);
      this.renderSections(el, cmp.sections);
      this.renderStyle(el, this.styles[0], this.styles[1]);
      this.renderText(el, cmp);
    }
    this.renderHistory(el, drafts);
    el.scrollTop = scroll;
  }
  renderPicker(el, drafts) {
    const bar = el.createDiv({ cls: "at-rev-picker" });
    const label = (d) => `${d.auto ? "\u25E6 " : ""}${d.name} \xB7 ${draftWhen(d)} \xB7 ${fmt4(d.words)} words`;
    const from = bar.createEl("select", { cls: "dropdown", attr: { "aria-label": "Older version" } });
    for (const d of [...drafts].reverse()) from.createEl("option", { value: d.id, text: label(d) });
    from.value = this.base;
    from.onchange = () => {
      this.base = from.value;
      this.compare();
      this.render();
    };
    const arrow = bar.createSpan({ cls: "at-rev-arrow" });
    (0, import_obsidian17.setIcon)(arrow, "arrow-right");
    const to = bar.createEl("select", { cls: "dropdown", attr: { "aria-label": "Newer version" } });
    to.createEl("option", { value: "current", text: "The note now" });
    for (const d of [...drafts].reverse()) to.createEl("option", { value: d.id, text: label(d) });
    to.value = this.target;
    to.onchange = () => {
      this.target = to.value;
      this.compare();
      this.render();
    };
    const tools = bar.createDiv({ cls: "at-rev-tools" });
    const marks = tools.createEl("button", { text: this.rev.marksBase(this.path) ? "Hide marks in editor" : "Show in editor" });
    marks.title = "Mark new, rewritten and cut lines in the margin of the editor";
    marks.onclick = () => {
      void this.rev.toggleMarks(this.path, this.rev.marksBase(this.path) ? void 0 : this.base).then(() => this.render());
    };
    const word = tools.createEl("button", { text: "Export with tracked changes" });
    word.title = "A manuscript (.docx) where the changes since the older version are tracked changes an editor can accept or reject";
    word.onclick = () => {
      void this.rev.exportTracked(this.path, this.base);
    };
    if (this.target !== "current") word.disabled = true;
  }
  renderSummary(el, cmp) {
    const s = cmp.stats;
    const tiles = el.createDiv({ cls: "at-grid at-rev-tiles" });
    const tile = (v, l, cls = "", tip = "") => {
      const t2 = tiles.createDiv({ cls: "at-tile " + cls });
      t2.createDiv({ cls: "at-tile-v", text: v });
      t2.createDiv({ cls: "at-tile-l", text: l });
      if (tip) t2.title = tip;
    };
    tile(`${fmt4(s.before)} \u2192 ${fmt4(s.after)}`, `words (${signed(s.after - s.before)})`);
    tile("+" + fmt4(s.added), "words added", "is-add");
    tile("\u2212" + fmt4(s.removed), "words cut", "is-cut");
    tile(pct2(s.changed), "of the text changed", "", "Words added and cut, over the words of both versions");
    const p = s.paras;
    tile(`${p.changed} rewritten \xB7 ${p.added} new`, `paragraphs \xB7 ${p.removed} cut \xB7 ${p.moved} moved`);
    if (s.added + s.removed + s.moved === 0) el.createDiv({ cls: "at-hint", text: "No changes between these two versions." });
  }
  renderGoal(el) {
    const g = this.df?.goal;
    const box = el.createDiv({ cls: "at-rev-goal" });
    if (!g) {
      const b = box.createEl("button", { cls: "at-link", text: "Set a revision goal\u2026" });
      b.onclick = () => this.rev.setGoal(this.path);
      return;
    }
    const from = this.draft(g.from);
    const now = this.target === "current" ? this.cmp?.stats.after ?? 0 : this.draft(this.target)?.words ?? 0;
    if (!from) return;
    const pr = goalProgress(g, from.words, now);
    const row = box.createDiv({ cls: "at-goal-row" });
    row.createSpan({ text: `${pr.label} \xB7 now ${fmt4(now)} (${Math.round(pr.done * 100)}%)` });
    const edit = row.createEl("button", { cls: "at-link", text: "Edit" });
    edit.onclick = () => this.rev.setGoal(this.path);
    box.createDiv({ cls: "at-bar" }).createDiv({ cls: "at-bar-fill" + (pr.done >= 1 ? " is-done" : "") }).setCssProps({ "--at-pct": Math.round(pr.done * 100) + "%" });
  }
  renderSections(el, rows) {
    const shown = rows.filter((r) => r.before || r.after || r.added || r.removed);
    if (shown.length < 2) return;
    const sec = el.createDiv({ cls: "at-section" });
    sec.createEl("h4", { text: "Chapters and sections" });
    const t2 = sec.createDiv({ cls: "at-rev-table at-rev-sections" });
    const head = t2.createDiv({ cls: "at-rev-tr at-rev-th" });
    for (const c of ["Section", "Before", "After", "Added", "Cut", ""]) head.createDiv({ text: c });
    const max = Math.max(1, ...shown.map((r) => Math.max(r.before, r.after)));
    const STATUS = { new: "New", cut: "Cut", rewritten: "Revised", renamed: "Renamed", moved: "Moved", same: "" };
    for (const r of shown) {
      const tr = t2.createDiv({ cls: "at-rev-tr is-" + r.status });
      const name = tr.createDiv({ cls: "at-rev-sname" });
      name.setCssProps({ "--at-lvl": String(Math.max(0, r.level - 1)) });
      name.createSpan({ text: r.title || "(Opening)" });
      const bar = name.createDiv({ cls: "at-rev-sbar" });
      bar.createDiv({ cls: "at-rev-sbar-a" }).setCssProps({ "--at-pct": Math.round(r.before / max * 100) + "%" });
      bar.createDiv({ cls: "at-rev-sbar-b" }).setCssProps({ "--at-pct": Math.round(r.after / max * 100) + "%" });
      tr.createDiv({ text: fmt4(r.before), attr: { "data-label": "Before" } });
      tr.createDiv({ text: fmt4(r.after), attr: { "data-label": "After" } });
      tr.createDiv({ cls: "is-add", text: r.added ? "+" + fmt4(r.added) : "", attr: { "data-label": "Added" } });
      tr.createDiv({ cls: "is-cut", text: r.removed ? "\u2212" + fmt4(r.removed) : "", attr: { "data-label": "Cut" } });
      tr.createDiv({ cls: "at-rev-status", text: STATUS[r.status] });
    }
  }
  renderStyle(el, a, b) {
    const sec = el.createDiv({ cls: "at-section" });
    sec.createEl("h4", { text: "Style" });
    const per1000 = (n, x) => x.words ? n / x.words * 1e3 : 0;
    const crutch = (x) => x.crutch.reduce((n, c) => n + c.hits.length, 0);
    const rows = [
      ["Words", a.words, b.words, fmt4, ""],
      ["Sentences", a.sentences, b.sentences, fmt4, ""],
      ["Average sentence (words)", a.avgSentence, b.avgSentence, (n) => n.toFixed(1), ""],
      ["Long sentences", a.longSentences.length, b.longSentences.length, fmt4, `Sentences longer than ${a.longThreshold} words`],
      [a.readability?.name ?? "Readability", a.readability?.score ?? 0, b.readability?.score ?? 0, (n) => n.toFixed(0), "Higher is easier to read"],
      ["Dialogue", a.dialogue, b.dialogue, pct2, "Share of words in dialogue"],
      ["Adverbs per 1,000 words", per1000(a.adverbCount, a), per1000(b.adverbCount, b), (n) => n.toFixed(1), "Words ending in -ly / -mente"],
      ["Crutch words per 1,000 words", per1000(crutch(a), a), per1000(crutch(b), b), (n) => n.toFixed(1), "From your crutch-word lists in the settings"],
      ["Lexical variety", a.variety, b.variety, pct2, "Moving-average type/token ratio. Higher = richer vocabulary."]
    ];
    const t2 = sec.createDiv({ cls: "at-rev-table at-rev-style" });
    for (const [label, x, y, f, tip] of rows) {
      const tr = t2.createDiv({ cls: "at-rev-tr" });
      const l = tr.createDiv({ text: label });
      if (tip) l.title = tip;
      tr.createDiv({ text: f(x) });
      tr.createDiv({ cls: "at-rev-arrow", text: "\u2192" });
      tr.createDiv({ text: f(y) });
      const same = f(x) === f(y);
      tr.createDiv({ cls: "at-rev-delta" + (same ? " is-same" : ""), text: same ? "" : y > x ? "\u25B2" : "\u25BC" });
    }
  }
  renderText(el, cmp) {
    const P = this.plugin, s = P.prefs;
    const sec = el.createDiv({ cls: "at-section" });
    const head = sec.createDiv({ cls: "at-rev-texthead" });
    head.createEl("h4", { text: "Text" });
    const seg = head.createDiv({ cls: "at-seg" });
    for (const [v, l] of [["changes", "Changes only"], ["all", "Whole text"]]) {
      const b = seg.createEl("button", { text: l, cls: s.revisionShow === v ? "is-active" : "" });
      b.onclick = () => {
        s.revisionShow = v;
        P.saveSettingsSoon();
        this.render();
      };
    }
    const legend = sec.createDiv({ cls: "at-rev-legend" });
    legend.createSpan({ cls: "at-ins", text: "added" });
    legend.createSpan({ cls: "at-del", text: "cut" });
    legend.createSpan({ cls: "at-rev-moved-tag", text: "moved" });
    if (this.target === "current") legend.createSpan({ cls: "at-hint", text: "Tap a paragraph to open it in the note." });
    const box = sec.createDiv({ cls: "at-rev-text" });
    const ops = cmp.ops;
    const changed = (o) => o.kind !== "same";
    const keep = /* @__PURE__ */ new Set();
    if (s.revisionShow === "changes") {
      ops.forEach((o, i) => {
        if (changed(o)) for (let k = i - CONTEXT; k <= i + CONTEXT; k++) keep.add(k);
      });
    }
    let skipped = 0;
    const flushSkip = () => {
      if (!skipped) return;
      box.createDiv({ cls: "at-rev-skip", text: `\u2026 ${skipped} unchanged paragraph${skipped === 1 ? "" : "s"} \u2026` });
      skipped = 0;
    };
    const live2 = this.target === "current";
    const draftText = this.draft(this.base)?.text ?? "";
    ops.forEach((o, i) => {
      if (s.revisionShow === "changes" && !keep.has(i)) {
        skipped++;
        return;
      }
      flushSkip();
      const para2 = (p, cls) => {
        const d = box.createDiv({ cls: "at-rev-p " + cls + (p.heading ? " is-heading" : "") });
        return d;
      };
      const clickable = (d, p) => {
        if (!live2) return;
        d.addClass("is-link");
        d.onclick = (e) => {
          if (e.target.closest("button")) return;
          void this.rev.openAt(this.path, p.line);
        };
      };
      const restore = (d, label) => {
        if (!live2) return;
        const b = d.createEl("button", { cls: "at-rev-restore", text: label });
        b.onclick = (e) => {
          e.stopPropagation();
          void this.rev.restoreParagraph(this.path, cmp, i, draftText).then((ok) => {
            if (ok) window.setTimeout(() => {
              void this.reload();
            }, 50);
          });
        };
      };
      switch (o.kind) {
        case "same": {
          const p = cmp.b[o.b];
          const d = para2(p, "is-same");
          d.createSpan({ text: p.text });
          clickable(d, p);
          break;
        }
        case "added": {
          const p = cmp.b[o.b];
          const d = para2(p, "is-added");
          d.createSpan({ cls: "at-ins", text: p.text });
          clickable(d, p);
          break;
        }
        case "removed": {
          const p = cmp.a[o.a];
          const d = para2(p, "is-removed");
          d.createSpan({ cls: "at-del", text: p.text });
          restore(d, "Restore");
          break;
        }
        case "changed": {
          const p = cmp.b[o.b];
          const d = para2(p, "is-changed");
          const t2 = d.createSpan();
          for (const sg of o.segs) t2.createSpan({ cls: sg.op === 1 ? "at-ins" : sg.op === -1 ? "at-del" : "", text: sg.text });
          d.createSpan({ cls: "at-rev-count", text: ` +${o.added} \u2212${o.removed}` });
          clickable(d, p);
          restore(d, "Undo changes");
          break;
        }
        case "moved": {
          const p = cmp.b[o.b];
          const d = para2(p, "is-moved");
          d.createSpan({ cls: "at-rev-moved-tag", text: "moved here" });
          d.createSpan({ text: " " + p.text });
          clickable(d, p);
          break;
        }
        case "moved-away": {
          const p = cmp.a[o.a];
          const d = para2(p, "is-moved-away");
          d.createSpan({ cls: "at-rev-moved-tag", text: "moved" });
          d.createSpan({ text: " " + (p.text.length > 80 ? p.text.slice(0, 80) + "\u2026" : p.text) });
          break;
        }
      }
    });
    flushSkip();
  }
  renderHistory(el, drafts) {
    const sec = el.createDiv({ cls: "at-section" });
    sec.createEl("h4", { text: `Drafts (${drafts.length})` });
    sec.createDiv({ cls: "at-hint", text: "\u25E6 marks drafts kept automatically; they are removed after the number of days set in the settings unless you rename them." });
    const list = sec.createDiv({ cls: "at-rev-history" });
    const items = [...drafts].reverse();
    items.forEach((d, i) => {
      const prev = items[i + 1];
      const row = list.createDiv({ cls: "at-rev-draft" + (d.id === this.base ? " is-base" : "") + (d.auto ? " is-auto" : "") });
      const main = row.createDiv({ cls: "at-rev-draft-main" });
      const title = main.createDiv({ cls: "at-rev-draft-name" });
      title.createSpan({ text: (d.auto ? "\u25E6 " : "") + d.name });
      main.createDiv({ cls: "at-rev-draft-meta", text: `${draftWhen(d)} \xB7 ${fmt4(d.words)} words${prev ? ` (${signed(d.words - prev.words)})` : ""}` });
      if (d.note) main.createDiv({ cls: "at-rev-draft-note", text: d.note });
      const act = row.createDiv({ cls: "at-rev-draft-actions" });
      const btn = (icon, label, f) => {
        const b = act.createEl("button", { cls: "clickable-icon", attr: { "aria-label": label } });
        (0, import_obsidian17.setIcon)(b, icon);
        b.onclick = f;
      };
      btn("git-compare", "Compare with the note now", () => {
        this.base = d.id;
        this.target = "current";
        this.compare();
        this.render();
        this.contentEl.scrollTop = 0;
      });
      btn("pencil", "Rename or add a note", () => this.rev.editDraft(this.path, d));
      btn("history", "Restore this draft", () => this.rev.restoreDraft(this.path, d));
      btn("copy", "Copy to a new note", () => {
        void this.rev.copyToNote(this.path, d);
      });
      btn("trash-2", "Delete", () => this.rev.deleteDraft(this.path, d));
    });
  }
};

// src/revision/controller.ts
var bodyWords = (text2) => notePars(text2).reduce((n, p) => n + (p.heading ? 0 : p.words), 0);
var Revision = class {
  constructor(plugin) {
    this.plugin = plugin;
    /** Drafts of notes, loaded for the writing panel (render is synchronous). */
    this.loaded = /* @__PURE__ */ new Map();
    this.loading = /* @__PURE__ */ new Set();
    /** Notes already checked for today's checkpoint: "YYYY-MM-DD|path". */
    this.checked = /* @__PURE__ */ new Set();
    /** Recent comparisons for the panel: same draft and same text → same result. */
    this.memo = /* @__PURE__ */ new Map();
    this.store = new DraftStore(plugin.app.vault.adapter, () => plugin.prefs.draftsFolder);
  }
  get app() {
    return this.plugin.app;
  }
  /* ---------- reading notes ---------- */
  file(path) {
    const f = this.app.vault.getAbstractFileByPath(path);
    return f instanceof import_obsidian18.TFile ? f : null;
  }
  /** An open editor showing the note, if any. */
  editorOf(path) {
    if (this.plugin.target?.file?.path === path && this.plugin.target.editor) return this.plugin.target;
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const v = leaf.view;
      if (v instanceof import_obsidian18.MarkdownView && v.file?.path === path) return v;
    }
    return null;
  }
  /** The note's current text: from its editor when open (unsaved typing included), else from the vault. */
  async text(path) {
    const v = this.editorOf(path);
    if (v?.editor) return v.editor.getValue();
    const f = this.file(path);
    return f ? this.app.vault.read(f) : null;
  }
  /* ---------- drafts for the panel ---------- */
  /** Drafts of a note if loaded (loads them in the background otherwise and re-renders). */
  cached(path) {
    const df = this.loaded.get(path);
    if (df) return df;
    if (!this.loading.has(path)) {
      this.loading.add(path);
      void this.store.load(path).then((d) => {
        this.loaded.set(path, d);
        this.loading.delete(path);
        this.plugin.renderPanels();
      });
    }
    return null;
  }
  /** Comparison of `text` with a draft, remembered between renders of the panel. */
  compareWith(d, text2) {
    const hit = this.memo.get(d.id);
    if (hit && hit.text === text2) return hit.cmp;
    const cmp = compareTexts(d.text, text2);
    if (this.memo.size > 4) this.memo.clear();
    this.memo.set(d.id, { text: text2, cmp });
    return cmp;
  }
  /** After drafts change: reload them for the panel and redraw everything that shows them. */
  async changed(path) {
    this.loaded.set(path, await this.store.load(path));
    this.plugin.renderPanels();
    for (const v of this.views()) if (v.path === path) void v.reload();
  }
  views() {
    return this.app.workspace.getLeavesOfType(VIEW_REVISION).map((l) => l.view).filter((v) => v instanceof RevisionView);
  }
  /** Forget loaded drafts (the drafts folder changed). */
  forget() {
    this.store.clear();
    this.loaded.clear();
    this.memo.clear();
  }
  /* ---------- saving drafts ---------- */
  /** Ask for a name and save the note as a draft. */
  async saveDraft(file) {
    const f = file ?? this.plugin.target?.file ?? this.app.workspace.getActiveFile();
    if (!f || f.extension !== "md") {
      new import_obsidian18.Notice("Open the note you want to keep a draft of first.");
      return;
    }
    const drafts = await this.store.list(f.path);
    const named = drafts.filter((d) => !d.auto).length;
    new DraftModal(this.app, {
      title: "Save a draft",
      hint: `A copy of \u201C${f.basename}\u201D as it is now, to compare with or go back to later.`,
      name: `Draft ${named + 1}`,
      action: "Save draft",
      onDone: (name, note) => {
        void this.addDraft(f.path, name, note);
      }
    }).open();
  }
  async addDraft(path, name, note, auto) {
    const text2 = await this.text(path);
    if (text2 === null) return null;
    const d = await this.store.add(path, text2, bodyWords(text2), { name, note, auto });
    if (!auto) new import_obsidian18.Notice(`Draft saved: ${name}`);
    await this.changed(path);
    return d;
  }
  /**
   * The first time a writing note is shown each day, keep its text as an automatic draft
   * (if it changed since the last draft), and drop automatic drafts older than the setting allows.
   */
  async checkpoint(path, text2) {
    const s = this.plugin.prefs;
    if (!s.autoDrafts || !this.plugin.isWritingPath(path)) return;
    const key = `${dayKey(/* @__PURE__ */ new Date())}|${path}`;
    if (this.checked.has(key)) return;
    this.checked.add(key);
    const last = await this.store.latest(path);
    if (bodyWords(text2) === 0) return;
    if (!last || last.text !== text2) {
      await this.store.add(path, text2, bodyWords(text2), { name: `Start of ${draftWhen(Date.now(), false)}`, auto: true });
    }
    await this.store.pruneAuto(path, Math.max(1, s.autoDraftDays));
    if (this.loaded.has(path) || this.views().some((v) => v.path === path)) await this.changed(path);
  }
  async rename(from, to) {
    await this.store.rename(from, to);
    this.loaded.delete(from);
    for (const v of this.views()) if (v.path === from) {
      v.path = to;
      void v.reload();
    }
  }
  /* ---------- editing drafts ---------- */
  editDraft(path, d) {
    new DraftModal(this.app, {
      title: "Rename draft",
      name: d.name,
      note: d.note,
      action: "Save",
      onDone: (name, note) => {
        void this.store.update(path, d.id, { name, note, auto: false }).then(() => this.changed(path));
      }
    }).open();
  }
  deleteDraft(path, d) {
    new ConfirmModal(this.app, {
      title: "Delete draft",
      text: `Delete \u201C${d.name}\u201D (${draftWhen(d)})? This can't be undone.`,
      action: "Delete",
      warning: true,
      onYes: () => {
        void this.store.remove(path, d.id).then(() => this.changed(path));
      }
    }).open();
  }
  setGoal(path) {
    void this.store.load(path).then((df) => {
      if (!df.drafts.length) {
        new import_obsidian18.Notice("Save a draft first: the goal is measured from one.");
        return;
      }
      new GoalModal(this.app, { drafts: df.drafts, goal: df.goal ?? null, onDone: (goal) => {
        void this.store.setGoal(path, goal).then(() => this.changed(path));
      } }).open();
    });
  }
  /** Replace the note's text with a draft's (the current text is kept as a draft first; properties stay as they are now). */
  restoreDraft(path, d) {
    new ConfirmModal(this.app, {
      title: "Restore draft",
      text: `Replace the text of the note with \u201C${d.name}\u201D (${draftWhen(d)})? The current text is saved as a draft first, and the note keeps its current properties.`,
      action: "Restore",
      onYes: () => {
        void this.doRestoreDraft(path, d);
      }
    }).open();
  }
  async doRestoreDraft(path, d) {
    const cur = await this.text(path);
    if (cur === null) return;
    await this.store.add(path, cur, bodyWords(cur), { name: `Before restoring \u201C${d.name}\u201D` });
    const keepFm = (t2) => t2.split("\n").slice(0, bodyStart(t2.split("\n"))).join("\n");
    const draftBody = d.text.split("\n").slice(bodyStart(d.text.split("\n"))).join("\n");
    const fm = keepFm(cur);
    await this.write(path, (fm ? fm + "\n" : "") + draftBody);
    new import_obsidian18.Notice(`Restored \u201C${d.name}\u201D.`);
    await this.changed(path);
  }
  /** A new note with the draft's text, next to the original. */
  async copyToNote(path, d) {
    const f = this.file(path);
    const folder = f?.parent?.path && f.parent.path !== "/" ? f.parent.path + "/" : "";
    const base = `${f?.basename ?? "Note"} (${d.name.replace(/[\\/:*?"<>|#^[\]]/g, "-")})`;
    let p = (0, import_obsidian18.normalizePath)(`${folder}${base}.md`), n = 2;
    while (this.app.vault.getAbstractFileByPath(p)) p = (0, import_obsidian18.normalizePath)(`${folder}${base} ${n++}.md`);
    const created = await this.app.vault.create(p, d.text);
    await this.app.workspace.getLeaf("tab").openFile(created);
  }
  /* ---------- changing the note ---------- */
  /** Replace the whole note (in its editor when open, so it can be undone). */
  async write(path, text2) {
    const v = this.editorOf(path);
    if (v?.editor) {
      const ed = v.editor;
      const last = ed.lastLine();
      ed.replaceRange(text2, { line: 0, ch: 0 }, { line: last, ch: ed.getLine(last).length });
      return;
    }
    const f = this.file(path);
    if (f) await this.app.vault.modify(f, text2);
  }
  /**
   * Put a draft's version of one paragraph back into the note: a cut paragraph is inserted where it
   * was, a rewritten one replaces its new version. Only if the note still reads as compared.
   */
  async restoreParagraph(path, cmp, opIndex, draftText) {
    const op = cmp.ops[opIndex];
    const cur = await this.text(path);
    if (cur === null || op.kind !== "removed" && op.kind !== "changed") return false;
    const lines = cur.split("\n");
    const oldLines = draftText.split("\n");
    const a = cmp.a[op.a];
    let end = a.line + 1;
    while (end < oldLines.length && !oldLines[end].trim()) end++;
    const block = oldLines.slice(a.line, end);
    if (op.kind === "changed") {
      const b = cmp.b[op.b];
      if (lines[b.line] !== b.raw) {
        new import_obsidian18.Notice("The note has changed since the comparison. Refresh and try again.");
        return false;
      }
      return this.replaceLines(path, b.line, b.line + 1, [a.raw]);
    }
    const next = cmp.ops.slice(opIndex + 1).find((o) => "b" in o && o.kind !== "moved-away");
    if (next) {
      const b = cmp.b[next.b];
      if (lines[b.line] !== b.raw) {
        new import_obsidian18.Notice("The note has changed since the comparison. Refresh and try again.");
        return false;
      }
      return this.replaceLines(path, b.line, b.line, block);
    }
    const tail = lines.length && lines[lines.length - 1] === "" ? lines.length - 1 : lines.length;
    return this.replaceLines(path, tail, tail, ["", a.raw]);
  }
  /** Replace lines [from, to) of the note with `insert`. */
  async replaceLines(path, from, to, insert) {
    const v = this.editorOf(path);
    if (v?.editor) {
      const ed = v.editor;
      const last = ed.lastLine();
      if (from > last) ed.replaceRange("\n" + insert.join("\n"), { line: last, ch: ed.getLine(last).length });
      else if (from === to) ed.replaceRange(insert.join("\n") + "\n", { line: from, ch: 0 });
      else ed.replaceRange(insert.join("\n"), { line: from, ch: 0 }, { line: to - 1, ch: ed.getLine(to - 1).length });
      return true;
    }
    const f = this.file(path);
    if (!f) return false;
    await this.app.vault.process(f, (t2) => {
      const L = t2.split("\n");
      L.splice(from, to - from, ...insert);
      return L.join("\n");
    });
    return true;
  }
  /* ---------- the revision view ---------- */
  async open(file, state) {
    const f = file ?? this.plugin.target?.file ?? this.app.workspace.getActiveFile();
    if (!f || f.extension !== "md") {
      new import_obsidian18.Notice("Open the note you are revising first.");
      return;
    }
    const ws = this.app.workspace;
    const existing = this.views().find((v) => v.path === f.path);
    const leaf = existing?.leaf ?? ws.getLeaf("tab");
    await leaf.setViewState({ type: VIEW_REVISION, active: true, state: { path: f.path, ...state } });
    await ws.revealLeaf(leaf);
  }
  /** Open the note at a line. */
  async openAt(path, line) {
    let v = this.editorOf(path);
    if (!v) {
      const f = this.file(path);
      if (!f) return;
      const leaf = this.app.workspace.getLeaf("tab");
      await leaf.openFile(f);
      v = leaf.view instanceof import_obsidian18.MarkdownView ? leaf.view : null;
    } else {
      this.app.workspace.setActiveLeaf(v.leaf, { focus: true });
    }
    if (!v?.editor) return;
    v.editor.setCursor({ line, ch: 0 });
    v.editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, true);
  }
  /* ---------- marks in the editor ---------- */
  cm(v) {
    return this.plugin.cmOf(v);
  }
  /** The draft the editor of `path` is compared with, if marks are on. */
  marksBase(path) {
    const cm = this.cm(this.editorOf(path));
    return cm?.state.field(revisionBaseField, false)?.label ?? null;
  }
  /** Show (or hide) marks for changes since a draft (the latest by default) in the note's editor. */
  async toggleMarks(path, draftId) {
    const p = path ?? this.plugin.target?.file?.path;
    if (!p) {
      new import_obsidian18.Notice("Open the note first.");
      return;
    }
    const cm = this.cm(this.editorOf(p));
    if (!cm) {
      new import_obsidian18.Notice("Open the note in the editor to see its changes.");
      return;
    }
    const on = cm.state.field(revisionBaseField, false);
    if (on && !draftId) {
      cm.dispatch({ effects: setRevisionBase.of(null) });
      this.plugin.renderPanels();
      return;
    }
    const d = draftId ? await this.store.get(p, draftId) : await this.store.latest(p);
    if (!d) {
      new import_obsidian18.Notice("Save a draft first: the marks show what changed since it.");
      return;
    }
    cm.dispatch({ effects: setRevisionBase.of({ text: d.text, label: d.name }) });
    this.plugin.renderPanels();
  }
  /* ---------- Word file with tracked changes ---------- */
  async exportTracked(path, draftId) {
    const f = this.file(path);
    const cur = await this.text(path);
    const d = draftId ? await this.store.get(path, draftId) : await this.store.latest(path);
    if (!f || cur === null) return;
    if (!d) {
      new import_obsidian18.Notice("Save a draft first: the exported file shows the changes since it.");
      return;
    }
    const s = this.plugin.prefs;
    const fm = this.app.metadataCache.getFileCache(f)?.frontmatter ?? {};
    const ms = trackedManuscript(d.text, cur, { fallbackTitle: f.basename, fmTitle: typeof fm.title === "string" ? fm.title : void 0, authorNames: [s.authorName], poem: isPoemFM(fm) || isPoemText(cur) });
    const o = {
      layout: "manuscript",
      font: s.exportFont,
      spacing: parseFloat(s.exportSpacing) || 2,
      page: s.exportPage,
      author: s.authorName,
      contact: s.exportContact,
      pseudonym: s.exportPseudonym,
      chapterBreaks: s.exportChapterBreaks,
      keepJustify: s.exportKeepJustify,
      sceneBreak: s.exportSceneBreak,
      coverPage: false,
      lang: this.plugin.langOf(f, cur),
      track: { author: s.authorName.trim() || "Author", date: (/* @__PURE__ */ new Date()).toISOString().replace(/\.\d+Z$/, "Z") }
    };
    const dir = f.parent?.path && f.parent.path !== "/" ? f.parent.path + "/" : "";
    const folder = (0, import_obsidian18.normalizePath)(`${dir}Exports`);
    const out = (0, import_obsidian18.normalizePath)(`${folder}/${f.basename} (${o.lang === "es" ? "cambios desde" : "changes since"} ${d.name.replace(/[\\/:*?"<>|#^[\]]/g, "-")}).docx`);
    try {
      if (!(this.app.vault.getAbstractFileByPath(folder) instanceof import_obsidian18.TFolder)) await this.app.vault.createFolder(folder);
      const buf = buildDocx(ms, o).slice().buffer;
      const existing = this.app.vault.getAbstractFileByPath(out);
      if (existing instanceof import_obsidian18.TFile) await this.app.vault.modifyBinary(existing, buf);
      else await this.app.vault.createBinary(out, buf);
      new import_obsidian18.Notice(`Saved ${out}`);
    } catch (e) {
      console.error("Authors Toolbox:", e);
      new import_obsidian18.Notice("Couldn't export: " + (e instanceof Error ? e.message : String(e)));
    }
  }
  /* ---------- style ---------- */
  analyze(text2, path) {
    return this.plugin.analyzeText(text2, this.file(path));
  }
};

// src/submissions/controller.ts
var import_obsidian21 = require("obsidian");

// src/submissions/modals.ts
var import_obsidian19 = require("obsidian");
var OTHER = "\0other";
var SubmissionModal = class extends import_obsidian19.Modal {
  constructor(app, f) {
    super(app);
    this.f = f;
  }
  onOpen() {
    const { f } = this;
    this.modalEl.addClass("at-modal");
    this.titleEl.setText(f.sub.id ? "Edit submission" : "Add a submission");
    const c = this.contentEl;
    c.createDiv({ cls: "setting-item-description", text: `Where \u201C${f.story}\u201D was sent, or will be.` });
    c.createEl("label", { cls: "at-field-label", text: "Venue" });
    const venue = c.createEl("select", { cls: "dropdown at-full" });
    for (const k of f.contests) venue.createEl("option", { value: k.path, text: k.deadline ? `${k.name} \xB7 ${shortDay(k.deadline, f.today)}` : k.name });
    venue.createEl("option", { value: OTHER, text: "Another venue\u2026" });
    const other = c.createEl("input", { type: "text", cls: "at-full", attr: { placeholder: "Name of the contest or magazine" } });
    const known = f.contests.some((k) => k.path === f.sub.venuePath);
    venue.value = known ? f.sub.venuePath : f.contests.length && !f.sub.venue ? f.contests[0].path : OTHER;
    other.value = known ? "" : f.sub.venue;
    const sync = () => {
      other.toggleClass("at-hidden", venue.value !== OTHER);
    };
    venue.onchange = sync;
    sync();
    c.createEl("label", { cls: "at-field-label", text: "Status" });
    const status = c.createEl("select", { cls: "dropdown at-full" });
    for (const s of STATUSES) status.createEl("option", { value: s, text: STATUS_LABEL[s] });
    status.value = f.sub.status;
    c.createEl("label", { cls: "at-field-label", text: "Day sent (or planned)" });
    const sent = c.createEl("input", { type: "date", cls: "at-full" });
    sent.value = f.sub.sent ?? "";
    c.createEl("label", { cls: "at-field-label", text: "Day of the answer" });
    const decided = c.createEl("input", { type: "date", cls: "at-full" });
    decided.value = f.sub.decided ?? "";
    c.createEl("label", { cls: "at-field-label", text: "Fee paid" });
    const fee = c.createEl("input", { type: "number", cls: "at-full", attr: { min: "0", step: "any", inputmode: "decimal" } });
    fee.value = f.sub.fee !== void 0 ? String(f.sub.fee) : "";
    c.createEl("label", { cls: "at-field-label", text: "Note (optional)" });
    const note = c.createEl("textarea", { cls: "at-full at-draft-note", attr: { rows: "3" } });
    note.value = f.sub.notes ?? "";
    const row = c.createDiv({ cls: "at-modal-btns" });
    if (f.onDelete) row.createEl("button", { text: "Delete", cls: "mod-warning" }).onclick = () => {
      this.close();
      f.onDelete?.();
    };
    row.createEl("button", { text: "Cancel" }).onclick = () => this.close();
    row.createEl("button", { text: f.sub.id ? "Save" : "Add", cls: "mod-cta" }).onclick = () => {
      const isOther = venue.value === OTHER;
      const name = isOther ? other.value.trim() : f.contests.find((k) => k.path === venue.value)?.name ?? "";
      if (!name) {
        other.focus();
        return;
      }
      const out = { ...f.sub, venue: name, status: status.value };
      if (isOther) delete out.venuePath;
      else out.venuePath = venue.value;
      const set = (k, v) => {
        if (v === void 0 || v === "") delete out[k];
        else out[k] = v;
      };
      set("sent", parseDay(sent.value) ?? void 0);
      set("decided", parseDay(decided.value) ?? void 0);
      set("fee", fee.value ? parseNum(fee.value) : void 0);
      set("notes", note.value.trim());
      this.close();
      f.onDone(out);
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ContestPicker = class extends import_obsidian19.Modal {
  constructor(app, o) {
    super(app);
    this.o = o;
  }
  onOpen() {
    this.modalEl.addClass("at-modal");
    this.titleEl.setText(this.o.title);
    const list = this.contentEl.createDiv({ cls: "at-pick" });
    for (const c of this.o.contests) {
      const row = list.createDiv({ cls: "at-item" });
      row.createSpan({ cls: "at-h-name", text: c.name });
      if (c.deadline) row.createSpan({ cls: "at-h-num", text: shortDay(c.deadline, this.o.today) });
      row.onclick = () => {
        this.close();
        this.o.onPick(c);
      };
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
var NewContestModal = class extends import_obsidian19.Modal {
  constructor(app, onDone) {
    super(app);
    this.onDone = onDone;
  }
  onOpen() {
    this.modalEl.addClass("at-modal");
    this.titleEl.setText("New contest note");
    const c = this.contentEl;
    c.createEl("label", { cls: "at-field-label", text: "Name" });
    const name = c.createEl("input", { type: "text", cls: "at-full" });
    c.createEl("label", { cls: "at-field-label", text: "Deadline" });
    const deadline = c.createEl("input", { type: "date", cls: "at-full" });
    c.createEl("label", { cls: "at-field-label", text: "Longest entry (words)" });
    const max = c.createEl("input", { type: "number", cls: "at-full", attr: { min: "0", inputmode: "numeric" } });
    const anon = c.createEl("label", { cls: "at-format" });
    const anonBox = anon.createEl("input", { type: "checkbox" });
    anon.appendText("Entries are anonymous");
    const row = c.createDiv({ cls: "at-modal-btns" });
    row.createEl("button", { text: "Cancel" }).onclick = () => this.close();
    const ok = () => {
      const n = name.value.trim();
      if (!n) {
        name.focus();
        return;
      }
      const props = { name: n };
      const d = parseDay(deadline.value);
      if (d) props.deadline = d;
      const m = parseNum(max.value);
      if (m) props.word_max = m;
      if (anonBox.checked) props.anonymous = true;
      this.close();
      this.onDone(props);
    };
    row.createEl("button", { text: "Create", cls: "mod-cta" }).onclick = ok;
    name.addEventListener("keydown", (e) => {
      if (e.key === "Enter") ok();
    });
    window.setTimeout(() => name.focus(), 30);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ImportCsvModal = class extends import_obsidian19.Modal {
  constructor(app, onDone) {
    super(app);
    this.onDone = onDone;
  }
  onOpen() {
    this.modalEl.addClass("at-modal");
    this.titleEl.setText("Import contests from a CSV");
    const c = this.contentEl;
    c.createDiv({ cls: "setting-item-description", text: "One row per contest, with a header row. Recognised columns: name, deadline (YYYY-MM-DD), opens, recurs, word_min, word_max, languages, anonymous, fee, prize, url, country, theme, simultaneous, font, spacing, page_size. Nothing is sent anywhere." });
    const area = c.createEl("textarea", { cls: "at-full at-csv", attr: { rows: "8" } });
    if (canPickFile()) {
      const pick = c.createEl("button", { text: "Choose a CSV file\u2026", cls: "at-ghost" });
      pick.onclick = () => {
        const input = createEl("input", { type: "file", attr: { accept: ".csv,.tsv,.txt,text/csv,text/plain" } });
        input.onchange = () => {
          const f = input.files?.[0];
          if (f) void f.text().then((t2) => {
            area.value = t2;
            refresh();
          });
        };
        input.click();
      };
    }
    const info = c.createDiv({ cls: "at-hint" });
    const row = c.createDiv({ cls: "at-modal-btns" });
    row.createEl("button", { text: "Cancel" }).onclick = () => this.close();
    const go = row.createEl("button", { text: "Import", cls: "mod-cta" });
    let parsed = [];
    const refresh = () => {
      const r = contestsFromCsv(area.value);
      parsed = r.contests;
      go.disabled = !parsed.length;
      info.setText(!area.value.trim() ? "" : parsed.length ? `${parsed.length} ${parsed.length === 1 ? "contest" : "contests"} found${r.skipped ? `, ${r.skipped} without a name skipped` : ""}${r.unknown.length ? `. Ignored columns: ${r.unknown.join(", ")}` : ""}.` : "No contests found. The first row must name the columns and each row needs a name.");
    };
    area.addEventListener("input", refresh);
    go.disabled = true;
    go.onclick = () => {
      if (!parsed.length) {
        new import_obsidian19.Notice("Nothing to import.");
        return;
      }
      this.close();
      this.onDone(parsed);
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/submissions/store.ts
var titleOf = (path) => (path.split("/").pop() ?? path).replace(/\.md$/i, "");
var SubmissionStore = class {
  constructor(adapter, folder) {
    this.files = new SidecarStore({
      adapter,
      folder,
      defaultFolder: ".authors-toolbox/submissions",
      version: 1,
      empty: (path) => ({ version: 1, path, items: [] }),
      normalize: (raw, path) => {
        if (!Array.isArray(raw.items)) return null;
        const items = raw.items.filter((s) => !!s && typeof s.id === "string" && typeof s.venue === "string").map((s) => STATUSES.includes(s.status) ? s : { ...s, status: "planned" });
        return { version: 1, path, items };
      },
      isEmpty: (f) => !f.items.length
    });
  }
  async list(path) {
    return (await this.files.load(path)).items;
  }
  async add(path, sub, now = Date.now()) {
    const f = await this.files.load(path);
    const s = { id: now.toString(36) + Math.floor(Math.random() * 1296).toString(36).padStart(2, "0"), ...sub };
    f.items.push(s);
    await this.files.save(f);
    return s;
  }
  async replace(path, sub) {
    const f = await this.files.load(path);
    const i = f.items.findIndex((x) => x.id === sub.id);
    if (i < 0) return;
    f.items[i] = sub;
    await this.files.save(f);
  }
  async remove(path, id) {
    const f = await this.files.load(path);
    f.items = f.items.filter((x) => x.id !== id);
    await this.files.save(f);
  }
  /** Every submission of every story. */
  async all() {
    const out = [];
    for (const f of await this.files.all()) for (const sub of f.items) out.push({ path: f.path, title: titleOf(f.path), sub });
    return out;
  }
  /** The most recent submission of a story. */
  async latest(path) {
    const items = await this.list(path);
    return items.length ? [...items].sort((a, b) => (a.sent ?? "").localeCompare(b.sent ?? "") || a.id.localeCompare(b.id))[items.length - 1] : null;
  }
  rename(from, to) {
    return this.files.rename(from, to);
  }
  /** A renamed contest note keeps its link in every submission. */
  async renameVenue(from, to, name) {
    for (const f of await this.files.all()) {
      let changed = false;
      for (const s of f.items) if (s.venuePath === from) {
        s.venuePath = to;
        s.venue = name;
        changed = true;
      }
      if (changed) await this.files.save(f);
    }
  }
  clear() {
    this.files.clear();
  }
};

// src/submissions/view.ts
var import_obsidian20 = require("obsidian");
var VIEW_SUBMISSIONS = "authors-toolbox-submissions";
var FINISHED = /* @__PURE__ */ new Set(["final", "finished", "done", "complete", "completed", "ready", "terminado", "terminada", "listo", "lista", "completo"]);
var fmt5 = (n) => Math.round(n).toLocaleString("en-US");
var money = (n) => Number.isInteger(n) ? fmt5(n) : n.toFixed(2);
var SubmissionsView = class extends import_obsidian20.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.entries = null;
    this.stopWatching = null;
  }
  getViewType() {
    return VIEW_SUBMISSIONS;
  }
  getDisplayText() {
    return "Submissions";
  }
  getIcon() {
    return "send";
  }
  async onOpen() {
    this.contentEl.addClass("at-habits", "at-subs");
    this.stopWatching = watchWidth(this.contentEl);
    this.render();
    await this.loadEntries();
  }
  async onClose() {
    this.stopWatching?.();
    this.stopWatching = null;
    this.contentEl.empty();
    await Promise.resolve();
  }
  async loadEntries() {
    this.entries = await this.plugin.submissions.store.all();
    this.render();
  }
  /** Redraw; reads the records again when they changed. */
  render() {
    if (this.entries === null) {
      this.paint();
      return;
    }
    void this.plugin.submissions.store.all().then((e) => {
      this.entries = e;
      this.paint();
    });
  }
  open(path) {
    const f = this.app.vault.getAbstractFileByPath(path);
    if (f instanceof import_obsidian20.TFile) void this.app.workspace.getLeaf(false).openFile(f);
  }
  section(el, title, hint) {
    const s = el.createDiv({ cls: "at-section" });
    s.createDiv({ cls: "at-label", text: title });
    if (hint) s.createDiv({ cls: "at-hint", text: hint });
    return s;
  }
  paint() {
    const el = this.contentEl;
    const scroll = el.scrollTop;
    el.empty();
    const S = this.plugin.submissions;
    const today = S.today();
    const contests = S.contests();
    const byPath = new Map(contests.map((c) => [c.path, c]));
    const entries = this.entries ?? [];
    const head = el.createDiv({ cls: "at-h-head" });
    head.createEl("h2", { text: "Submissions" });
    const actions = head.createDiv({ cls: "at-h-actions" });
    const add = actions.createEl("button", { cls: "mod-cta", text: "Add submission" });
    add.onclick = () => S.addDialog();
    const more = actions.createEl("button", { text: "New contest" });
    more.onclick = () => S.newContestDialog();
    const imp = actions.createEl("button", { text: "Import CSV" });
    imp.onclick = () => S.importDialog();
    const ics = actions.createEl("button", { text: "Calendar file" });
    ics.onclick = () => {
      void S.exportIcs();
    };
    const csv = actions.createEl("button", { text: "Spreadsheet (CSV)" });
    csv.onclick = () => {
      void S.exportCsv();
    };
    const refresh = actions.createEl("button", { attr: { "aria-label": "Refresh" } });
    (0, import_obsidian20.setIcon)(refresh, "refresh-cw");
    refresh.onclick = () => {
      this.entries = null;
      void this.loadEntries();
    };
    if (this.entries === null) {
      el.createDiv({ cls: "at-hint", text: "Reading your submissions\u2026" });
      return;
    }
    const t2 = totals2(entries);
    const year = today.slice(0, 4);
    const ty = t2.byYear.get(year);
    const pipe = pipeline(entries, today);
    const grid = el.createDiv({ cls: "at-grid at-h-grid" });
    const tile = (label, value, hint) => {
      const d = grid.createDiv({ cls: "at-tile" });
      d.createDiv({ cls: "at-tile-v", text: value });
      d.createDiv({ cls: "at-tile-l", text: label });
      if (hint) d.setAttr("title", hint);
    };
    tile("Out now", fmt5(pipe.waiting.length));
    tile(`Sent in ${year}`, fmt5(ty?.sent ?? 0), `${fmt5(t2.all.sent)} in all`);
    tile("Accepted", fmt5(t2.all.accepted), ty ? `${fmt5(ty.accepted)} in ${year}` : void 0);
    tile("Declined", fmt5(t2.all.declined));
    tile(`Fees in ${year}`, money(ty?.fees ?? 0), `${money(t2.all.fees)} in all`);
    const warns = storyWarnings(entries, (p) => byPath.get(p ?? "")?.simultaneous);
    if (warns.length) {
      const sec = this.section(el, "Look at this");
      for (const w of warns) {
        const r = sec.createDiv({ cls: "at-item at-subs-warn" });
        r.createSpan({ text: "\u26A0" });
        r.createSpan({ cls: "at-h-link", text: w.text });
        r.onclick = () => this.open(w.path);
      }
    }
    const up = upcoming(contests, today, 60);
    const upSec = this.section(el, "Upcoming", "Deadlines in the next 60 days and entries about to open.");
    if (!contests.length) upSec.createDiv({ cls: "at-hint", text: "No contest notes yet. Create one with New contest, or import a spreadsheet with Import CSV." });
    else if (!up.length) upSec.createDiv({ cls: "at-hint", text: "Nothing due in the next 60 days." });
    for (const u of up) {
      const r = upSec.createDiv({ cls: "at-item" });
      r.createSpan({ cls: "at-item-n", text: u.kind === "deadline" ? shortDay(u.day, today) : `opens ${shortDay(u.day, today)}` });
      r.createSpan({ cls: "at-h-link", text: u.contest.name });
      r.createSpan({ cls: "at-h-num", text: `${inDays(u.days)}${this.limits(u.contest)}` });
      r.onclick = () => this.open(u.contest.path);
    }
    const pipeSec = this.section(el, "Pipeline");
    if (!entries.length) pipeSec.createDiv({ cls: "at-hint", text: "Nothing recorded yet. Export a story for a contest, or use Add submission, and it appears here." });
    const group = (title, rows) => {
      if (!rows.length) return;
      pipeSec.createDiv({ cls: "at-subs-group", text: `${title} (${rows.length})` });
      for (const e of rows) {
        const r = pipeSec.createDiv({ cls: "at-item" });
        r.createSpan({ cls: `at-chip-s is-${e.sub.status.replace(" ", "-")}`, text: STATUS_LABEL[e.sub.status] });
        r.createSpan({ cls: "at-h-link", text: `${e.title} \u2192 ${e.sub.venue}` });
        const when2 = e.sub.status === "sent" ? `${e.days ?? 0} ${e.days === 1 ? "day" : "days"}${e.usual !== void 0 ? ` \xB7 usually ${e.usual}` : ""}` : e.sub.decided ? shortDay(e.sub.decided, today) : e.sub.sent ? shortDay(e.sub.sent, today) : "";
        r.createSpan({ cls: "at-h-num", text: when2 });
        r.onclick = () => S.editDialog(e.path, e.sub);
      }
    };
    group("Planned", pipe.planned);
    group("Waiting", pipe.waiting);
    group("Decided", pipe.decided.slice(0, 15));
    const stories = /* @__PURE__ */ new Map();
    for (const e of entries) stories.set(e.path, [...stories.get(e.path) ?? [], e]);
    if (stories.size) {
      const sec = this.section(el, "By story");
      for (const [path, list] of [...stories].sort((a, b) => a[1][0].title.localeCompare(b[1][0].title))) {
        const r = sec.createDiv({ cls: "at-item" });
        r.createSpan({ cls: "at-h-link at-h-name", text: list[0].title });
        r.createSpan({ cls: "at-h-num", text: list.map((e) => `${e.sub.venue} (${STATUS_LABEL[e.sub.status].toLowerCase()})`).join(" \xB7 ") });
        r.onclick = () => this.open(path);
      }
    }
    const sent = new Set(entries.map((e) => e.path));
    const unplaced = this.plugin.writingFiles().filter((f) => {
      if (sent.has(f.path)) return false;
      const fm = this.app.metadataCache.getFileCache(f)?.frontmatter ?? {};
      return FINISHED.has(fmText(fm.status).toLowerCase()) && !["hub", "anthology", "contest"].includes(fmText(fm.type).toLowerCase());
    });
    if (unplaced.length) {
      const sec = this.section(el, "Finished, not sent anywhere", "Notes whose status property says they are finished.");
      for (const f of unplaced.slice(0, 40)) {
        const r = sec.createDiv({ cls: "at-item" });
        const name = r.createSpan({ cls: "at-h-link", text: f.basename });
        name.onclick = () => {
          void this.app.workspace.getLeaf(false).openFile(f);
        };
        const b = r.createEl("button", { cls: "at-ghost", text: "Add submission" });
        b.onclick = () => {
          if (!this.plugin.submissions.contests().length) new import_obsidian20.Notice("You can also type a venue that has no contest note.");
          S.addDialog(f);
        };
      }
    }
    el.scrollTop = scroll;
  }
  limits(c) {
    const parts = [];
    if (c.wordMax !== void 0) parts.push(`up to ${fmt5(c.wordMax)} words`);
    if (c.fee !== void 0) parts.push(c.fee ? `fee ${money(c.fee)}` : "free");
    return parts.length ? ` \xB7 ${parts.join(" \xB7 ")}` : "";
  }
};

// src/submissions/controller.ts
var Submissions = class _Submissions {
  constructor(plugin) {
    this.plugin = plugin;
    this.nextEl = null;
    /** Latest submission of notes shown in the Revise tab (render is synchronous). */
    this.latest = /* @__PURE__ */ new Map();
    this.store = new SubmissionStore(plugin.app.vault.adapter, () => plugin.prefs.submissionsFolder);
  }
  get app() {
    return this.plugin.app;
  }
  get prefs() {
    return this.plugin.prefs;
  }
  today() {
    return todayKey();
  }
  forget() {
    this.store.clear();
    this.latest.clear();
  }
  /* ---------- contests ---------- */
  static isContest(fm) {
    const t2 = fmText(fm?.type).toLowerCase().replace(/\[\[|\]\]/g, "").trim();
    return t2 === "contest" || t2 === "concurso";
  }
  /** Contest notes anywhere in the vault, with yearly dates rolled forward, soonest deadline first. */
  contests() {
    const today = this.today();
    const out = [];
    for (const f of this.app.vault.getMarkdownFiles()) {
      const fm = this.app.metadataCache.getFileCache(f)?.frontmatter ?? {};
      if (_Submissions.isContest(fm)) out.push(rollContest(parseContest(f.path, f.basename, fm), today));
    }
    return out.sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999") || a.name.localeCompare(b.name));
  }
  contestAt(path) {
    return path ? this.contests().find((c) => c.path === path) : void 0;
  }
  /** Names and contact lines to look for in an anonymous entry. */
  identities() {
    const p = this.prefs;
    return [p.authorName, ...p.exportContact.split(/\n/)].map((x) => x.trim()).filter((x) => x.length >= 3);
  }
  /* ---------- status bar and opening notice ---------- */
  start() {
    this.nextEl = this.plugin.addStatusBarItem();
    this.nextEl.addClass("at-next-deadline", "mod-clickable");
    this.nextEl.onclick = () => {
      void this.openView();
    };
    this.updateStatus();
    window.setTimeout(() => {
      this.updateStatus();
      this.startupNotice();
    }, 2500);
  }
  updateStatus() {
    const el = this.nextEl;
    if (!el) return;
    const n = this.prefs.showNextDeadline ? nextDeadline(this.contests(), this.today()) : null;
    el.setText(n ? `Next: ${n.contest.name}, ${inDays(n.days)}` : "");
    el.setAttr("aria-label", n ? `Next contest deadline: ${shortDay(n.contest.deadline)}. Click to open submissions.` : "");
    el.toggleClass("at-hidden", !n);
  }
  /** Once a day, when Obsidian opens: deadlines within the window. */
  startupNotice() {
    const days = this.prefs.noticeDays;
    const today = this.today();
    if (!(days > 0) || this.prefs.noticeDay === today) return;
    const due = upcoming(this.contests(), today, days);
    if (!due.length) return;
    this.prefs.noticeDay = today;
    void this.plugin.saveSettings();
    const lines = due.slice(0, 5).map((d) => `\u2022 ${d.contest.name}: ${d.kind === "deadline" ? "deadline" : "opens"} ${inDays(d.days)} (${shortDay(d.day, today)})`);
    if (due.length > 5) lines.push(`\u2026and ${due.length - 5} more`);
    new import_obsidian21.Notice(["Contest deadlines coming up", ...lines].join("\n"), 1e4);
  }
  /* ---------- contest notes ---------- */
  newContestDialog() {
    new NewContestModal(this.app, (props) => {
      void this.createContest(props).then((f) => {
        if (f) void this.app.workspace.getLeaf(false).openFile(f);
      });
    }).open();
  }
  async ensureFolder(folder) {
    if (!folder || this.app.vault.getAbstractFileByPath(folder)) return;
    await this.app.vault.createFolder(folder);
  }
  /** Writes a contest note; null when a note of that name already exists. */
  async createContest(props, blank = true) {
    const folder = (0, import_obsidian21.normalizePath)(this.prefs.contestsFolder.trim() || "Contests");
    await this.ensureFolder(folder);
    const path = (0, import_obsidian21.normalizePath)(`${folder}/${contestFileName(String(props.name))}.md`);
    if (this.app.vault.getAbstractFileByPath(path)) {
      new import_obsidian21.Notice(`A note called \u201C${String(props.name)}\u201D already exists.`);
      return null;
    }
    const f = await this.app.vault.create(path, contestNote(props, blank));
    this.updateStatus();
    this.views().forEach((v) => v.render());
    return f;
  }
  importDialog() {
    new ImportCsvModal(this.app, (list) => {
      void this.importContests(list);
    }).open();
  }
  async importContests(list) {
    let created = 0, skipped = 0;
    const folder = (0, import_obsidian21.normalizePath)(this.prefs.contestsFolder.trim() || "Contests");
    await this.ensureFolder(folder);
    for (const props of list) {
      const path = (0, import_obsidian21.normalizePath)(`${folder}/${contestFileName(String(props.name))}.md`);
      if (this.app.vault.getAbstractFileByPath(path)) {
        skipped++;
        continue;
      }
      await this.app.vault.create(path, contestNote(props));
      created++;
    }
    new import_obsidian21.Notice(`${created} contest ${created === 1 ? "note" : "notes"} created${skipped ? `, ${skipped} skipped because a note with that name exists` : ""}.`);
    this.updateStatus();
    this.views().forEach((v) => v.render());
    return { created, skipped };
  }
  /* ---------- records ---------- */
  views() {
    return this.app.workspace.getLeavesOfType(VIEW_SUBMISSIONS).map((l) => l.view).filter((v) => v instanceof SubmissionsView);
  }
  async changed(path) {
    this.latest.set(path, await this.store.latest(path));
    this.views().forEach((v) => v.render());
    this.plugin.renderPanels();
  }
  /** The latest submission of a story, for the Revise tab: undefined while loading. */
  latestFor(path) {
    if (!this.latest.has(path)) {
      this.latest.set(path, null);
      void this.store.latest(path).then((s) => {
        if (s) {
          this.latest.set(path, s);
          this.plugin.renderPanels();
        }
      });
    }
    return this.latest.get(path);
  }
  /** Add a submission for a story (the active note by default). */
  addDialog(file, preset) {
    const f = file ?? this.plugin.target?.file ?? this.app.workspace.getActiveFile();
    if (!f || f.extension !== "md") {
      new import_obsidian21.Notice("Open the story you sent first.");
      return;
    }
    new SubmissionModal(this.app, {
      story: f.basename,
      contests: this.contests(),
      today: this.today(),
      sub: { venue: "", status: "planned", sent: this.today(), ...preset },
      onDone: (sub) => {
        void this.store.add(f.path, sub).then(() => this.changed(f.path));
      }
    }).open();
  }
  editDialog(path, sub) {
    new SubmissionModal(this.app, {
      story: (path.split("/").pop() ?? path).replace(/\.md$/i, ""),
      contests: this.contests(),
      today: this.today(),
      sub,
      onDone: (next) => {
        void this.store.replace(path, next).then(() => this.changed(path));
      },
      onDelete: () => new ConfirmModal(this.app, {
        title: "Delete this submission?",
        text: `The record of \u201C${sub.venue}\u201D is removed. The story is not touched.`,
        action: "Delete",
        warning: true,
        onYes: () => {
          void this.store.remove(path, sub.id).then(() => this.changed(path));
        }
      }).open()
    }).open();
  }
  /** Change only the status (the page's quick action). */
  async setStatus(path, sub, status) {
    await this.store.replace(path, withStatus(sub, status, this.today()));
    await this.changed(path);
  }
  async rename(from, to) {
    await this.store.rename(from, to);
    this.latest.delete(from);
    const f = this.app.vault.getAbstractFileByPath(to);
    if (f instanceof import_obsidian21.TFile) {
      const fm = this.app.metadataCache.getFileCache(f)?.frontmatter ?? {};
      if (_Submissions.isContest(fm)) await this.store.renameVenue(from, to, f.basename);
    }
    this.views().forEach((v) => v.render());
  }
  /* ---------- the page and the files ---------- */
  async openView() {
    const ws = this.app.workspace;
    const existing = ws.getLeavesOfType(VIEW_SUBMISSIONS)[0];
    const leaf = existing ?? ws.getLeaf("tab");
    if (!existing) await leaf.setViewState({ type: VIEW_SUBMISSIONS, active: true });
    await ws.revealLeaf(leaf);
  }
  /** Deadlines as a calendar file in the vault (phones can open it in their calendar). */
  async exportIcs() {
    const list = this.contests().filter((c) => c.deadline || c.opens);
    const text2 = buildIcs(list, (/* @__PURE__ */ new Date()).toISOString(), this.today());
    if (!text2.includes("BEGIN:VEVENT")) {
      new import_obsidian21.Notice("No upcoming deadlines to export.");
      return null;
    }
    return this.writeText((0, import_obsidian21.normalizePath)(`${this.prefs.contestsFolder.trim() || "Contests"}/Contest deadlines.ics`), text2);
  }
  async exportCsv() {
    const entries = await this.store.all();
    if (!entries.length) {
      new import_obsidian21.Notice("No submissions to export yet.");
      return null;
    }
    return this.writeText((0, import_obsidian21.normalizePath)(`${this.prefs.contestsFolder.trim() || "Contests"}/Submissions.csv`), submissionsCsv(entries));
  }
  async writeText(path, text2) {
    await this.ensureFolder(path.slice(0, path.lastIndexOf("/")));
    const old = this.app.vault.getAbstractFileByPath(path);
    if (old instanceof import_obsidian21.TFile) await this.app.vault.modify(old, text2);
    else await this.app.vault.create(path, text2);
    new import_obsidian21.Notice(`Saved ${path}`);
    return path;
  }
  /* ---------- export for a contest ---------- */
  /** Choose a contest, then open the export window for the story with its checks. */
  exportFor(file) {
    const f = file ?? this.plugin.target?.file ?? this.app.workspace.getActiveFile();
    if (!f || f.extension !== "md") {
      new import_obsidian21.Notice("Open the story you want to send first.");
      return;
    }
    const contests = this.contests();
    if (!contests.length) {
      new import_obsidian21.Notice("No contest notes yet. Create one with the command to make a contest note first.");
      return;
    }
    new ContestPicker(this.app, { title: "Export for which contest?", contests, today: this.today(), onPick: (c) => {
      void this.plugin.exportManuscript(f, c.path);
    } }).open();
  }
  /** After a contest export: keep the exact version as a draft and offer to log the submission. */
  async afterExport(info) {
    if (!info.path) return;
    const f = this.app.vault.getAbstractFileByPath(info.path);
    if (!(f instanceof import_obsidian21.TFile)) return;
    const today = this.today();
    const draft = await this.plugin.revision.addDraft(info.path, `Sent to ${info.contest.name}, ${shortDay(today)}`, "Exported for the contest.");
    this.addDialog(f, {
      venue: info.contest.name,
      venuePath: info.contest.path,
      status: "sent",
      sent: today,
      draftId: draft?.id,
      files: info.files,
      ...info.contest.fee !== void 0 ? { fee: info.contest.fee } : {}
    });
  }
};

// src/check/languagetool.ts
var import_obsidian22 = require("obsidian");
function scopeRange(plugin, scope, ed, text2) {
  if (scope === "selection" && ed.somethingSelected()) {
    const s = ed.listSelections()[0];
    if (s) {
      let a2 = ed.posToOffset(s.anchor), b2 = ed.posToOffset(s.head);
      if (a2 > b2) [a2, b2] = [b2, a2];
      return { from: a2, to: b2, label: "the selection" };
    }
  }
  if (scope === "note") return { from: 0, to: text2.length, label: "the whole note" };
  const o = buildOutline(text2);
  const line = ed.getCursor().line;
  let best = { start: o.root.start, end: o.lines.length };
  for (const n of o.all) {
    if (n.id && line >= n.start && line < n.end && n.end - n.start <= best.end - best.start) best = n;
    for (const sc of n.scenes) if (line >= sc.start && line < sc.end && sc.end - sc.start <= best.end - best.start) best = sc;
  }
  const a = ed.posToOffset({ line: best.start, ch: 0 });
  const lastLine = Math.max(best.start, best.end - 1);
  const b = ed.posToOffset({ line: lastLine, ch: ed.getLine(lastLine).length });
  return { from: a, to: b, label: "this section" };
}
async function waitForRateLimit(plugin, bytes) {
  const s = plugin.prefs;
  const official = /api\.languagetool\.org/.test(s.ltServer || "");
  if (!official || s.ltKey && s.ltUser) return;
  for (; ; ) {
    const now = Date.now();
    plugin.sent = plugin.sent.filter((x) => now - x.t < 6e4);
    const used = plugin.sent.reduce((t2, x) => t2 + x.bytes, 0);
    if (plugin.sent.length < 18 && used + bytes <= 72e3) break;
    const firstEntry = plugin.sent[0];
    const wait = Math.max(1e3, 6e4 - (now - (firstEntry ? firstEntry.t : now)) + 500);
    plugin.checkStatus = `Waiting ${Math.ceil(wait / 1e3)} s for LanguageTool's free-tier limit\u2026`;
    plugin.renderPanels();
    await new Promise((r) => window.setTimeout(r, Math.min(wait, 5e3)));
  }
  plugin.sent.push({ t: Date.now(), bytes });
}
async function runCheck(plugin, scope) {
  const view = plugin.target || plugin.app.workspace.getActiveViewOfType(import_obsidian22.MarkdownView);
  if (!view || !view.editor || !view.file) {
    new import_obsidian22.Notice("Open a note in editing view first.");
    return;
  }
  plugin.target = view;
  if (!plugin.prefs.ltConsent) {
    plugin.prefs.panelTab = "check";
    await plugin.activatePanel();
    new import_obsidian22.Notice("Allow the spelling & grammar service in the writing panel first.");
    return;
  }
  if (plugin.checking) return;
  const s = plugin.prefs, ed = view.editor, cm = plugin.cmOf(view);
  const text2 = ed.getValue();
  const L = plugin.noteLang(view.file);
  const lang = L.code;
  const rng = plugin.scopeRange(scope, ed, text2);
  const { pieces } = proseMap(text2);
  const premium = !!(s.ltKey && s.ltUser);
  const chunks = ltChunks(pieces, rng.from, rng.to, premium ? 6e4 : 18e3);
  if (!chunks.length) {
    new import_obsidian22.Notice("Nothing to check there.");
    return;
  }
  plugin.checking = true;
  plugin.check = { path: view.file.path, issues: /* @__PURE__ */ new Map(), scopeLabel: rng.label, lang };
  plugin.renderPanels();
  const server = (s.ltServer || "https://api.languagetool.org").replace(/\/+$/, "").replace(/\/v2(\/check)?$/, "");
  const dict = new Set(String(s.ltDictionary || "").split(/[\n,]/).map((x) => x.trim().toLowerCase()).filter(Boolean));
  const disabled = String(s.ltDisabledRules || "").split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
  const found = [];
  let failed = null;
  const spTypes = isScriptText(text2) ? classifyScript(text2).types : null;
  try {
    for (let k = 0; k < chunks.length; k++) {
      const ch = chunks[k];
      if (!ch) continue;
      await plugin.waitForRateLimit(ch.bytes);
      plugin.checkStatus = chunks.length > 1 ? `Checking part ${k + 1} of ${chunks.length}\u2026` : "Checking\u2026";
      plugin.renderPanels();
      const params = new URLSearchParams();
      params.set("data", JSON.stringify({ annotation: ch.annotation }));
      params.set("language", lang === "auto" ? "auto" : lang);
      if (lang === "auto") params.set("preferredVariants", "en-US");
      if (s.ltPicky) params.set("level", "picky");
      if (disabled.length) params.set("disabledRules", disabled.join(","));
      if (premium) {
        params.set("username", s.ltUser);
        params.set("apiKey", s.ltKey);
      }
      const res = await (0, import_obsidian22.requestUrl)({ url: server + "/v2/check", method: "POST", contentType: "application/x-www-form-urlencoded", body: params.toString(), throw: false });
      if (res.status !== 200) {
        failed = res.status === 429 ? "LanguageTool's free limit was reached. Wait a minute and try again." : res.status === 413 ? "That text is too long for one request." : `LanguageTool answered with an error (${res.status}). ${String(res.text || "").slice(0, 120)}`;
        break;
      }
      if (ed.getValue() !== text2) {
        failed = "The text changed while it was being checked \u2014 run the check again.";
        break;
      }
      const ltJson = res.json;
      for (const m of mapMatches(ltJson, ch, text2)) {
        if (m.kind === "spelling" && dict.has(m.text.toLowerCase())) continue;
        if (spTypes) {
          const ln = text2.slice(0, m.from).split("\n").length - 1;
          const tt = spTypes[ln]?.t;
          if (tt === "scene" || tt === "character" || tt === "transition" || tt === "pagebreak" || tt === "section") continue;
        }
        found.push(m);
      }
    }
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : String(e);
    failed = "Couldn't reach LanguageTool. Check your internet connection. (" + msg + ")";
  }
  plugin.checking = false;
  for (const m of found) {
    m.id = "i" + ++plugin.issueSeq;
    plugin.check.issues.set(m.id, m);
  }
  if (cm) cm.dispatch({ effects: setIssues.of(found.map((m) => ({ from: m.from, to: m.to, kind: m.kind, id: m.id }))) });
  plugin.checkStatus = failed || (found.length ? `${found.length} suggestion${found.length === 1 ? "" : "s"} in ${rng.label}.` : "");
  if (failed) new import_obsidian22.Notice(failed);
  plugin.prefs.panelTab = "check";
  if (!plugin.panels().length) await plugin.activatePanel();
  plugin.renderPanels();
}
function clearCheck(plugin) {
  const cm = plugin.cmOf(plugin.target);
  if (cm) cm.dispatch({ effects: setIssues.of([]) });
  plugin.check = null;
  plugin.checkStatus = "";
  plugin.renderPanels();
}
function dropIssue(plugin, id) {
  const cm = plugin.cmOf(plugin.target);
  if (cm) cm.dispatch({ effects: removeIssue.of(id) });
  if (plugin.check) plugin.check.issues.delete(id);
  plugin.renderPanels();
}
function applyFix(plugin, id, value) {
  const cm = plugin.cmOf(plugin.target);
  const it = plugin.check && plugin.check.issues.get(id);
  if (!cm || !it) return;
  const r = issueRange(cm, id);
  if (!r || cm.state.sliceDoc(r.from, r.to) !== it.text) {
    new import_obsidian22.Notice("That text has changed \u2014 run the check again.");
    plugin.dropIssue(id);
    return;
  }
  cm.dispatch({ changes: { from: r.from, to: r.to, insert: value }, effects: removeIssue.of(id) });
  if (plugin.check) plugin.check.issues.delete(id);
  plugin.refreshSoon();
  plugin.renderPanels();
}
function ignoreIssue(plugin, id) {
  plugin.dropIssue(id);
}
async function addToDictionary(plugin, id) {
  const it = plugin.check && plugin.check.issues.get(id);
  if (!it) return;
  const w = it.text.trim();
  const list = String(plugin.prefs.ltDictionary || "").split(/\n/).map((x) => x.trim()).filter(Boolean);
  if (!list.some((x) => x.toLowerCase() === w.toLowerCase())) list.push(w);
  plugin.prefs.ltDictionary = list.join("\n");
  await plugin.saveSettings();
  if (plugin.check) {
    for (const [k, v] of [...plugin.check.issues]) if (v.kind === "spelling" && v.text.toLowerCase() === w.toLowerCase()) plugin.dropIssue(k);
  }
  new import_obsidian22.Notice(`\u201C${w}\u201D added to your dictionary.`);
}
function onEditorClick(plugin, e, view) {
  if (!plugin.check || !plugin.check.issues.size) return false;
  const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });
  if (pos == null) return false;
  const hit = issueAt(view, pos);
  if (!hit) return false;
  const it = plugin.check.issues.get(hit.id);
  if (!it) return false;
  if (plugin.target && plugin.cmOf(plugin.target) !== view) {
    const leaf = plugin.app.workspace.getLeavesOfType("markdown").find((l) => plugin.cmOf(l.view) === view);
    if (leaf && leaf.view instanceof import_obsidian22.MarkdownView) plugin.target = leaf.view;
  }
  const m = new import_obsidian22.Menu();
  m.addItem((i) => i.setTitle(it.message.length > 90 ? it.message.slice(0, 88) + "\u2026" : it.message).setIcon("info").setDisabled(true));
  for (const rep of it.replacements.slice(0, 5)) m.addItem((i) => i.setTitle(rep === "" ? "(delete)" : rep).setIcon("check").onClick(() => plugin.applyFix(it.id, rep)));
  m.addSeparator();
  m.addItem((i) => i.setTitle("Ignore").setIcon("x").onClick(() => plugin.ignoreIssue(it.id)));
  if (it.kind === "spelling") m.addItem((i) => i.setTitle(`Add \u201C${it.text}\u201D to dictionary`).setIcon("book-plus").onClick(() => {
    void plugin.addToDictionary(it.id);
  }));
  if (it.rule) m.addItem((i) => i.setTitle("Turn off this rule").setIcon("ban").onClick(async () => {
    const rules = String(plugin.prefs.ltDisabledRules || "").split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
    if (!rules.includes(it.rule)) rules.push(it.rule);
    plugin.prefs.ltDisabledRules = rules.join(", ");
    await plugin.saveSettings();
    if (plugin.check) {
      for (const [k, v] of [...plugin.check.issues]) if (v.rule === it.rule) plugin.dropIssue(k);
    }
    new import_obsidian22.Notice(`Rule turned off: ${it.ruleName || it.rule}`);
  }));
  window.setTimeout(() => m.showAtPosition({ x: e.clientX, y: e.clientY + 8 }), 0);
  return false;
}

// src/view/navigation.ts
var import_obsidian23 = require("obsidian");
var import_view9 = require("@codemirror/view");
function wordDocRange(plugin, w) {
  if (!plugin.state) return { from: 0, to: 0 };
  const p = plugin.state.analysis.paras[w.para];
  return p ? plugin.plainDocRange(p, w.a, w.b) : { from: 0, to: 0 };
}
function plainDocRange(plugin, p, a, b) {
  return { from: plainToDoc(p, a), to: plainToDoc(p, b) };
}
function highlightSentences(plugin, sents) {
  if (!plugin.state) return;
  const a = plugin.state.analysis;
  plugin.showRanges(sents.map((s) => {
    const p = a.paras[s.para];
    return p ? plugin.plainDocRange(p, s.a, s.b) : { from: 0, to: 0 };
  }), 0);
}
function ensureEditable(plugin) {
  const v = plugin.target;
  if (!v) return null;
  if (v.getMode && v.getMode() === "preview") return null;
  return plugin.cmOf(v);
}
function closeDrawerOnPhone(plugin) {
  if (import_obsidian23.Platform.isPhone) {
    try {
      const split = plugin.app.workspace.rightSplit;
      if (split && typeof split.collapse === "function") split.collapse();
    } catch {
    }
  }
}
function showRanges(plugin, ranges, current2, select) {
  const v = plugin.target;
  if (!v || !ranges.length) return;
  const r = ranges[current2] || ranges[0];
  if (!r) return;
  const cm = plugin.ensureEditable();
  if (!cm) {
    const line = v.editor.offsetToPos(r.from).line;
    v.setEphemeralState({ line });
    plugin.closeDrawerOnPhone();
    return;
  }
  const effects = [setFind.of({ ranges, current: current2 }), import_view9.EditorView.scrollIntoView(r.from, { y: "center" })];
  const tr = { effects };
  if (select) tr.selection = { anchor: r.from, head: r.to };
  cm.dispatch(tr);
  if (ranges.length > 1) new import_obsidian23.Notice(`${current2 + 1} of ${ranges.length}`, 1200);
  plugin.closeDrawerOnPhone();
}
function jumpToLine(plugin, line) {
  const v = plugin.target;
  if (!v) return;
  const cm = plugin.ensureEditable();
  if (!cm) {
    v.setEphemeralState({ line });
    plugin.closeDrawerOnPhone();
    return;
  }
  const pos = v.editor.posToOffset({ line, ch: 0 });
  cm.dispatch({ selection: { anchor: pos }, effects: import_view9.EditorView.scrollIntoView(pos, { y: "start", yMargin: 40 }) });
  if (!import_obsidian23.Platform.isMobile) cm.focus();
  plugin.closeDrawerOnPhone();
}
function selectLines(plugin, a, b) {
  const v = plugin.target;
  if (!v) return;
  const ed = v.editor;
  while (b - 1 > a && !ed.getLine(b - 1).trim()) b--;
  ed.setSelection({ line: a, ch: 0 }, { line: b - 1, ch: ed.getLine(b - 1).length });
  ed.scrollIntoView({ from: { line: a, ch: 0 }, to: { line: a, ch: 0 } }, true);
  ed.focus();
  plugin.closeDrawerOnPhone();
}
function moveSection(plugin, parentId, kind, from, to) {
  const v = plugin.target;
  if (!v || !v.editor) return;
  const ed = v.editor;
  const r = kind === "c" ? reorderScenes(buildScriptOutline(ed.getValue()), parentId, from, to) : kind === "h" || kind === "s" ? reorder(buildOutline(ed.getValue()), parentId, kind, from, to) : null;
  if (!r) {
    new import_obsidian23.Notice("Couldn't move that section \u2014 the text changed. Try again.");
    plugin.refresh();
    return;
  }
  ed.replaceRange(r.text, { line: r.fromLine, ch: 0 }, { line: r.toLine, ch: ed.getLine(r.toLine).length });
  plugin.refresh();
}

// src/habits/actions.ts
var import_obsidian25 = require("obsidian");

// src/habits/genre-modal.ts
var import_obsidian24 = require("obsidian");
var GenreModal = class extends import_obsidian24.Modal {
  constructor(app, title, current2, known, onSave) {
    super(app);
    this.title = title;
    this.known = known;
    this.onSave = onSave;
    this.chosen = [...current2];
  }
  onOpen() {
    this.titleEl.setText(`Genre of \u201C${this.title}\u201D`);
    this.render();
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    const all = [.../* @__PURE__ */ new Set([...this.known, ...this.chosen])].sort((a, b) => a.localeCompare(b));
    if (all.length) {
      contentEl.createDiv({ cls: "setting-item-description", text: "Tap to add or remove. A work can have several genres." });
      const box = contentEl.createDiv({ cls: "at-chips" });
      for (const g of all) {
        const on = this.chosen.includes(g);
        const c = box.createEl("button", { cls: "at-chip" + (on ? " is-active" : ""), text: g });
        c.onclick = () => {
          this.chosen = on ? this.chosen.filter((x) => x !== g) : [...this.chosen, g];
          this.render();
        };
      }
    }
    let input = "";
    new import_obsidian24.Setting(contentEl).setName("New genre").addText((t2) => {
      t2.setPlaceholder("Terror, romance, ciencia ficci\xF3n\u2026").onChange((v) => {
        input = v;
      });
      t2.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") add();
      });
    }).addButton((b) => b.setButtonText("Add").onClick(() => add()));
    const add = () => {
      for (const g of input.split(",").map(normaliseGenre).filter(Boolean)) if (!this.chosen.includes(g)) this.chosen.push(g);
      this.render();
    };
    new import_obsidian24.Setting(contentEl).addButton((b) => b.setButtonText("Save").setCta().onClick(() => {
      this.close();
      this.onSave(this.chosen);
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/habits/actions.ts
function trackDaily(plugin, path, wordCount) {
  const d = plugin.prefs.daily || (plugin.prefs.daily = {});
  const key = todayKey();
  if (prune(d, key, HISTORY_DAYS)) plugin.saveSettingsSoon();
  const day = d[key] || (d[key] = {});
  const e = day[path];
  if (!e) {
    day[path] = { s: wordCount, l: wordCount };
    plugin.saveSettingsSoon();
  } else if (e.l !== wordCount) {
    e.l = wordCount;
    plugin.saveSettingsSoon();
  }
}
async function openHabits(plugin) {
  const ws = plugin.app.workspace;
  const existing = ws.getLeavesOfType(VIEW_HABITS)[0];
  const leaf = existing ?? ws.getLeaf("tab");
  if (!existing) await leaf.setViewState({ type: VIEW_HABITS, active: true });
  await ws.revealLeaf(leaf);
}
function habitViews(plugin) {
  return plugin.app.workspace.getLeavesOfType(VIEW_HABITS).map((l) => l.view).filter((v) => v instanceof HabitsView);
}
function writingFiles(plugin) {
  const lines = (plugin.prefs.writingFolders.trim() ? plugin.prefs.writingFolders : `${plugin.prefs.storyFolders}
${plugin.prefs.scriptsFolder}`).split(/[\n,]/).map((x) => (0, import_obsidian25.normalizePath)(x.trim())).filter((x) => x && x !== "/");
  const folders = lines.map((p) => plugin.app.vault.getAbstractFileByPath(p)).filter((f) => f instanceof import_obsidian25.TFolder);
  return filesIn(folders);
}
function knownGenres(plugin) {
  const out = /* @__PURE__ */ new Set();
  for (const f of plugin.writingFiles()) for (const g of genresOf(plugin.app.metadataCache.getFileCache(f)?.frontmatter)) out.add(g);
  return [...out];
}
function openGenre(plugin, file, after) {
  const fm = plugin.app.metadataCache.getFileCache(file)?.frontmatter;
  new GenreModal(plugin.app, file.basename, genresOf(fm), plugin.knownGenres(), (genres) => {
    void plugin.app.fileManager.processFrontMatter(file, (f) => {
      for (const k of ["genres", "g\xE9nero", "genero"]) delete f[k];
      if (genres.length) f.genre = genres;
      else delete f.genre;
    }).then(() => {
      new import_obsidian25.Notice(genres.length ? `Genre: ${genres.join(", ")}` : "Genre removed.");
      after?.();
    });
  }).open();
}
function openSprint(plugin) {
  if (plugin.sprint) {
    new import_obsidian25.Notice("A sprint is already running.");
    return;
  }
  new StartSprintModal(plugin.app, plugin.prefs.sprintMinutes || 25, plugin.prefs.sprintTarget, (minutes, target) => plugin.startSprint(minutes, target)).open();
}
function startSprint(plugin, minutes, target) {
  if (plugin.target) plugin.refresh();
  const today = dayKey(/* @__PURE__ */ new Date());
  const log = plugin.prefs.daily ?? {};
  let start = 0;
  for (const e of Object.values(log[today] ?? {})) start += Math.max(0, e.l - e.s);
  plugin.sprint = { start: Date.now(), minutes, target, startDay: today, startWords: start };
  plugin.prefs.sprintMinutes = minutes;
  plugin.prefs.sprintTarget = target;
  void plugin.saveSettings();
  new import_obsidian25.Notice(`Sprint started: ${minutes} min${target ? `, ${target} words` : ""}. Go!`);
  plugin.sprintTick();
}
function finishSprint(plugin, early) {
  const sp = plugin.sprint;
  if (!sp) return;
  if (plugin.target) plugin.refresh();
  plugin.sprint = null;
  const words2 = sprintWords(plugin.prefs.daily ?? {}, sp, dayKey(/* @__PURE__ */ new Date()));
  const elapsed = Math.min(sp.minutes, (Date.now() - sp.start) / 6e4);
  const rec = { start: new Date(sp.start).toISOString(), minutes: sp.minutes, elapsed, target: sp.target, words: words2 };
  const best = (plugin.prefs.sprints ?? []).reduce((a, r) => Math.max(a, r.words), 0);
  if (elapsed >= 1 || words2 > 0) {
    plugin.prefs.sprints = [...plugin.prefs.sprints ?? [], rec].slice(-200);
    void plugin.saveSettings();
  }
  plugin.statusEl?.setText("");
  new SprintSummaryModal(plugin.app, rec, best, early).open();
  plugin.renderPanels();
  plugin.habitViews().forEach((v) => v.render());
}
function sprintTick(plugin) {
  const sp = plugin.sprint;
  if (!sp) return;
  const left = sp.start + sp.minutes * 6e4 - Date.now();
  if (left <= 0) {
    plugin.finishSprint(false);
    return;
  }
  const words2 = sprintWords(plugin.prefs.daily ?? {}, sp, dayKey(/* @__PURE__ */ new Date()));
  const text2 = `Sprint ${fmtClock(left)} \xB7 ${words2}${sp.target ? `/${sp.target}` : ""} words`;
  plugin.statusEl?.setText(text2);
  for (const el of [...plugin.panels().map((p) => p.contentEl), ...plugin.habitViews().map((v) => v.contentEl)]) {
    el.querySelectorAll(".at-sprint-clock").forEach((c) => c.setText(fmtClock(left)));
    el.querySelectorAll(".at-sprint-words").forEach((c) => c.setText(`${words2}${sp.target ? ` / ${sp.target}` : ""}`));
  }
}
function habitSummary(plugin) {
  const log = plugin.prefs.daily ?? {};
  const today = dayKey(/* @__PURE__ */ new Date());
  let t2 = 0;
  for (const e of Object.values(log[today] ?? {})) t2 += Math.max(0, e.l - e.s);
  const st = streaks(log, today, plugin.prefs.dailyGoal);
  return { goal: plugin.prefs.dailyGoal, today: t2, streak: st.current, todayDone: st.todayDone };
}
function todayWords(plugin, path) {
  const day = (plugin.prefs.daily || {})[todayKey()] || {};
  let total = 0;
  for (const e2 of Object.values(day)) total += e2.l - e2.s;
  const e = day[path];
  return { total, note: e ? e.l - e.s : 0 };
}

// src/screenplay/actions.ts
var import_obsidian26 = require("obsidian");
function lineRange(plugin, n) {
  const ed = plugin.target && plugin.target.editor;
  if (!ed) return { from: 0, to: 0 };
  const from = ed.posToOffset({ line: n, ch: 0 });
  return { from, to: from + ed.getLine(n).length };
}
function formatLine(plugin, editor, kind) {
  const c = editor.getCursor();
  const n = c.line;
  const t2 = editor.getLine(n);
  const core = t2.trim().replace(/^[.!@>~]\s*/, "").replace(/\s*<\s*$/, "").replace(/\^\s*$/, "");
  let out = core, needBlankBefore = true, needBlankAfter = false;
  const up = (s) => s.toUpperCase();
  if (kind === "scene") {
    out = core ? SP_SCENE.test(core) ? up(core) : up("INT. " + core) : "INT. ";
    needBlankAfter = !!core;
  } else if (kind === "character") {
    out = up(core);
  } else if (kind === "transition") {
    out = up(core || "CUT TO:");
    if (!/(TO|A):$/.test(out) && !SP_TRANS_WORDS.test(out)) out = "> " + out;
    needBlankAfter = true;
  } else if (kind === "centered") {
    out = "> " + (core || "THE END") + " <";
    needBlankAfter = true;
  } else if (kind === "paren") {
    out = "(" + core.replace(/^\(|\)$/g, "") + ")";
    needBlankBefore = false;
  } else if (kind === "action") {
    out = isUpperLine(core) || SP_SCENE.test(core) ? "!" + core : core;
  }
  const prevBlank = n === 0 || !editor.getLine(n - 1).trim();
  const nextBlank = n >= editor.lastLine() || !editor.getLine(n + 1).trim();
  const pre = needBlankBefore && !prevBlank ? "\n" : "";
  const post = needBlankAfter && !nextBlank ? "\n" : "";
  editor.replaceRange(pre + out + post, { line: n, ch: 0 }, { line: n, ch: t2.length });
  const ln = n + (pre ? 1 : 0);
  editor.setCursor({ line: ln, ch: kind === "paren" ? out.length - 1 : out.length });
}
function scriptsFolder(plugin) {
  return (0, import_obsidian26.normalizePath)(plugin.prefs.scriptsFolder || SCRIPTS_FOLDER_DEFAULT);
}
async function createScript(plugin, title, opts) {
  const folder = plugin.scriptsFolder();
  if (!(plugin.app.vault.getAbstractFileByPath(folder) instanceof import_obsidian26.TFolder)) await plugin.app.vault.createFolder(folder);
  const safe = title.replace(/[\\/:*?"<>|#^[\]]/g, "").trim() || "Untitled script";
  let path = `${folder}/${safe}.md`, k = 2;
  while (plugin.app.vault.getAbstractFileByPath(path)) path = `${folder}/${safe} ${k++}.md`;
  const d = /* @__PURE__ */ new Date(), p = (x) => String(x).padStart(2, "0");
  const date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  const guide = !!plugin.app.metadataCache.getFirstLinkpathDest("Screenplay Format Guide", "");
  return await plugin.app.vault.create(path, scriptTemplate({ title, date, author: plugin.prefs.authorName, guide, ...opts || {} }));
}
function newScript(plugin) {
  new TextPrompt(plugin.app, "New script", "", (title) => {
    void (async () => {
      const f = await plugin.createScript(title, {});
      await plugin.app.workspace.getLeaf(false).openFile(f);
    })();
  }, "Created in " + plugin.scriptsFolder()).open();
}
async function adaptStory(plugin) {
  const v = plugin.target || plugin.app.workspace.getActiveViewOfType(import_obsidian26.MarkdownView);
  if (!v || !v.file) {
    new import_obsidian26.Notice("Open the story you want to adapt first.");
    return;
  }
  const story = v.file;
  const text2 = v.editor ? v.editor.getValue() : await plugin.app.vault.read(story);
  const lang = baseLang(plugin.noteLang(story).code === "auto" ? detectLang(text2) : plugin.noteLang(story).code);
  const suffix = lang === "es" ? " (guion)" : " (screenplay)";
  new TextPrompt(plugin.app, "Adapt into a script", story.basename + suffix, (title) => {
    void (async () => {
      const f = await plugin.createScript(title, { adapted: story.basename, lang, format: "short" });
      const leaf = plugin.app.workspace.getLeaf("split", "vertical");
      await leaf.openFile(f);
      new import_obsidian26.Notice("Script created next to the story. Turn each scene of the story into a scene heading, action and dialogue.");
    })();
  }, "The script opens to the right of the story so you can adapt it scene by scene.").open();
}
async function exportFountain(plugin) {
  const v = plugin.target || plugin.app.workspace.getActiveViewOfType(import_obsidian26.MarkdownView);
  if (!v || !v.file) {
    new import_obsidian26.Notice("Open a script first.");
    return;
  }
  const text2 = v.editor ? v.editor.getValue() : await plugin.app.vault.read(v.file);
  if (!isScriptText(text2)) {
    new import_obsidian26.Notice("This note isn't a script (type: script).");
    return;
  }
  const fm = (plugin.app.metadataCache.getFileCache(v.file) || {}).frontmatter || {};
  const out = toFountain(text2, Object.assign({ title: v.file.basename }, fm));
  const dir = v.file.parent && v.file.parent.path !== "/" ? v.file.parent.path + "/" : "";
  const path = (0, import_obsidian26.normalizePath)(`${dir}Exports/${v.file.basename}.fountain`);
  const folder = path.slice(0, path.lastIndexOf("/"));
  if (folder && !(plugin.app.vault.getAbstractFileByPath(folder) instanceof import_obsidian26.TFolder)) await plugin.app.vault.createFolder(folder);
  const existing = plugin.app.vault.getAbstractFileByPath(path);
  if (existing instanceof import_obsidian26.TFile) await plugin.app.vault.process(existing, () => out);
  else await plugin.app.vault.create(path, out);
  new import_obsidian26.Notice(`Exported to ${path}. Open it in Final Draft, Fade In, Highland, WriterSolo or Beat.`, 8e3);
}
async function toggleScriptMode(plugin) {
  const v = plugin.target || plugin.app.workspace.getActiveViewOfType(import_obsidian26.MarkdownView);
  if (!v || !v.file) return;
  const on = !isScriptText(v.editor ? v.editor.getValue() : "");
  await plugin.app.fileManager.processFrontMatter(v.file, (fm) => {
    const existingCls = Array.isArray(fm.cssclasses) ? fm.cssclasses : typeof fm.cssclasses === "string" ? [fm.cssclasses] : [];
    const cls = existingCls.map((x) => String(x));
    if (on) {
      fm.type = "script";
      if (!cls.includes("screenplay")) cls.push("screenplay");
      fm.cssclasses = cls;
    } else {
      if (typeof fm.type === "string" && fm.type.toLowerCase() === "script") delete fm.type;
      const c2 = cls.filter((x) => x !== "screenplay");
      if (c2.length) fm.cssclasses = c2;
      else delete fm.cssclasses;
    }
  });
  new import_obsidian26.Notice(on ? "Script formatting on for this note." : "Script formatting off.");
  window.setTimeout(() => plugin.refresh(), 300);
}

// src/export/actions.ts
var import_obsidian29 = require("obsidian");

// src/modals/export-manuscript.ts
var import_obsidian27 = require("obsidian");

// src/export/epub.ts
var esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function runs(rs) {
  return rs.map((r) => {
    let t2 = esc(r.text);
    if (r.i) t2 = `<em>${t2}</em>`;
    if (r.b) t2 = `<strong>${t2}</strong>`;
    return t2;
  }).join("");
}
function page(title, lang, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}" lang="${lang}">
<head><meta charset="UTF-8"/><title>${esc(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
${body}
</body>
</html>`;
}
var CSS = `body { margin: 0 5%; line-height: 1.5; }
h1.title { text-align: center; margin-top: 30%; font-weight: normal; }
p.subtitle, p.byline { text-align: center; text-indent: 0; }
h2 { text-align: center; margin: 2em 0 1em; }
h3, h4, h5, h6 { text-align: center; margin: 1.5em 0 0.5em; }
p { margin: 0; text-indent: 1.5em; }
p.first, p.center, p.right, p.break { text-indent: 0; }
p.center, p.break { text-align: center; }
p.right { text-align: right; }
p.justify { text-align: justify; }
p.break { margin: 1em 0; }
blockquote { margin: 0 0 0 2em; }
p.verse { text-indent: -2em; padding-left: 2em; text-align: left; }
div.stanza { margin-bottom: 1em; }
p.end { text-align: center; text-indent: 0; margin-top: 2em; }
`;
function bookId(seed) {
  let h1 = 2166136261, h2 = 16777619;
  for (let i = 0; i < seed.length; i++) {
    h1 = Math.imul(h1 ^ seed.charCodeAt(i), 16777619) >>> 0;
    h2 = Math.imul(h2 + seed.charCodeAt(i), 2246822519) >>> 0;
  }
  const hex = (h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")).padEnd(32, "0");
  return `urn:uuid:${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
function chapters(ms) {
  const headings = ms.blocks.filter((b) => b.kind === "heading");
  const chapterHeads = headings.some((h) => h.chapter) ? headings.filter((h) => h.chapter) : headings.filter((h) => h.level === Math.min(...headings.map((x) => x.level)));
  const out = [];
  let cur = { title: ms.title, blocks: [] };
  for (const b of ms.blocks) {
    if (b.kind === "heading" && chapterHeads.includes(b)) {
      if (cur.blocks.length) out.push(cur);
      cur = { title: b.runs.map((r) => r.text).join(""), blocks: [b] };
    } else cur.blocks.push(b);
  }
  if (cur.blocks.length) out.push(cur);
  return out;
}
function chapterBody(blocks, o) {
  const out = [];
  let firstPara = true, inStanza = false;
  const closeStanza = () => {
    if (inStanza) {
      out.push("</div>");
      inStanza = false;
    }
  };
  for (const b of blocks) {
    if (b.kind !== "verse" && b.kind !== "stanza") closeStanza();
    switch (b.kind) {
      case "heading": {
        const lvl = b.chapter ? 2 : Math.min(6, Math.max(2, b.level + 1));
        out.push(`<h${lvl}>${runs(b.runs)}</h${lvl}>`);
        firstPara = true;
        break;
      }
      case "break":
        out.push(`<p class="break">${esc(breakText(o)) || "&#160;"}</p>`);
        firstPara = true;
        break;
      case "stanza":
        closeStanza();
        break;
      case "verse": {
        if (!inStanza) {
          out.push('<div class="stanza">');
          inStanza = true;
        }
        const pad2 = b.indent ? `<span style="padding-left:${(b.indent * 0.5).toFixed(1)}em"></span>` : "";
        out.push(`<p class="verse${b.align === "center" || b.align === "right" ? " " + b.align : ""}">${pad2}${runs(b.runs)}</p>`);
        break;
      }
      case "para": {
        const cls = b.align === "center" || b.align === "right" ? b.align : b.align === "justify" && justifies(o) ? "justify" : firstPara ? "first" : "";
        const p = `<p${cls ? ` class="${cls}"` : ""}>${runs(b.runs)}</p>`;
        out.push(b.quote ? `<blockquote>${p}</blockquote>` : p);
        firstPara = false;
        break;
      }
    }
  }
  closeStanza();
  return out.join("\n");
}
function buildEpub(ms, o) {
  const L = labels(o.lang);
  const lang = o.lang === "es" ? "es" : "en";
  const contest = o.layout === "contest";
  const creator = contest ? o.pseudonym.trim() : o.author.trim();
  const t2 = titleLines(ms, o);
  const chs = chapters(ms);
  const titleBody = [
    `<h1 class="title">${esc(ms.title)}</h1>`,
    t2.subtitle ? `<p class="subtitle"><em>${runs(t2.subtitle.map((r) => ({ ...r, i: false })))}</em></p>` : "",
    contest && o.pseudonym.trim() ? `<p class="byline">${esc(`${L.pseudonym}: ${o.pseudonym.trim()}`)}</p>` : "",
    t2.byline ? `<p class="byline">${esc(t2.byline)}</p>` : ""
  ].join("\n");
  const files = [{ name: "title.xhtml", body: page(ms.title, lang, `<section epub:type="titlepage">
${titleBody}
</section>`) }];
  chs.forEach((c, k) => {
    const last = k === chs.length - 1;
    files.push({ name: `ch${k + 1}.xhtml`, body: page(c.title, lang, `<section epub:type="chapter">
${chapterBody(c.blocks, o)}${last ? `
<p class="end">${esc(L.end)}</p>` : ""}
</section>`) });
  });
  const navList = chs.map((c, k) => `<li><a href="ch${k + 1}.xhtml">${esc(c.title)}</a></li>`).join("\n");
  const nav = page(ms.title, lang, `<nav epub:type="toc" id="toc"><h2>${lang === "es" ? "\xCDndice" : "Contents"}</h2><ol>
<li><a href="title.xhtml">${esc(ms.title)}</a></li>
${navList}
</ol></nav>`);
  const id = bookId(ms.title + "|" + creator);
  const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="${id}"/></head>
<docTitle><text>${esc(ms.title)}</text></docTitle><navMap>
${["title.xhtml", ...chs.map((_, k) => `ch${k + 1}.xhtml`)].map((src, k) => `<navPoint id="n${k}" playOrder="${k + 1}"><navLabel><text>${esc(k === 0 ? ms.title : chs[k - 1].title)}</text></navLabel><content src="${src}"/></navPoint>`).join("\n")}
</navMap></ncx>`;
  const modified = (/* @__PURE__ */ new Date()).toISOString().replace(/\.\d+Z$/, "Z");
  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="${lang}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="bookid">${id}</dc:identifier>
<dc:title>${esc(ms.title)}</dc:title>
${creator ? `<dc:creator>${esc(creator)}</dc:creator>` : ""}
<dc:language>${lang}</dc:language>
<meta property="dcterms:modified">${modified}</meta>
</metadata>
<manifest>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
<item id="css" href="style.css" media-type="text/css"/>
${files.map((f, k) => `<item id="p${k}" href="${f.name}" media-type="application/xhtml+xml"/>`).join("\n")}
</manifest>
<spine toc="ncx">
${files.map((_, k) => `<itemref idref="p${k}"/>`).join("\n")}
</spine>
</package>`;
  const container = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`;
  const enc = new TextEncoder();
  return zip([
    { name: "mimetype", data: enc.encode("application/epub+zip") },
    { name: "META-INF/container.xml", data: enc.encode(container) },
    { name: "OEBPS/content.opf", data: enc.encode(opf) },
    { name: "OEBPS/nav.xhtml", data: enc.encode(nav) },
    { name: "OEBPS/toc.ncx", data: enc.encode(ncx) },
    { name: "OEBPS/style.css", data: enc.encode(CSS) },
    ...files.map((f) => ({ name: `OEBPS/${f.name}`, data: enc.encode(f.body) }))
  ]);
}

// src/export/widths.ts
var WIDTHS = {
  "Times-Roman": [250, 333, 408, 500, 500, 833, 778, 180, 333, 333, 500, 564, 250, 333, 250, 278, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 278, 278, 564, 564, 564, 444, 921, 722, 667, 667, 722, 611, 556, 722, 722, 333, 389, 722, 611, 889, 722, 722, 556, 722, 667, 556, 611, 722, 722, 944, 722, 722, 611, 333, 278, 333, 469, 500, 333, 444, 500, 444, 500, 444, 333, 500, 500, 278, 278, 500, 278, 778, 500, 500, 500, 500, 333, 389, 278, 500, 500, 722, 500, 500, 444, 480, 200, 480, 541, 761, 500, 0, 333, 500, 444, 1e3, 500, 500, 333, 1e3, 556, 333, 889, 0, 611, 0, 0, 333, 333, 444, 444, 350, 500, 1e3, 333, 980, 389, 333, 722, 0, 444, 722, 250, 333, 500, 500, 500, 500, 200, 500, 333, 760, 276, 500, 564, 333, 760, 333, 400, 564, 300, 300, 333, 500, 453, 250, 333, 300, 310, 500, 750, 750, 750, 444, 722, 722, 722, 722, 722, 722, 889, 667, 611, 611, 611, 611, 333, 333, 333, 333, 722, 722, 722, 722, 722, 722, 722, 564, 722, 722, 722, 722, 722, 722, 556, 500, 444, 444, 444, 444, 444, 444, 667, 444, 444, 444, 444, 444, 278, 278, 278, 278, 500, 500, 500, 500, 500, 500, 500, 564, 500, 500, 500, 500, 500, 500, 500, 500],
  "Times-Bold": [250, 333, 555, 500, 500, 1e3, 833, 278, 333, 333, 500, 570, 250, 333, 250, 278, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 333, 333, 570, 570, 570, 500, 930, 722, 667, 722, 722, 667, 611, 778, 778, 389, 500, 778, 667, 944, 722, 778, 611, 778, 722, 556, 667, 722, 722, 1e3, 722, 722, 667, 333, 278, 333, 581, 500, 333, 500, 556, 444, 556, 444, 333, 500, 556, 278, 333, 556, 278, 833, 556, 500, 556, 556, 444, 389, 333, 556, 500, 722, 500, 500, 444, 394, 220, 394, 520, 761, 500, 0, 333, 500, 500, 1e3, 500, 500, 333, 1e3, 556, 333, 1e3, 0, 667, 0, 0, 333, 333, 500, 500, 350, 500, 1e3, 333, 1e3, 389, 333, 722, 0, 444, 722, 250, 333, 500, 500, 500, 500, 220, 500, 333, 747, 300, 500, 570, 333, 747, 333, 400, 570, 300, 300, 333, 556, 540, 250, 333, 300, 330, 500, 750, 750, 750, 500, 722, 722, 722, 722, 722, 722, 1e3, 722, 667, 667, 667, 667, 389, 389, 389, 389, 722, 722, 778, 778, 778, 778, 778, 570, 778, 722, 722, 722, 722, 722, 611, 556, 500, 500, 500, 500, 500, 500, 722, 444, 444, 444, 444, 444, 278, 278, 278, 278, 500, 556, 500, 500, 500, 500, 500, 570, 500, 556, 556, 556, 556, 500, 556, 500],
  "Times-Italic": [250, 333, 420, 500, 500, 833, 778, 214, 333, 333, 500, 675, 250, 333, 250, 278, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 333, 333, 675, 675, 675, 500, 920, 611, 611, 667, 722, 611, 611, 722, 722, 333, 444, 667, 556, 833, 667, 722, 611, 722, 611, 500, 556, 722, 611, 833, 611, 556, 556, 389, 278, 389, 422, 500, 333, 500, 500, 444, 500, 444, 278, 500, 500, 278, 278, 444, 278, 722, 500, 500, 500, 500, 389, 389, 278, 500, 444, 667, 444, 444, 389, 400, 275, 400, 541, 761, 500, 0, 333, 500, 556, 889, 500, 500, 333, 1e3, 500, 333, 944, 0, 556, 0, 0, 333, 333, 556, 556, 350, 500, 889, 333, 980, 389, 333, 667, 0, 389, 556, 250, 389, 500, 500, 500, 500, 275, 500, 333, 760, 276, 500, 675, 333, 760, 333, 400, 675, 300, 300, 333, 500, 523, 250, 333, 300, 310, 500, 750, 750, 750, 500, 611, 611, 611, 611, 611, 611, 889, 667, 611, 611, 611, 611, 333, 333, 333, 333, 722, 667, 722, 722, 722, 722, 722, 675, 722, 722, 722, 722, 722, 556, 611, 500, 500, 500, 500, 500, 500, 500, 667, 444, 444, 444, 444, 444, 278, 278, 278, 278, 500, 500, 500, 500, 500, 500, 500, 675, 500, 500, 500, 500, 500, 444, 500, 444],
  "Times-BoldItalic": [250, 389, 555, 500, 500, 833, 778, 278, 333, 333, 500, 570, 250, 333, 250, 278, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 333, 333, 570, 570, 570, 500, 832, 667, 667, 667, 722, 667, 667, 722, 778, 389, 500, 667, 611, 889, 722, 722, 611, 722, 667, 556, 611, 722, 667, 889, 667, 611, 611, 333, 278, 333, 570, 500, 333, 500, 500, 444, 500, 444, 333, 500, 556, 278, 278, 500, 278, 778, 556, 500, 500, 500, 389, 389, 278, 556, 444, 667, 500, 444, 389, 348, 220, 348, 570, 761, 500, 0, 333, 500, 500, 1e3, 500, 500, 333, 1e3, 556, 333, 944, 0, 611, 0, 0, 333, 333, 500, 500, 350, 500, 1e3, 333, 1e3, 389, 333, 722, 0, 389, 611, 250, 389, 500, 500, 500, 500, 220, 500, 333, 747, 266, 500, 606, 333, 747, 333, 400, 570, 300, 300, 333, 576, 500, 250, 333, 300, 300, 500, 750, 750, 750, 500, 667, 667, 667, 667, 667, 667, 944, 667, 667, 667, 667, 667, 389, 389, 389, 389, 722, 722, 722, 722, 722, 722, 722, 570, 722, 722, 722, 722, 722, 611, 611, 500, 500, 500, 500, 500, 500, 500, 722, 444, 444, 444, 444, 444, 278, 278, 278, 278, 500, 556, 500, 500, 500, 500, 500, 570, 500, 556, 556, 556, 556, 444, 500, 444],
  "Helvetica": [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 761, 556, 0, 222, 556, 333, 1e3, 556, 556, 333, 1e3, 667, 333, 1e3, 0, 611, 0, 0, 222, 222, 333, 333, 350, 556, 1e3, 333, 1e3, 500, 333, 944, 0, 500, 667, 278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611, 667, 667, 667, 667, 667, 667, 1e3, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278, 556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500],
  "Helvetica-Bold": [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 761, 556, 0, 278, 556, 500, 1e3, 556, 556, 333, 1e3, 667, 333, 1e3, 0, 611, 0, 0, 278, 278, 500, 500, 350, 556, 1e3, 333, 1e3, 556, 333, 944, 0, 500, 667, 278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611, 722, 722, 722, 722, 722, 722, 1e3, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278, 611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556],
  "Helvetica-Oblique": [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 761, 556, 0, 222, 556, 333, 1e3, 556, 556, 333, 1e3, 667, 333, 1e3, 0, 611, 0, 0, 222, 222, 333, 333, 350, 556, 1e3, 333, 1e3, 500, 333, 944, 0, 500, 667, 278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611, 667, 667, 667, 667, 667, 667, 1e3, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278, 556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500],
  "Helvetica-BoldOblique": [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 761, 556, 0, 278, 556, 500, 1e3, 556, 556, 333, 1e3, 667, 333, 1e3, 0, 611, 0, 0, 278, 278, 500, 500, 350, 556, 1e3, 333, 1e3, 556, 333, 944, 0, 500, 667, 278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611, 722, 722, 722, 722, 722, 722, 1e3, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278, 611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556]
};

// src/export/layout.ts
var PAGE_PT = { letter: { w: 612, h: 792 }, a4: { w: 595.28, h: 841.89 } };
var MARGIN2 = 72;
var INDENT2 = 36;
var SIZE = 12;
var FONT_FAMILY = {
  times: { r: "Times-Roman", b: "Times-Bold", i: "Times-Italic", bi: "Times-BoldItalic" },
  arial: { r: "Helvetica", b: "Helvetica-Bold", i: "Helvetica-Oblique", bi: "Helvetica-BoldOblique" },
  courier: { r: "Courier", b: "Courier-Bold", i: "Courier-Oblique", bi: "Courier-BoldOblique" }
};
var CP1252 = {
  8364: 128,
  8218: 130,
  402: 131,
  8222: 132,
  8230: 133,
  8224: 134,
  8225: 135,
  710: 136,
  8240: 137,
  352: 138,
  8249: 139,
  338: 140,
  381: 142,
  8216: 145,
  8217: 146,
  8220: 147,
  8221: 148,
  8226: 149,
  8211: 150,
  8212: 151,
  732: 152,
  8482: 153,
  353: 154,
  8250: 155,
  339: 156,
  382: 158,
  376: 159
};
var FALLBACK = { "\u2015": "\u2014", "\u2012": "\u2013", "\u2011": "-", "\xA0": " ", "\u202F": " ", "\u2009": " ", "\u2032": "'", "\u2033": '"', "\u2212": "-" };
function winAnsi(s) {
  const out = [];
  for (const ch0 of s) {
    const ch = FALLBACK[ch0] ?? ch0;
    const c = ch.codePointAt(0) ?? 63;
    if (c < 128 || c >= 160 && c <= 255) out.push(c);
    else out.push(CP1252[c] ?? 63);
  }
  return out;
}
function textWidth(s, fontName, size) {
  const w = WIDTHS[fontName];
  let total = 0;
  for (const code of winAnsi(s)) total += w ? code >= 32 ? w[code - 32] || 0 : 0 : 600;
  return total * size / 1e3;
}
var fontKey = (r) => r.b && r.i ? "bi" : r.b ? "b" : r.i ? "i" : "r";
function toWords(runs3, fonts) {
  const out = [];
  let cur = null;
  for (const r of runs3) {
    const f = fontKey(r);
    for (const tok of r.text.split(/( +)/)) {
      if (!tok) continue;
      if (/^ +$/.test(tok)) {
        if (cur) {
          cur.spaceAfter = true;
          cur = null;
        }
        continue;
      }
      if (!cur) {
        cur = { pieces: [], width: 0, spaceAfter: false };
        out.push(cur);
      }
      cur.pieces.push({ text: tok, font: f });
      cur.width += textWidth(tok, fonts[f], SIZE);
    }
  }
  return out;
}
function layoutManuscript(ms, o) {
  const L = labels(o.lang);
  const { w: W, h: H } = PAGE_PT[o.page];
  const fonts = FONT_FAMILY[o.font];
  const lineH = SIZE * 1.15 * o.spacing, singleH = SIZE * 1.15;
  const textW = W - 2 * MARGIN2, bottom = H - MARGIN2;
  const contest = o.layout === "contest";
  const pages = [{ lines: [] }];
  let y = MARGIN2;
  const page2 = () => pages[pages.length - 1];
  const newPage = () => {
    pages.push({ lines: [] });
    y = MARGIN2;
  };
  const spaceW = (f) => textWidth(" ", fonts[f], SIZE);
  const paragraph = (runs3, opt) => {
    const h = opt.height ?? lineH;
    const left = MARGIN2 + (opt.left ?? 0);
    const width = textW - (opt.left ?? 0);
    const ws = toWords(runs3, fonts);
    if (!ws.length) {
      y += h;
      return;
    }
    const lines = [];
    let cur = [], curW = 0, first = true;
    for (const w of ws) {
      const avail = width - (first ? opt.indent ?? 0 : opt.hang ?? 0);
      const add = (cur.length ? spaceW(cur[cur.length - 1].pieces[cur[cur.length - 1].pieces.length - 1].font) : 0) + w.width;
      if (cur.length && curW + add > avail) {
        lines.push(cur);
        cur = [];
        curW = 0;
        first = false;
      }
      curW += cur.length ? add : w.width;
      cur.push(w);
    }
    if (cur.length) lines.push(cur);
    if (opt.keepWithNext && y + h * (lines.length + 1) > bottom && page2().lines.length) newPage();
    lines.forEach((lw, k) => {
      if (y + h > bottom + 0.01 && page2().lines.length) newPage();
      const indent = k === 0 ? opt.indent ?? 0 : opt.hang ?? 0;
      const avail = width - indent;
      const natural = lw.reduce((t3, w, j) => t3 + w.width + (j < lw.length - 1 ? spaceW(w.pieces[w.pieces.length - 1].font) : 0), 0);
      const gaps = lw.length - 1;
      const last = k === lines.length - 1;
      let x = left + indent, wordSpace = 0;
      if (opt.align === "center") x = left + (width - natural) / 2;
      else if (opt.align === "right") x = left + width - natural;
      else if (opt.align === "justify" && !last && gaps > 0) wordSpace = (avail - natural) / gaps;
      const segs = [];
      lw.forEach((w, j) => {
        for (const p of w.pieces) {
          const pw = textWidth(p.text, fonts[p.font], SIZE);
          const prev = segs[segs.length - 1];
          if (prev && prev.font === p.font && prev.x + prev.width === x) {
            prev.text += p.text;
            prev.width += pw;
          } else segs.push({ text: p.text, font: p.font, x, width: pw });
          x += pw;
        }
        if (j < lw.length - 1) {
          const f = w.pieces[w.pieces.length - 1].font;
          const sw = spaceW(f) + wordSpace;
          const prev = segs[segs.length - 1];
          prev.text += " ";
          prev.width += sw;
          x += sw;
        }
      });
      page2().lines.push({ y, segments: segs, wordSpace });
      y += h;
    });
  };
  const plain = (s) => [{ text: s }];
  const t2 = titleLines(ms, o);
  const count = `${L.about} ${roundedWords(ms.words).toLocaleString(o.lang === "es" ? "es-MX" : "en-US")} ${L.words}`;
  const titleBlock2 = () => {
    paragraph(plain(ms.title), { align: "center", keepWithNext: true });
    if (t2.subtitle) paragraph(t2.subtitle, { align: "center" });
    if (contest && o.pseudonym.trim()) paragraph(plain(`${L.pseudonym}: ${o.pseudonym.trim()}`), { align: "center" });
    if (t2.byline) paragraph(plain(t2.byline), { align: "center" });
  };
  if (!contest) {
    const cw = textWidth(count, fonts.r, SIZE);
    page2().lines.push({ y, wordSpace: 0, segments: [
      ...o.author.trim() ? [{ text: o.author.trim(), font: "r", x: MARGIN2, width: textWidth(o.author.trim(), fonts.r, SIZE) }] : [],
      { text: count, font: "r", x: W - MARGIN2 - cw, width: cw }
    ] });
    y += singleH;
    for (const line of o.contact.split("\n").map((x) => x.trim()).filter(Boolean)) paragraph(plain(line), { align: "left", height: singleH });
  }
  if (o.coverPage) {
    y = Math.max(y + lineH, H / 2 - 2 * lineH);
    titleBlock2();
    if (contest) paragraph(plain(count), { align: "center" });
    newPage();
  } else {
    if (!contest) y += lineH;
    titleBlock2();
    y += lineH;
  }
  const levels = ms.blocks.flatMap((b) => b.kind === "heading" && !b.chapter ? [b.level] : []);
  const topLevel = levels.length ? Math.min(...levels) : 9;
  const indentW = textWidth("n", fonts.r, SIZE);
  let started = false;
  for (const b of ms.blocks) {
    switch (b.kind) {
      case "break": {
        const sym = breakText(o);
        const verse = ms.blocks.some((x) => x.kind === "verse");
        if (verse) y += singleH / 2;
        if (sym) paragraph(plain(sym), { align: "center" });
        else y += lineH;
        if (verse) y += singleH / 2;
        break;
      }
      case "stanza":
        y += singleH;
        break;
      case "heading": {
        const breakBefore = b.chapter || o.chapterBreaks && b.level === topLevel;
        if (breakBefore && started && page2().lines.length) newPage();
        if (b.chapter && started) y += lineH;
        paragraph(b.runs.map((r) => ({ ...r, b: true })), { align: b.align === "justify" ? "center" : b.align, keepWithNext: true });
        if (b.chapter) y += lineH / 2;
        started = true;
        break;
      }
      case "verse": {
        const indent = b.indent * indentW;
        paragraph(b.runs, { align: b.align === "justify" ? "left" : b.align, indent, hang: indent + 2 * SIZE, height: singleH });
        started = true;
        break;
      }
      case "para": {
        const align = b.align === "justify" ? justifies(o) ? "justify" : "left" : b.align;
        if (b.quote) paragraph(b.runs, { align, left: INDENT2 });
        else paragraph(b.runs, { align, indent: align === "center" || align === "right" ? 0 : INDENT2 });
        started = true;
        break;
      }
    }
  }
  paragraph(plain(L.end), { align: "center" });
  return { width: W, height: H, size: SIZE, fonts, pages };
}
function pageMarks(o, title, pageNo, layout) {
  if (o.layout === "contest") {
    const t3 = String(pageNo);
    return { text: t3, x: (layout.width - textWidth(t3, layout.fonts.r, SIZE)) / 2, y: layout.height - MARGIN2 / 2 - SIZE };
  }
  if (pageNo === 1) return null;
  const surname = o.author.trim().split(/\s+/).pop() || "";
  const t2 = [surname, title, String(pageNo)].filter(Boolean).join(" / ");
  return { text: t2, x: layout.width - MARGIN2 - textWidth(t2, layout.fonts.r, SIZE), y: MARGIN2 / 2 };
}

// src/export/pdf.ts
var FONT_RES = { r: "F1", b: "F2", i: "F3", bi: "F4" };
function pdfString(s) {
  let out = "(";
  for (const c of winAnsi(s)) {
    if (c === 40 || c === 41 || c === 92) out += "\\" + String.fromCharCode(c);
    else if (c < 32 || c > 126) out += "\\" + c.toString(8).padStart(3, "0");
    else out += String.fromCharCode(c);
  }
  return out + ")";
}
var num = (n) => (Math.round(n * 100) / 100).toString();
function infoString(s) {
  let hex = "FEFF";
  for (let i = 0; i < s.length; i++) hex += s.charCodeAt(i).toString(16).padStart(4, "0").toUpperCase();
  return `<${hex}>`;
}
function buildPdf(layout, o, title) {
  const objs = [];
  const add = (body) => {
    objs.push(body);
    return objs.length;
  };
  const catalogId = add("");
  const pagesId = add("");
  const fontIds = ["r", "b", "i", "bi"].map((k) => add(`<< /Type /Font /Subtype /Type1 /BaseFont /${layout.fonts[k]} /Encoding /WinAnsiEncoding >>`));
  const creator = o.layout === "contest" ? o.pseudonym.trim() : o.author.trim();
  const infoId = add(`<< /Title ${infoString(title)}${creator ? ` /Author ${infoString(creator)}` : ""} /Creator (Authors Toolbox) /Producer (Authors Toolbox) >>`);
  const fontRes = `<< ${["r", "b", "i", "bi"].map((k, j) => `/${FONT_RES[k]} ${fontIds[j]} 0 R`).join(" ")} >>`;
  const pageIds = [];
  const size = layout.size;
  layout.pages.forEach((p, idx) => {
    const ops = [];
    const text2 = (s, f, x, yTop, wordSpace = 0) => {
      const base = layout.height - yTop - size;
      ops.push(`BT /${FONT_RES[f]} ${size} Tf ${num(wordSpace)} Tw 1 0 0 1 ${num(x)} ${num(base)} Tm ${pdfString(s)} Tj ET`);
    };
    for (const line of p.lines) for (const s of line.segments) text2(s.text, s.font, s.x, line.y, line.wordSpace);
    const mark2 = pageMarks(o, title, idx + 1, layout);
    if (mark2) text2(mark2.text, "r", mark2.x, mark2.y);
    const stream = ops.join("\n");
    const contentId = add(`<< /Length ${stream.length} >>
stream
${stream}
endstream`);
    pageIds.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${num(layout.width)} ${num(layout.height)}] /Resources << /Font ${fontRes} >> /Contents ${contentId} 0 R >>`));
  });
  objs[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objs[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [];
  objs.forEach((body, k) => {
    offsets.push(out.length);
    out += `${k + 1} 0 obj
${body}
endobj
`;
  });
  const xref = out.length;
  out += `xref
0 ${objs.length + 1}
0000000000 65535 f 
`;
  for (const off of offsets) out += `${String(off).padStart(10, "0")} 00000 n 
`;
  out += `trailer
<< /Size ${objs.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>
startxref
${xref}
%%EOF
`;
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
  return bytes;
}

// src/export/text.ts
function buildText(ms, o) {
  const L = labels(o.lang);
  const t2 = titleLines(ms, o);
  const out = [ms.title];
  if (t2.subtitle) out.push(runsText(t2.subtitle));
  if (o.layout === "contest" && o.pseudonym.trim()) out.push(`${L.pseudonym}: ${o.pseudonym.trim()}`);
  if (t2.byline) out.push(t2.byline);
  out.push("");
  let verse = false;
  for (const b of ms.blocks) {
    if (b.kind === "verse") {
      out.push(" ".repeat(b.indent) + runsText(b.runs));
      verse = true;
      continue;
    }
    if (verse) {
      out.push("");
      verse = false;
    }
    if (b.kind === "stanza") continue;
    if (b.kind === "break") out.push(breakText(o) || "", "");
    else if (b.kind === "heading") out.push(runsText(b.runs).toUpperCase(), "");
    else out.push(runsText(b.runs), "");
  }
  if (verse) out.push("");
  out.push(L.end, "");
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

// src/modals/export-manuscript.ts
var FORMATS = [["docx", "Word"], ["pdf", "PDF"], ["epub", "EPUB"], ["txt", "Plain text"]];
var MAX_PREVIEW_PAGES = 40;
var ExportManuscriptModal = class extends import_obsidian27.Modal {
  constructor(app, host, target) {
    super(app);
    this.host = host;
    this.target = target;
    this.stopWatching = null;
    this.renderTimer = 0;
    this.contest = null;
    this.pseudonym = target.pseudonym?.trim() || host.prefs.exportPseudonym;
    if (target.contest) this.contest = host.contests?.().find((c) => c.path === target.contest) ?? null;
  }
  options() {
    const s = this.host.prefs;
    return {
      layout: s.exportLayout,
      font: s.exportFont,
      spacing: parseFloat(s.exportSpacing) || 2,
      page: s.exportPage,
      author: s.authorName,
      contact: s.exportContact,
      pseudonym: this.pseudonym,
      chapterBreaks: s.exportChapterBreaks,
      keepJustify: s.exportKeepJustify,
      sceneBreak: s.exportSceneBreak,
      coverPage: s.exportCoverPage,
      lang: this.target.lang
    };
  }
  formats() {
    return new Set(this.host.prefs.exportFormats.split(",").map((x) => x.trim()).filter(Boolean));
  }
  onOpen() {
    this.modalEl.addClass("at-export-modal");
    this.titleEl.setText(this.target.note ? "Export project" : "Export manuscript");
    this.stopWatching = watchWidth(this.contentEl);
    this.build();
  }
  onClose() {
    this.stopWatching?.();
    this.stopWatching = null;
    window.clearTimeout(this.renderTimer);
    this.contentEl.empty();
  }
  build() {
    this.contentEl.empty();
    const wrap = this.contentEl.createDiv({ cls: "at-export" });
    const left = wrap.createDiv({ cls: "at-export-opts" });
    const right = wrap.createDiv({ cls: "at-export-preview" });
    const s = this.host.prefs;
    const changed = () => {
      void this.host.saveSettings();
      this.updateRows();
      this.schedulePreview();
    };
    const names = Object.keys(s.exportPresets).sort((a, b) => a.localeCompare(b));
    const presetRow = new import_obsidian27.Setting(left).setName("Preset");
    if (names.length) {
      presetRow.addDropdown((d) => {
        d.addOption("", "Choose\u2026");
        for (const n of names) d.addOption(n, n);
        d.onChange((v) => {
          if (v) this.applyPreset(v);
        });
      });
      presetRow.addExtraButton((b) => b.setIcon("trash").setTooltip("Delete a preset").onClick(() => this.deletePreset()));
    } else presetRow.setDesc("Save the current options under a name, for example one per contest.");
    presetRow.addExtraButton((b) => b.setIcon("save").setTooltip("Save these options as a preset").onClick(() => this.savePreset()));
    const contests = this.host.contests?.() ?? [];
    if (contests.length && this.target.path) {
      new import_obsidian27.Setting(left).setName("Check for a contest").setDesc("Compares this story with a contest note: length, anonymity, language, layout and deadline.").addDropdown((d) => {
        d.addOption("", "None");
        for (const c of contests) d.addOption(c.path, c.name);
        d.setValue(this.contest?.path ?? "");
        d.onChange((v) => {
          this.contest = contests.find((c) => c.path === v) ?? null;
          this.renderChecks();
        });
      });
      this.checksEl = left.createDiv({ cls: "at-pf" });
    } else this.checksEl = createDiv({ cls: "at-pf" });
    new import_obsidian27.Setting(left).setName("Layout").addDropdown((d) => d.addOptions({ manuscript: "Standard manuscript", contest: "Contest (anonymous)" }).setValue(s.exportLayout).onChange((v) => {
      s.exportLayout = v === "contest" ? "contest" : "manuscript";
      changed();
    }));
    this.nameRow = new import_obsidian27.Setting(left).setName("Your name").addText((t2) => t2.setValue(s.authorName).onChange((v) => {
      s.authorName = v.trim();
      changed();
    }));
    this.contactRow = new import_obsidian27.Setting(left).setName("Contact details").setDesc("One item per line.").addTextArea((t2) => t2.setValue(s.exportContact).onChange((v) => {
      s.exportContact = v;
      changed();
    }));
    this.pseudonymRow = new import_obsidian27.Setting(left).setName("Pseudonym").setDesc("Your name appears nowhere in the files, not even in their properties.").addText((t2) => t2.setValue(this.pseudonym).onChange((v) => {
      this.pseudonym = v.trim();
      s.exportPseudonym = v.trim();
      changed();
    }));
    new import_obsidian27.Setting(left).setName("Font").addDropdown((d) => d.addOptions({ times: "Times New Roman", courier: "Courier", arial: "Arial" }).setValue(s.exportFont).onChange((v) => {
      s.exportFont = v === "courier" || v === "arial" ? v : "times";
      changed();
    }));
    new import_obsidian27.Setting(left).setName("Line spacing").addDropdown((d) => d.addOptions({ "2": "Double", "1.5": "1.5 lines" }).setValue(s.exportSpacing).onChange((v) => {
      s.exportSpacing = v;
      changed();
    }));
    new import_obsidian27.Setting(left).setName("Page size").addDropdown((d) => d.addOptions({ letter: "Letter", a4: "A4" }).setValue(s.exportPage).onChange((v) => {
      s.exportPage = v === "a4" ? "a4" : "letter";
      changed();
    }));
    new import_obsidian27.Setting(left).setName("Scene breaks").addDropdown((d) => d.addOptions({ "#": "#", "* * *": "* * *", "\u2014": "\u2014", blank: "Blank line" }).setValue(s.exportSceneBreak).onChange((v) => {
      s.exportSceneBreak = ["#", "* * *", "\u2014", "blank"].includes(v) ? v : "#";
      changed();
    }));
    new import_obsidian27.Setting(left).setName("Keep justified paragraphs").setDesc("The contest layout always keeps them.").addToggle((t2) => t2.setValue(s.exportKeepJustify).onChange((v) => {
      s.exportKeepJustify = v;
      changed();
    }));
    new import_obsidian27.Setting(left).setName("Cover page").addToggle((t2) => t2.setValue(s.exportCoverPage).onChange((v) => {
      s.exportCoverPage = v;
      changed();
    }));
    new import_obsidian27.Setting(left).setName("Chapters on a new page").addToggle((t2) => t2.setValue(s.exportChapterBreaks).onChange((v) => {
      s.exportChapterBreaks = v;
      changed();
    }));
    const fmtRow = new import_obsidian27.Setting(left).setName("Formats");
    const box = fmtRow.controlEl.createDiv({ cls: "at-formats" });
    const chosen = this.formats();
    for (const [id, label] of FORMATS) {
      const lab = box.createEl("label", { cls: "at-format" });
      const cb = lab.createEl("input", { type: "checkbox" });
      cb.checked = chosen.has(id);
      lab.appendText(label);
      cb.onchange = () => {
        const f = this.formats();
        if (cb.checked) f.add(id);
        else f.delete(id);
        s.exportFormats = FORMATS.map(([k]) => k).filter((k) => f.has(k)).join(",");
        void this.host.saveSettings();
      };
    }
    new import_obsidian27.Setting(left).addButton((b) => b.setButtonText("Export").setCta().onClick(() => {
      void this.export();
    }));
    this.contestBtn = new import_obsidian27.Setting(left).setDesc("Applies the contest's layout, exports, keeps this version as a draft and offers to log the submission.").addButton((b) => b.setButtonText("Export for this contest").setCta().onClick(() => {
      void this.exportForContest();
    }));
    this.summaryEl = right.createDiv({ cls: "at-export-summary" });
    this.previewEl = right.createDiv({ cls: "at-export-pages" });
    this.updateRows();
    window.requestAnimationFrame(() => this.renderPreview());
  }
  /* ---------- presets ---------- */
  currentPreset() {
    const s = this.host.prefs;
    return {
      layout: s.exportLayout,
      font: s.exportFont,
      spacing: s.exportSpacing,
      page: s.exportPage,
      formats: s.exportFormats,
      keepJustify: s.exportKeepJustify,
      sceneBreak: s.exportSceneBreak,
      coverPage: s.exportCoverPage,
      chapterBreaks: s.exportChapterBreaks
    };
  }
  applyPreset(name) {
    const p = this.host.prefs.exportPresets[name];
    if (!p) return;
    Object.assign(this.host.prefs, {
      exportLayout: p.layout,
      exportFont: p.font,
      exportSpacing: p.spacing,
      exportPage: p.page,
      exportFormats: p.formats,
      exportKeepJustify: p.keepJustify,
      exportSceneBreak: p.sceneBreak,
      exportCoverPage: p.coverPage,
      exportChapterBreaks: p.chapterBreaks
    });
    void this.host.saveSettings();
    this.build();
    new import_obsidian27.Notice(`Preset \u201C${name}\u201D applied.`);
  }
  savePreset() {
    new TextPrompt(this.app, "Save preset", "", (name) => {
      this.host.prefs.exportPresets[name] = this.currentPreset();
      void this.host.saveSettings();
      this.build();
      new import_obsidian27.Notice(`Preset \u201C${name}\u201D saved.`);
    }, "Saves layout, font, spacing, page size, scene breaks and formats. Your name and contact details are not saved in presets.").open();
  }
  deletePreset() {
    const names = Object.keys(this.host.prefs.exportPresets);
    if (!names.length) return;
    new TextPrompt(this.app, "Delete preset", names.length === 1 ? names[0] : "", (name) => {
      if (!(name in this.host.prefs.exportPresets)) {
        new import_obsidian27.Notice(`No preset called \u201C${name}\u201D.`);
        return;
      }
      delete this.host.prefs.exportPresets[name];
      void this.host.saveSettings();
      this.build();
      new import_obsidian27.Notice(`Preset \u201C${name}\u201D deleted.`);
    }, "Type the name of the preset to delete: " + names.join(", ")).open();
  }
  /* ---------- preview ---------- */
  updateRows() {
    const contest = this.host.prefs.exportLayout === "contest";
    this.nameRow.settingEl.toggleClass("at-hidden", contest);
    this.contactRow.settingEl.toggleClass("at-hidden", contest);
    this.pseudonymRow.settingEl.toggleClass("at-hidden", !contest);
    this.renderChecks();
  }
  /* ---------- checks for a contest ---------- */
  rows() {
    const c = this.contest;
    if (!c) return [];
    const o = this.options();
    const s = this.host.prefs;
    const printed = buildText(this.target.ms, { ...o, layout: "contest" });
    const props = /^---\r?\n([\s\S]*?)\r?\n---/.exec(this.target.raw ?? "")?.[1] ?? "";
    const identities = [s.authorName, ...s.exportContact.split(/\n/)].map((x) => x.trim()).filter((x) => x.length >= 3);
    return preflight(c, { words: this.target.ms.words, lang: o.lang, text: printed, props, identities, layout: o.layout, font: o.font, spacing: o.spacing, page: o.page, today: todayKey() });
  }
  renderChecks() {
    this.checksEl.empty();
    this.contestBtn.settingEl.toggleClass("at-hidden", !this.contest);
    if (!this.contest) return;
    for (const r of this.rows()) {
      const row = this.checksEl.createDiv({ cls: `at-pf-row is-${r.level}` });
      row.createSpan({ cls: "at-pf-icon", text: r.level === "pass" ? "\u2713" : r.level === "warn" ? "!" : "\u2715", attr: { "aria-label": r.level } });
      row.createSpan({ cls: "at-pf-text", text: r.text });
      const fix = r.fix;
      if (fix) row.createEl("button", { cls: "at-ghost", text: "Apply" }).onclick = () => {
        this.applyFix(fix);
        this.build();
      };
    }
  }
  applyFix(fix) {
    const s = this.host.prefs;
    if (fix.layout) s.exportLayout = fix.layout;
    if (fix.font) s.exportFont = fix.font;
    if (fix.spacing) s.exportSpacing = String(fix.spacing);
    if (fix.page) s.exportPage = fix.page;
    void this.host.saveSettings();
  }
  async exportForContest() {
    const c = this.contest;
    if (!c) return;
    const fix = {};
    for (const r of this.rows()) Object.assign(fix, r.fix);
    if (c.anonymous === true) fix.layout = "contest";
    this.applyFix(fix);
    this.build();
    const bad = this.rows().filter((r) => r.level === "fail");
    if (!bad.length) {
      await this.export(c);
      return;
    }
    new ConfirmModal(this.app, { title: "Some checks fail", text: `${bad.map((r) => r.text).join(" ")} Export anyway?`, action: "Export anyway", warning: true, onYes: () => {
      void this.export(c);
    } }).open();
  }
  schedulePreview() {
    window.clearTimeout(this.renderTimer);
    this.renderTimer = window.setTimeout(() => this.renderPreview(), 250);
  }
  renderPreview() {
    const o = this.options();
    const ms = this.target.ms;
    const layout = layoutManuscript(ms, o);
    const L = labels(o.lang);
    const n = layout.pages.length;
    const parts = [ms.title, this.target.note ?? "", `${ms.words.toLocaleString()} ${L.words} (${L.about} ${roundedWords(ms.words).toLocaleString()})`, `${n} ${n === 1 ? "page" : "pages"}`];
    this.summaryEl.setText(parts.filter(Boolean).join(" \xB7 "));
    renderPages(this.previewEl, layout, o, ms.title, MAX_PREVIEW_PAGES);
  }
  /* ---------- export ---------- */
  async export(forContest) {
    const o = this.options();
    const fmts = this.formats();
    if (!fmts.size) {
      new import_obsidian27.Notice("Choose at least one format.");
      return;
    }
    if (o.layout === "contest" && !o.pseudonym) {
      new import_obsidian27.Notice("Add a pseudonym for the contest layout first.");
      return;
    }
    const t2 = this.target;
    const dir = t2.folder && t2.folder !== "/" ? t2.folder + "/" : "";
    const folder = (0, import_obsidian27.normalizePath)(`${dir}Exports`);
    const base = forContest ? `${t2.baseName} - ${contestFileName(forContest.name)}` : t2.baseName + (o.layout === "contest" ? ` (${o.lang === "es" ? "concurso" : "contest"})` : "");
    const written = [];
    try {
      if (!(this.app.vault.getAbstractFileByPath(folder) instanceof import_obsidian27.TFolder)) await this.app.vault.createFolder(folder);
      const save = async (ext, data) => {
        const path = (0, import_obsidian27.normalizePath)(`${folder}/${base}.${ext}`);
        const buf = data.slice().buffer;
        const existing = this.app.vault.getAbstractFileByPath(path);
        if (existing instanceof import_obsidian27.TFile) await this.app.vault.modifyBinary(existing, buf);
        else await this.app.vault.createBinary(path, buf);
        written.push(path);
      };
      if (fmts.has("docx")) await save("docx", buildDocx(t2.ms, o));
      if (fmts.has("pdf")) await save("pdf", buildPdf(layoutManuscript(t2.ms, o), o, t2.ms.title));
      if (fmts.has("epub")) await save("epub", buildEpub(t2.ms, o));
      if (fmts.has("txt")) await save("txt", new TextEncoder().encode(buildText(t2.ms, o)));
    } catch (e) {
      console.error("Authors Toolbox:", e);
      new import_obsidian27.Notice("Couldn't export: " + (e instanceof Error ? e.message : String(e)));
      return;
    }
    this.close();
    new import_obsidian27.Notice(`Exported to ${written.join(", ")}.`, 8e3);
    if (forContest) {
      await this.host.afterContestExport?.({ contest: forContest, path: t2.path, files: written, words: t2.ms.words });
      return;
    }
    const pdf = written.find((p) => p.endsWith(".pdf"));
    const f = pdf ? this.app.vault.getAbstractFileByPath(pdf) : null;
    if (f instanceof import_obsidian27.TFile && !import_obsidian27.Platform.isPhone) await this.app.workspace.getLeaf("tab").openFile(f);
  }
};
function renderPages(el, layout, o, title, max) {
  el.empty();
  const width = el.clientWidth || 320;
  const scale = Math.min(1, (width - 8) / layout.width);
  layout.pages.slice(0, max).forEach((p, idx) => {
    const sheet = el.createDiv({ cls: "at-pv-sheet" });
    sheet.setCssProps({ "--at-pw": `${layout.width * scale}px`, "--at-ph": `${layout.height * scale}px` });
    const page2 = sheet.createDiv({ cls: `at-pv-page at-pv-${o.font}` });
    page2.setCssProps({ "--at-pw": `${layout.width}px`, "--at-ph": `${layout.height}px`, "--at-scale": String(scale), "--at-size": `${layout.size}px` });
    for (const line of p.lines) {
      for (const seg of line.segments) {
        const span = page2.createSpan({ cls: `at-pv-t at-pv-${seg.font}`, text: seg.text });
        span.setCssProps({ "--at-x": `${seg.x}px`, "--at-y": `${line.y}px`, "--at-ws": `${line.wordSpace}px` });
      }
    }
    const mark2 = pageMarks(o, title, idx + 1, layout);
    if (mark2) page2.createSpan({ cls: "at-pv-t at-pv-r", text: mark2.text }).setCssProps({ "--at-x": `${mark2.x}px`, "--at-y": `${mark2.y}px`, "--at-ws": "0px" });
  });
  if (layout.pages.length > max) el.createDiv({ cls: "at-hint", text: `Preview shows the first ${max} of ${layout.pages.length} pages.` });
}

// src/modals/substack.ts
var import_obsidian28 = require("obsidian");

// src/export/substack.ts
var NBSP = "\xA0";
function buildSubstack(ms, subtitle) {
  const blocks = [];
  const levels = ms.blocks.flatMap((b) => b.kind === "heading" && !b.chapter ? [b.level] : []);
  const top = levels.length ? Math.min(...levels) : 1;
  const hasChapters = ms.blocks.some((b) => b.kind === "heading" && b.chapter);
  let stanza = null;
  let quote = null;
  const end = () => {
    stanza = null;
    quote = null;
  };
  for (const b of ms.blocks) {
    switch (b.kind) {
      case "verse": {
        quote = null;
        const line = b.indent ? [{ text: NBSP.repeat(b.indent) }, ...b.runs] : b.runs;
        if (stanza) stanza.push(line);
        else {
          stanza = [line];
          blocks.push({ kind: "p", lines: stanza });
        }
        break;
      }
      case "stanza":
        end();
        break;
      case "break":
        end();
        if (blocks.length && blocks[blocks.length - 1].kind !== "hr") blocks.push({ kind: "hr" });
        break;
      case "heading": {
        end();
        const level = b.chapter ? 2 : Math.min(6, 2 + (b.level - top) + (hasChapters ? 1 : 0));
        blocks.push({ kind: "h", level, runs: b.runs });
        break;
      }
      case "para":
        stanza = null;
        if (b.quote) {
          if (quote) quote.push(b.runs);
          else {
            quote = [b.runs];
            blocks.push({ kind: "quote", paras: quote });
          }
        } else {
          quote = null;
          blocks.push({ kind: "p", lines: [b.runs] });
        }
        break;
    }
  }
  while (blocks.length && blocks[blocks.length - 1].kind === "hr") blocks.pop();
  return {
    title: ms.title,
    subtitle: (ms.subtitle ? runsText(ms.subtitle) : subtitle ?? "").trim(),
    blocks,
    html: toHtml(blocks),
    text: toText(blocks),
    words: ms.words
  };
}
var esc2 = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
var safeHref = (url) => url && /^(https?:\/\/|mailto:)/i.test(url.trim()) ? url.trim() : null;
function runsHtml(rs) {
  return rs.map((r) => {
    let t2 = esc2(r.text);
    if (r.i) t2 = `<em>${t2}</em>`;
    if (r.b) t2 = `<strong>${t2}</strong>`;
    const href = safeHref(r.href);
    return href ? `<a href="${esc2(href)}">${t2}</a>` : t2;
  }).join("");
}
function toHtml(blocks) {
  return blocks.map((b) => {
    switch (b.kind) {
      case "p":
        return `<p>${b.lines.map(runsHtml).join("<br>")}</p>`;
      case "h":
        return `<h${b.level}>${runsHtml(b.runs)}</h${b.level}>`;
      case "quote":
        return `<blockquote>${b.paras.map((p) => `<p>${runsHtml(p)}</p>`).join("")}</blockquote>`;
      case "hr":
        return "<hr>";
    }
  }).join("\n");
}
function toText(blocks) {
  const out = [];
  for (const b of blocks) {
    switch (b.kind) {
      case "p":
        out.push(b.lines.map(runsText).join("\n"));
        break;
      case "h":
        out.push(runsText(b.runs));
        break;
      case "quote":
        out.push(...b.paras.map(runsText));
        break;
      case "hr":
        out.push("* * *");
        break;
    }
  }
  return out.join("\n\n") + "\n";
}
function substackNotes(text2, ms) {
  const lines = text2.split("\n");
  const body = lines.slice(bodyStart(lines)).join("\n").replace(/%%[\s\S]*?%%/g, "");
  const count = (re) => (body.match(re) || []).length;
  const images = count(/!\[\[[^\]]*\]\]|!\[[^\]]*\]\([^)]*\)/g);
  const footnotes = new Set(body.match(/\[\^[^\]]+\](?!:)/g) || []).size;
  const tables2 = count(/^\s*\|.*\n\s*\|\s*:?-+/gm);
  const callouts = count(/^\s*>\s*\[!/gm);
  const code = Math.floor(count(/^\s*(```|~~~)/gm) / 2);
  const aligned = ms.blocks.filter((b) => (b.kind === "para" || b.kind === "verse") && (b.align === "center" || b.align === "right")).length;
  const n = (k, one, many) => `${k} ${k === 1 ? one : many}`;
  const out = [];
  if (images) out.push(`${n(images, "image isn't", "images aren't")} copied: add them in Substack with the image button.`);
  if (footnotes) out.push(`${n(footnotes, "footnote isn't", "footnotes aren't")} copied: add them with Substack's footnote button.`);
  if (aligned) out.push(`${n(aligned, "centred or right-aligned paragraph", "centred or right-aligned paragraphs")} will be left-aligned: Substack can't align text.`);
  if (tables2 + callouts + code) out.push("Tables, callouts and code blocks are left out.");
  return out;
}

// src/modals/substack.ts
async function copyRich(html, text2) {
  const clip = navigator.clipboard;
  if (!clip) return false;
  try {
    if (typeof ClipboardItem !== "undefined" && clip.write) {
      await clip.write([new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text2], { type: "text/plain" })
      })]);
      return true;
    }
  } catch (e) {
    console.warn("Authors Toolbox: rich copy failed, copying plain text", e);
  }
  try {
    await clip.writeText(text2);
    return true;
  } catch {
    return false;
  }
}
async function copyPlain(text2) {
  try {
    await navigator.clipboard.writeText(text2);
    return true;
  } catch {
    return false;
  }
}
var SubstackModal = class extends import_obsidian28.Modal {
  constructor(app, post, notes, poem) {
    super(app);
    this.post = post;
    this.notes = notes;
    this.poem = poem;
  }
  onOpen() {
    this.modalEl.addClass("at-substack-modal");
    this.titleEl.setText("Copy for Substack");
    const p = this.post;
    const el = this.contentEl;
    el.createDiv({ cls: "at-hint", text: "In a new Substack post, paste each part into its own field." });
    const done = (ok, what) => new import_obsidian28.Notice(ok ? `${what} copied. Paste it into Substack.` : "Couldn't use the clipboard.");
    new import_obsidian28.Setting(el).setName("Title").setDesc(p.title).addButton((b) => b.setButtonText("Copy").onClick(async () => done(await copyPlain(p.title), "Title")));
    if (p.subtitle) new import_obsidian28.Setting(el).setName("Subtitle").setDesc(p.subtitle).addButton((b) => b.setButtonText("Copy").onClick(async () => done(await copyPlain(p.subtitle), "Subtitle")));
    new import_obsidian28.Setting(el).setName("Text").setDesc(`${p.words.toLocaleString()} words, with italics, bold, headings, links, quotes and dividers.`).addButton((b) => b.setButtonText("Copy text").setCta().onClick(async () => done(await copyRich(p.html, p.text), "Text")));
    const tips = [...this.notes];
    if (this.poem) tips.push("Each stanza pastes as one paragraph with line breaks (like Shift+Enter), so the lines stay together. Check the post's preview on a phone too.");
    for (const t2 of tips) el.createDiv({ cls: "at-hint at-substack-note", text: t2 });
    this.renderPreview(el.createDiv({ cls: "at-substack-preview" }));
  }
  onClose() {
    this.contentEl.empty();
  }
  renderPreview(box) {
    box.createEl("h1", { text: this.post.title });
    if (this.post.subtitle) box.createEl("p", { cls: "at-substack-subtitle", text: this.post.subtitle });
    for (const b of this.post.blocks) {
      switch (b.kind) {
        case "p": {
          const p = box.createEl("p");
          b.lines.forEach((line, k) => {
            if (k) p.createEl("br");
            runs2(p, line);
          });
          break;
        }
        case "h":
          runs2(box.createEl(`h${b.level}`), b.runs);
          break;
        case "quote": {
          const q = box.createEl("blockquote");
          for (const para2 of b.paras) runs2(q.createEl("p"), para2);
          break;
        }
        case "hr":
          box.createEl("hr");
          break;
      }
    }
  }
};
function runs2(el, rs) {
  for (const r of rs) {
    let host = el;
    const href = safeHref(r.href);
    if (href) host = host.createEl("a", { attr: { href } });
    if (r.b) host = host.createEl("strong");
    if (r.i) host = host.createEl("em");
    host.appendText(r.text);
  }
}

// src/export/actions.ts
async function exportManuscript(plugin, file, contest) {
  const v = plugin.target || plugin.app.workspace.getActiveViewOfType(import_obsidian29.MarkdownView);
  const f = file ?? v?.file ?? null;
  if (!f || f.extension !== "md") {
    new import_obsidian29.Notice("Open the story you want to export first.");
    return;
  }
  const fm = plugin.app.metadataCache.getFileCache(f)?.frontmatter ?? {};
  if (fmText(fm.type).toLowerCase().replace(/\[\[|\]\]/g, "") === "anthology") {
    await plugin.exportProject(f);
    return;
  }
  const text2 = v && v.file === f && v.editor ? v.editor.getValue() : await plugin.app.vault.read(f);
  if (isScriptText(text2)) {
    new import_obsidian29.Notice("This note is a script. Use the screenplay export command for it instead.");
    return;
  }
  const ms = buildManuscript(text2, { fallbackTitle: f.basename, fmTitle: typeof fm.title === "string" ? fm.title : void 0, authorNames: [plugin.prefs.authorName], poem: isPoemFM(fm) || isPoemText(text2) });
  new ExportManuscriptModal(plugin.app, plugin, {
    ms,
    folder: f.parent?.path ?? "",
    baseName: f.basename,
    lang: plugin.langOf(f, text2),
    pseudonym: typeof fm.pseudonym === "string" ? fm.pseudonym : void 0,
    path: f.path,
    raw: text2,
    contest
  }).open();
}
async function copyForSubstack(plugin, file) {
  const v = plugin.target || plugin.app.workspace.getActiveViewOfType(import_obsidian29.MarkdownView);
  const f = file ?? v?.file ?? null;
  if (!f || f.extension !== "md") {
    new import_obsidian29.Notice("Open the story or poem you want to post first.");
    return;
  }
  const text2 = v && v.file === f && v.editor ? v.editor.getValue() : await plugin.app.vault.read(f);
  if (isScriptText(text2)) {
    new import_obsidian29.Notice("This note is a script. Substack posts are made from stories and poems.");
    return;
  }
  const fm = plugin.app.metadataCache.getFileCache(f)?.frontmatter ?? {};
  const poem = isPoemFM(fm) || isPoemText(text2);
  const ms = buildManuscript(text2, { fallbackTitle: f.basename, fmTitle: typeof fm.title === "string" ? fm.title : void 0, authorNames: [plugin.prefs.authorName], poem, links: true });
  const post = buildSubstack(ms, typeof fm.subtitle === "string" ? fm.subtitle : void 0);
  if (!post.blocks.length) {
    new import_obsidian29.Notice("This note has no text to post yet.");
    return;
  }
  new SubstackModal(plugin.app, post, substackNotes(text2, ms), poem).open();
}
function langOf(plugin, f, text2) {
  const code = plugin.noteLang(f).code;
  return baseLang(code === "auto" ? detectLang(text2) : code);
}
async function exportProject(plugin, source) {
  const files = source instanceof import_obsidian29.TFolder ? plugin.folderNotes(source) : plugin.anthologyNotes(source);
  if (!files.length) {
    new import_obsidian29.Notice(source instanceof import_obsidian29.TFolder ? "No notes to export in this folder." : "No stories found for this anthology. Link it from a story's \u201Canthology\u201D property.");
    return;
  }
  const entries = [];
  let sample = "";
  for (const f of files) {
    const text2 = await plugin.app.vault.cachedRead(f);
    if (isScriptText(text2)) continue;
    const fm2 = plugin.app.metadataCache.getFileCache(f)?.frontmatter ?? {};
    entries.push({ text: text2, title: f.basename, fmTitle: typeof fm2.title === "string" ? fm2.title : void 0, poem: isPoemFM(fm2) || isPoemText(text2) });
    if (sample.length < 2e4) sample += text2.slice(0, 2e4 - sample.length);
  }
  const fm = source instanceof import_obsidian29.TFile ? plugin.app.metadataCache.getFileCache(source)?.frontmatter ?? {} : {};
  const title = typeof fm.title === "string" && fm.title.trim() ? fm.title.trim() : source instanceof import_obsidian29.TFile ? source.basename : source.name;
  const ms = compileProject(title, entries, [plugin.prefs.authorName]);
  const lang = source instanceof import_obsidian29.TFile ? plugin.langOf(source, sample) : baseLang(detectLang(sample));
  const kind = lang === "es" ? entries.length === 1 ? "texto" : "textos" : entries.length === 1 ? "note" : "notes";
  new ExportManuscriptModal(plugin.app, plugin, {
    ms,
    folder: source instanceof import_obsidian29.TFile ? source.parent?.path ?? "" : source.path,
    baseName: title,
    lang,
    pseudonym: typeof fm.pseudonym === "string" ? fm.pseudonym : void 0,
    note: `${entries.length} ${kind}`
  }).open();
}
function sortNotes(plugin, files) {
  const key = (f) => {
    const fm = plugin.app.metadataCache.getFileCache(f)?.frontmatter ?? {};
    const order = typeof fm.order === "number" ? fm.order : parseFloat(fmText(fm.order));
    return { order: Number.isFinite(order) ? order : Infinity, date: fmText(fm.date_created), name: f.basename };
  };
  return files.map((f) => ({ f, k: key(f) })).sort((a, b) => (a.k.order === b.k.order ? 0 : a.k.order - b.k.order) || a.k.date.localeCompare(b.k.date) || a.k.name.localeCompare(b.k.name, void 0, { numeric: true })).map((x) => x.f);
}
function folderNotes(plugin, folder) {
  const notes = folder.children.filter((c) => c instanceof import_obsidian29.TFile && c.extension === "md");
  const subs = folder.children.filter((c) => c instanceof import_obsidian29.TFolder && c.name !== "Exports").sort((a, b) => a.name.localeCompare(b.name, void 0, { numeric: true }));
  return [...plugin.sortNotes(notes), ...subs.flatMap((s) => plugin.folderNotes(s))];
}
function anthologyNotes(plugin, anth) {
  const mc = plugin.app.metadataCache;
  const out = [];
  const isStory = (f) => f !== anth && f.extension === "md";
  for (const l of mc.getFileCache(anth)?.links ?? []) {
    const f = mc.getFirstLinkpathDest(l.link.split("#")[0], anth.path);
    if (f && isStory(f) && !out.includes(f)) out.push(f);
  }
  const members = [];
  for (const [src, dests] of Object.entries(mc.resolvedLinks)) {
    if (!dests[anth.path]) continue;
    const f = plugin.app.vault.getAbstractFileByPath(src);
    if (!(f instanceof import_obsidian29.TFile) || !isStory(f) || out.includes(f)) continue;
    const fm = mc.getFileCache(f)?.frontmatter ?? {};
    const raw = Array.isArray(fm.anthology) ? fm.anthology : [fm.anthology];
    const hit = raw.some((x) => {
      const link = fmText(x).replace(/^\[\[|\]\]$/g, "").split("|")[0].split("#")[0].trim();
      return !!link && mc.getFirstLinkpathDest(link, f.path) === anth;
    });
    if (hit) members.push(f);
  }
  return [...out, ...plugin.sortNotes(members)];
}

// src/main.ts
function selectionWatcherFor(plugin) {
  return import_view11.ViewPlugin.fromClass(class {
    update(u) {
      if (u.selectionSet && !u.docChanged) plugin.onSelection(u.view);
    }
  });
}
function clickHandlerFor(plugin) {
  return import_view11.EditorView.domEventHandlers({ click: (e, view) => plugin.onEditorClick(e, view) });
}
var AuthorsToolbox = class extends import_obsidian30.Plugin {
  constructor() {
    super(...arguments);
    this.state = null;
    this.target = null;
    this.check = null;
    this.checking = false;
    this.checkStatus = "";
    this.sent = [];
    this.issueSeq = 0;
    /* ---------- writing habits ---------- */
    this.sprint = null;
    this.statusEl = null;
  }
  async onload() {
    const loadedData = await this.loadData();
    this.prefs = Object.assign({}, DEFAULTS, loadedData || {});
    this.state = null;
    this.target = null;
    this.check = null;
    this.checking = false;
    this.checkStatus = "";
    this.sent = [];
    this.issueSeq = 0;
    this.saveSettingsSoon = (0, import_obsidian30.debounce)(() => this.saveSettings(), 4e3, true);
    const selectionWatcher = selectionWatcherFor(this);
    const clicks = clickHandlerFor(this);
    this.registerEditorExtension([alignView, issueField, selectionWatcher, clicks, spView, spAttrs, poemAttrs]);
    if (this.prefs.smartEnter) this.registerEditorExtension(spKeymap);
    this.registerEditorExtension(rayaExtension(this));
    this.revision = new Revision(this);
    this.registerEditorExtension(revisionExtension);
    this.submissions = new Submissions(this);
    this.registerMarkdownPostProcessor((el, ctx) => spPostProcess(el, ctx));
    this.registerMarkdownPostProcessor((el, ctx) => poemPostProcess(el, ctx));
    this.registerEditorSuggest(new ScriptSuggest(this.app, this));
    this.registerMarkdownPostProcessor((el, ctx) => {
      const info = ctx.getSectionInfo(el);
      if (!info) return;
      const line = info.text.split("\n")[info.lineStart];
      const m = line && MARK.exec(line);
      if (m && m[2]) el.addClasses(["at-sec", `at-sec-${m[2]}`]);
    });
    this.registerView(VIEW_WRITING, (leaf) => new WritingView(leaf, this));
    this.addRibbonIcon("pen-line", "Writing panel", () => {
      void this.activatePanel();
    });
    registerCommands(this);
    registerMenus(this);
    this.refreshSoon = (0, import_obsidian30.debounce)(() => this.refresh(), import_obsidian30.Platform.isMobile ? 1200 : 600, true);
    this.selectionSoon = (0, import_obsidian30.debounce)(() => this.updateSelection(), 350, true);
    this.registerEvent(this.app.workspace.on("active-leaf-change", (leaf) => {
      if (leaf && leaf.view instanceof import_obsidian30.MarkdownView) {
        this.setTarget(leaf.view);
      }
    }));
    this.registerEvent(this.app.workspace.on("file-open", () => {
      const v = this.app.workspace.getActiveViewOfType(import_obsidian30.MarkdownView);
      if (v) this.setTarget(v, true);
      else this.refreshSoon();
    }));
    this.registerEvent(this.app.workspace.on("editor-change", (editor, info) => {
      if (this.target && info && info.file && this.target.file && info.file.path === this.target.file.path) this.refreshSoon();
    }));
    this.registerEvent(this.app.metadataCache.on("changed", (file) => {
      if (this.target && this.target.file && file.path === this.target.file.path) this.refreshSoon();
    }));
    this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {
      if (this.prefs.daily && renamePath(this.prefs.daily, oldPath, file.path)) this.saveSettingsSoon();
      if (file instanceof import_obsidian30.TFile) {
        void this.revision.rename(oldPath, file.path);
        void this.submissions.rename(oldPath, file.path);
      }
      this.refreshSoon();
    }));
    this.registerView(VIEW_HABITS, (leaf) => new HabitsView(leaf, this));
    this.addRibbonIcon("flame", "Writing habits", () => {
      void this.openHabits();
    });
    this.registerView(VIEW_REVISION, (leaf) => new RevisionView(leaf, this));
    this.registerView(VIEW_SUBMISSIONS, (leaf) => new SubmissionsView(leaf, this));
    this.addRibbonIcon("send", "Submissions", () => {
      void this.submissions.openView();
    });
    this.submissions.start();
    this.statusEl = this.addStatusBarItem();
    this.statusEl.addClass("at-sprint-status");
    this.registerInterval(window.setInterval(() => this.sprintTick(), 1e3));
    this.addSettingTab(new ToolboxSettings(this.app, this));
    this.app.workspace.onLayoutReady(() => {
      const v = this.app.workspace.getActiveViewOfType(import_obsidian30.MarkdownView);
      if (v) this.setTarget(v);
      if (!this.prefs.panelAutoOpened) {
        this.prefs.panelAutoOpened = true;
        void this.saveSettings();
        void this.activatePanel(false);
      }
    });
  }
  onunload() {
    this.app.workspace.getLeavesOfType(VIEW_WRITING).forEach((l) => l.detach());
    this.app.workspace.getLeavesOfType(VIEW_HABITS).forEach((l) => l.detach());
    this.app.workspace.getLeavesOfType(VIEW_REVISION).forEach((l) => l.detach());
    this.app.workspace.getLeavesOfType(VIEW_SUBMISSIONS).forEach((l) => l.detach());
  }
  settingChanged(key) {
    if (key === "draftsFolder") this.revision.forget();
    if (key === "submissionsFolder") this.submissions.forget();
    if (key === "contestsFolder" || key === "showNextDeadline") void this.submissions.updateStatus();
  }
  async saveSettings() {
    await this.saveData(this.prefs);
  }
  /* ---------- panel plumbing ---------- */
  async activatePanel(reveal = true) {
    const ws = this.app.workspace;
    let leaf = ws.getLeavesOfType(VIEW_WRITING)[0];
    if (!leaf) {
      const right = ws.getRightLeaf(false);
      if (!right) return;
      leaf = right;
      await leaf.setViewState({ type: VIEW_WRITING, active: reveal });
    }
    if (reveal) await ws.revealLeaf(leaf);
    this.refresh();
  }
  panels() {
    return this.app.workspace.getLeavesOfType(VIEW_WRITING).map((l) => l.view).filter((v) => v instanceof WritingView);
  }
  renderPanels() {
    this.panels().forEach((p) => p.render());
  }
  setTarget(view, force) {
    const changed = !this.target || this.target !== view || this.state && view && view.file && this.state.file && this.state.file.path !== view.file.path;
    if (changed && this.check && (!view || !view.file || this.check.path !== view.file.path)) {
      this.check = null;
      this.checkStatus = "";
    }
    this.target = view;
    if (changed || force) this.refresh();
    else this.refreshSoon();
  }
  cmOf(view) {
    if (!view || !view.editor) return null;
    const ed = view.editor;
    return ed.cm ?? null;
  }
  noteLang(file) {
    const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
    const v = normLang(fm?.lang);
    if (v) return { code: v, source: "note" };
    const d = normLang(this.prefs.defaultLang);
    return { code: d || "auto", source: d ? "default" : "auto" };
  }
  refresh() {
    const v = this.target;
    if (!v || !v.file) {
      this.state = null;
      this.renderPanels();
      return;
    }
    if (!this.panels().length) {
      const text2 = v.editor ? v.editor.getValue() : v.data || "";
      const n = proseMap(text2).paras.reduce((t2, p) => t2 + (p.kind === "heading" ? 0 : words(p.plain).length), 0);
      this.trackDaily(v.file.path, n);
      void this.revision.checkpoint(v.file.path, text2);
      return;
    }
    this.computeState(v);
    this.renderPanels();
  }
  computeState(view) {
    const file = view.file;
    if (!file) {
      this.state = null;
      return;
    }
    const text2 = view.editor ? view.editor.getValue() : view.data || "";
    const L = this.noteLang(file);
    const s = this.prefs;
    const analysis = analyze(text2, this.analyzeOptions(L.code));
    const outline = buildOutline(text2);
    const fm = this.app.metadataCache.getFileCache(file)?.frontmatter || {};
    const rawGoal = fm.word_goal;
    const goalStr = typeof rawGoal === "number" || typeof rawGoal === "string" ? String(rawGoal) : "";
    const goal = parseInt(goalStr, 10) || s.defaultGoal || 0;
    let cursorLine = null;
    try {
      cursorLine = view.editor.getCursor().line;
    } catch {
    }
    const isSp = isScriptFM(fm) || isScriptText(text2);
    const script = isSp ? analyzeScript(text2, analysis.lang) : null;
    const sOutline = isSp ? buildScriptOutline(text2) : null;
    const poem = !isSp && (isPoemFM(fm) || isPoemText(text2)) ? analyzePoem(text2, analysis.lang) : null;
    this.state = {
      file: { basename: file.basename, path: file.path },
      text: text2,
      analysis,
      outline,
      goal,
      cursorLine,
      script,
      sOutline,
      poem,
      fm,
      langCode: L.code,
      langSource: L.source,
      ltLang: L.code,
      selection: this.state && this.state.file.path === file.path ? this.state.selection : null
    };
    try {
      view.contentEl.setAttr("lang", L.code === "auto" ? analysis.lang : L.code.slice(0, 2));
    } catch {
    }
    this.trackDaily(file.path, analysis.words);
    void this.revision.checkpoint(file.path, text2);
  }
  analyzeOptions(lang) {
    const s = this.prefs;
    const crutch = { en: s.crutchEn || DEFAULT_CRUTCH.en, es: s.crutchEs || DEFAULT_CRUTCH.es };
    return { lang, longSentence: s.longSentence, echoWindow: s.echoWindow, crutch, linesAsParagraphs: s.linesAsParagraphs };
  }
  /** Style analysis of any text, in the note's language. */
  analyzeText(text2, file) {
    return analyze(text2, this.analyzeOptions(file ? this.noteLang(file).code : "auto"));
  }
  /** Is the note in one of the writing folders (see `writingFiles`)? */
  isWritingPath(path) {
    const lines = (this.prefs.writingFolders.trim() ? this.prefs.writingFolders : `${this.prefs.storyFolders}
${this.prefs.scriptsFolder}`).split(/[\n,]/).map((x) => (0, import_obsidian30.normalizePath)(x.trim())).filter((x) => x && x !== "/");
    return lines.some((f) => path.startsWith(f + "/"));
  }
  onSelection(cmView) {
    const cm = this.cmOf(this.target);
    if (cm && cm === cmView) this.selectionSoon();
  }
  updateSelection() {
    const v = this.target;
    if (!v || !v.editor || !this.state) return;
    const txt = v.editor.getSelection() || "";
    let selection = null;
    if (txt.trim()) {
      const { paras } = proseMap(txt);
      let w = 0, c = 0, sents = 0;
      for (const p of paras) {
        if (p.kind === "heading") continue;
        w += words(p.plain).length;
        c += p.plain.length;
        sents += splitSentences(p.plain).length;
      }
      selection = { words: w, chars: c, sentences: sents };
    }
    try {
      this.state.cursorLine = v.editor.getCursor().line;
    } catch {
    }
    const prev = this.state.selection;
    this.state.selection = selection;
    const tab = this.prefs.panelTab;
    if (JSON.stringify(prev) !== JSON.stringify(selection) || tab === "outline") this.renderPanels();
  }
  /* ---------- note properties ---------- */
  async setNoteLang(code) {
    const f = this.target && this.target.file;
    if (!f) {
      new import_obsidian30.Notice("Open a note first.");
      return;
    }
    await this.app.fileManager.processFrontMatter(f, (fm) => {
      if (code === "auto") delete fm.lang;
      else fm.lang = code;
    });
    if (this.check && this.check.path === f.path) this.clearCheck();
    const langKey = code;
    new import_obsidian30.Notice(code === "auto" ? "Language: auto-detect" : `Language for this note: ${LANGS[langKey] || code}`);
    window.setTimeout(() => this.refresh(), 250);
  }
  editGoal() {
    const f = this.target && this.target.file;
    if (!f) return;
    new NumberPrompt(this.app, "Word goal for this note", this.state ? this.state.goal : 0, (n) => {
      void this.app.fileManager.processFrontMatter(f, (fm) => {
        if (n > 0) fm.word_goal = n;
        else delete fm.word_goal;
      });
      window.setTimeout(() => this.refresh(), 250);
    }).open();
  }
  async saveUpload(file, sourcePath) {
    const folder = (0, import_obsidian30.normalizePath)(this.prefs.imageFolder || "");
    const data = await file.arrayBuffer();
    if (!this.prefs.imageFolder) {
      const path2 = await this.app.fileManager.getAvailablePathForAttachment(file.name, sourcePath || "");
      return await this.app.vault.createBinary(path2, data);
    }
    if (!(this.app.vault.getAbstractFileByPath(folder) instanceof import_obsidian30.TFolder)) await this.app.vault.createFolder(folder);
    const dot = file.name.lastIndexOf(".");
    const base = dot > 0 ? file.name.slice(0, dot) : file.name;
    const ext = dot > 0 ? file.name.slice(dot) : "";
    let path = (0, import_obsidian30.normalizePath)(`${folder}/${base}${ext}`), n = 1;
    while (this.app.vault.getAbstractFileByPath(path)) path = (0, import_obsidian30.normalizePath)(`${folder}/${base} ${n++}${ext}`);
    return await this.app.vault.createBinary(path, data);
  }
  /* ---------- delegates: the work lives in the topic modules ---------- */
  // spelling and grammar (check/languagetool)
  scopeRange(scope, ed, text2) {
    return scopeRange(this, scope, ed, text2);
  }
  waitForRateLimit(bytes) {
    return waitForRateLimit(this, bytes);
  }
  runCheck(scope) {
    return runCheck(this, scope);
  }
  clearCheck() {
    return clearCheck(this);
  }
  dropIssue(id) {
    return dropIssue(this, id);
  }
  applyFix(id, value) {
    return applyFix(this, id, value);
  }
  ignoreIssue(id) {
    return ignoreIssue(this, id);
  }
  addToDictionary(id) {
    return addToDictionary(this, id);
  }
  onEditorClick(e, view) {
    return onEditorClick(this, e, view);
  }
  // navigation and highlights (view/navigation)
  wordDocRange(w) {
    return wordDocRange(this, w);
  }
  plainDocRange(p, a, b) {
    return plainDocRange(this, p, a, b);
  }
  highlightSentences(sents) {
    return highlightSentences(this, sents);
  }
  ensureEditable() {
    return ensureEditable(this);
  }
  closeDrawerOnPhone() {
    return closeDrawerOnPhone(this);
  }
  showRanges(ranges, current2, select) {
    return showRanges(this, ranges, current2, select);
  }
  jumpToLine(line) {
    return jumpToLine(this, line);
  }
  selectLines(a, b) {
    return selectLines(this, a, b);
  }
  moveSection(parentId, kind, from, to) {
    return moveSection(this, parentId, kind, from, to);
  }
  // writing habits (habits/actions)
  trackDaily(path, wordCount) {
    return trackDaily(this, path, wordCount);
  }
  openHabits() {
    return openHabits(this);
  }
  habitViews() {
    return habitViews(this);
  }
  writingFiles() {
    return writingFiles(this);
  }
  knownGenres() {
    return knownGenres(this);
  }
  openGenre(file, after) {
    return openGenre(this, file, after);
  }
  openSprint() {
    return openSprint(this);
  }
  startSprint(minutes, target) {
    return startSprint(this, minutes, target);
  }
  finishSprint(early) {
    return finishSprint(this, early);
  }
  sprintTick() {
    return sprintTick(this);
  }
  habitSummary() {
    return habitSummary(this);
  }
  todayWords(path) {
    return todayWords(this, path);
  }
  // screenplay (screenplay/actions)
  lineRange(n) {
    return lineRange(this, n);
  }
  formatLine(editor, kind) {
    return formatLine(this, editor, kind);
  }
  scriptsFolder() {
    return scriptsFolder(this);
  }
  createScript(title, opts) {
    return createScript(this, title, opts);
  }
  newScript() {
    return newScript(this);
  }
  adaptStory() {
    return adaptStory(this);
  }
  exportFountain() {
    return exportFountain(this);
  }
  toggleScriptMode() {
    return toggleScriptMode(this);
  }
  // export (export/actions)
  exportManuscript(file, contest) {
    return exportManuscript(this, file, contest);
  }
  // contests for the export window
  contests() {
    return this.submissions.contests();
  }
  afterContestExport(info) {
    return this.submissions.afterExport(info);
  }
  copyForSubstack(file) {
    return copyForSubstack(this, file);
  }
  langOf(f, text2) {
    return langOf(this, f, text2);
  }
  exportProject(source) {
    return exportProject(this, source);
  }
  sortNotes(files) {
    return sortNotes(this, files);
  }
  folderNotes(folder) {
    return folderNotes(this, folder);
  }
  anthologyNotes(anth) {
    return anthologyNotes(this, anth);
  }
};

/* nosourcemap */