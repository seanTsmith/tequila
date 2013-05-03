// FILE IS DESTROYED AND REBUILT IN MAKE
var Markdown;

if (typeof exports === "object" && typeof require === "function") // we're in a CommonJS (e.g. Node.js) module
    Markdown = exports;
else
    Markdown = {};
    
// The following text is included for historical reasons, but should
// be taken with a pinch of salt; it's not all true anymore.

//
// Wherever possible, Showdown is a straight, line-by-line port
// of the Perl version of Markdown.
//
// This is not a normal parser design; it's basically just a
// series of string substitutions.  It's hard to read and
// maintain this way,  but keeping Showdown close to the original
// design makes it easier to port new features.
//
// More importantly, Showdown behaves like markdown.pl in most
// edge cases.  So web applications can do client-side preview
// in Javascript, and then build identical HTML on the server.
//
// This port needs the new RegExp functionality of ECMA 262,
// 3rd Edition (i.e. Javascript 1.5).  Most modern web browsers
// should do fine.  Even with the new regular expression features,
// We do a lot of work to emulate Perl's regex functionality.
// The tricky changes in this file mostly have the "attacklab:"
// label.  Major or self-explanatory changes don't.
//
// Smart diff tools like Araxis Merge will be able to match up
// this file with markdown.pl in a useful way.  A little tweaking
// helps: in a copy of markdown.pl, replace "#" with "//" and
// replace "$text" with "text".  Be sure to ignore whitespace
// and line endings.
//


//
// Usage:
//
//   var text = "Markdown *rocks*.";
//
//   var converter = new Markdown.Converter();
//   var html = converter.makeHtml(text);
//
//   alert(html);
//
// Note: move the sample code to the bottom of this
// file before uncommenting it.
//

(function () {

    function identity(x) { return x; }
    function returnFalse(x) { return false; }

    function HookCollection() { }

    HookCollection.prototype = {

        chain: function (hookname, func) {
            var original = this[hookname];
            if (!original)
                throw new Error("unknown hook " + hookname);

            if (original === identity)
                this[hookname] = func;
            else
                this[hookname] = function (text) {
                    var args = Array.prototype.slice.call(arguments, 0);
                    args[0] = original.apply(null, args);
                    return func.apply(null, args);
                };
        },
        set: function (hookname, func) {
            if (!this[hookname])
                throw new Error("unknown hook " + hookname);
            this[hookname] = func;
        },
        addNoop: function (hookname) {
            this[hookname] = identity;
        },
        addFalse: function (hookname) {
            this[hookname] = returnFalse;
        }
    };

    Markdown.HookCollection = HookCollection;

    // g_urls and g_titles allow arbitrary user-entered strings as keys. This
    // caused an exception (and hence stopped the rendering) when the user entered
    // e.g. [push] or [__proto__]. Adding a prefix to the actual key prevents this
    // (since no builtin property starts with "s_"). See
    // http://meta.stackoverflow.com/questions/64655/strange-wmd-bug
    // (granted, switching from Array() to Object() alone would have left only __proto__
    // to be a problem)
    function SaveHash() { }
    SaveHash.prototype = {
        set: function (key, value) {
            this["s_" + key] = value;
        },
        get: function (key) {
            return this["s_" + key];
        }
    };

    Markdown.Converter = function () {
        var pluginHooks = this.hooks = new HookCollection();
        
        // given a URL that was encountered by itself (without markup), should return the link text that's to be given to this link
        pluginHooks.addNoop("plainLinkText");
        
        // called with the orignal text as given to makeHtml. The result of this plugin hook is the actual markdown source that will be cooked
        pluginHooks.addNoop("preConversion");
        
        // called with the text once all normalizations have been completed (tabs to spaces, line endings, etc.), but before any conversions have
        pluginHooks.addNoop("postNormalization");
        
        // Called with the text before / after creating block elements like code blocks and lists. Note that this is called recursively
        // with inner content, e.g. it's called with the full text, and then only with the content of a blockquote. The inner
        // call will receive outdented text.
        pluginHooks.addNoop("preBlockGamut");
        pluginHooks.addNoop("postBlockGamut");
        
        // called with the text of a single block element before / after the span-level conversions (bold, code spans, etc.) have been made
        pluginHooks.addNoop("preSpanGamut");
        pluginHooks.addNoop("postSpanGamut");
        
        // called with the final cooked HTML code. The result of this plugin hook is the actual output of makeHtml
        pluginHooks.addNoop("postConversion");

        //
        // Private state of the converter instance:
        //

        // Global hashes, used by various utility routines
        var g_urls;
        var g_titles;
        var g_html_blocks;

        // Used to track when we're inside an ordered or unordered list
        // (see _ProcessListItems() for details):
        var g_list_level;

        this.makeHtml = function (text) {

            //
            // Main function. The order in which other subs are called here is
            // essential. Link and image substitutions need to happen before
            // _EscapeSpecialCharsWithinTagAttributes(), so that any *'s or _'s in the <a>
            // and <img> tags get encoded.
            //

            // This will only happen if makeHtml on the same converter instance is called from a plugin hook.
            // Don't do that.
            if (g_urls)
                throw new Error("Recursive call to converter.makeHtml");
        
            // Create the private state objects.
            g_urls = new SaveHash();
            g_titles = new SaveHash();
            g_html_blocks = [];
            g_list_level = 0;

            text = pluginHooks.preConversion(text);

            // attacklab: Replace ~ with ~T
            // This lets us use tilde as an escape char to avoid md5 hashes
            // The choice of character is arbitray; anything that isn't
            // magic in Markdown will work.
            text = text.replace(/~/g, "~T");

            // attacklab: Replace $ with ~D
            // RegExp interprets $ as a special character
            // when it's in a replacement string
            text = text.replace(/\$/g, "~D");

            // Standardize line endings
            text = text.replace(/\r\n/g, "\n"); // DOS to Unix
            text = text.replace(/\r/g, "\n"); // Mac to Unix

            // Make sure text begins and ends with a couple of newlines:
            text = "\n\n" + text + "\n\n";

            // Convert all tabs to spaces.
            text = _Detab(text);

            // Strip any lines consisting only of spaces and tabs.
            // This makes subsequent regexen easier to write, because we can
            // match consecutive blank lines with /\n+/ instead of something
            // contorted like /[ \t]*\n+/ .
            text = text.replace(/^[ \t]+$/mg, "");
            
            text = pluginHooks.postNormalization(text);

            // Turn block-level HTML blocks into hash entries
            text = _HashHTMLBlocks(text);

            // Strip link definitions, store in hashes.
            text = _StripLinkDefinitions(text);

            text = _RunBlockGamut(text);

            text = _UnescapeSpecialChars(text);

            // attacklab: Restore dollar signs
            text = text.replace(/~D/g, "$$");

            // attacklab: Restore tildes
            text = text.replace(/~T/g, "~");

            text = pluginHooks.postConversion(text);

            g_html_blocks = g_titles = g_urls = null;

            return text;
        };

        function _StripLinkDefinitions(text) {
            //
            // Strips link definitions from text, stores the URLs and titles in
            // hash references.
            //

            // Link defs are in the form: ^[id]: url "optional title"

            /*
            text = text.replace(/
                ^[ ]{0,3}\[(.+)\]:  // id = $1  attacklab: g_tab_width - 1
                [ \t]*
                \n?                 // maybe *one* newline
                [ \t]*
                <?(\S+?)>?          // url = $2
                (?=\s|$)            // lookahead for whitespace instead of the lookbehind removed below
                [ \t]*
                \n?                 // maybe one newline
                [ \t]*
                (                   // (potential) title = $3
                    (\n*)           // any lines skipped = $4 attacklab: lookbehind removed
                    [ \t]+
                    ["(]
                    (.+?)           // title = $5
                    [")]
                    [ \t]*
                )?                  // title is optional
                (?:\n+|$)
            /gm, function(){...});
            */

            text = text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?(?=\s|$)[ \t]*\n?[ \t]*((\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,
                function (wholeMatch, m1, m2, m3, m4, m5) {
                    m1 = m1.toLowerCase();
                    g_urls.set(m1, _EncodeAmpsAndAngles(m2));  // Link IDs are case-insensitive
                    if (m4) {
                        // Oops, found blank lines, so it's not a title.
                        // Put back the parenthetical statement we stole.
                        return m3;
                    } else if (m5) {
                        g_titles.set(m1, m5.replace(/"/g, "&quot;"));
                    }

                    // Completely remove the definition from the text
                    return "";
                }
            );

            return text;
        }

        function _HashHTMLBlocks(text) {

            // Hashify HTML blocks:
            // We only want to do this for block-level HTML tags, such as headers,
            // lists, and tables. That's because we still want to wrap <p>s around
            // "paragraphs" that are wrapped in non-block-level tags, such as anchors,
            // phrase emphasis, and spans. The list of tags we're looking for is
            // hard-coded:
            var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
            var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";

            // First, look for nested blocks, e.g.:
            //   <div>
            //     <div>
            //     tags for inner block must be indented.
            //     </div>
            //   </div>
            //
            // The outermost tags must start at the left margin for this to match, and
            // the inner nested divs must be indented.
            // We need to do this before the next, more liberal match, because the next
            // match will start at the first `<div>` and stop at the first `</div>`.

            // attacklab: This regex can be expensive when it fails.

            /*
            text = text.replace(/
                (                       // save in $1
                    ^                   // start of line  (with /m)
                    <($block_tags_a)    // start tag = $2
                    \b                  // word break
                                        // attacklab: hack around khtml/pcre bug...
                    [^\r]*?\n           // any number of lines, minimally matching
                    </\2>               // the matching end tag
                    [ \t]*              // trailing spaces/tabs
                    (?=\n+)             // followed by a newline
                )                       // attacklab: there are sentinel newlines at end of document
            /gm,function(){...}};
            */
            text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, hashElement);

            //
            // Now match more liberally, simply from `\n<tag>` to `</tag>\n`
            //

            /*
            text = text.replace(/
                (                       // save in $1
                    ^                   // start of line  (with /m)
                    <($block_tags_b)    // start tag = $2
                    \b                  // word break
                                        // attacklab: hack around khtml/pcre bug...
                    [^\r]*?             // any number of lines, minimally matching
                    .*</\2>             // the matching end tag
                    [ \t]*              // trailing spaces/tabs
                    (?=\n+)             // followed by a newline
                )                       // attacklab: there are sentinel newlines at end of document
            /gm,function(){...}};
            */
            text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm, hashElement);

            // Special case just for <hr />. It was easier to make a special case than
            // to make the other regex more complicated.  

            /*
            text = text.replace(/
                \n                  // Starting after a blank line
                [ ]{0,3}
                (                   // save in $1
                    (<(hr)          // start tag = $2
                        \b          // word break
                        ([^<>])*?
                    \/?>)           // the matching end tag
                    [ \t]*
                    (?=\n{2,})      // followed by a blank line
                )
            /g,hashElement);
            */
            text = text.replace(/\n[ ]{0,3}((<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, hashElement);

            // Special case for standalone HTML comments:

            /*
            text = text.replace(/
                \n\n                                            // Starting after a blank line
                [ ]{0,3}                                        // attacklab: g_tab_width - 1
                (                                               // save in $1
                    <!
                    (--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)   // see http://www.w3.org/TR/html-markup/syntax.html#comments and http://meta.stackoverflow.com/q/95256
                    >
                    [ \t]*
                    (?=\n{2,})                                  // followed by a blank line
                )
            /g,hashElement);
            */
            text = text.replace(/\n\n[ ]{0,3}(<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>[ \t]*(?=\n{2,}))/g, hashElement);

            // PHP and ASP-style processor instructions (<?...?> and <%...%>)

            /*
            text = text.replace(/
                (?:
                    \n\n            // Starting after a blank line
                )
                (                   // save in $1
                    [ ]{0,3}        // attacklab: g_tab_width - 1
                    (?:
                        <([?%])     // $2
                        [^\r]*?
                        \2>
                    )
                    [ \t]*
                    (?=\n{2,})      // followed by a blank line
                )
            /g,hashElement);
            */
            text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, hashElement);

            return text;
        }

        function hashElement(wholeMatch, m1) {
            var blockText = m1;

            // Undo double lines
            blockText = blockText.replace(/^\n+/, "");

            // strip trailing blank lines
            blockText = blockText.replace(/\n+$/g, "");

            // Replace the element text with a marker ("~KxK" where x is its key)
            blockText = "\n\n~K" + (g_html_blocks.push(blockText) - 1) + "K\n\n";

            return blockText;
        }
        
        var blockGamutHookCallback = function (t) { return _RunBlockGamut(t); }

        function _RunBlockGamut(text, doNotUnhash) {
            //
            // These are all the transformations that form block-level
            // tags like paragraphs, headers, and list items.
            //
            
            text = pluginHooks.preBlockGamut(text, blockGamutHookCallback);
            
            text = _DoHeaders(text);

            // Do Horizontal Rules:
            var replacement = "<hr />\n";
            text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, replacement);
            text = text.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm, replacement);
            text = text.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm, replacement);

            text = _DoLists(text);
            text = _DoCodeBlocks(text);
            text = _DoBlockQuotes(text);
            
            text = pluginHooks.postBlockGamut(text, blockGamutHookCallback);

            // We already ran _HashHTMLBlocks() before, in Markdown(), but that
            // was to escape raw HTML in the original Markdown source. This time,
            // we're escaping the markup we've just created, so that we don't wrap
            // <p> tags around block-level tags.
            text = _HashHTMLBlocks(text);
            text = _FormParagraphs(text, doNotUnhash);

            return text;
        }

        function _RunSpanGamut(text) {
            //
            // These are all the transformations that occur *within* block-level
            // tags like paragraphs, headers, and list items.
            //

            text = pluginHooks.preSpanGamut(text);
            
            text = _DoCodeSpans(text);
            text = _EscapeSpecialCharsWithinTagAttributes(text);
            text = _EncodeBackslashEscapes(text);

            // Process anchor and image tags. Images must come first,
            // because ![foo][f] looks like an anchor.
            text = _DoImages(text);
            text = _DoAnchors(text);

            // Make links out of things like `<http://example.com/>`
            // Must come after _DoAnchors(), because you can use < and >
            // delimiters in inline links like [this](<url>).
            text = _DoAutoLinks(text);
            
            text = text.replace(/~P/g, "://"); // put in place to prevent autolinking; reset now
            
            text = _EncodeAmpsAndAngles(text);
            text = _DoItalicsAndBold(text);

            // Do hard breaks:
            text = text.replace(/  +\n/g, " <br>\n");
            
            text = pluginHooks.postSpanGamut(text);

            return text;
        }

        function _EscapeSpecialCharsWithinTagAttributes(text) {
            //
            // Within tags -- meaning between < and > -- encode [\ ` * _] so they
            // don't conflict with their use in Markdown for code, italics and strong.
            //

            // Build a regex to find HTML tags and comments.  See Friedl's 
            // "Mastering Regular Expressions", 2nd Ed., pp. 200-201.

            // SE: changed the comment part of the regex

            var regex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>)/gi;

            text = text.replace(regex, function (wholeMatch) {
                var tag = wholeMatch.replace(/(.)<\/?code>(?=.)/g, "$1`");
                tag = escapeCharacters(tag, wholeMatch.charAt(1) == "!" ? "\\`*_/" : "\\`*_"); // also escape slashes in comments to prevent autolinking there -- http://meta.stackoverflow.com/questions/95987
                return tag;
            });

            return text;
        }

        function _DoAnchors(text) {
            //
            // Turn Markdown link shortcuts into XHTML <a> tags.
            //
            //
            // First, handle reference-style links: [link text] [id]
            //

            /*
            text = text.replace(/
                (                           // wrap whole match in $1
                    \[
                    (
                        (?:
                            \[[^\]]*\]      // allow brackets nested one level
                            |
                            [^\[]           // or anything else
                        )*
                    )
                    \]

                    [ ]?                    // one optional space
                    (?:\n[ ]*)?             // one optional newline followed by spaces

                    \[
                    (.*?)                   // id = $3
                    \]
                )
                ()()()()                    // pad remaining backreferences
            /g, writeAnchorTag);
            */
            text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, writeAnchorTag);

            //
            // Next, inline-style links: [link text](url "optional title")
            //

            /*
            text = text.replace(/
                (                           // wrap whole match in $1
                    \[
                    (
                        (?:
                            \[[^\]]*\]      // allow brackets nested one level
                            |
                            [^\[\]]         // or anything else
                        )*
                    )
                    \]
                    \(                      // literal paren
                    [ \t]*
                    ()                      // no id, so leave $3 empty
                    <?(                     // href = $4
                        (?:
                            \([^)]*\)       // allow one level of (correctly nested) parens (think MSDN)
                            |
                            [^()\s]
                        )*?
                    )>?                
                    [ \t]*
                    (                       // $5
                        (['"])              // quote char = $6
                        (.*?)               // Title = $7
                        \6                  // matching quote
                        [ \t]*              // ignore any spaces/tabs between closing quote and )
                    )?                      // title is optional
                    \)
                )
            /g, writeAnchorTag);
            */

            text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?((?:\([^)]*\)|[^()\s])*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, writeAnchorTag);

            //
            // Last, handle reference-style shortcuts: [link text]
            // These must come last in case you've also got [link test][1]
            // or [link test](/foo)
            //

            /*
            text = text.replace(/
                (                   // wrap whole match in $1
                    \[
                    ([^\[\]]+)      // link text = $2; can't contain '[' or ']'
                    \]
                )
                ()()()()()          // pad rest of backreferences
            /g, writeAnchorTag);
            */
            text = text.replace(/(\[([^\[\]]+)\])()()()()()/g, writeAnchorTag);

            return text;
        }

        function writeAnchorTag(wholeMatch, m1, m2, m3, m4, m5, m6, m7) {
            if (m7 == undefined) m7 = "";
            var whole_match = m1;
            var link_text = m2.replace(/:\/\//g, "~P"); // to prevent auto-linking withing the link. will be converted back after the auto-linker runs
            var link_id = m3.toLowerCase();
            var url = m4;
            var title = m7;

            if (url == "") {
                if (link_id == "") {
                    // lower-case and turn embedded newlines into spaces
                    link_id = link_text.toLowerCase().replace(/ ?\n/g, " ");
                }
                url = "#" + link_id;

                if (g_urls.get(link_id) != undefined) {
                    url = g_urls.get(link_id);
                    if (g_titles.get(link_id) != undefined) {
                        title = g_titles.get(link_id);
                    }
                }
                else {
                    if (whole_match.search(/\(\s*\)$/m) > -1) {
                        // Special case for explicit empty url
                        url = "";
                    } else {
                        return whole_match;
                    }
                }
            }
            url = encodeProblemUrlChars(url);
            url = escapeCharacters(url, "*_");
            var result = "<a href=\"" + url + "\"";

            if (title != "") {
                title = attributeEncode(title);
                title = escapeCharacters(title, "*_");
                result += " title=\"" + title + "\"";
            }

            result += ">" + link_text + "</a>";

            return result;
        }

        function _DoImages(text) {
            //
            // Turn Markdown image shortcuts into <img> tags.
            //

            //
            // First, handle reference-style labeled images: ![alt text][id]
            //

            /*
            text = text.replace(/
                (                   // wrap whole match in $1
                    !\[
                    (.*?)           // alt text = $2
                    \]

                    [ ]?            // one optional space
                    (?:\n[ ]*)?     // one optional newline followed by spaces

                    \[
                    (.*?)           // id = $3
                    \]
                )
                ()()()()            // pad rest of backreferences
            /g, writeImageTag);
            */
            text = text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, writeImageTag);

            //
            // Next, handle inline images:  ![alt text](url "optional title")
            // Don't forget: encode * and _

            /*
            text = text.replace(/
                (                   // wrap whole match in $1
                    !\[
                    (.*?)           // alt text = $2
                    \]
                    \s?             // One optional whitespace character
                    \(              // literal paren
                    [ \t]*
                    ()              // no id, so leave $3 empty
                    <?(\S+?)>?      // src url = $4
                    [ \t]*
                    (               // $5
                        (['"])      // quote char = $6
                        (.*?)       // title = $7
                        \6          // matching quote
                        [ \t]*
                    )?              // title is optional
                    \)
                )
            /g, writeImageTag);
            */
            text = text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, writeImageTag);

            return text;
        }
        
        function attributeEncode(text) {
            // unconditionally replace angle brackets here -- what ends up in an attribute (e.g. alt or title)
            // never makes sense to have verbatim HTML in it (and the sanitizer would totally break it)
            return text.replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        }

        function writeImageTag(wholeMatch, m1, m2, m3, m4, m5, m6, m7) {
            var whole_match = m1;
            var alt_text = m2;
            var link_id = m3.toLowerCase();
            var url = m4;
            var title = m7;

            if (!title) title = "";

            if (url == "") {
                if (link_id == "") {
                    // lower-case and turn embedded newlines into spaces
                    link_id = alt_text.toLowerCase().replace(/ ?\n/g, " ");
                }
                url = "#" + link_id;

                if (g_urls.get(link_id) != undefined) {
                    url = g_urls.get(link_id);
                    if (g_titles.get(link_id) != undefined) {
                        title = g_titles.get(link_id);
                    }
                }
                else {
                    return whole_match;
                }
            }
            
            alt_text = escapeCharacters(attributeEncode(alt_text), "*_[]()");
            url = escapeCharacters(url, "*_");
            var result = "<img src=\"" + url + "\" alt=\"" + alt_text + "\"";

            // attacklab: Markdown.pl adds empty title attributes to images.
            // Replicate this bug.

            //if (title != "") {
            title = attributeEncode(title);
            title = escapeCharacters(title, "*_");
            result += " title=\"" + title + "\"";
            //}

            result += " />";

            return result;
        }

        function _DoHeaders(text) {

            // Setext-style headers:
            //  Header 1
            //  ========
            //  
            //  Header 2
            //  --------
            //
            text = text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,
                function (wholeMatch, m1) { return "<h1>" + _RunSpanGamut(m1) + "</h1>\n\n"; }
            );

            text = text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,
                function (matchFound, m1) { return "<h2>" + _RunSpanGamut(m1) + "</h2>\n\n"; }
            );

            // atx-style headers:
            //  # Header 1
            //  ## Header 2
            //  ## Header 2 with closing hashes ##
            //  ...
            //  ###### Header 6
            //

            /*
            text = text.replace(/
                ^(\#{1,6})      // $1 = string of #'s
                [ \t]*
                (.+?)           // $2 = Header text
                [ \t]*
                \#*             // optional closing #'s (not counted)
                \n+
            /gm, function() {...});
            */

            text = text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,
                function (wholeMatch, m1, m2) {
                    var h_level = m1.length;
                    return "<h" + h_level + ">" + _RunSpanGamut(m2) + "</h" + h_level + ">\n\n";
                }
            );

            return text;
        }

        function _DoLists(text) {
            //
            // Form HTML ordered (numbered) and unordered (bulleted) lists.
            //

            // attacklab: add sentinel to hack around khtml/safari bug:
            // http://bugs.webkit.org/show_bug.cgi?id=11231
            text += "~0";

            // Re-usable pattern to match any entirel ul or ol list:

            /*
            var whole_list = /
                (                                   // $1 = whole list
                    (                               // $2
                        [ ]{0,3}                    // attacklab: g_tab_width - 1
                        ([*+-]|\d+[.])              // $3 = first list item marker
                        [ \t]+
                    )
                    [^\r]+?
                    (                               // $4
                        ~0                          // sentinel for workaround; should be $
                        |
                        \n{2,}
                        (?=\S)
                        (?!                         // Negative lookahead for another list item marker
                            [ \t]*
                            (?:[*+-]|\d+[.])[ \t]+
                        )
                    )
                )
            /g
            */
            var whole_list = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

            if (g_list_level) {
                text = text.replace(whole_list, function (wholeMatch, m1, m2) {
                    var list = m1;
                    var list_type = (m2.search(/[*+-]/g) > -1) ? "ul" : "ol";

                    var result = _ProcessListItems(list, list_type);

                    // Trim any trailing whitespace, to put the closing `</$list_type>`
                    // up on the preceding line, to get it past the current stupid
                    // HTML block parser. This is a hack to work around the terrible
                    // hack that is the HTML block parser.
                    result = result.replace(/\s+$/, "");
                    result = "<" + list_type + ">" + result + "</" + list_type + ">\n";
                    return result;
                });
            } else {
                whole_list = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;
                text = text.replace(whole_list, function (wholeMatch, m1, m2, m3) {
                    var runup = m1;
                    var list = m2;

                    var list_type = (m3.search(/[*+-]/g) > -1) ? "ul" : "ol";
                    var result = _ProcessListItems(list, list_type);
                    result = runup + "<" + list_type + ">\n" + result + "</" + list_type + ">\n";
                    return result;
                });
            }

            // attacklab: strip sentinel
            text = text.replace(/~0/, "");

            return text;
        }

        var _listItemMarkers = { ol: "\\d+[.]", ul: "[*+-]" };

        function _ProcessListItems(list_str, list_type) {
            //
            //  Process the contents of a single ordered or unordered list, splitting it
            //  into individual list items.
            //
            //  list_type is either "ul" or "ol".

            // The $g_list_level global keeps track of when we're inside a list.
            // Each time we enter a list, we increment it; when we leave a list,
            // we decrement. If it's zero, we're not in a list anymore.
            //
            // We do this because when we're not inside a list, we want to treat
            // something like this:
            //
            //    I recommend upgrading to version
            //    8. Oops, now this line is treated
            //    as a sub-list.
            //
            // As a single paragraph, despite the fact that the second line starts
            // with a digit-period-space sequence.
            //
            // Whereas when we're inside a list (or sub-list), that line will be
            // treated as the start of a sub-list. What a kludge, huh? This is
            // an aspect of Markdown's syntax that's hard to parse perfectly
            // without resorting to mind-reading. Perhaps the solution is to
            // change the syntax rules such that sub-lists must start with a
            // starting cardinal number; e.g. "1." or "a.".

            g_list_level++;

            // trim trailing blank lines:
            list_str = list_str.replace(/\n{2,}$/, "\n");

            // attacklab: add sentinel to emulate \z
            list_str += "~0";

            // In the original attacklab showdown, list_type was not given to this function, and anything
            // that matched /[*+-]|\d+[.]/ would just create the next <li>, causing this mismatch:
            //
            //  Markdown          rendered by WMD        rendered by MarkdownSharp
            //  ------------------------------------------------------------------
            //  1. first          1. first               1. first
            //  2. second         2. second              2. second
            //  - third           3. third                   * third
            //
            // We changed this to behave identical to MarkdownSharp. This is the constructed RegEx,
            // with {MARKER} being one of \d+[.] or [*+-], depending on list_type:
        
            /*
            list_str = list_str.replace(/
                (^[ \t]*)                       // leading whitespace = $1
                ({MARKER}) [ \t]+               // list marker = $2
                ([^\r]+?                        // list item text   = $3
                    (\n+)
                )
                (?=
                    (~0 | \2 ({MARKER}) [ \t]+)
                )
            /gm, function(){...});
            */

            var marker = _listItemMarkers[list_type];
            var re = new RegExp("(^[ \\t]*)(" + marker + ")[ \\t]+([^\\r]+?(\\n+))(?=(~0|\\1(" + marker + ")[ \\t]+))", "gm");
            var last_item_had_a_double_newline = false;
            list_str = list_str.replace(re,
                function (wholeMatch, m1, m2, m3) {
                    var item = m3;
                    var leading_space = m1;
                    var ends_with_double_newline = /\n\n$/.test(item);
                    var contains_double_newline = ends_with_double_newline || item.search(/\n{2,}/) > -1;

                    if (contains_double_newline || last_item_had_a_double_newline) {
                        item = _RunBlockGamut(_Outdent(item), /* doNotUnhash = */true);
                    }
                    else {
                        // Recursion for sub-lists:
                        item = _DoLists(_Outdent(item));
                        item = item.replace(/\n$/, ""); // chomp(item)
                        item = _RunSpanGamut(item);
                    }
                    last_item_had_a_double_newline = ends_with_double_newline;
                    return "<li>" + item + "</li>\n";
                }
            );

            // attacklab: strip sentinel
            list_str = list_str.replace(/~0/g, "");

            g_list_level--;
            return list_str;
        }

        function _DoCodeBlocks(text) {
            //
            //  Process Markdown `<pre><code>` blocks.
            //  

            /*
            text = text.replace(/
                (?:\n\n|^)
                (                               // $1 = the code block -- one or more lines, starting with a space/tab
                    (?:
                        (?:[ ]{4}|\t)           // Lines must start with a tab or a tab-width of spaces - attacklab: g_tab_width
                        .*\n+
                    )+
                )
                (\n*[ ]{0,3}[^ \t\n]|(?=~0))    // attacklab: g_tab_width
            /g ,function(){...});
            */

            // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
            text += "~0";

            text = text.replace(/(?:\n\n|^\n?)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,
                function (wholeMatch, m1, m2) {
                    var codeblock = m1;
                    var nextChar = m2;

                    codeblock = _EncodeCode(_Outdent(codeblock));
                    codeblock = _Detab(codeblock);
                    codeblock = codeblock.replace(/^\n+/g, ""); // trim leading newlines
                    codeblock = codeblock.replace(/\n+$/g, ""); // trim trailing whitespace

                    codeblock = "<pre><code>" + codeblock + "\n</code></pre>";

                    return "\n\n" + codeblock + "\n\n" + nextChar;
                }
            );

            // attacklab: strip sentinel
            text = text.replace(/~0/, "");

            return text;
        }

        function hashBlock(text) {
            text = text.replace(/(^\n+|\n+$)/g, "");
            return "\n\n~K" + (g_html_blocks.push(text) - 1) + "K\n\n";
        }

        function _DoCodeSpans(text) {
            //
            // * Backtick quotes are used for <code></code> spans.
            // 
            // * You can use multiple backticks as the delimiters if you want to
            //   include literal backticks in the code span. So, this input:
            //     
            //      Just type ``foo `bar` baz`` at the prompt.
            //     
            //   Will translate to:
            //     
            //      <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
            //     
            //   There's no arbitrary limit to the number of backticks you
            //   can use as delimters. If you need three consecutive backticks
            //   in your code, use four for delimiters, etc.
            //
            // * You can use spaces to get literal backticks at the edges:
            //     
            //      ... type `` `bar` `` ...
            //     
            //   Turns to:
            //     
            //      ... type <code>`bar`</code> ...
            //

            /*
            text = text.replace(/
                (^|[^\\])       // Character before opening ` can't be a backslash
                (`+)            // $2 = Opening run of `
                (               // $3 = The code block
                    [^\r]*?
                    [^`]        // attacklab: work around lack of lookbehind
                )
                \2              // Matching closer
                (?!`)
            /gm, function(){...});
            */

            text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
                function (wholeMatch, m1, m2, m3, m4) {
                    var c = m3;
                    c = c.replace(/^([ \t]*)/g, ""); // leading whitespace
                    c = c.replace(/[ \t]*$/g, ""); // trailing whitespace
                    c = _EncodeCode(c);
                    c = c.replace(/:\/\//g, "~P"); // to prevent auto-linking. Not necessary in code *blocks*, but in code spans. Will be converted back after the auto-linker runs.
                    return m1 + "<code>" + c + "</code>";
                }
            );

            return text;
        }

        function _EncodeCode(text) {
            //
            // Encode/escape certain characters inside Markdown code runs.
            // The point is that in code, these characters are literals,
            // and lose their special Markdown meanings.
            //
            // Encode all ampersands; HTML entities are not
            // entities within a Markdown code span.
            text = text.replace(/&/g, "&amp;");

            // Do the angle bracket song and dance:
            text = text.replace(/</g, "&lt;");
            text = text.replace(/>/g, "&gt;");

            // Now, escape characters that are magic in Markdown:
            text = escapeCharacters(text, "\*_{}[]\\", false);

            // jj the line above breaks this:
            //---

            //* Item

            //   1. Subitem

            //            special char: *
            //---

            return text;
        }

        function _DoItalicsAndBold(text) {

            // <strong> must go first:
            text = text.replace(/([\W_]|^)(\*\*|__)(?=\S)([^\r]*?\S[\*_]*)\2([\W_]|$)/g,
            "$1<strong>$3</strong>$4");

            text = text.replace(/([\W_]|^)(\*|_)(?=\S)([^\r\*_]*?\S)\2([\W_]|$)/g,
            "$1<em>$3</em>$4");

            return text;
        }

        function _DoBlockQuotes(text) {

            /*
            text = text.replace(/
                (                           // Wrap whole match in $1
                    (
                        ^[ \t]*>[ \t]?      // '>' at the start of a line
                        .+\n                // rest of the first line
                        (.+\n)*             // subsequent consecutive lines
                        \n*                 // blanks
                    )+
                )
            /gm, function(){...});
            */

            text = text.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,
                function (wholeMatch, m1) {
                    var bq = m1;

                    // attacklab: hack around Konqueror 3.5.4 bug:
                    // "----------bug".replace(/^-/g,"") == "bug"

                    bq = bq.replace(/^[ \t]*>[ \t]?/gm, "~0"); // trim one level of quoting

                    // attacklab: clean up hack
                    bq = bq.replace(/~0/g, "");

                    bq = bq.replace(/^[ \t]+$/gm, "");     // trim whitespace-only lines
                    bq = _RunBlockGamut(bq);             // recurse

                    bq = bq.replace(/(^|\n)/g, "$1  ");
                    // These leading spaces screw with <pre> content, so we need to fix that:
                    bq = bq.replace(
                            /(\s*<pre>[^\r]+?<\/pre>)/gm,
                        function (wholeMatch, m1) {
                            var pre = m1;
                            // attacklab: hack around Konqueror 3.5.4 bug:
                            pre = pre.replace(/^  /mg, "~0");
                            pre = pre.replace(/~0/g, "");
                            return pre;
                        });

                    return hashBlock("<blockquote>\n" + bq + "\n</blockquote>");
                }
            );
            return text;
        }

        function _FormParagraphs(text, doNotUnhash) {
            //
            //  Params:
            //    $text - string to process with html <p> tags
            //

            // Strip leading and trailing lines:
            text = text.replace(/^\n+/g, "");
            text = text.replace(/\n+$/g, "");

            var grafs = text.split(/\n{2,}/g);
            var grafsOut = [];
            
            var markerRe = /~K(\d+)K/;

            //
            // Wrap <p> tags.
            //
            var end = grafs.length;
            for (var i = 0; i < end; i++) {
                var str = grafs[i];

                // if this is an HTML marker, copy it
                if (markerRe.test(str)) {
                    grafsOut.push(str);
                }
                else if (/\S/.test(str)) {
                    str = _RunSpanGamut(str);
                    str = str.replace(/^([ \t]*)/g, "<p>");
                    str += "</p>"
                    grafsOut.push(str);
                }

            }
            //
            // Unhashify HTML blocks
            //
            if (!doNotUnhash) {
                end = grafsOut.length;
                for (var i = 0; i < end; i++) {
                    var foundAny = true;
                    while (foundAny) { // we may need several runs, since the data may be nested
                        foundAny = false;
                        grafsOut[i] = grafsOut[i].replace(/~K(\d+)K/g, function (wholeMatch, id) {
                            foundAny = true;
                            return g_html_blocks[id];
                        });
                    }
                }
            }
            return grafsOut.join("\n\n");
        }

        function _EncodeAmpsAndAngles(text) {
            // Smart processing for ampersands and angle brackets that need to be encoded.

            // Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
            //   http://bumppo.net/projects/amputator/
            text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;");

            // Encode naked <'s
            text = text.replace(/<(?![a-z\/?!]|~D)/gi, "&lt;");

            return text;
        }

        function _EncodeBackslashEscapes(text) {
            //
            //   Parameter:  String.
            //   Returns:    The string, with after processing the following backslash
            //               escape sequences.
            //

            // attacklab: The polite way to do this is with the new
            // escapeCharacters() function:
            //
            //     text = escapeCharacters(text,"\\",true);
            //     text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
            //
            // ...but we're sidestepping its use of the (slow) RegExp constructor
            // as an optimization for Firefox.  This function gets called a LOT.

            text = text.replace(/\\(\\)/g, escapeCharacters_callback);
            text = text.replace(/\\([`*_{}\[\]()>#+-.!])/g, escapeCharacters_callback);
            return text;
        }
        
        function handleTrailingParens(wholeMatch, lookbehind, protocol, link) {
            if (lookbehind)
                return wholeMatch;
            if (link.charAt(link.length - 1) !== ")")
                return "<" + protocol + link + ">";
            var parens = link.match(/[()]/g);
            var level = 0;
            for (var i = 0; i < parens.length; i++) {
                if (parens[i] === "(") {
                    if (level <= 0)
                        level = 1;
                    else
                        level++;
                }
                else {
                    level--;
                }
            }
            var tail = "";
            if (level < 0) {
                var re = new RegExp("\\){1," + (-level) + "}$");
                link = link.replace(re, function (trailingParens) {
                    tail = trailingParens;
                    return "";
                });
            }
            
            return "<" + protocol + link + ">" + tail;
        }

        function _DoAutoLinks(text) {

            // note that at this point, all other URL in the text are already hyperlinked as <a href=""></a>
            // *except* for the <http://www.foo.com> case

            // automatically add < and > around unadorned raw hyperlinks
            // must be preceded by a non-word character (and not by =" or <) and followed by non-word/EOF character
            // simulating the lookbehind in a consuming way is okay here, since a URL can neither and with a " nor
            // with a <, so there is no risk of overlapping matches.
            text = text.replace(/(="|<)?\b(https?|ftp)(:\/\/[-A-Z0-9+&@#\/%?=~_|\[\]\(\)!:,\.;]*[-A-Z0-9+&@#\/%=~_|\[\])])(?=$|\W)/gi, handleTrailingParens);

            //  autolink anything like <http://example.com>
            
            var replacer = function (wholematch, m1) { return "<a href=\"" + m1 + "\">" + pluginHooks.plainLinkText(m1) + "</a>"; }
            text = text.replace(/<((https?|ftp):[^'">\s]+)>/gi, replacer);

            // Email addresses: <address@domain.foo>
            /*
            text = text.replace(/
                <
                (?:mailto:)?
                (
                    [-.\w]+
                    \@
                    [-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+
                )
                >
            /gi, _DoAutoLinks_callback());
            */

            /* disabling email autolinking, since we don't do that on the server, either
            text = text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,
                function(wholeMatch,m1) {
                    return _EncodeEmailAddress( _UnescapeSpecialChars(m1) );
                }
            );
            */
            return text;
        }

        function _UnescapeSpecialChars(text) {
            //
            // Swap back in all the special characters we've hidden.
            //
            text = text.replace(/~E(\d+)E/g,
                function (wholeMatch, m1) {
                    var charCodeToReplace = parseInt(m1);
                    return String.fromCharCode(charCodeToReplace);
                }
            );
            return text;
        }

        function _Outdent(text) {
            //
            // Remove one level of line-leading tabs or spaces
            //

            // attacklab: hack around Konqueror 3.5.4 bug:
            // "----------bug".replace(/^-/g,"") == "bug"

            text = text.replace(/^(\t|[ ]{1,4})/gm, "~0"); // attacklab: g_tab_width

            // attacklab: clean up hack
            text = text.replace(/~0/g, "")

            return text;
        }

        function _Detab(text) {
            if (!/\t/.test(text))
                return text;

            var spaces = ["    ", "   ", "  ", " "],
            skew = 0,
            v;

            return text.replace(/[\n\t]/g, function (match, offset) {
                if (match === "\n") {
                    skew = offset + 1;
                    return match;
                }
                v = (offset - skew) % 4;
                skew = offset + 1;
                return spaces[v];
            });
        }

        //
        //  attacklab: Utility functions
        //

        var _problemUrlChars = /(?:["'*()[\]:]|~D)/g;

        // hex-encodes some unusual "problem" chars in URLs to avoid URL detection problems 
        function encodeProblemUrlChars(url) {
            if (!url)
                return "";

            var len = url.length;

            return url.replace(_problemUrlChars, function (match, offset) {
                if (match == "~D") // escape for dollar
                    return "%24";
                if (match == ":") {
                    if (offset == len - 1 || /[0-9\/]/.test(url.charAt(offset + 1)))
                        return ":"
                }
                return "%" + match.charCodeAt(0).toString(16);
            });
        }


        function escapeCharacters(text, charsToEscape, afterBackslash) {
            // First we have to escape the escape characters so that
            // we can build a character class out of them
            var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g, "\\$1") + "])";

            if (afterBackslash) {
                regexString = "\\\\" + regexString;
            }

            var regex = new RegExp(regexString, "g");
            text = text.replace(regex, escapeCharacters_callback);

            return text;
        }


        function escapeCharacters_callback(wholeMatch, m1) {
            var charCodeToEscape = m1.charCodeAt(0);
            return "~E" + charCodeToEscape + "E";
        }

    }; // end of the Markdown.Converter constructor

})();
// FILE IS DESTROYED AND REBUILT IN MAKE
/**
 * tequila
 * tequila-class.js
 */
var Tequila = (function () {
  var singletonInstance;
  function init() {
    // Private methods and variables
    var version = '0.0.1';
//    function privateMethod() {
//      console.log("I am private");
//    }
//    var privateVariable = "Im also private";
    var attributeTypes = ['ID', 'String', 'Date', 'Boolean', 'Number', 'Model', 'Group', 'Table'];
    return    {
      // Public methods and variables
      getVersion: function () {
        return version;
      },
      contains: function (a, obj) {
        for (var i = 0; i < a.length; i++) {
          if (a[i] === obj) return true;
        }
        return false;
      },
      getUnusedProperties: function (properties, allowedProperties) {
        var props = [];
        for (var property in properties) {
          if (!this.contains(allowedProperties, property)) {
            props.push(property);
          }
        }
        return props;
      },
      inheritPrototype: function(p) {
        if (p == null) throw TypeError();
        if (Object.create) return Object.create(p);
        var t = typeof p;
        if (t !== "object" && typeof t !== "function") throw TypeError();
        function f() {};
        f.prototype = p;
        return new f();
      },
      getAttributeTypes: function() {
        return attributeTypes;
      }
    };
  };
  return function () {
    if (!singletonInstance) singletonInstance = init();
    return singletonInstance;
  };
})();
// Library scoped ref to singleton
var T = Tequila();
/**
 * tequila
 * attribute-class
 */
// Attribute Constructor
function Attribute(args, arg2) {
  var splitTypes; // For String(30) type
  if (false === (this instanceof Attribute)) throw new Error('new operator required');
  if (typeof args == 'string') {
    var quickName = args;
    args = [];
    args.name = quickName;
    if (typeof arg2 == 'string') {
      args.type = arg2;
    }
  }
  args = args || [];
  this.name = args.name || null;
  this.label = args.label || args.name;
  this.type = args.type || 'String';
  splitTypes = splitParens(this.type);
  this.type = splitTypes[0];
  var unusedProperties = [];
  switch (this.type) {
    case 'ID':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'String':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value', 'size']);
      this.size = splitTypes[1] ? splitTypes[1] : typeof args.size == 'number' ? args.size : args.size || 50;
      this.value = args.value || null;
      break;
    case 'Date':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'Boolean':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'Number':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'Model':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value', 'modelType']);
      this.value = args.value || null;
      this.modelType = args.modelType || null;
      break;
    case 'Group':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'Table':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value', 'group']);
      this.value = args.value || null;
      this.group = args.group || null;
      break;

    default:
      break;
  }
  var badJooJoo = this.getValidationErrors(); // before leaving make sure valid Attribute
  for (var i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Attribute: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Attribute: ' + badJooJoo[0]);
}
/*
 * Methods
 */
Attribute.prototype.toString = function () {
  return this.name === null ? 'new Attribute' : 'Attribute: ' + this.name;
};
Attribute.prototype.coerce = function (value) {
  var newValue = value;
  var temp;
  switch (this.type) {
    case 'String':
      if (typeof newValue == 'undefined') return '';
      if (typeof newValue == 'boolean' && !newValue) return 'false';
      if (!newValue) return '';
      newValue = value.toString();
      if (newValue.length > this.size) return newValue.substring(0, this.size);
      return newValue;
      break;
    case 'Number':
      if (typeof newValue == 'undefined') return 0;
      if (!newValue) return 0;
      if (typeof newValue == 'string') {
        newValue = newValue.replace(/^\s+|\s+$/g, ''); // trim
        temp = newValue.split(' ');
        newValue = temp.length ? temp[0] : '';
        newValue = Number(newValue.replace(/[^/0-9\ \.]+/g, ""));
      } else {
        newValue = Number(newValue);
      }
      if (!newValue) return 0;
      return newValue;
      break;
    case 'Boolean':
      if (typeof newValue == 'undefined') return false;
      if (typeof newValue == 'string') {
        newValue =newValue.toUpperCase();
        if (newValue === 'Y' || newValue === 'YES' || newValue === 'T' || newValue === 'TRUE' || newValue === '1')
          return true;
        return false;
      }
      return (newValue == true);
      break;
  }
  throw(Error('coerce cannot determine appropriate value'))
};
Attribute.prototype.getValidationErrors = function () {
  var errors = [];
  if (!this.name) errors.push('name required');
  var shit = T.getAttributeTypes();
  if (!T.contains(shit, this.type))
    errors.push('Invalid type: ' + this.type);
  switch (this.type) {
    case 'ID': // Todo how to handle IDs ?
      if (!(this.value == null /*  || this.value instanceof ID */ )) errors.push('value must be null or a ID');
      break;
    case 'String':
      if (typeof this.size != 'number') errors.push('size must be a number from 1 to 255');
      if (this.size < 1 || this.size > 255) errors.push('size must be a number from 1 to 255');
      if (!(this.value == null || typeof this.value == 'string')) errors.push('value must be null or a String');
      break;
    case 'Date':
      if (!(this.value == null || this.value instanceof Date)) errors.push('value must be null or a Date');
      break;
    case 'Boolean':
      if (!(this.value == null || typeof this.value == 'boolean')) errors.push('value must be null or a Boolean');
      break;
    case 'Number':
      if (!(this.value == null || typeof this.value == 'number')) errors.push('value must be null or a Number');
      break;
    case 'Model':
      if (!(this.value == null || this.value instanceof Model)) errors.push('value must be null or a Model');
      if (!(this.modelType instanceof Model)) errors.push('modelType must be instance of Model');
      break;
    case 'Group':
      if (this.value == null || this.value instanceof Array) {
        for (var i in this.value) {
          if (!(this.value[i] instanceof Attribute)) errors.push('each element in group must be instance of Attribute');
          if (this.value[i].getValidationErrors().length) errors.push('group contains invalid members');
        }
      } else {
        errors.push('value must be null or an array');
      }
      break;
    case 'Table':
      if (!(this.group instanceof Attribute)) {
        errors.push('group property required');
      } else {
        if (this.group.value instanceof Array) {
          if (this.group.value.length < 1) {
            errors.push('group property value must contain at least one Attribute');
          } else {
            for (var i in this.group.value) {
              if (!(this.group.value[i] instanceof Attribute)) errors.push('each element in group must be instance of Attribute');
              if (this.group.value[i].getValidationErrors().length) errors.push('group contains invalid members');
            }
          }
        } else {
          errors.push('group.value must be an array');
        }
      }
      break;
    default:
      break;
  }
  return errors;
};
/*
 * Helpers
 */
function splitParens(str, outside, inside) {
  var tmpSplit = str.split('(');
  tmpSplit[1] = parseInt(tmpSplit[1]);
  return tmpSplit;
}
/**
 * tequila
 * model-class
 */
// Model Constructor
var Model = function (args) {
  if (false === (this instanceof Model)) throw new Error('new operator required');
  this.modelType = "Model";
  this.attributes = [new Attribute('id','ID')];
  args = args || [];
  if (args.attributes) {
    for (var i in args.attributes) {
      this.attributes.push(args.attributes[i]);
    }
  }
  var unusedProperties = T.getUnusedProperties(args, ['attributes']);
  var badJooJoo = this.getValidationErrors(); // before leaving make sure valid Model
  for (var i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Attribute: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Attribute: ' + badJooJoo[0]);
};
// Methods
Model.prototype.toString = function () {
  return "a " + this.modelType;
};

Model.prototype.copy = function (sourceModel) {
  for (var i in this.attributes) {
    this.attributes[i].value = sourceModel.attributes[i].value;
  }
}
Model.prototype.getValidationErrors = function () {
  var errors = [];
  // check attributes
  if (!(this.attributes instanceof Array)) {
    errors.push('attributes must be Array');
  } else {
    if (this.attributes.length<1) {
      errors.push('attributes must not be empty');
    } else {
      for (var i = 0; i < this.attributes.length; i++) {
        if (i == 0 && (!(this.attributes[i] instanceof Attribute) || this.attributes[i].type != "ID")) errors.push('first attribute must be ID');
        if (!(this.attributes[i] instanceof Attribute)) errors.push('attribute must be Attribute');
      }
    }
  }
  // check tags
  if (this.tags !== undefined && !(this.tags instanceof Array)) {
    errors.push('tags must be Array or null');
  }
  return errors;
};
Model.prototype.getAttributeValue = function(attribute) {
  for (var i = 0; i < this.attributes.length; i++) {
    if (this.attributes[i].name.toUpperCase() == attribute.toUpperCase())
      return this.attributes[i].value;
  }
};
Model.prototype.setAttributeValue = function(attribute,value) {
  for (var i = 0; i < this.attributes.length; i++) {
    if (this.attributes[i].name.toUpperCase() == attribute.toUpperCase()) {
      this.attributes[i].value = value;
      return;
    }
  }
  throw new Error('attribute not valid for model');
};/**
 * tequila
 * list-class
 */

// Constructor
var List = function () {
  if (false === (this instanceof List)) throw new Error('new operator required');
  this.items = [];
};/**
 * tequila
 * user-core-model
 */

// Model Constructor
var User = function (args) {
  if (false === (this instanceof User)) throw new Error('new operator required');
  Model.call(this,args);
  this.modelType = "User";
};
User.prototype = T.inheritPrototype(Model.prototype);/**
 * tequila
 * store-core-model
 */

// Constructor
var Store = function (args) {
  if (false === (this instanceof Store)) throw new Error('new operator required');
  Model.call(this,args);
  this.modelType = "Store";
  this.interface = {
    canGetModel: false,
    canPutModel: false,
    canDeleteModel: false
  };
};
Store.prototype = T.inheritPrototype(Model.prototype);
// Methods
Store.prototype.getStoreInterface = function () {
  return this.interface;
};
Store.prototype.getModel = function (parm /* {modelType:modelID} */) {
  throw new Error('Store does not provide getModel');
};
Store.prototype.putModel = function (parm /* {modelType:model} */) {
  throw new Error('Store does not provide putModel');
};
Store.prototype.deleteModel = function (parm /* {modelType:modelID} */) {
  throw new Error('Store does not provide deleteModel');
};/**
 * tequila
 * memory-store-model
 */
// Constructor
var MemoryStore = function (args) {
  if (false === (this instanceof MemoryStore)) throw new Error('new operator required');
  Store.call(this, args);
  this.modelType = "MemoryStore";
  this.interface.canGetModel = true;
  this.interface.canPutModel = true;
  this.interface.canDeleteModel = true;
  this.data = [];// Each ele is an array of model types and contents (which is an array of IDs and Model Value Store)
  this.idCounter = 0;
};
MemoryStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
MemoryStore.prototype.getModel = function (model, callBack, self) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callback required');
  // Find model in memorystore, error out if can't find
  var modelIndex = -1;
  for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
  if (modelIndex < 0) {
    callBack(model, new Error('model not found in store'), self);
    return;
  }
  // Find the ID now and put in instanceIndex
  var id = model.getAttributeValue('id');
  var storedPair = this.data[modelIndex][1];
  var instanceIndex = -1;
  for (var i = 0; instanceIndex < 0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
  if (instanceIndex < 0) {
    callBack(model, new Error('id not found in store'), self);
    return;
  }
  // Copy values from store to ref model
  var storeValues = storedPair[instanceIndex][1];
  for (var a in model.attributes) {
    model.attributes[a].value = storeValues[model.attributes[a].name];
  }
  callBack(model, undefined, self);
};
MemoryStore.prototype.putModel = function (model, callBack, self) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');

  var id = model.getAttributeValue('ID');
  if (id) {
    // Find model in memorystore, error out if can't find
    var modelIndex = -1;
    for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
    if (modelIndex < 0) {
      callBack(model, new Error('model not found in store'), self);
      return;
    }
    // Find the ID now
    var instanceIndex = -1;
    var id = model.getAttributeValue('id');
    var storedPair = this.data[modelIndex][1];
    for (var i = 0; instanceIndex < 0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
    if (instanceIndex < 0) {
      callBack(model, new Error('id not found in store'), self);
      return;
    }
    // Copy from store
    var ModelValues = {};
    for (var a in model.attributes) {
      var theName = model.attributes[a].name;
      var theValue = model.attributes[a].value;
      ModelValues[theName] = theValue;
    }
    storedPair[instanceIndex][1] = ModelValues;
    callBack(model, undefined, self);
  } else {
    // Find model in memorystore, add if not found
    var modelIndex = -1;
    for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
    if (modelIndex < 0) {
      this.data.push([model.modelType, [] ]);
      modelIndex = this.data.length - 1;
    }
    // Add the id and model to memory store
    var newID = ++this.idCounter;
    model.setAttributeValue('id', newID);
    var ModelValues = {};
    for (var a in model.attributes) {
      var theName = model.attributes[a].name;
      var theValue = model.attributes[a].value;
      ModelValues[theName] = theValue;
    }
    this.data[modelIndex][1].push([newID, ModelValues]);
    callBack(model, undefined, self);
  }

};
MemoryStore.prototype.deleteModel = function (model, callBack, self) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  // Find model in memorystore, error out if can't find
  var modelIndex = -1;
  for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
  if (modelIndex < 0) {
    callBack(model, new Error('model not found in store'), self);
    return;
  }
  // Find the ID now
  var instanceIndex = -1;
  var id = model.getAttributeValue('id');
  var storedPair = this.data[modelIndex][1];
  for (var i = 0; instanceIndex < 0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
  if (instanceIndex < 0) {
    callBack(model, new Error('id not found in store'), self);
    return;
  }
  // Splice out the stored values then prepare that Model for callback with ID stripped
  //var storeValues = storedPair[instanceIndex][1];
  var storeValues = storedPair.splice(instanceIndex,1)[0][1];
  for (var a in model.attributes) {
    if (model.attributes[a].name=='id')
      model.attributes[a].value = undefined;
    else
      model.attributes[a].value = storeValues[model.attributes[a].name];
  }
  callBack(model, undefined, self);
};/***********************************************************************************************************************
 * tequila
 * node-test-header
 */

var colors = require('colors');/**
 * tequila
 * test-tequila
 */
var TestNode = function (inheritanceTest, nodeType, level, levelText, text, func, exampleNumber, deferedExample, expectedValue) {
  this.inheritanceTest = inheritanceTest;
  this.nodeType = nodeType; // nodeType 1 char string: H)eading P)aragraph E)xample E(X)eption
  this.level = level;
  this.levelText = levelText;
  this.text = text;
  this.func = func;
  this.exampleNumber = exampleNumber;
  var funcText;
  if (func) {
    funcText = test.formatCode(func, false);
  }
  this.deferedExample = (funcText && funcText.length > 0) ? deferedExample : true;
  this.expectedValue = expectedValue;
  return this;
};
var test = {};
test.converter = new Markdown.Converter();
test.showWork = [];
test.AsyncResponse = function (wut) {
  return 'test.AsyncResponse: ' + wut;
};
test.start = function (options) {
  this.nodes = [];
  this.exampleNumber = 0;
  this.headingLevel = 0;
  this.levels = [0];
};
test.heading = function (text, func) {
  this.levels[this.headingLevel]++;
  this.outlineLabel = '';
  for (var i in this.levels) this.outlineLabel += this.levels[i].toString() + '.';
  this.nodes.push(new TestNode(T.inheritanceTest, 'h', this.headingLevel + 1, this.outlineLabel, text, func));
  if (func) {
    this.headingLevel++;
    this.levels[this.headingLevel] = 0;
    func();
    this.headingLevel--;
    this.levels.pop();
  }
};
test.paragraph = function (text) {
  this.nodes.push(new TestNode(T.inheritanceTest, 'p', this.headingLevel + 1, this.outlineLabel, text));
};
test.example = function (text, expect, func) {
  this.exampleNumber++;
  this.nodes.push(new TestNode(T.inheritanceTest, 'e', this.headingLevel + 1, this.outlineLabel, text, func, this.exampleNumber, false, expect));
};
test.xexample = function (text, expect, func) {
  this.exampleNumber++;
  this.nodes.push(new TestNode(T.inheritanceTest, 'e', this.headingLevel + 1, this.outlineLabel, text, func, this.exampleNumber, true, expect));
};
test.assertion = function (truDat) {
  test.assertions.push(truDat);
};
test.show = function (value) {
  try {
    if (value == null || value instanceof Date || typeof value == 'number' || typeof value == 'function' || value instanceof RegExp) {
      test.showWork.push(value);
      return;
    }
    if (value !== undefined) {
      test.showWork.push(JSON.stringify(value));
      return;
    }
    test.showWork.push(value);
  } catch (e) {
    test.showWork.push(e);
  }

};
test.stop = function () {
};
test.run = function (resultsCallback) {
};
test.getParam = function (name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results == null)
    return "";
  else
    return results[1];
};
test.refresh = function () {
//  test.filterLevel='All';
  var vars = '';
  if (test.hideExamples) vars += (vars ? '&' : '') + '?he=Y';
  if (test.filterSection) vars += (vars ? '&' : '') + '?fs=' + test.filterSection;
  if (test.filterLevel) vars += (vars ? '&' : '') + '?fl=' + test.filterLevel;
  var rootPath = window.location.href;
  if (rootPath.indexOf('#') > 0) rootPath = rootPath.substring(0, rootPath.indexOf('#'))
  window.location.href = rootPath + vars ? ("#" + vars) : '';
  window.location.reload();
};
test.render = function (isBrowser) {
  var i, j;
  test.isBrowser = isBrowser;
  test.countUnique = 0;
  test.countTests = 0;
  test.countPass = 0;
  test.countFail = 0;
  test.countDefer = 0;
  test.countPending = 0;
  test.testsLaunched = false;
  // function to evaluate results of async
  var asyncCallback = function (node, test_Results) {
    if (node.errorThrown) return;
    var testPassed = false;
    test.wasThrown = false;
    var expectedValue = node.expectedValue.substr(20, 999);
    exampleCode = '';
    if (typeof test_Results == 'undefined') {
      if (typeof expectedValue == 'undefined') testPassed = true;
    } else {
      if (typeof expectedValue != 'undefined' && test_Results.toString() === expectedValue.toString()) testPassed = true;
    }
    // Check assertions
    var gotFailedAssertions = false;
    for (var j in test.assertions) {
      if (!test.assertions[j]) gotFailedAssertions = true;
    }
    gotFailedAssertions = true; /////////////////////////////////// FORCE
    test.countPending--;
    if (test.isBrowser) {
      if (testPassed && !gotFailedAssertions) {
        test.countPass++;
        node.examplePre.style.background = "#cfc"; // green
        if (test.wasThrown) {
          exampleCode += '✓<b>error thrown as expected (' + test_Results + ')</b>'; // ✘
        } else {
          if (typeof test_Results == 'undefined') {
            exampleCode += '✓<b>returns without harming any kittens</b>'; // ✘
          } else {
            exampleCode += '✓<b>returns ' + test.expressionInfo(test_Results) + ' as expected</b>'; // ✘
          }
        }
      } else {
        // clear invisible attribute if failed
        node.examplePre.style.display = "";
        node.exampleCaption.style.display = "";
        test.countFail++;
        node.examplePre.style.background = "#fcc"; // red
        if (test.wasThrown) {
          if (node.expectedValue === undefined) {
            exampleCode += '<b>✘ERROR THROWN: ' + test.expressionInfo(test_Results) + '\n';
          } else {
            exampleCode += '<b>✘ERROR THROWN: ' + test.expressionInfo(test_Results) + '\n  EXPECTED: ' + test.expressionInfo(node.expectedValue) + '</b>';
          }
        } else if (testPassed && gotFailedAssertions) {
          exampleCode += '✘<b>ASSERTION(S) FAILED</b>'; // ✘
        } else {
          exampleCode += '✘<b>RETURNED: ' + test.expressionInfo(test_Results) + '\n  EXPECTED: ' + test.expressionInfo(node.expectedValue) + '</b>'; // ✘
        }
      }
      node.examplePre.innerHTML = '<code>' + exampleCode + '</code>';
      test.updateStats();
    } else {
      if (testPassed && !gotFailedAssertions) {
        test.countPass++;
        process.stdout.write(colors.green('✓'));
      } else {
        test.countFail++;
        var ref =test.nodes[i].levelText + test.nodes[i].exampleNumber + ' ';
        if (test.wasThrown) {
          process.stdout.write(colors.red('✘') + '\n' + ref + colors.white(' ERROR: idk' ));
        } else {
          process.stdout.write(colors.red('✘') + '\n' + ref + colors.white(
            'RETURNED: ' + test.expressionInfo(test_Results) +
              ' EXPECTED: ' + test.expressionInfo(test.nodes[i].expectedValue)));
        }

      }
    }
  };
  // Browser Dressing
  if (isBrowser) {
    // Get vars from URL
    test.hideExamples = (test.getParam('he') == 'Y');
    test.filterSection = test.getParam('fs');
    test.filterTest = test.getParam('ft');
    test.filterLevel = test.getParam('fl') || 'All';
    // Fixed Header Div
    test.headerDiv = document.createElement("div");
    test.headerDiv.style.display = 'inline-block';
    test.headerDiv.align = 'center';
    test.headerDiv.style.position = 'fixed';
    test.headerDiv.style.top = '0px';
    test.headerDiv.style.margin = '0px';
    test.headerDiv.style.padding = '0px';
    test.headerDiv.style.zIndex = '100000';
    test.headerDiv.style.width = '100%';
    test.headerDiv.style.background = '#AA4'; // yellow header to start
    document.body.appendChild(test.headerDiv);
    // div for controls
    var controls = document.createElement("div");
    controls.id = "controls";
    controls.style.display = 'inline-block';
    controls.style.padding = '0px';
    controls.style.margin = '0px 0px'; // was 0 / 16
    test.headerDiv.appendChild(controls);
    // control button maker
    var buttonControl = function (text, help, func) {
      var control = document.createElement("button");
      if (help) {
        control.className = "tooltip";
        control.innerHTML = text + '<span class="classic">' + help + '</span>';
      } else {
        control.innerHTML = text;
      }
      control.onclick = func;
      controls.appendChild(control);
      return control;
    };
    // Reset Filters
    test.tequilaStats = '☠';
    test.helpTestTequila = 'tequila ' + T.getVersion() + '<br>click filters for test pass/fail and selected session<b><em>note: click on any section below to filter</em></b>';
    test.btnTequila = buttonControl(test.tequilaStats + ' tequila',
      test.helpTestTequila,
      function () {
        test.filterSection = false;
        test.filterTest = false;
        test.refresh();
      });
    // Hide / Show Tests
    test.helpTestPass = 'passing tests<br>click to filter';
    test.textTestPass = 'pass<br>' + '<code class="counter_green">$1</code>';
    test.btnTestPass = buttonControl(test.textTestPass, test.helpTestPass, function () {
      test.refresh();
    });
    test.helpTestFail = 'failing tests<br>click to filter';
    test.textTestFail = 'fail<br>' + '<code class="counter_red">$1</code>';
    test.btnTestFail = buttonControl(test.textTestFail, test.helpTestFail, function () {
      test.refresh();
    });
    test.helpTestDefer = 'deferred tests<br>click to filter';
    test.textTestDefer = 'todo<br>' + '<code class="counter_yellow">$1</code>';
    test.btnTestDefer = buttonControl(test.textTestDefer, test.helpTestDefer, function () {
      test.refresh();
    });
    // Hide / Show Test Level
    test.helpTestLevel = 'set filter level of detail<br>click to cycle thru';
    test.textTestLevel = 'level<br>' + '<code class="counter">' + test.filterLevel + '</code>';
    test.btnTestLevel = buttonControl(test.textTestLevel, test.helpTestLevel, function () {
      switch (test.filterLevel) {
        case 'All':
          test.filterLevel = 'TOC';
          break;
        case 'TOC':
          test.filterLevel = 'Mid';
          break;
        default:
          test.filterLevel = 'All';
          break;
      }
      test.refresh();
    });
    // Hide / Show Examples
//    buttonControl((test.hideExamples ? '✩' : '✭') + ' examples', 'show/hide examples<br>errors always show', function () {
    buttonControl('ex.<br>' + '<code class="counter">' + (test.hideExamples ? 'Off' : 'On&nbsp;'  ) + '</code>', 'show/hide examples<br>errors always show', function () {
      test.hideExamples = !test.hideExamples;
      test.refresh();
    });
    // Outer & Inner Div to center content
    var outerDiv = document.createElement("div");
    outerDiv.style.width = "100%";
    document.body.appendChild(outerDiv);
    var innerDiv = document.createElement("div");
    innerDiv.style.width = "1000px";
    innerDiv.style.margin = "0 auto";
    outerDiv.appendChild(innerDiv);
  } else {
    process.stdout.write('Testing 123...');
  }
  var scrollFirstError = 0;
  for (i in test.nodes) {
    // Check filters
    var filterSection = (test.filterSection + '.');
    if (filterSection.indexOf('..') >= 0) filterSection = (test.filterSection);
    var curSection = test.nodes[i].levelText;
    var testNodeType = test.nodes[i].nodeType;
    var dotCount = curSection.match(/\./g) ? curSection.match(/\./g).length : 0;
    var isInScope = curSection.indexOf(filterSection) == 0;
    var isFiltered = false; // If true will not be rendered
    switch (test.filterLevel) {
      case 'TOC':
        test.filterLevel = 'TOC';
        if (!isInScope && dotCount > 2) isFiltered = true;
        break;
      case 'Mid':
        test.filterLevel = 'Mid'; // TOC with paragraph text
        if (!isInScope && dotCount > 2) isFiltered = true;
        break;
    }
    if (test.filterSection && curSection.indexOf(filterSection) != 0) {
      isFiltered = true;
      if (testNodeType != 'e' && filterSection.indexOf(curSection) == 0) {
        isFiltered = false;
      }
    }
    if (test.nodes[i].inheritanceTest) isFiltered = true;
//    console.log((isInScope?'SCOPE ':'scope ')+testNodeType+(isFiltered?' FILTER ':' filter ')+filterSection+' '+curSection);
    if (!isBrowser) {
      if (testNodeType == 'e') {
        testNodeType = '.';
      } else {
        testNodeType = '';
      }
    }
    switch (testNodeType) {
      case 'h':
        if (!isFiltered) {
          var p = document.createElement("h" + test.nodes[i].level);
          var lt = test.nodes[i].levelText;
          if (lt.length > 2) lt = lt.substring(0, lt.length - 1);
//          if (dots < 2)
//            p.innerHTML = test.nodes[i].text;
//          else
          p.innerHTML = lt + ' ' + test.nodes[i].text;
          p.onclick = function () {
            var words = this.innerText.split(' ');
            test.filterSection = '';
            if (words.length > 0 && parseInt(words[0]) > 0)
              test.filterSection = words[0];
            test.refresh();
          };
          innerDiv.appendChild(p);
        }
        break;
      case 'p':
        if (!isFiltered && (dotCount < 2 || test.filterLevel != 'TOC')) {
          var p = document.createElement("p");
          p.innerHTML = test.converter.makeHtml(test.nodes[i].text);
          innerDiv.appendChild(p);
        }
        break;
      case '.':
        test.countTests++;
        if (!test.nodes[i].deferedExample && test.nodes[i].func) {
          test.nodes[i].asyncTest = false;
          if (typeof (test.nodes[i].expectedValue) != 'undefined') {
            if (test.nodes[i].expectedValue.toString().indexOf('test.AsyncResponse') == 0)
              test.nodes[i].asyncTest = true;
          }
          test.showWork = [];
          test.assertions = [];
          var ref =test.nodes[i].levelText + test.nodes[i].exampleNumber + ' ';
          if (test.nodes[i].asyncTest) {
            test.countPending++;
            test.nodes[i].errorThrown = false;
            var err = test.callTestCode(test.nodes[i], asyncCallback);
            if (test.wasThrown) {
              process.stdout.write(colors.red('✘') + '\n' + ref + colors.white(' ERROR: ' + err));
              test.countPending--;
              test.countFail++;
              test.nodes[i].errorThrown = true;
            }
          } else {
            var test_Results = test.callTestCode(test.nodes[i]);
            var test_Value = 'undefined';
            if (typeof test_Results !== 'undefined') test_Value = test_Results.toString();
            var expected_Value = 'undefined';
            if (typeof test.nodes[i].expectedValue !== 'undefined') expected_Value = test.nodes[i].expectedValue.toString();
            if (test_Value !== expected_Value) {
              test.countFail++; // TODO if console is white this is invisible ink...
              process.stdout.write(colors.red('✘') + '\n' + ref + colors.white(
                'RETURNED: ' + test.expressionInfo(test_Results) +
                  ' EXPECTED: ' + test.expressionInfo(test.nodes[i].expectedValue)));
            } else {
              test.countPass++;
              process.stdout.write(colors.green('✓'));
            }
          }
        } else {
          test.countDefer++;
          process.stdout.write(colors.yellow('✍'));
        }
        break;
      case 'e':
        var testPassed = false;
        var ranTest = false;
        var caption = document.createElement("caption");
        caption.innerHTML = '<caption>' + 'EXAMPLE #' + test.nodes[i].exampleNumber + ' ' + test.nodes[i].text + '</caption>';
        var pre = document.createElement("pre");
        test.nodes[i].exampleCaption = caption;
        test.nodes[i].examplePre = pre;
        pre.className = "prettyprint";
        test.countTests++;
        if (!test.nodes[i].inheritanceTest) test.countUnique++;
        if (!test.nodes[i].deferedExample && test.nodes[i].func) {
          test.nodes[i].asyncTest = false;
          if (typeof (test.nodes[i].expectedValue) != 'undefined') {
            if (test.nodes[i].expectedValue.toString().indexOf('test.AsyncResponse') == 0)
              test.nodes[i].asyncTest = true;
          }
          test.showWork = [];
          test.assertions = [];
          var exampleCode = '';
          if (test.nodes[i].asyncTest) {
            exampleCode += test.formatCode(test.nodes[i].func, true);
            exampleCode += '✍<b>pending async results</b>';
            test.countPending++;
            pre.style.background = "#ffa500"; // oranges
          } else {
            var test_Results = test.callTestCode(test.nodes[i], asyncCallback);
            ranTest = true;
            exampleCode += test.formatCode(test.nodes[i].func, true);
            if (typeof test_Results == 'undefined') {
              if (typeof test.nodes[i].expectedValue == 'undefined') testPassed = true;
            } else if (test_Results === null) {
              if (typeof test.nodes[i].expectedValue != 'undefined' && test.nodes[i].expectedValue === null) testPassed = true;
            } else {
              if (typeof test.nodes[i].expectedValue != 'undefined' && test_Results.toString() === test.nodes[i].expectedValue.toString()) testPassed = true;
            }
            // Check assertions
            var gotFailedAssertions = false;
            for (var j in test.assertions) {
              if (!test.assertions[j]) gotFailedAssertions = true;
            }
            if (testPassed && !gotFailedAssertions) {
              test.countPass++;
              pre.style.background = "#cfc"; // green
              if (test.wasThrown) {
                exampleCode += '✓<b>error thrown as expected (' + test_Results + ')</b>'; // ✘
              } else {
                if (typeof test_Results == 'undefined') {
                  exampleCode += '✓<b>returns without harming any kittens</b>'; // TODO This is wrong for async since tests are not really done yet!!!
                } else {
                  exampleCode += '✓<b>returns ' + test.expressionInfo(test_Results) + ' as expected</b>'; // ✘
                }
              }
            } else {
              test.countFail++;
              pre.style.background = "#fcc"; // red
              if (test.wasThrown) {
                if (test.nodes[i].expectedValue === undefined) {
                  exampleCode += '<b>✘ERROR THROWN: ' + test.expressionInfo(test_Results) + '\n';
                } else {
                  exampleCode += '<b>✘ERROR THROWN: ' + test.expressionInfo(test_Results) + '\n  EXPECTED: ' + test.expressionInfo(test.nodes[i].expectedValue) + '</b>';
                }
              } else if (testPassed && gotFailedAssertions) {
                exampleCode += '✘<b>ASSERTION(S) FAILED</b>'; // ✘
              } else {
                exampleCode += '✘<b>RETURNED: ' + test.expressionInfo(test_Results) + '\n  EXPECTED: ' + test.expressionInfo(test.nodes[i].expectedValue) + '</b>'; // ✘
              }
            }
          }
          pre.innerHTML = '<code>' + exampleCode + '</code>';
        } else {
          test.countDefer++;
          pre.style.background = "#ffc"; // yellow
          if (test.nodes[i].func) {
            exampleCode = test.formatCode(test.nodes[i].func, false);
            exampleCode += '✍ <b>(test disabled)</b>';
            pre.innerHTML = exampleCode;
          } else {
            pre.innerHTML = '<code> TODO: write some code that rocks.</code>';
          }
        }
        var showExample = !test.hideExamples;
        if (isFiltered) showExample = false;
        if (ranTest && !testPassed) showExample = true;
        if (test.nodes[i].asyncTest) {
          if (!showExample) pre.style.display = "none";
          if (!showExample) caption.style.display = "none";
          innerDiv.appendChild(caption);
          innerDiv.appendChild(pre);
        } else {
          if (showExample) innerDiv.appendChild(caption);
          if (showExample) innerDiv.appendChild(pre);
        }
        test.updateStats();
        if (ranTest && !testPassed && scrollFirstError < 1) {
          scrollFirstError = document.height - document.documentElement.clientHeight;
        }
        if (test.nodes[i].asyncTest) {
          test.nodes[i].errorThrown = false;
          var err = test.callTestCode(test.nodes[i], asyncCallback);
          if (test.wasThrown) {
            test.countPending--;
            test.countFail++;
            test.nodes[i].errorThrown = true;
            exampleCode = test.formatCode(test.nodes[i].func, true);
            exampleCode += '<b>✘ERROR THROWN: ' + err + '\n';
            pre.innerHTML = '<code>' + exampleCode + '</code>';
            test.nodes[i].examplePre.style.display = "";
            test.nodes[i].exampleCaption.style.display = "";
            test.nodes[i].examplePre.style.background = "#fcc"; // red
            test.updateStats();
          }
        }
        break;
    }
  }
  test.testsLaunched = true;
  if (isBrowser) {
    test.updateStats();
    if (scrollFirstError > 0)
      window.scroll(0, scrollFirstError);
  } else {
    test.closerCalled = false;
    test.cliCloser();
  }
};
test.cliCloser = function() {
  // Wait for deferred tasks to finish
  if (test.countPending>0) {
    if (!test.closerCalled) {
      test.closerCalled=true;
      console.log('\nWaiting for pending async results...');
    }
    setTimeout(test.cliCloser,0);
  } else {
  var results = '\n ' + test.countTests + ' pass(' + test.countPass + ') fail(' + test.countFail + ') defer(' + test.countDefer + ') ';
  if (test.countFail)
    console.log(colors.inverse(colors.red(results)));
  else
    console.log(colors.inverse(colors.green(results)));
  }
}
test.updateStats = function () {
  var miniPad, i;
  newtequilaStats = '☠';
  if (test.countPass > 0) newtequilaStats = '☺';
  if (test.countFail > 0) newtequilaStats = '☹';
  if (test.tequilaStats != test.countUnique + newtequilaStats) {
    test.tequilaStats = test.countUnique + newtequilaStats;
    var myName = newtequilaStats + ' ' + test.countUnique.toString();
    for (miniPad = '', i = 0; i < (3 - myName.toString().length); i++) miniPad += '&nbsp;'
    test.btnTequila.innerHTML = 'tequila<br><code class="counter">' + miniPad + myName + '</code>' + '<span class="classic">' + test.helpTestTequila + '</span>';
  }
  if (!test.lastCountPass || test.lastCountPass != test.countPass) {
    test.lastCountPass = test.countPass;
    for (miniPad = '', i = 0; i < (3 - test.countPass.toString().length); i++) miniPad += '&nbsp;'
    test.btnTestPass.innerHTML = test.textTestPass.replace('$1', miniPad + test.countPass) + '<span class="classic">' + test.helpTestPass + '</span>';
  }
  if (!test.lastCountFail || test.lastCountFail != test.countFail) {
    test.lastCountFail = test.countFail;
    for (miniPad = '', i = 0; i < (3 - test.countFail.toString().length); i++) miniPad += '&nbsp;'
    test.btnTestFail.innerHTML = test.textTestFail.replace('$1', miniPad + test.countFail) + '<span class="classic">' + test.helpTestFail + '</span>';
  }
  if (!test.lastCountDefer || test.lastCountDefer != (test.countDefer + test.countPending)) {
    test.lastCountDefer = test.countDefer + test.countPending;
    for (miniPad = '', i = 0; i < (3 - test.lastCountDefer.toString().length); i++) miniPad += '&nbsp;'
    test.btnTestDefer.innerHTML = test.textTestDefer.replace('$1', miniPad + test.lastCountDefer) + '<span class="classic">' + test.helpTestDefer + '</span>';
  }
  if (test.testsLaunched && test.countPending < 1) {
    if (test.countFail) test.headerDiv.style.background = '#F33'; // fail color color
    if (!test.countFail) test.headerDiv.style.background = '#6C7'; // pass color
  }
}
test.expressionInfo = function (expr) {
  if (typeof expr == 'string') {
    return '"' + expr.replace(/"/g, '\\\"') + '"';
  }
  return expr;
}
test.shouldThrow = function (err, func) {
  try {
    func();
  } catch (e) {
    if (err !== undefined)
      if (err.toString() != e.toString() && err.toString() != '*') throw('EXPECTED ERROR(' + err + ') GOT ERROR(' + e + ')');
  }
}
test.callTestCode = function (node, funkytown) {
  try {
    test.wasThrown = false;
    return node.func(node, funkytown);
  } catch (e) {
    test.wasThrown = true;
    return e;
  }
}
test.formatCode = function (txt, rancode) {
  var lines = [];
  var spaces = [];
  var marks = [];
  var spaceCount = 0;
  var gotNonSpace = false;
  var line = '';
  var i, j;
  var w = 0;
  var s = txt.toString();
  var assertionsSeen = 0;
  for (i = 0; i < s.length; i++) {
    if (s[i] == '\n') {
      if (line.substring(0, 9) == 'test.show') {
        if (w < test.showWork.length) {
          var oldline = line.substring(10);
          if (oldline.length > 0) oldline = oldline.substring(0, oldline.length - 1);
          if (oldline.length > 0) oldline = oldline.substring(0, oldline.length - 1);
          if (oldline)
            line = '<b>// ' + oldline + ' is ' + test.showWork[w] + '</b>';
          else
            line = '<b>// i got nothing</b>';
          w++;
        }
      }
      if (rancode && line.substring(0, 14) == 'test.assertion') {
        marks.push((test.assertions[assertionsSeen++]) ? '✓' : '✘'); // TODO if code is never reached shows x yet test does not fail!!!
        var oldline = line.substring(14);
        line = '<b>ASSERT: </b>' + oldline;
      } else {
        marks.push(' ');
      }

      lines.push(line);
      line = '';
      spaces.push(spaceCount);
      spaceCount = 0;
      gotNonSpace = false;
    } else {
      if (s[i] == ' ' && !gotNonSpace) {
        spaceCount++;
      } else {
        gotNonSpace = true;
        line += s[i];
      }
    }
  }
  var adjustspace = spaces[1];
  var output = '';
  for (i = 1; i < lines.length; i++) { // skip 'function'
    var spaceOut = spaces[i] - adjustspace;
    for (j = 1; j < spaceOut; j++) output += ' ';
    output += marks[i] + lines[i] + '\n';
  }
  return output;
};
/**
 * tequila
 * tequila-test
 */
test.runnerTequila = function () {
  test.heading('Tequila Singleton', function () {
    test.paragraph('The Tequila Singleton provides a namespace for the library.  In it is access to the classes ' +
      'that make up the library and a collection of helper methods.');
    test.heading('CONSTRUCTOR', function () {
      test.paragraph('The object is instantiated upon loading the source file.  Any call to Tequila() will return a ' +
        'reference to the singleton.');
      test.example('multiple instances are deep equal', true, function () {
        return (Tequila() === Tequila() && Tequila() === new Tequila());
      });
      test.example('A reference is available internally to all modules in the library "T"', true, function () {
        return T === Tequila();
      });
    });
    test.heading('METHODS', function () {
      test.heading('getVersion()');
      test.paragraph('This method returns the tequila library version.');
      test.example('tequila library version', '0.0.1', function () {
        return (Tequila().getVersion());
      });
      test.heading('contains(array,object)');
      test.paragraph('This method returns true or false as to whether object is contained in array.');
      test.example('object exists in array', true, function () {
        return Tequila().contains(['moe', 'larry', 'curley'], 'larry');
      });
      test.example('object does not exist in array', false, function () {
        return Tequila().contains(['moe', 'larry', 'curley'], 'shemp');
      });
      test.heading('getUnusedProperties(settings,allowedProperties)');
      test.paragraph('This method is used to check parameter properties as being valid.  If invoked with unknown property it throws an error.');
      test.example('valid property', 'occupation', function () {
        // got occupation and value backwards so occupation is an unknown property
        return Tequila().getUnusedProperties({name: 'name', occupation: 'value'}, ['name', 'value'])[0];
      });
      test.example('invalid property', 0, function () {
        // no unknown properties
        return Tequila().getUnusedProperties({name: 'name', value: 'occupation'}, ['name', 'value']).length;
      });
      test.heading('inheritPrototype(p)');
      test.paragraph('This method returns a object that inherits properties from the prototype object p');
      test.example('new objects are instance of inherited object', undefined, function () {
        Thing = function (name) { // Create class and 2 subclasses
          this.name = name;
        };
        Car = function (name) {
          Thing.call(this,name); // apply Thing constructer
          this.canBeDriven = true;
        };
        Car.prototype = T.inheritPrototype(Thing.prototype); // <- proper usage
        Food = function (name) {
          Thing.call(this,name); // apply Thing constructer
          this.canBeEaten = true;
        };
        var thing = new Thing('rock'), car = new Car('mustang'), food = new Food('pizza');
        test.assertion(!thing.canBeDriven && car.canBeDriven && !food.canBeDriven);
        test.assertion(!thing.canBeEaten && !car.canBeEaten && food.canBeEaten);
        test.assertion(thing.name == 'rock' && car.name == 'mustang' && food.name == 'pizza');
        test.assertion(car instanceof Car && car instanceof Thing); // T.inheritPrototype makes this work
        test.assertion(food instanceof Food && !(food instanceof Thing)); // without calling T.inheritPrototype
      });
    });
  });
};/**
 * tequila
 * attribute-test
 */
test.runnerAttribute = function () {
  test.heading('Attribute Class', function () {
    test.paragraph('Attributes are the means for models to represent data of different types.  They have no' +
      ' dependencies on Models however and can be used without creating a model.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Attribute', true, function () {
        return new Attribute({name: 'name'}) instanceof Attribute;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Attribute({name: 'name'});
      });
      test.example('should make sure properties are valid', Error('error creating Attribute: invalid property: sex'), function () {
        new Attribute({name: 'name', sex: 'female'});
      });
      test.example('should validate and throw errors before returning from constructor', Error('error creating Attribute: multiple errors'), function () {
        new Attribute({eman: 'the'}); // 2 errors: name missing and eman an unknown property
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('name', function () {
        test.example('should be required', Error('error creating Attribute: name required'), function () {
          new Attribute();
        });
        test.example('should allow shorthand string constructor for name property', 'Attribute: favoriteActorName', function () {
          return new Attribute('favoriteActorName');
        });
      });
      test.heading('type', function () {
        test.example("should default to 'String'", 'String', function () {
          return new Attribute({name: 'name'}).type;
        });
        test.example('should be a valid attribute type', Error('error creating Attribute: Invalid type: Dude'), function () {
          new Attribute({name: 'Bogus', type: "Dude"});
        });
        test.example('should allow shorthand string constructor for type property', 'Date', function () {
          return new Attribute('favoriteActorBorn', 'Date').type;
        });
      });
      test.heading('label', function () {
        test.example('should default to name property', 'name', function () {
          return new Attribute({name: 'name'}).label;
        });
        test.example('should be optional in constructor', 'Name', function () {
          return new Attribute({name: 'name', label: 'Name'}).label;
        });
      });
      test.heading('value', function () {
        test.example('should accept null assignment', undefined, function () {
          var myTypes = T.getAttributeTypes();
          var record = '';
          for (var i in myTypes) {
            record += myTypes[i] + ':' + new Attribute({name: 'my' + myTypes[i]}).value + ' ';
          }
          test.show(record);
          // It's the default and it passes constructor validation
        });
        test.example('should accept assignment of correct type and validate incorrect attributeTypes', undefined, function () {
          var myTypes = T.getAttributeTypes();
          test.show(myTypes);
          // TODO ID
          var myModel = new Model();
          var myGroup = new Attribute({name: 'columns', type: 'Group', value: [new Attribute("Name")]});
          var myTable = new Attribute({name: 'bills', type: 'Table', group: myGroup });
          var myValues = [null, 'Jane Doe', new Date, true, 18, new Model(), [], myTable]; // , [new Attribute('likes'), new Attribute('dislikes')]];
          for (var i in myTypes)
            for (var j in myValues) {
//              console.log(i + ',' + j);
              if (i == j) {
                switch (myTypes[i]) {
                  case 'Model':
                    new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j], modelType: myModel});
                    break;
                  case 'Group':
                    new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j]});
                    break;
                  case 'Table':
                    new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j], group: myGroup});
                    break;
                  default:
                    new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j] });
                    break;
                }
              } else {
                // mismatches bad so should throw error (is caught unless no error or different error)
                test.shouldThrow('*', function () {
                  new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j]});
                });
              }
              // other objects should throw always
              test.shouldThrow('*', function () {
                new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: {} });
              });
            }
        });
      });
    });
    test.heading('TYPES', function () {
      test.heading('ID', function () {
        test.example("should have type of 'ID'", 'ID', function () {
          return new Attribute({name: 'CustomerID', type: 'ID'}).type;
        });
      });
      test.heading('String', function () {
        test.example("should have type of 'String'", 'String', function () {
          return new Attribute({name: 'Cheese', type: 'String'}).type;
        });
        test.example('should have size property', 10, function () {
          return new Attribute({name: 'zipCode', size: 10}).size;
        });
        test.example('size should default to 50', 50, function () {
          return new Attribute({name: 'stuff'}).size;
        });
        test.example('size should be an integer', 'Error: error creating Attribute: size must be a number from 1 to 255', function () {
          new Attribute({name: 'zipCode', size: "10"});
        });
        test.example('size should be between 1 and 255', undefined, function () {
          test.shouldThrow(Error('error creating Attribute: size must be a number from 1 to 255'), function () {
            new Attribute({name: 'partyLikeIts', size: 1999});
          });
          test.shouldThrow(Error('error creating Attribute: size must be a number from 1 to 255'), function () {
            new Attribute({name: 'iGotNothing', size: 0});
          });
        });
        test.example('size should accept format shorthand with parens', 255, function () {
          return new Attribute({name: 'comments', type: 'String(255)'}).size;
        });
      });
      test.heading('Number', function () {
        test.example("type should be 'Number'", 'Number', function () {
          return new Attribute({name: 'healthPoints', type: 'Number'}).type;
        });
      });
      test.heading('Date', function () {
        test.example("type should be 'Date'", 'Date', function () {
          return new Attribute({name: 'born', type: 'Date'}).type;
        });
      });
      test.heading('Boolean', function () {
        test.example("type should be 'Boolean'", 'Boolean', function () {
          return new Attribute({name: 'bored', type: 'Boolean'}).type;
        });
      });
      test.heading('Model', function () {
        test.paragraph('Parameter type Model is used to store a reference to another model of any type.  The value attribute is the ID of the referenced Model.');
        test.example("should be type of 'Model' or null", 'Model', function () {
          return new Attribute({name: 'Twiggy', type: 'Model', modelType: new Model()}).type;
        });
        test.example('modelType is required', Error('error creating Attribute: modelType must be instance of Model'), function () {
          return new Attribute({name: 'Twiggy', type: 'Model'});
        });
      });
      test.heading('Group', function () {
        test.paragraph('Groups are used to keep attributes together for presentation purposes.');
        test.example("should have type of 'Group'", 'Group', function () {
          return new Attribute({name: 'stuff', type: 'Group'}).type;
        });
        test.example('deep check value for valid Attributes that pass getValidationErrors() test', 1, function () {
          // this example is just to conceptualize nested components
          var myStuff = new Attribute("stuff", "Group");
          var myCars = new Attribute("cars", "Group");
          var myFood = new Attribute("food", "Group");
          var myFruit = new Attribute("fruit", "Group");
          var myVegs = new Attribute("vegetables", "Group");
          var badApple = new Attribute('Apple');
          myCars.value = [new Attribute('Nova'), new Attribute('Pinto')];
          myFruit.value = [badApple, new Attribute('Peach')];
          myVegs.value = [new Attribute('Carrot'), new Attribute('Beet')];
          myFood.value = [myFruit, myVegs];
          myStuff.value = [myFood, myCars, new Attribute('House'), new Attribute('Health')];
          badApple.value = -1; // One bad apple will spoil my stuff
          test.show(myStuff.getValidationErrors());
          return myStuff.getValidationErrors().length;
        });
      });
      test.heading('Table', function () {
        test.paragraph("Table types are used to store an array of values (rows) each of which is an array of " +
          "values (columns).  Each column value is associated with the corresponding element in the Table " +
          "property group which is set when creating a Table."
        );
        test.example("should have type of 'Table'", 'Table', function () {
          var name = new Attribute("Name");
          var cols = new Attribute({name: 'columns', type: 'Group', value: [name]});
          return new Attribute({name: 'bills', type: 'Table', group: cols }).type;
        });
        test.example("group property must be defined", Error('error creating Attribute: group property required'),
          function () {
            new Attribute({name: 'bills', type: 'Table'});
          });
        test.example("group property must not be empty array",
          Error('error creating Attribute: group property value must contain at least one Attribute'), function () {
            var cols = new Attribute({name: 'columns', type: 'Group', value: []});
            new Attribute({name: 'bills', type: 'Table', group: cols });
          });
      });
    });
    test.heading('METHODS', function () {
      test.heading('toString()', function () {
        test.example('should return a description of the attribute', 'Attribute: name', function () {
          return new Attribute({name: 'name'}).toString();
        });
      });
      test.heading('coerce(newValue)', function () {
        test.paragraph('Method returns the type equivalent of newValue for the owner objects type.');
        test.example('coerce method basic usage', undefined, function () {
          var myString = new Attribute({name: 'name', size: 10});
          var myNumber = new Attribute({name: 'age', type: 'Number' });
          var myBool = new Attribute({name: 'active', type: 'Boolean' });
          var myGroup = new Attribute({name: 'columns', type: 'Group', value: [new Attribute("Name")]});
          var myTable = new Attribute({name: 'bills', type: 'Table', group: myGroup });
          test.show(myBool.coerce('12/31/99'));
          // Strings
          test.assertion(myString.coerce() === '');
          test.assertion(myString.coerce(false) === 'false');
          test.assertion(myString.coerce(12) === '12');
          test.assertion(myString.coerce(1 / 0) === 'Infinity');
          test.assertion(myString.coerce('01234567890') === '0123456789');
          test.assertion(myString.coerce() === '');
          // Numbers
          test.assertion(myNumber.coerce() === 0);
          test.assertion(myNumber.coerce(false) === 0);
          test.assertion(myNumber.coerce(true) === 1);
          test.assertion(myNumber.coerce(' 007 ') === 7);
          test.assertion(myNumber.coerce(' $123,456.78 ') === 123456.78);
          test.assertion(myNumber.coerce(' $123, 456.78 ') === 123); // space will split
          test.assertion(myNumber.coerce('4/20') === 0); // slash kills it
          // Boolean
          test.assertion(myBool.coerce() === false && myBool.coerce(null) === false && myBool.coerce(0) === false);
          test.assertion(myBool.coerce(true) === true && myBool.coerce(1) === true);
          test.assertion(myBool.coerce('y') && myBool.coerce('yEs') && myBool.coerce('t') && myBool.coerce('TRUE') && myBool.coerce('1'));
          test.assertion(!((myBool.coerce('') || (myBool.coerce('yep')))));
          // TODO
          test.shouldThrow(Error('coerce cannot determine appropriate value'), function () {
            new Attribute('TODO','Date').coerce();
          });
          test.shouldThrow(Error('coerce cannot determine appropriate value'), function () {
            new Attribute({name: 'Twiggy', type: 'Model', modelType: new Model()}).coerce();
          });
          test.shouldThrow(Error('coerce cannot determine appropriate value'), function () {
            new Attribute(myGroup.coerce());
          });
          test.shouldThrow(Error('coerce cannot determine appropriate value'), function () {
            new Attribute(myTable.coerce());
          });
        });
      });
      test.heading('getValidationErrors()', function () {
        test.example('should return array of validation errors', undefined, function () {
          test.assertion(new Attribute({name: 'name'}).getValidationErrors() instanceof Array);
          var nameHosed = new Attribute({name: 'name'}); // No errors
          test.assertion(nameHosed.getValidationErrors().length == 0);
          nameHosed.name = ''; // 1 err
          test.assertion(nameHosed.getValidationErrors().length == 1);
          nameHosed.type = ''; // 2 errors
          test.assertion(nameHosed.getValidationErrors().length == 2);
        });
      });
    });
  });
};/**
 * tequila
 * model-test
 */

test.runnerModel = function (SurrogateModelClass, inheritanceTest) {
  var inheritanceTestWas = T.inheritanceTest;
  T.inheritanceTest = inheritanceTest;
  test.heading('Model Class', function () {
    test.paragraph('Models being the primary purpose of this library are extensions of javascript objects.  ' +
      'The tequila class library provides this class to encapsulate and enforce consistent programming interface' +
      'to the models created by this library.');
    test.heading('CONSTRUCTOR', function () {
      test.paragraph('Creation of all Models must adhere to following examples:');
      test.example('objects created should be an instance of Model', true, function () {
        return new SurrogateModelClass() instanceof Model;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        SurrogateModelClass();
      });
      test.example('should make sure properties are valid', Error('error creating Attribute: invalid property: sup'), function () {
        new SurrogateModelClass({sup: 'yo'});
      });
      test.example('can supply attributes in constructor in addition to ID default', 'Attribute: id,Attribute: description', function () {
        return new SurrogateModelClass({attributes: [new Attribute('description')]}).attributes;
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('tags', function () {
        test.paragraph('Tags are an array of strings that can be used in searching.');
        test.example('should be an array or undefined', undefined, function () {
          var m = new SurrogateModelClass(); // default is undefined
          test.assertion(m.tag === undefined && m.getValidationErrors().length == 0);
          m.tags = [];
          test.assertion(m.getValidationErrors().length == 0);
          m.tags = 'your it';
          test.assertion(m.getValidationErrors().length == 1);
        });
      });
      test.heading('attributes', function () {
        test.paragraph('The attributes property is an array of Attributes.');
        test.example('should be an array', true, function () {
          var goodModel = new SurrogateModelClass(), badModel = new SurrogateModelClass();
          badModel.attributes = 'wtf';
          return (goodModel.getValidationErrors().length == 0 && badModel.getValidationErrors().length == 1);
        });
        test.example('elements of array must be instance of Attribute', undefined, function () {
          var model = new SurrogateModelClass();
          model.attributes = [new Attribute("ID", "ID")];
          test.assertion(model.getValidationErrors().length == 0);
          model.attributes = [new Attribute("ID", "ID"), new SurrogateModelClass(), 0, 'a', {}, [], null];
          test.assertion(model.getValidationErrors().length == 6);
        });
      });
    });
    test.heading('METHODS', function () {
      test.heading('toString()', function () {
        test.example('should return a description of the attribute', 'a ' + new SurrogateModelClass().modelType, function () {
          return new SurrogateModelClass().toString();
        });
      });
      test.heading('copy(sourceModel)', function () {
        test.example('copy all attribute values of a model', undefined, function () {
          var Foo = function (args) {
            Model.call(this, args);
            this.modelType = "Foo";
            this.attributes.push(new Attribute('name'));
          };
          Foo.prototype = T.inheritPrototype(Model.prototype);
          var m1 = new Foo();
          var m2 = new Foo();
          var m3 = m1;
          m1.setAttributeValue('name', 'Bar');
          m2.setAttributeValue('name', 'Bar');
          // First demonstrate instance ref versus anothel model with equal attributes
          test.assertion(m1 === m3); // assigning one model to variable references same instance
          test.assertion(m3.getAttributeValue('name') === 'Bar'); // m3 changed when m1 changed
          test.assertion(m1 !== m2); // 2 models are not the same instance
          test.assertion(JSON.stringify(m1) === JSON.stringify(m2)); // but they are identical
          // clone m1 into m4 and demonstrate that contents equal but not same ref to object
          var m4 = new Foo();
          m4.copy(m1);
          test.assertion(m1 !== m4); // 2 models are not the same instance
          test.assertion(JSON.stringify(m1) === JSON.stringify(m4)); // but they are identical
        });
      });

      test.heading('getValidationErrors()', function () {
        test.example('should return array of validation errors', undefined, function () {
          test.assertion(new SurrogateModelClass().getValidationErrors() instanceof Array);
        });
        test.example('first attribute must be an ID field', 'first attribute must be ID', function () {
          var m = new SurrogateModelClass();
          m.attributes = [new Attribute('spoon')];
          return m.getValidationErrors();
        });
      });
      test.heading('getAttributeValue(attributeName)', function () {
        test.example('returns undefined if the attribute does not exists', undefined, function () {
          return new SurrogateModelClass().getAttributeValue('whatever');
        });
        test.example("returns the value for given attribute", 42, function () {
          var question = new SurrogateModelClass({attributes: [new Attribute('answer', 'Number')]});
          question.attributes[1].value = 42;
          return question.getAttributeValue('answer');
        });
      });
      test.heading('setAttributeValue(attributeName,value)', function () {
        test.example('throws an error if the attribute does not exists', Error('attribute not valid for model'), function () {
          new SurrogateModelClass().setAttributeValue('whatever');
        });
        test.example("sets the value for given attribute", 42, function () {
          var question = new SurrogateModelClass({attributes: [new Attribute('answer', 'Number')]});
          question.setAttributeValue('answer', 42);
          return question.attributes[1].value;
        });
      });

    });
  });
  T.inheritanceTest = inheritanceTestWas;
};
/**
 * tequila
 * list-test
 */

test.runnerList = function (SurrogateListClass, inheritanceTest) {
  var inheritanceTestWas = T.inheritanceTest;
  T.inheritanceTest = inheritanceTest;
  test.heading('List Class', function () {
//    test.paragraph('The List Class is a container for Model sets.');
//    test.heading('CONSTRUCTOR', function () {
//      test.paragraph('Creation of all Collections must adhere to following examples:');
//      test.example('objects created should be an instance of List', true, function () {
//        return new SurrogateListClass() instanceof List;
//      });
//      test.example('should make sure new operator used', Error('new operator required'), function () {
//        List();
//      });
//    });
//    test.heading('PROPERTIES', function () {
//      test.heading('type', function () {
//        test.paragraph('The type determines the nature of the collection.  Each type has it\'s own implementation' +
//          ' but all share the interface of the class.  Methods that are not allowed for a given type will throw an' +
//          ' exception.');
//        test.heading('map', function () {
//          test.paragraph('Associative array, no duplicate IDs, single Model.');
//        });
//        test.heading('list', function () {
//          test.paragraph('List of Models of same type with order in list preserved.');
//        });
//        test.heading('filter', function () {
//          test.paragraph('Calculated collection of Models of same type based filter and order properties.');
//        });
//        test.heading('repository', function () {
//          test.paragraph('Repository of Collections.  Primary usage with StoreInterface.');
//        });
//        test.heading('workspace', function () {
//          test.paragraph('List of Models of any type or other Collections');
//        });
//      });
//      test.heading('modelType', function () {
//      });
//      test.heading('filter', function () {
//      });
//      test.heading('order', function () {
//      });
//    });
//    test.heading('METHODS', function () {
//    });
  });
  T.inheritanceTest = inheritanceTestWas;
};
/**
 * tequila
 * user-test
 */
test.runnerUserModel = function () {
  test.heading('User Model', function () {
    test.paragraph('The User Model represents the user logged into the system. The library uses this for system' +
      ' access, logging and other functions.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of User', true, function () {
        return new User() instanceof User;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(User,true);
      });
    });
  });
};
/**
 * tequila
 * store-test
 */
test.runnerStoreModel = function () {
  test.heading('Store Model', function () {
    test.paragraph('The store class is used for object persistence.');
    test.heading('CONSTRUCTOR', function () {
      test.runnerStoreConstructor(Store);
    });
    test.heading('METHODS', function () {
      test.runnerStoreMethods(Store);
    });
  });
};
test.runnerStoreConstructor = function (SurrogateStoreModel) {
  test.example('objects created should be an instance of Store', true, function () {
    return new SurrogateStoreModel() instanceof Store;
  });
  test.heading('Model tests are applied', function () {
    test.runnerModel(SurrogateStoreModel, true);
  });
};
test.runnerStoreMethods = function (SurrogateStoreModel) {
  test.example('getStoreInterface() returns an array of method implementation for the Store.', undefined, function () {
    var interface = new SurrogateStoreModel().getStoreInterface();
    test.show(interface);
    test.assertion(interface instanceof Object);
    test.assertion(typeof interface['canGetModel'] == 'boolean');
    test.assertion(typeof interface['canPutModel'] == 'boolean');
    test.assertion(typeof interface['canDeleteModel'] == 'boolean');
  });
  var interface = new SurrogateStoreModel().getStoreInterface();
  test.heading('getModel', function () {
    if (interface['canGetModel']) {
      test.example('must pass valid model', Error('argument must be a Model'), function () {
        new SurrogateStoreModel().getModel();
      });
      test.example('model must have no validation errors', Error('model has validation errors'), function () {
        var m = new Model();
        m.attributes = null;
        new SurrogateStoreModel().getModel(m);
      });
      test.example('ID attribute must have truthy value', Error('ID not set'), function () {
        new SurrogateStoreModel().getModel(new Model());
      });
      test.example('callback function required', Error('callback required'), function () {
        var m = new Model();
        m.attributes[0].value = 1;
        new SurrogateStoreModel().getModel(m);
      });
      test.example('returns error when model not found', test.AsyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
        var m = new Model();
        m.attributes[0].value = 1;
        new SurrogateStoreModel().getModel(m, function (mod, err) {
          if (err) {
            returnResponse(testNode, err);
          } else {
            returnResponse(testNode, mod);
          }
        });
      });
    } else {
      test.example('getModel() is not implemented', Error(new SurrogateStoreModel().modelType + ' does not provide getModel'), function () {
        new SurrogateStoreModel().getModel();
      });
    }
  });
  test.heading('putModel', function () {
    if (interface['canPutModel']) {
      test.example('must pass valid model', Error('argument must be a Model'), function () {
        new SurrogateStoreModel().putModel();
      });
      test.example('model must have no validation errors', Error('model has validation errors'), function () {
        var m = new Model();
        m.attributes = null;
        new SurrogateStoreModel().putModel(m);
      });
      test.example('callback function required', Error('callback required'), function () {
        var m = new Model();
        m.attributes[0].value = 1;
        new SurrogateStoreModel().putModel(m);
      });
      test.example('returns error when model not found', test.AsyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
        var m = new Model();
        m.attributes[0].value = 1;
        new SurrogateStoreModel().putModel(m, function (mod, err) {
          if (err) {
            returnResponse(testNode, err);
          } else {
            returnResponse(testNode, mod);
          }
        });
      });
      test.example('creates new model when ID is not set', test.AsyncResponse(true), function (testNode, returnResponse) {
        var m = new Model();
        new SurrogateStoreModel().putModel(m, function (mod, err) {
          if (err) {
            returnResponse(testNode, err);
          } else {
            returnResponse(testNode, mod.getAttributeValue('id') ? true : false);
          }
        });
      });
    } else {
      test.example('putModel() is not implemented', Error('Store does not provide putModel'), function () {
        new SurrogateStoreModel().putModel();
      });
    }
  });
  test.heading('deleteModel', function () {
    if (interface['canDeleteModel']) {
      test.example('must pass valid model', Error('argument must be a Model'), function () {
        new SurrogateStoreModel().deleteModel();
      });
      test.example('model must have no validation errors', Error('model has validation errors'), function () {
        var m = new Model();
        m.attributes = null;
        new SurrogateStoreModel().deleteModel(m);
      });
      test.example('callback function required', Error('callback required'), function () {
        var m = new Model();
        m.attributes[0].value = 1;
        new SurrogateStoreModel().deleteModel(m);
      });
      test.example('returns error when model not found', test.AsyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
        var m = new Model();
        m.attributes[0].value = 1;
        new SurrogateStoreModel().deleteModel(m, function (mod, err) {
          if (err) {
            returnResponse(testNode, err);
          } else {
            returnResponse(testNode, mod);
          }
        });
      });
    } else {
      test.example('deleteModel() is not implemented', Error('Store does not provide deleteModel'), function () {
        new SurrogateStoreModel().deleteModel();
      });
    }
  });
};/**
 * tequila
 * memory-store-test
 */
test.runnerMemoryStoreModel = function () {
  test.heading('MemoryStore', function () {
    test.paragraph('The MemoryStore is a simple volatile store.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of MemoryStore', true, function () {
        return new MemoryStore() instanceof MemoryStore;
      });
      test.runnerStoreConstructor(MemoryStore);
    });
    test.heading('METHODS', function () {
      test.runnerStoreMethods(MemoryStore);
    });
  });
};
/**
 * tequila
 * test-store
 */
test.runnerStoreIntegration = function () {
  test.heading('Store Integration', function () {
    test.paragraph('');
    test.heading('CRUD (Create Read Update Delete)', function () {
      test.example('Exercise and verify CRUD functionality.', undefined, function () {

        // setup store and stooge class
        this.store = new MemoryStore();
        this.Stooge = function (args) {
          Model.call(this, args);
          this.modelType = "Stooge";
          this.attributes.push(new Attribute('name'));
        };
        this.Stooge.prototype = T.inheritPrototype(Model.prototype);

        // create initial stooges
        this.moe = new this.Stooge();
        this.moe.setAttributeValue('name', 'Moe');
        this.larry = new this.Stooge();
        this.larry.setAttributeValue('name', 'Larry');
        this.shemp = new this.Stooge();
        this.shemp.setAttributeValue('name', 'Shemp');

        // IDs after stored will be here
        this.stoogeIDsStored = [];
        this.stoogesRetrieved = [];

        // store the stooges
        this.store.putModel(this.moe, stoogeStored, this); // todo unit test this / self
        this.store.putModel(this.larry, stoogeStored, this);
        this.store.putModel(this.shemp, stoogeStored, this);

        // callback after storing stooges
        function stoogeStored(model, error, self) {
          if (typeof error != 'undefined') throw error;
          self.stoogeIDsStored.push(model.getAttributeValue('id'));
          if (self.stoogeIDsStored.length == 3) {
            // Now that first 3 stooges are stored lets retrieve and verify
            var actors = [];
            for (var i = 0; i < 3; i++) {
              actors.push(new self.Stooge());
              actors[i].setAttributeValue('id', self.stoogeIDsStored[i]);
              self.store.getModel(actors[i], stoogeRetrieved, self);
            }
          }
        }

        // callback after retrieving stored stooges
        function stoogeRetrieved(model, error, self) {
          if (typeof error != 'undefined') throw error;
          self.stoogesRetrieved.push(model);
          if (self.stoogesRetrieved.length == 3) {
            // Now we have stored and retrieved (via IDs into new objects).  So verify the stooges made it
            test.assertion(self.stoogesRetrieved[0] !== self.moe && // Make sure not a reference but a copy
              self.stoogesRetrieved[0] !== self.larry && self.stoogesRetrieved[0] !== self.shemp);
            var s = []; // get list of names to see if all stooges made it
            for (var i = 0; i < 3; i++) s.push(self.stoogesRetrieved[i].getAttributeValue('name'));
            test.show(s);
            test.assertion(T.contains(s, 'Moe') && T.contains(s, 'Larry') && T.contains(s, 'Shemp'));
            // Replace Shemp with Curly
            for (var i = 0; i < 3; i++) {
              if (self.stoogesRetrieved[i].getAttributeValue('name') == 'Shemp') {
                self.stoogesRetrieved[i].setAttributeValue('name', 'Curly');
                self.store.putModel(self.stoogesRetrieved[i], stoogeChanged, self);
              }
            }
          }
        }

        // callback after storing changed stooge
        function stoogeChanged(model, error, self) {
          if (typeof error != 'undefined') throw error;
          test.assertion(model.getAttributeValue('name') == 'Curly');
          var curly = new self.Stooge();
          curly.setAttributeValue('id', model.getAttributeValue('id'));
          self.store.getModel(curly, storeChangedShempToCurly, self);
        }

        // callback after retrieving changed stooge
        function storeChangedShempToCurly(model, error, self) {
          if (typeof error != 'undefined') throw error;
          test.assertion(model.getAttributeValue('name') == 'Curly');
          // Now test delete
          self.deletedModelId = model.getAttributeValue('id'); // Remember this
          self.store.deleteModel(model, stoogeDeleted, self)
        }

        // callback when Curly is deleted
        function stoogeDeleted(model, error, self) {
          if (error) throw error;
          // model parameter is what was deleted
          test.assertion(model.getAttributeValue('id') == null); // ID is removed
          test.assertion(model.getAttributeValue('name') == 'Curly'); // the rest remains
          // Is it really dead?
          var curly = new self.Stooge();
          curly.setAttributeValue('id', self.deletedModelId);
          self.store.getModel(curly, hesDeadJim, self);
        }

        function hesDeadJim(model, error, self) {
          test.assertion(error==Error('id not found in store'))
        }

      });
    });
  });
};
/**
 * tequila
 * tequila-spec
 */
test.start();
test.heading('CORE CLASSES', function () {
  test.paragraph('The core classes provide a abstract interface that are subclassed via prototypical inheritance.');
  test.runnerTequila();
  test.runnerAttribute();
  test.runnerModel(Model,false);
  test.runnerList(List,false);
});
test.heading('CORE MODELS', function () {
  test.paragraph('The core models inherit from the core classes and provide the framework structure.');
  test.runnerUserModel();
  test.runnerStoreModel();
  test.runnerMemoryStoreModel();
});
test.heading('SYSTEM INTEGRATION', function () {
  test.paragraph('The system functionality and requirements for the library as a whole is contained in this section.');
  test.runnerStoreIntegration();
});
test.stop();
/**
 * tequila
 * node-test-tail
 */
test.render(false);