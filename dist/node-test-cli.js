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
;
/**
 * tequila
 * tequila-singleton.js
 */

var Tequila = (function () {
  var singletonInstance;

  function init() {
    // Private methods and variables
    var version = '0.1.2';
    var attributeTypes = ['ID', 'String', 'Date', 'Boolean', 'Number', 'Model', 'Group', 'Table', 'Object'];
    var messageTypes = ['Null', 'Connected', 'Error', 'Sent', 'Ping', 'PutModel', 'PutModelAck', 'GetModel', 'GetModelAck', 'DeleteModel', 'DeleteModelAck', 'GetList', 'GetListAck'];
    var commandTypes = ['Stub', 'Menu', 'Presentation', 'Function', 'Procedure'];
    var commandEvents = ['BeforeExecute', 'AfterExecute', 'Error', 'Aborted', 'Completed'];
    var logTypes = ['Text', 'Delta'];
    var messageHandlers = {};
    return    {
      // Public methods and variables
      getVersion: function () {
        return version;
      },
      isServer: function () {
        return typeof exports !== 'undefined' && this.exports !== exports
      },
      contains: function (a, obj) {
        for (var i = 0; i < a.length; i++) {
          if (a[i] === obj) return true;
        }
        return false;
      },
      getInvalidProperties: function (args, allowedProperties) {
        var props = [];
        for (var property in args) {
          if (!this.contains(allowedProperties, property)) {
            props.push(property);
          }
        }
        return props;
      },
      inheritPrototype: function (p) {
        if (p == null) throw TypeError();
        if (Object.create) return Object.create(p);
        var t = typeof p;
        if (t !== "object" && typeof t !== "function") throw TypeError();
        function f() {
        };
        f.prototype = p;
        return new f();
      },
      getAttributeTypes: function () {
        return attributeTypes.slice(0); // copy array
      },
      getMessageTypes: function () {
        return messageTypes.slice(0); // copy array
      },
      getCommandTypes: function () {
        return commandTypes.slice(0); // copy array
      },
      getCommandEvents: function () {
        return commandEvents.slice(0); // copy array
      },
      getLogTypes: function () {
        return logTypes.slice(0); // copy array
      },
      setMessageHandler: function (message, handler) {
        messageHandlers[message] = handler;
      },
      hostMessageProcess: function (obj, fn) {
        if (messageHandlers[obj.type]) {
          messageHandlers[obj.type](obj.contents, fn);
        } else {
//          console.log('socket.io ackmessage: ' + JSON.stringify(obj));
          fn(true); // todo should this be an error?
        }
      }
    };
  }

  return function () {
    if (!singletonInstance) singletonInstance = init();
    return singletonInstance;
  };
})();
// Library scoped ref to singleton
var T = Tequila();
;
/**
 * tequila
 * attribute-class
 */
/*
 * Constructor
 */
function Attribute(args, arg2) {

  // this.ID = function() {};

  var splitTypes; // For String(30) type
  if (false === (this instanceof Attribute)) throw new Error('new operator required');
  if (typeof args == 'string') {
    var quickName = args;
    args = {};
    args.name = quickName;
    if (typeof arg2 == 'string') {
      args.type = arg2;
    }
  }
  args = args || {};
  this.name = args.name || null;
  this.label = args.label || args.name;
  this.type = args.type || 'String';
  splitTypes = function (str) { // for String(30) remove right of (
    var tmpSplit = str.split('(');
    tmpSplit[1] = parseInt(tmpSplit[1]);
    return tmpSplit;
  }(this.type);

  this.type = splitTypes[0];
  var unusedProperties = [];
  switch (this.type) {
    case 'ID':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'String':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'value', 'size']);
      this.size = splitTypes[1] ? splitTypes[1] : typeof args.size == 'number' ? args.size : args.size || 50;
      this.value = args.value || null;
      break;
    case 'Date':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'Boolean':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'Number':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'Model':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      if (this.value instanceof Attribute.ModelID)
      this.modelType = this.value.modelType;
      break;
    case 'Group':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'Table':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'value', 'group']);
      this.value = args.value || null;
      this.group = args.group || null;
      break;
    case 'Object':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
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
 * Additional Constructors
 */
Attribute.ModelID = function (model) {
  if (false === (this instanceof Attribute.ModelID)) throw new Error('new operator required');
  if (false === (model instanceof Model)) throw new Error('must be constructed with Model');
  this.value = model.get('id');
  this.constructorFunction = model.constructor;
  this.modelType = model.modelType;
};
Attribute.ModelID.prototype.toString = function () {
  if (typeof this.value == 'string')
    return 'ModelID(' + this.modelType + ':\'' + this.value + '\')';
  else
    return 'ModelID(' + this.modelType + ':' + this.value + ')';
};
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
        newValue = newValue.toUpperCase();
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
  if (!T.contains(T.getAttributeTypes(), this.type))
    errors.push('Invalid type: ' + this.type);
  switch (this.type) {
    case 'ID':
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
      if (!(this.value instanceof Attribute.ModelID)) errors.push('value must be Attribute.ModelID');
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
;
/**
 * tequila
 * command-class
 */
// Command Constructor
function Command(/* does this matter */ args) {
  if (false === (this instanceof Command)) throw new Error('new operator required');
  args = args || {};
  var i;
  var unusedProperties = T.getInvalidProperties(args, ['name', 'description', 'type', 'contents', 'scope', 'timeout', 'bucket']);
  var badJooJoo = [];
  for (i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Command: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Command: ' + badJooJoo[0]);
  for (i in args) this[i] = args[i];
  this.name = this.name || "(unnamed)"; // name is optional
  if ('string' != typeof this.name) throw new Error('name must be string');
  if ('undefined' == typeof this.description) this.description = this.name + ' Command';
  if ('undefined' == typeof this.type) this.type = 'Stub';
  if (!T.contains(T.getCommandTypes(), this.type)) throw new Error('Invalid command type: ' + this.type);
  switch (this.type) {
    case 'Stub':
      break;
    case 'Menu':
      if (!(this.contents instanceof Array)) throw new Error('contents must be array of menu items');
      if (!this.contents.length) throw new Error('contents must be array of menu items');
      for (i in this.contents) {
        if (typeof this.contents[i] != 'string' && !(this.contents[i] instanceof Command))
          throw new Error('contents must be array of menu items');
      }
      break;
    case 'Presentation':
      if (!(this.contents instanceof Presentation)) throw new Error('contents must be a Presentation');
      break;
    case 'Function':
      if (typeof this.contents != 'function') throw new Error('contents must be a Function');
      break;
    case 'Procedure':
      if (!(this.contents instanceof Procedure)) throw new Error('contents must be a Procedure');
      break;
  }
  if ('undefined' != typeof this.scope)
    if (!((this.scope instanceof Model) || (this.scope instanceof List)))
      throw new Error('optional scope property must be Model or List');
  if ('undefined' != typeof this.timeout)
    if (typeof this.timeout != 'Number') throw new Error('timeout must be a Number');
  // Validations done
  this._eventListeners = [];
}
/*
 * Methods
 */
Command.prototype.toString = function () {
  return this.type + ' Command: ' + this.name;
};
Command.prototype.onEvent = function (events, callback) {
  if (!(events instanceof Array)) {
    if (typeof events != 'string') throw new Error('subscription string or array required');
    events = [events]; // coerce to array
  }
  if (typeof callback != 'function') throw new Error('callback is required');
  // Check known Events
  for (var i in events) {
    if (events[i] != '*')
      if (!T.contains(T.getCommandEvents(), events[i]))
        throw new Error('Unknown command event: ' + events[i]);
  }
  // All good add to chain
  this._eventListeners.push({events: events, callback: callback});
};
Command.prototype.emitEvent = function (event) {
  var i;
  for (i in this._eventListeners) {
    var subscriber = this._eventListeners[i];
    if ((subscriber.events.length && subscriber.events[0] === '*') || T.contains(subscriber.events, event)) {
      subscriber.callback.call(this, event);
    }
  }
  if (event == 'Completed') // if command complete release listeners
    this._eventListeners = [];
};
Command.prototype.execute = function () {
  if (!T.contains(['Function'], this.type)) throw new Error('command not implemented');
  var self = this;
  this.emitEvent('BeforeExecute');
  try {
    switch (this.type) {
      case 'Function':
        setTimeout(callFunc, 0); // async execution delay till function returns
        break;
      default:
        throw new Error('command not implemented');
    }
  } catch (e) {
    this.error = e;
    this.emitEvent('Error');
    this.emitEvent('Completed');
    this.status = -1;
  }
  this.emitEvent('AfterExecute');
  function callFunc() {
    try {
      self.contents(); // give function this context to command object (self)
    } catch (e) {
      self.error = e;
      self.emitEvent('Error');
      self.emitEvent('Completed');
      self.status = -1;
    }
  }
};
Command.prototype.abort = function () {
  this.emitEvent('Aborted');
  this.emitEvent('Completed');
  this.status = -1;
};
Command.prototype.complete = function () {
  this.emitEvent('Completed');
  this.status = 1;
};

;
/**
 * tequila
 * delta-class
 */
/*
 * Constructor
 */
function Delta(modelID) {
  if (false === (this instanceof Delta)) throw new Error('new operator required');
  if (false === (modelID instanceof Attribute.ModelID)) throw new Error('Attribute.ModelID required in constructor');
  this.dateCreated = new Date();
  this.modelID = modelID;
  this.attributeValues = {};
}
;
/**
 * tequila
 * interface-class
 */
/*
 * Constructor
 */
function Interface(args) {
  if (false === (this instanceof Interface)) throw new Error('new operator required');
  args = args || {};
  args.name = args.name || '(unnamed)';
  args.description = args.description || 'a Interface';
  var i;
  var unusedProperties = T.getInvalidProperties(args, ['name', 'description', 'tasksCompleted']);
  var badJooJoo = [];
  for (i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1)
    throw new Error('error creating Procedure: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Procedure: ' + badJooJoo[0]);
  // args ok, now copy to object and check for errors
  for (i in args) this[i] = args[i];
  badJooJoo = this.getValidationErrors(); // before leaving make sure valid Attribute
  if (badJooJoo) {
    if (badJooJoo.length > 1) throw new Error('error creating Procedure: multiple errors');
    if (badJooJoo.length) throw new Error('error creating Procedure: ' + badJooJoo[0]);
  }
}
/*
 * Methods
 */
Interface.prototype.getValidationErrors = function () {
  var badJooJoo = [];
  return badJooJoo.length ? badJooJoo : null;
};
Interface.prototype.toString = function () {
  return this.description;
};
Interface.prototype.requestResponse = function (obj, callback) {
  if (obj == null || typeof obj !== 'object' || typeof callback !== 'function') throw new Error('requestResponse arguments required: object, callback');
  if (obj.request === undefined) throw new Error('requestResponse object has no request property');
  if (obj.mockResponse !== undefined) throw new Error('mockResponse not available for Interface');
  // Parameters are ok now handle the request
  setTimeout(function () {
    obj.response = new Error('invalid request: ' + obj.request);
    callback(obj);
  }, 0);
};
Interface.prototype.canMockResponses = function () {
  return false;
};
;
/**
 * tequila
 * list-class
 */

// Constructor
var List = function (model) {
  if (false === (this instanceof List)) throw new Error('new operator required');
  if (false === (model instanceof Model)) throw new Error('argument required: model');
  this.model = model;
  this._items = [];
  this._itemIndex = -1;
};
List.prototype.length = function () {
  return this._items.length;
};
List.prototype.clear = function () {
  this._items = [];
  this._itemIndex = -1;
  return this;
};
List.prototype.get = function (attribute) {
  if (this._items.length < 1) throw new Error('list is empty');
  for (var i = 0; i < this.model.attributes.length; i++) {
    if (this.model.attributes[i].name.toUpperCase() == attribute.toUpperCase())
      return this._items[this._itemIndex][i];
  }
};
List.prototype.set = function (attribute,value) {
  if (this._items.length < 1) throw new Error('list is empty');
  for (var i = 0; i < this.model.attributes.length; i++) {
    if (this.model.attributes[i].name.toUpperCase() == attribute.toUpperCase()) {
      this._items[this._itemIndex][i] = value;
      return;
    }
  }
  throw new Error('attribute not valid for list model');
};
List.prototype.addItem = function (item) {
  var values = [];
  if (item) {
    for (var i in item.attributes) {
      values.push(item.attributes[i].value);
    }
  } else {
    for (var i in this.model.attributes) {
      values.push(undefined);
    }
  }
  this._items.push(values);
  this._itemIndex = this._items.length - 1;
  return this;
};
List.prototype.removeItem = function (item) {
  this._items.splice(this._itemIndex, 1);
  this._itemIndex--;
  return this;
};
List.prototype.indexedItem = function (index) {
  if (this._items.length < 1) throw new Error('list is empty');
  if (index < 0) throw new Error('item not found');
  this._itemIndex = index;
};
List.prototype.nextItem = function () {
  if (this._items.length < 1) throw new Error('list is empty');
  this.indexedItem(this._itemIndex + 1);
};
List.prototype.previousItem = function () {
  if (this._items.length < 1) throw new Error('list is empty');
  this.indexedItem(this._itemIndex - 1);
};
List.prototype.firstItem = function () {
  if (this._items.length < 1) throw new Error('list is empty');
  this.indexedItem(0);
};
List.prototype.lastItem = function () {
  if (this._items.length < 1) throw new Error('list is empty');
  this.indexedItem(this._items.length - 1);
};
List.prototype.sort = function (key) {
  var i = 0;
  var keyvalue;
  for (var keyName in key) {
    if (!keyvalue) keyvalue = keyName;
  }
  if (!keyvalue) throw new Error('sort order required');
  var ascendingSort = (key[keyvalue] == 1);
  while (i < this.model.attributes.length && this.model.attributes[i].name != keyvalue) i++;
  this._items.sort(function (a, b) {
    if (ascendingSort) {
      if (a[i] < b[i])
        return -1;
      if (a[i] > b[i])
        return 1;
    } else {
      if (a[i] > b[i])
        return -1;
      if (a[i] < b[i])
        return 1;
    }
    return 0;
  });
};
;
/**
 * tequila
 * message-class
 */
/*
 * Constructor
 */
function Message(type,contents) {
  if (false === (this instanceof Message)) throw new Error('new operator required');
  if ('undefined' == typeof type) throw new Error('message type required');
  if (!T.contains(T.getMessageTypes(), type)) throw new Error('Invalid message type: ' + type);
  this.type = type;
  this.contents = contents;
}
/*
 * Methods
 */
Message.prototype.toString = function () {
  switch (this.type) {
    case 'Null':
      return this.type+ ' Message';
      break;
    default:
      return this.type+ ' Message: ' + this.contents;
      break;
  }
};
;
/**
 * tequila
 * model-class
 */
// Model Constructor
var Model = function (args) {
  if (false === (this instanceof Model)) throw new Error('new operator required');
  this.modelType = "Model";
  this.attributes = [new Attribute('id','ID')];
  args = args || {};
  if (args.attributes) {
    for (var i in args.attributes) {
      this.attributes.push(args.attributes[i]);
    }
  }
  var unusedProperties = T.getInvalidProperties(args, ['attributes']);
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
};
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
Model.prototype.get = function(attribute) {
  for (var i = 0; i < this.attributes.length; i++) {
    if (this.attributes[i].name.toUpperCase() == attribute.toUpperCase())
      return this.attributes[i].value;
  }
};
Model.prototype.set = function(attribute,value) {
  for (var i = 0; i < this.attributes.length; i++) {
    if (this.attributes[i].name.toUpperCase() == attribute.toUpperCase()) {
      this.attributes[i].value = value;
      return;
    }
  }
  throw new Error('attribute not valid for model');
};;
/**
 * tequila
 * procedure-class
 */
// Model Constructor
var Procedure = function (args) {
  if (false === (this instanceof Procedure)) throw new Error('new operator required');
  args = args || {};
  var i;
  var unusedProperties = T.getInvalidProperties(args, ['tasks', 'tasksNeeded', 'tasksCompleted']);
  var badJooJoo = [];
  for (i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1)
    throw new Error('error creating Procedure: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Procedure: ' + badJooJoo[0]);
  // args ok, now copy to object and check for errors
  for (i in args) this[i] = args[i];
  badJooJoo = this.getValidationErrors(); // before leaving make sure valid Attribute
  if (badJooJoo) {
    if (badJooJoo.length > 1) throw new Error('error creating Procedure: multiple errors');
    if (badJooJoo.length) throw new Error('error creating Procedure: ' + badJooJoo[0]);
  }
};
Procedure.prototype.getValidationErrors = function () {
  var i, j;
  var unusedProperties;
  if (this.tasks && !(this.tasks instanceof Array)) return ['tasks is not an array'];
  var badJooJoo = [];
  for (i in this.tasks) {
    var task = this.tasks[i];
    unusedProperties = T.getInvalidProperties(task, ['label', 'command', 'requires', 'timeout']);
    for (j = 0; j < unusedProperties.length; j++) badJooJoo.push('invalid task[' + i + '] property: ' + unusedProperties[j]);
    if (typeof task.label != 'undefined' && typeof task.label != 'string')
      badJooJoo.push('task[' + i + '].label must be string');
    if (typeof task.command != 'undefined' && !(task.command instanceof Command))
      badJooJoo.push('task[' + i + '].command must be a Command object');
    // make sure requires valid if specified
    if (!task.requires)
      task.requires = -1; // default to
    if (!(task.requires instanceof Array)) task.requires = [task.requires]; // coerce to array
    for (j in task.requires) {
      switch (typeof task.requires[j]) {
        case 'string':
          throw new Error('wtf string requires in task[' + i + ']');
          break;
        case 'number':
          if (task.requires[j] >= this.tasks.length) throw new Error('missing task #' + task.requires[j] + ' for requires in task[' + i + ']');
          if (task.requires[j] < -1) throw new Error('task #' + task.requires[j] + ' invalid requires in task[' + i + ']');
          break;
        default:
          throw new Error('invalid type for requires in task[' + i + ']');
      }
    }
  }
return badJooJoo.length ? badJooJoo : null;
};
;
/**
 * tequila
 * store-class
 */

// Constructor
var Store = function (args) {
  if (false === (this instanceof Store)) throw new Error('new operator required');
  args = args || {};
  this.storeType = args.storeType || "Store";
  this.name = args.name || 'a ' + this.storeType;
  this.storeInterface = {
    isReady: true,
    canGetModel: false,
    canPutModel: false,
    canDeleteModel: false,
    canGetList: false
  };
  var unusedProperties = T.getInvalidProperties(args, ['name', 'storeType']);
  var badJooJoo = [];
  for (var i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Store: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Store: ' + badJooJoo[0]);
};
// Methods
Store.prototype.toString = function () {
  if (this.name == 'a ' + this.storeType) {
    return this.name;
  } else {
    return this.storeType + ': ' +this.name;
  }
};
Store.prototype.getServices = function () {
  return this.storeInterface;
};
Store.prototype.onConnect = function (location, callBack) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callBack != 'function') throw new Error('argument must a callback');
  callBack(this, undefined);
};
Store.prototype.getModel = function () {
  throw new Error(this.storeType + ' does not provide getModel');
};
Store.prototype.putModel = function () {
  throw new Error('Store does not provide putModel');
};
Store.prototype.deleteModel = function () {
  throw new Error('Store does not provide deleteModel');
};
Store.prototype.getList = function () {
  throw new Error('Store does not provide getList');
};
;
/**
 * tequila
 * transport-class
 */
function Transport(location, callBack) {
  if (false === (this instanceof Transport)) throw new Error('new operator required');
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callBack != 'function') throw new Error('argument must a callback');
  var self = this;
  self.connected = false;
  self.initialConnect = true;
  self.location = location;
  if (self.location=='') self.location='http host';
  self.socket = io.connect(location);
  self.socket.on('connect', function () {
    self.connected = true;
    self.initialConnect = false;
    console.log('socket.io ('+self.location+') connected');
    callBack.call(self, new Message('Connected', ''));
  });
  self.socket.on('connecting', function () {
    console.log('socket.io ('+self.location+') connecting');
  });
  self.socket.on('error', function (reason) {
    var theReason = reason;
    if (theReason.length < 1) theReason = "(unknown)";
    console.error('socket.io ('+self.location+') error: ' + theReason + '.');
    // If have not ever connected then signal error
    if (self.initialConnect) {
      callBack.call(self, new Message('Error', 'cannot connect'));
    }
  });
  self.socket.on('connect_failed', function (reason) {
    var theReason = reason;
    if (theReason.length < 1) theReason = "(unknown)";
    console.error('socket.io ('+self.location+') connect_failed: ' + theReason + '.');
    // If have not ever connected then signal error
    if (self.initialConnect) {
      callBack.call(self, new Message('Error', 'cannot connect'));
    }
  });
  self.socket.on('message', function (obj) {
    console.log('socket.io ('+self.location+') message: ' + obj);
  });
  self.socket.on('disconnect', function (reason) {
    self.connected = false;
    console.log('socket.io ('+self.location+') disconnect: ' + reason);
  });
}
/*
 * Methods
 */
Transport.prototype.send = function (message, callBack) {
  var self = this;
  if (typeof message == 'undefined') throw new Error('message required');
  if (!(message instanceof Message)) throw new Error('parameter must be instance of Message');
  if (typeof callBack != 'undefined' && typeof callBack != 'function') throw new Error('argument must a callback');
  if (!this.connected) {
    callBack.call(self, new Message('Error', 'not connected'));
    return;
  }
  if (typeof callBack != 'undefined') {
    self.socket.emit('ackmessage', message, function (msg) {
      callBack.call(self, msg);
    });
  } else {
    self.socket.send(message);
  }
};
Transport.prototype.close = function () {
  if (!this.connected)
    throw new Error('not connected');
  this.socket.disconnect();
};
;
/**
 * tequila
 * application-model
 */

// Model Constructor
var Application = function (args) {
  if (false === (this instanceof Application)) throw new Error('new operator required');
  Model.call(this, args);
  this.modelType = "Application";
  this.interface = new Interface();
};
Application.prototype = T.inheritPrototype(Model.prototype);
/*
 * Methods
 */
Application.prototype.run = function () {
  return new Command().execute();
};
Application.prototype.setInterface = function (interface) {
  if (false === (interface instanceof Interface)) throw new Error('instance of Interface a required parameter');
};
Application.prototype.getInterface = function () {
  return this.interface;
};
;
/**
 * tequila
 * log-model
 */

// Model Constructor
var Log = function (args) {
  if (false === (this instanceof Log)) throw new Error('new operator required');
  if (typeof args == 'string') {
    var simpleText = args;
    args = {};
    args.contents = simpleText;
  }
  args = args || {};
  if (!args.attributes) {
    args.attributes = [];
  }
  var my_logType = args.logType || 'Text';
  var my_importance = args.importance || 'Info';
  var my_contents = args.contents || '(no text)';
  if (!T.contains(T.getLogTypes(), my_logType)) throw new Error('Unknown log type: ' + my_logType);

  if (typeof args.logType != 'undefined') delete args.logType;
  if (typeof args.importance != 'undefined') delete args.importance;
  if (typeof args.contents != 'undefined') delete args.contents;
  args.attributes.push(new Attribute({name: 'dateLogged', type: 'Date', value: new Date()}));
  args.attributes.push(new Attribute({name: 'logType', type: 'String', value: my_logType}));
  args.attributes.push(new Attribute({name: 'importance', type: 'String', value: my_importance}));
  if (my_logType=='Delta')
    args.attributes.push(new Attribute({name: 'contents', type: 'Object', value: my_contents}));
  else
    args.attributes.push(new Attribute({name: 'contents', type: 'String', value: my_contents}));
  Model.call(this, args);
  this.modelType = "Log";
};
Log.prototype = T.inheritPrototype(Model.prototype);
/*
 * Methods
 */
Log.prototype.toString = function () {
  if (this.get('logType')=='Delta')
    return this.get('importance') + ': ' + '(delta)';
  else
    return this.get('importance') + ': ' + this.get('contents');
};
;
/**
 * tequila
 * presentation-model
 */
// Model Constructor
var Presentation = function (args) {
  if (false === (this instanceof Presentation)) throw new Error('new operator required');
  args = args || {};
  if (!args.attributes) {
    args.attributes = [];
  }
  args.attributes.push(new Attribute({name: 'name', type: 'String(20)'}));
  Model.call(this, args);
  this.modelType = "Presentation";
};
Presentation.prototype = T.inheritPrototype(Model.prototype);;
/**
 * tequila
 * user-core-model
 */
// Model Constructor
var User = function (args) {
  if (false === (this instanceof User)) throw new Error('new operator required');
  args = args || {};
  if (!args.attributes) {
    args.attributes = [];
  }
  args.attributes.push(new Attribute({name: 'name', type: 'String(20)'}));
  args.attributes.push(new Attribute({name: 'active', type: 'Boolean'}));
  args.attributes.push(new Attribute({name: 'password', type: 'String(20)'}));
  args.attributes.push(new Attribute({name: 'firstName', type: 'String(35)'}));
  args.attributes.push(new Attribute({name: 'lastName', type: 'String(35)'}));
  args.attributes.push(new Attribute({name: 'email', type: 'String(20)'}));
  Model.call(this, args);
  this.modelType = "User";
  this.set('active',false)
};
User.prototype = T.inheritPrototype(Model.prototype);;
/**
 * tequila
 * workspace-class
 */
function Workspace(args) {
  if (false === (this instanceof Workspace)) throw new Error('new operator required');
  args = args || {};
  if (!args.attributes) {
    args.attributes = [];
  }
  var userModelID = new Attribute.ModelID(new User());
  args.attributes.push(new Attribute({name: 'user', type: 'Model', value: userModelID}));
  args.attributes.push(new Attribute({name: 'deltas', type: 'Object', value: {}}));

  var delta
//  this.deltas = [];

+
  Model.call(this, args);
  this.modelType = "Workspace";
}
Workspace.prototype = T.inheritPrototype(Model.prototype);
/*
 * Methods
 */

;
/**
 * tequila
 * memory-store
 */
// Constructor
var MemoryStore = function (args) {
  if (false === (this instanceof MemoryStore)) throw new Error('new operator required');
  args = args || {};
  this.storeType = args.storeType || "MemoryStore";
  this.name = args.name || 'a ' + this.storeType;
  this.storeInterface = {
    isReady: true,
    canGetModel: true,
    canPutModel: true,
    canDeleteModel: true,
    canGetList: true
  };
  this.data = [];// Each ele is an array of model types and contents (which is an array of IDs and Model Value Store)
  this.idCounter = 0;
  var unusedProperties = T.getInvalidProperties(args, ['name', 'storeType']);
  var badJooJoo = [];
  for (var i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Store: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Store: ' + badJooJoo[0]);
};
MemoryStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
MemoryStore.prototype.getModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callback required');
  // Find model in memorystore, error out if can't find
  var modelIndex = -1;
  for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
  if (modelIndex < 0) {
    callBack(model, new Error('model not found in store'));
    return;
  }
  // Find the ID now and put in instanceIndex
  var id = model.get('id');
  var storedPair = this.data[modelIndex][1];
  var instanceIndex = -1;
  for (var i = 0; instanceIndex < 0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
  if (instanceIndex < 0) {
    callBack(model, new Error('id not found in store'));
    return;
  }
  // Copy values from store to ref model
  var storeValues = storedPair[instanceIndex][1];
  for (var a in model.attributes) {
    model.attributes[a].value = storeValues[model.attributes[a].name];
  }
  callBack(model, undefined);
};
MemoryStore.prototype.putModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  var id = model.get('ID');
  if (id) {
    // Find model in memorystore, error out if can't find
    var modelIndex = -1;
    for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
    if (modelIndex < 0) {
      callBack(model, new Error('model not found in store'));
      return;
    }
    // Find the ID now
    var instanceIndex = -1;
    var id = model.get('id');
    var storedPair = this.data[modelIndex][1];
    for (var i = 0; instanceIndex < 0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
    if (instanceIndex < 0) {
      callBack(model, new Error('id not found in store'));
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
    callBack(model, undefined);
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
    model.set('id', newID);
    var ModelValues = {};
    for (var a in model.attributes) {
      var theName = model.attributes[a].name;
      var theValue = model.attributes[a].value;
      ModelValues[theName] = theValue;
    }
    this.data[modelIndex][1].push([newID, ModelValues]);
    callBack(model, undefined);
  }

};
MemoryStore.prototype.deleteModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  // Find model in memorystore, error out if can't find
  var modelIndex = -1;
  for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
  if (modelIndex < 0) {
    callBack(model, new Error('model not found in store'));
    return;
  }
  // Find the ID now
  var instanceIndex = -1;
  var id = model.get('id');
  var storedPair = this.data[modelIndex][1];
  for (var i = 0; instanceIndex < 0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
  if (instanceIndex < 0) {
    callBack(model, new Error('id not found in store'));
    return;
  }
  // Splice out the stored values then prepare that Model for callback with ID stripped
  var storeValues = storedPair.splice(instanceIndex, 1)[0][1];
  for (var a in model.attributes) {
    if (model.attributes[a].name == 'id')
      model.attributes[a].value = undefined;
    else
      model.attributes[a].value = storeValues[model.attributes[a].name];
  }
  callBack(model, undefined);
};
MemoryStore.prototype.getList = function (list, filter, arg3, arg4) {
  var callBack, order;
  if (typeof(arg4) == 'function') {
    callBack = arg4;
    order = arg3;
  } else {
    callBack = arg3;
  }
  if (!(list instanceof List)) throw new Error('argument must be a List');
  if (!(filter instanceof Object)) throw new Error('filter argument must be Object');
  if (typeof callBack != "function") throw new Error('callback required');
  // Find model in memorystore, error out if can't find
  var modelIndex = -1;
  for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == list.model.modelType) modelIndex = i;
  if (modelIndex < 0) {
    callBack(list);
    return;
  }
  list.clear();
  var storedPair = this.data[modelIndex][1];
  for (var i = 0; i < storedPair.length; i++) {
    var doIt = true;
    for (var prop in filter) {
      if (filter.hasOwnProperty(prop)) {
        console.log(storedPair[i][1][prop]);
        if (filter[prop] instanceof RegExp) {
          if (!filter[prop].test(storedPair[i][1][prop])) doIt = false;
        } else {
          if (filter[prop] != storedPair[i][1][prop]) doIt = false;
        }
      }
    }
    if (doIt) {
      var dataPart = [];
      for (var j in storedPair[i][1]) {
        dataPart.push(storedPair[i][1][j]);
      }
      list._items.push(dataPart);
    }
  }
  list._itemIndex = list._items.length - 1;
  if (order) {
    list.sort(order);
  }
  callBack(list);
};
;
/**
 * tequila
 * mongo-store
 */

// Constructor
var MongoStore = function (args) {
  if (false === (this instanceof MongoStore)) throw new Error('new operator required');
  args = args || {};
  this.storeType = args.storeType || "MongoStore";
  this.name = args.name || 'a ' + this.storeType;

  this.storeInterface = {
    isReady: false,
    canGetModel: T.isServer(),
    canPutModel: T.isServer(),
    canDeleteModel: T.isServer(),
    canGetList: T.isServer()
  };
  var unusedProperties = T.getInvalidProperties(args, ['name', 'storeType']);
  var badJooJoo = [];
  for (var i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Store: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Store: ' + badJooJoo[0]);
};
MongoStore.prototype = T.inheritPrototype(Store.prototype);
// Methods

// See mongo-store-model-server... stub for client here
MongoStore.prototype.onConnect = function (location, callBack) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callBack != 'function') throw new Error('argument must a callback');
  callBack(this, Error('mongoStore unavailable in client'));
};
;
/**
 * tequila
 * remote-store
 */
// Constructor
var RemoteStore = function (args) {
  if (false === (this instanceof RemoteStore)) throw new Error('new operator required');
  args = args || {};
  this.storeType = args.storeType || "RemoteStore";
  this.name = args.name || 'a ' + this.storeType;
  this.storeInterface = {
    isReady: false,
    canGetModel: true,
    canPutModel: true,
    canDeleteModel: true,
    canGetList: true
  };
  var unusedProperties = T.getInvalidProperties(args, ['name', 'storeType']);
  var badJooJoo = [];
  for (var i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Store: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Store: ' + badJooJoo[0]);
};
RemoteStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
RemoteStore.prototype.onConnect = function (location, callBack) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callBack != 'function') throw new Error('argument must a callback');
  var store = this;
  try {
    this.transport = new Transport(location, function (msg) {
      if (msg.type == 'Error') {
        console.log('Transport connect error: ' + store.name);
        callBack(undefined, new Error(msg.contents));
        return;
      }
      if (msg.type == 'Connected') {
        console.log('Transport connected: ' + store.name);
        store.storeInterface.isReady = true;
        callBack(store);
        return;
      }
      console.log('Transport unexpected message type: ' + store.name);
      callBack(undefined, new Error('unexpected message type: ' + msg.type));
    });
  }
  catch (err) {
    callBack(undefined, err);
  }
};
RemoteStore.prototype.putModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  this.transport.send(new Message('PutModel', model), function (msg) {
    if (false && msg == 'Ack') { // todo wtf is this
      callBack(model);
    } else if (msg.type == 'PutModelAck') {
      var c = msg.contents;
      model.attributes = [];
      for (var a in c.attributes) {
        var attrib = new Attribute(c.attributes[a].name, c.attributes[a].type);
        attrib.value = c.attributes[a].value;
        model.attributes.push(attrib);
      }
      if (typeof c == 'string')
        callBack(model, c);
      else
        callBack(model);
    } else {
      callBack(model, Error(msg));
    }
  });
};
RemoteStore.prototype.getModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callback required');
  this.transport.send(new Message('GetModel', model), function (msg) {
    if (false && msg == 'Ack') { // todo wtf is this
      callBack(model);
    } else if (msg.type == 'GetModelAck') {
      var c = msg.contents;
      model.attributes = [];
      for (var a in c.attributes) {
        var attrib = new Attribute(c.attributes[a].name, c.attributes[a].type);
        attrib.value = c.attributes[a].value;
        model.attributes.push(attrib);
      }
      if (typeof c == 'string')
        callBack(model, c);
      else
        callBack(model);
    } else {
      callBack(model, Error(msg));
    }
  });
};
RemoteStore.prototype.deleteModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  this.transport.send(new Message('DeleteModel', model), function (msg) {
    if (false && msg == 'Ack') { // todo wtf is this
      callBack(model);
    } else if (msg.type == 'DeleteModelAck') {
      var c = msg.contents;
      model.attributes = [];
      for (var a in c.attributes) {
        var attrib = new Attribute(c.attributes[a].name, c.attributes[a].type);
        attrib.value = c.attributes[a].value;
        model.attributes.push(attrib);
      }
      if (typeof c == 'string')
        callBack(model, c);
      else
        callBack(model);
    } else {
      callBack(model, Error(msg));
    }
  });
};
RemoteStore.prototype.getList = function (list, filter, arg3, arg4) {
  var callBack, order;
  if (typeof(arg4) == 'function') {
    callBack = arg4;
    order = arg3;
  } else {
    callBack = arg3;
  }
  if (!(list instanceof List)) throw new Error('argument must be a List');
  if (!(filter instanceof Object)) throw new Error('filter argument must be Object');
  if (typeof callBack != "function") throw new Error('callback required');
  this.transport.send(new Message('GetList', {list: list, filter: filter, order: order}), function (msg) {
    if (false && msg == 'Ack') { // todo wtf is this
      callBack(list);
    } else if (msg.type == 'GetListAck') {
      list._items = msg.contents._items;
      list._itemIndex = msg.contents._itemIndex;
      callBack(list);
    } else {
      callBack(list, Error(msg));
    }
  });

};
// Message Handlers
T.setMessageHandler('PutModel', function putModelMessageHandler(messageContents, fn) {
  // create proxy for client model
  var ProxyPutModel = function (args) {
    Model.call(this, args);
    this.modelType = messageContents.modelType;
    this.attributes = [];
    for (var a in messageContents.attributes) {
      var attrib = new Attribute(messageContents.attributes[a].name, messageContents.attributes[a].type);
      if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
        if (attrib.value != messageContents.attributes[a].value)
          attrib.value = messageContents.attributes[a].value;
      } else {
        attrib.value = messageContents.attributes[a].value;
      }
      this.attributes.push(attrib);
    }
  };
  ProxyPutModel.prototype = T.inheritPrototype(Model.prototype); // Todo this is not a real class object may need to make factory builder
  var pm = new ProxyPutModel();
  var msg;
  hostStore.putModel(pm, function (model, error) {
    if (typeof error == 'undefined') {
      msg = new Message('PutModelAck', model);
    } else {
      console.log('ERROR: ' + error + "");
      msg = new Message('PutModelAck', error + "");
    }
    fn(msg);
  }, this);
});
T.setMessageHandler('GetModel', function getModelMessageHandler(messageContents, fn) {
  // create proxy for client model
  var ProxyGetModel = function (args) {
    Model.call(this, args);
    this.modelType = messageContents.modelType;
    this.attributes = [];
    for (var a in messageContents.attributes) {
      var attrib = new Attribute(messageContents.attributes[a].name, messageContents.attributes[a].type);
      if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
        attrib.value = messageContents.attributes[a].value;
      } else {
        attrib.value = messageContents.attributes[a].value;
      }
      this.attributes.push(attrib);
    }
  };
  ProxyGetModel.prototype = T.inheritPrototype(Model.prototype);
  var pm = new ProxyGetModel();
  var msg;
  hostStore.getModel(pm, function (model, error) {
    if (typeof error == 'undefined') {
      msg = new Message('GetModelAck', model);
    } else {
      msg = new Message('GetModelAck', error + "");
    }
    fn(msg);
  }, this);
});
T.setMessageHandler('DeleteModel', function deleteModelMessageHandler(messageContents, fn) {
  // create proxy for client model
  var ProxyDeleteModel = function (args) {
    Model.call(this, args);
    this.modelType = messageContents.modelType;
    this.attributes = [];
    for (var a in messageContents.attributes) {
      var attrib = new Attribute(messageContents.attributes[a].name, messageContents.attributes[a].type);
      if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
        attrib.value = messageContents.attributes[a].value;
      } else {
        attrib.value = messageContents.attributes[a].value;
      }
      this.attributes.push(attrib);
    }
  };
  ProxyDeleteModel.prototype = T.inheritPrototype(Model.prototype);
  var pm = new ProxyDeleteModel();
  var msg;
  hostStore.deleteModel(pm, function (model, error) {
    if (typeof error == 'undefined')
      msg = new Message('DeleteModelAck', model);
    else
      msg = new Message('DeleteModelAck', error);
    fn(msg);
  }, this);
});
T.setMessageHandler('GetList', function getListMessageHandler(messageContents, fn) {
  var proxyList = new List(new Model());
  proxyList.model.modelType = messageContents.list.model.modelType;
  proxyList.model.attributes = messageContents.list.model.attributes;
  var msg;
  function messageCallback(list, error) {
    if (typeof error == 'undefined')
      msg = new Message('GetListAck', list);
    else
      msg = new Message('GetListAck', error);
    fn(msg);
  }
  if (messageContents.order) {
    hostStore.getList(proxyList, messageContents.filter, messageContents.order, messageCallback);
  } else {
    hostStore.getList(proxyList, messageContents.filter, messageCallback);
  }
});
;
/**
 * tequila
 * local-store
 */
// Constructor
var LocalStore = function (args) {
  if (false === (this instanceof LocalStore)) throw new Error('new operator required');
  args = args || {};
  this.storeType = args.storeType || "LocalStore";
  this.name = args.name || 'a ' + this.storeType;
  this.storeInterface = {
    isReady: false,
    canGetModel: false,
    canPutModel: false,
    canDeleteModel: false,
    canGetList: false
  };
  this.data = [];// Each ele is an array of model types and contents (which is an array of IDs and Model Value Store)
  this.idCounter = 0;
  var unusedProperties = T.getInvalidProperties(args, ['name', 'storeType']);
  var badJooJoo = [];
  for (var i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Store: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Store: ' + badJooJoo[0]);
};
LocalStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
;
/**
 * tequila
 * redis-store
 */
// Constructor
var RedisStore = function (args) {
  if (false === (this instanceof RedisStore)) throw new Error('new operator required');
  args = args || {};
  this.storeType = args.storeType || "RedisStore";
  this.name = args.name || 'a ' + this.storeType;
  this.storeInterface = {
    isReady: false,
    canGetModel: false,
    canPutModel: false,
    canDeleteModel: false,
    canGetList: false
  };
  this.data = [];// Each ele is an array of model types and contents (which is an array of IDs and Model Value Store)
  this.idCounter = 0;
  var unusedProperties = T.getInvalidProperties(args, ['name', 'storeType']);
  var badJooJoo = [];
  for (var i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Store: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Store: ' + badJooJoo[0]);
};
RedisStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
;
/**
 * tequila
 * bootstrap3-interface
 */
;
/**
 * tequila
 * command-line-interface
 */
;
/**
 * tequila
 * mock-interface.js
 */
;
/**
 * tequila
 * mongo-store-server
 *
 * MongoDB goodies
 *
 * db.testData.find() // return cursor with all docs in testData collection
 * db.testData.find( { x : 18 } ) // cursor with all docs where x = 18
 * db.testData.find().limit(3) // limit cursor
 * db.testData.findOne() // return document not cursor
 *
 *
 */

// Methods (Server Side Only)
MongoStore.prototype.onConnect = function (location, callBack) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callBack != 'function') throw new Error('argument must a callback');

  // Open mongo database
  var store = this;
  try {
    this.mongoServer = new mongo.Server('127.0.0.1', 27017, {auto_reconnect: true});
    this.mongoDatabase = new mongo.Db('tequilaStore', this.mongoServer, {safe: true});
    this.mongoDatabaseOpened = false;
    this.mongoDatabase.open(function (err, db) {
      if (err) {
        callBack(store, err);
        try {
          store.mongoDatabase.close();  // Error will retry till close with auto_reconnect: true
        }
        catch (err) {
          console.log('error closing when fail open: ' + err);
        }
      } else {
        store.mongoDatabaseOpened = true;
        store.storeInterface.isReady = true;
        store.storeInterface.canGetModel = true;
        store.storeInterface.canPutModel = true;
        store.storeInterface.canDeleteModel = true;
        callBack(store);
      }
    });
  }
  catch (err) {
    callBack(store, err);
  }

};
MongoStore.prototype.putModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  var store = this;
  var a;
  store.mongoDatabase.collection(model.modelType, function (err, collection) {
    if (err) {
      console.log('putModel collection error: ' + err);
      callBack(model, err);
      return;
    }
    // put name value pairs into modelData
    var modelData = {};
    var newModel = false;
    var id = model.attributes[0].value;
    for (a in model.attributes) {
      if (model.attributes[a].name == 'id') {
        if (!model.attributes[a].value)
          newModel = true;
      } else {
        modelData[model.attributes[a].name] = model.attributes[a].value;
      }
    }
    if (newModel) {
      collection.insert(modelData, {safe: true}, function (err, result) {
        if (err) {
          console.log('putModel insert error: ' + err);
          callBack(model, err);
        } else {
          // Get resulting data
          for (a in model.attributes) {
            if (model.attributes[a].name == 'id') {
              model.attributes[a].value = modelData['_id'].toString();
            } else {
              model.attributes[a].value = modelData[model.attributes[a].name];
            }
          }
          callBack(model);
        }
      });
    } else {
      id = mongo.ObjectID.createFromHexString(id);
      collection.update({'_id': id}, modelData, {safe: true}, function (err, result) {
        if (err) {
          console.log('putModel update error: ' + err);
          callBack(model, err);
        } else {
          // Get resulting data
          for (a in model.attributes) {
            if (model.attributes[a].name != 'id') // Keep original ID intact
              model.attributes[a].value = modelData[model.attributes[a].name];
          }
          callBack(model);
        }
      });
    }
  });
};
MongoStore.prototype.getModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callback required');
  var store = this;
  var a;
  var id = model.attributes[0].value;
  id = mongo.ObjectID.createFromHexString(id);
  store.mongoDatabase.collection(model.modelType, function (err, collection) {
    if (err) {
      console.log('getModel collection error: ' + err);
      callBack(model, err);
      return;
    }
    collection.findOne({'_id': id}, function (err, item) {
      if (err) {
        console.log('getModel findOne ERROR: ' + err);
        callBack(model, err);
        return;
      }
      if (item == null) {
        callBack(model, Error('id not found in store'));
      } else {
        for (a in model.attributes) {
          if (model.attributes[a].name == 'id')
            model.attributes[a].value = item['_id'].toString();
          else
            model.attributes[a].value = item[model.attributes[a].name];
        }
        callBack(model);
      }
    });
  });
};
MongoStore.prototype.deleteModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  var store = this;
  var a;
  var id = model.attributes[0].value;
  id = mongo.ObjectID.createFromHexString(id);
  store.mongoDatabase.collection(model.modelType, function (err, collection) {
    if (err) {
      console.log('deleteModel collection error: ' + err);
      callBack(model, err);
      return;
    }
    collection.remove({'_id': id}, function (err, item) {
      if (err || item != 1) {
        if (!err) err = 'error deleting: item is not equal to 1';
        console.log('deleteModel remove ERROR: ' + err);
        callBack(model, err);
        return;
      }
      for (a in model.attributes) {
        if (model.attributes[a].name == 'id')
          model.attributes[a].value = null;
      }
      callBack(model);
    });
  });
};
MongoStore.prototype.getList = function (list, filter, arg3, arg4) {
  var callBack, order;
  if (typeof(arg4) == 'function') {
    callBack = arg4;
    order = arg3;
  } else {
    callBack = arg3;
  }
  if (!(list instanceof List)) throw new Error('argument must be a List');
  if (!(filter instanceof Object)) throw new Error('filter argument must be Object');
  if (typeof callBack != "function") throw new Error('callback required');
  var store = this;
  list.clear();
  store.mongoDatabase.collection(list.model.modelType, function (err, collection) {
    if (err) {
      console.log('getList collection error: ' + err);
      callBack(list, err);
      return;
    }
    if (order) {
      collection.find({ query: filter, $orderby: order}, findCallback);
    } else {
      collection.find(filter, findCallback);
    }
    function findCallback(err, cursor) {
      if (err) {
        console.log('getList find error: ' + err);
        callBack(list, err);
        return;
      }
      cursor.toArray(function (err, documents) {
        if (err) {
          console.log('getList toArray error: ' + err);
          callBack(list, err);
          return;
        }
        for (var i = 0; i < documents.length; i++) {
          documents[i].id = documents[i]._id.toString();
          delete documents[i]._id;
          var dataPart = [];
          dataPart.push(documents[i].id);
          for (var j in documents[i]) {
            if (j != 'id')
              dataPart.push(documents[i][j]);
          }
          list._items.push(dataPart);
        }
        list._itemIndex = list._items.length - 1;
        callBack(list);
      });
    }
  });
};
;
/***********************************************************************************************************************
 * tequila
 * node-test-header
 */

var colors = require('colors');
var mongo = require('mongodb');
;
/**
 * tequila
 * test-runner
 */
var TestNode = function (inheritanceTest, nodeType, level, levelText, text, func, exampleNumber, deferredExample, expectedValue) {
  this.inheritanceTest = inheritanceTest;
  this.nodeType = nodeType; // nodeType 1 char string: H)eading P)aragraph E)xample E(X)eption
  this.level = level;
  this.levelText = levelText;
  this.text = text;
  this.func = func;
  this.exampleNumber = exampleNumber;
  this.deferedExample = deferredExample;
  this.expectedValue = expectedValue;
  return this;
};
var test = {};
test.converter = new Markdown.Converter();
test.showWork = [];
test.examplesDisabled = false;
test.criticalFail = false;
test.runner = function (isBrowser) {
  test.isBrowser = isBrowser;

  // After stores loaded run tests
  var storeLoader = {};
  storeLoader.countNeeded = 2; // total anync events
  storeLoader.countDone = 0;
  storeLoader.timedOut = false;
  storeLoader.callback = function (force) {
    storeLoader.countDone++;
    if (force || (!storeLoader.timedOut && storeLoader.countDone == storeLoader.countNeeded)) {
      clearInterval(storeLoader.watchdog);
      if (test.hostStoreAvailable) {
        test.integrationStore = test.hostStore;
      } else if (test.mongoStoreAvailable) {
        test.integrationStore = test.mongoStore;
      } else {
        test.integrationStore = new MemoryStore({name: 'Integration Test Store'});
      }
      console.log(test.integrationStore.name + ' is a ' + test.integrationStore.storeType);
      test.renderHead(isBrowser);
      try {
        test.renderDetail(isBrowser);
      } catch (e) {
        console.log('renderDetail error...\n' + e.stack)
      }
      test.renderCloser(isBrowser);
      test.updateStats();
    }
  };

  // watchdog timer
  storeLoader.watchdog = setInterval(function () {
    console.warn('Stores took too long to load');
    storeLoader.callback(true);
    storeLoader.timedOut = true;
  }, 3000);

  // try to create a hostStore
  test.hostStore = new RemoteStore({name: 'Integration Test Store'});
  test.hostStore.onConnect('http://localhost', function (store, err) { // DOUG CHANGE HERE
    if (err) {
      test.hostStoreAvailable = false;
      console.warn('hostStore unavailable (' + err + ')');
    } else {
      console.warn('hostStore connected.');
      test.hostStoreAvailable = true;
    }
    storeLoader.callback();
  });

  // try to create a mongoStore
  test.mongoStore = new MongoStore({name: 'Integration Test Store'});
  test.mongoStore.onConnect('http://localhost', function (store, err) {
    if (err) {
      test.mongoStoreAvailable = false;
      console.warn('mongoStore unavailable (' + err + ')');
      storeLoader.callback();
    } else {
      console.warn('mongoStore connected.');
      test.mongoStoreAvailable = true;
      storeLoader.callback(); // not
    }
  });

};
test.renderHead = function (isBrowser) {
  test.scrollFirstError = 0;
  test.countUnique = 0;
  test.countTests = 0;
  test.countPass = 0;
  test.countFail = 0;
  test.countDefer = 0;
  test.countPending = 0;
  test.testsLaunched = false;
  // Browser Dressing
  if (isBrowser) {
    // Get vars from URL
    test.showExamples = (test.getParam('se') == 'Y');
    test.filterSection = test.getParam('fs');
    test.filterTest = test.getParam('ft');
    test.filterLevel = test.getParam('fl') || 'TOC';
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
    // Host Status
    test.helpHost = 'Connection Status to host<br>click to configure';
    test.textHost = 'Host<br>' + '<code class="counter_yellow">...</code>';
    test.btnHost = buttonControl(test.textHost, test.helpHost, function () {
      console.log('host');
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
        case 'TOC':
          test.filterLevel = 'Inf';
          break;
        case 'Inf':
          test.filterLevel = 'All';
          break;
        default:
          test.filterLevel = 'TOC';
          break;
      }
      test.refresh();
    });
    // Hide / Show Examples
//    buttonControl((test.showExamples ? '✩' : '✭') + ' examples', 'show/hide examples<br>errors always show', function () {
    buttonControl('ex.<br>' + '<code class="counter">' + (test.showExamples ? 'On&nbsp;' : 'Off'  ) + '</code>', 'show/hide examples<br>errors always show', function () {
      test.showExamples = !test.showExamples;
      test.refresh();
    });
    // Outer & Inner Div to center content
    test.outerDiv = document.createElement("div");
    test.outerDiv.style.width = "100%";
    document.body.appendChild(test.outerDiv);
    test.innerDiv = document.createElement("div");
    test.innerDiv.style.width = "1000px";
    test.innerDiv.style.margin = "0 auto";
    test.outerDiv.appendChild(test.innerDiv);

    test.updateStats();
  }
};
test.renderDetail = function (isBrowser) {
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
      case 'Inf':
        test.filterLevel = 'Inf'; // TOC with paragraph text
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
          test.innerDiv.appendChild(p);
        }
        break;
      case 'p':
        if (!isFiltered && (dotCount < 2 || test.filterLevel != 'TOC')) {
          var p = document.createElement("p");
          p.innerHTML = test.converter.makeHtml(test.nodes[i].text);
          test.innerDiv.appendChild(p);
        }
        break;
      case '.':
        test.countTests++;
        if (!test.nodes[i].deferedExample && test.nodes[i].func) {
          test.nodes[i].asyncTest = false;
          if (typeof (test.nodes[i].expectedValue) != 'undefined' &&
            test.nodes[i].expectedValue != null) {
            if (test.nodes[i].expectedValue.toString().indexOf('test.asyncResponse') == 0)
              test.nodes[i].asyncTest = true;
          }
          test.showWork = [];
          test.assertions = [];
          var ref = test.nodes[i].levelText + test.nodes[i].exampleNumber + ' ';
          var indent = '';
          for (j = 0; j < ref.length; j++)
            indent += ' ';
          if (test.nodes[i].asyncTest) {
            test.countPending++;
            test.nodes[i].errorThrown = false;
            var err = test.callTestCode(test.nodes[i], test.asyncCallback);
            if (test.wasThrown) {
              process.stdout.write(colors.red('✘') + '\n' + ref + colors.white(' ERROR: ' + err));
              test.countPending--;
              test.countFail++;
              test.nodes[i].errorThrown = true;
            }
          } else {
            var test_Results = test.callTestCode(test.nodes[i]);
            ranTest = true;
            exampleCode += test.formatCode(test.nodes[i].func, true);
            var test_Value = 'undefined';
            if (typeof test_Results !== 'undefined' && test_Results != null)
              test_Value = test_Results.toString();
            var expected_Value = 'undefined';
            if (typeof test.nodes[i].expectedValue !== 'undefined' && test.nodes[i].expectedValue != null)
              expected_Value = test.nodes[i].expectedValue.toString();
            // Check assertions
            var gotFailedAssertions = false;
            for (var j in test.assertions) {
              if (!test.assertions[j]) gotFailedAssertions = true;
            }
            if (test_Value !== expected_Value || gotFailedAssertions) {
              test.countFail++; // TODO if console is white this is invisible ink...
              if (gotFailedAssertions) {
                process.stdout.write('\n' + colors.red('✘') + JSON.stringify(test.assertions) + '\n' + ref + colors.white(
                  'ASSERTION(s) failed'));
              } else {
                process.stdout.write(colors.red('✘') + '\n' + ref + colors.white(
                  'RETURNED: ' + test.expressionInfo(test_Results) +
                    '\n' + indent +
                    'EXPECTED: ' + test.expressionInfo(test.nodes[i].expectedValue) + '\n'));
              }
            } else {
              test.countPass++;
              process.stdout.write(colors.green('✓'));
            }
          }
        } else {
          test.countDefer++;
          process.stdout.write(colors.yellow('⚑'));
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
          if (typeof (test.nodes[i].expectedValue) != 'undefined' &&
            test.nodes[i].expectedValue != null) {
            if (test.nodes[i].expectedValue.toString().indexOf('test.asyncResponse') == 0)
              test.nodes[i].asyncTest = true;
          }
          test.showWork = [];
          test.assertions = [];
          var exampleCode = '';
          if (test.nodes[i].asyncTest) {
            exampleCode += test.formatCode(test.nodes[i].func, true);
            exampleCode += '⚑<b>pending async results</b>';
            test.countPending++;
            pre.style.background = "#ffa500"; // oranges
          } else {
            var test_Results = test.callTestCode(test.nodes[i], test.asyncCallback);
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
                  exampleCode += '✓<b>returns expected results (' + test.expressionInfo(test_Results) + ')</b>'; // ✘
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
            exampleCode += '⚑ <b>(test disabled)</b>';
            pre.innerHTML = exampleCode;
          } else {
            pre.innerHTML = '<code> TODO: write some code that rocks.</code>';
          }
        }
        var showExample = test.showExamples;
        if (isFiltered) showExample = false;
        if (ranTest && (!testPassed || gotFailedAssertions)) showExample = true;
        if (test.nodes[i].asyncTest) {
          if (!showExample) pre.style.display = "none";
          if (!showExample) caption.style.display = "none";
          test.innerDiv.appendChild(caption);
          test.innerDiv.appendChild(pre);
        } else {
          if (showExample) test.innerDiv.appendChild(caption);
          if (showExample) test.innerDiv.appendChild(pre);
        }
        test.updateStats();
        if (ranTest && !testPassed && test.scrollFirstError < 1) {
          test.scrollFirstError = document.height - document.documentElement.clientHeight;
        }
        if (test.nodes[i].asyncTest) {
          test.nodes[i].errorThrown = false;
          var err = test.callTestCode(test.nodes[i], test.asyncCallback);
          if (test.wasThrown) {
            test.countPending--;
            test.countFail++;
            test.nodes[i].errorThrown = true;
            exampleCode = test.formatCode(test.nodes[i].func, true);
            exampleCode += '<b>✘ERROR THROWN: ' + err.stack + '\n';
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
}
test.renderCloser = function (isBrowser) {
  if (isBrowser) {
    test.updateStats();
//    if (test.scrollFirstError > 0)
//      window.scroll(0, test.scrollFirstError);
  } else {
    test.closerCalled = false;
    test.cliCloser();
  }
};
test.asyncResponse = function (wut) {
  return 'test.asyncResponse: ' + wut;
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
    try {
      func();
    } catch (e) {
      console.error('Critical test spec error: ' + e)
      test.criticalFail = true;
    }
    this.headingLevel--;
    this.levels.pop();
  }
};
test.paragraph = function (text) {
  this.nodes.push(new TestNode(T.inheritanceTest, 'p', this.headingLevel + 1, this.outlineLabel, text));
};
test.example = function (text, expect, func) {
  this.exampleNumber++;
  this.nodes.push(new TestNode(T.inheritanceTest, 'e', this.headingLevel + 1, this.outlineLabel, text, func, this.exampleNumber, test.examplesDisabled, expect));
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
  if (test.showExamples) vars += (vars ? '&' : '') + '?se=Y';
  if (test.filterSection) vars += (vars ? '&' : '') + '?fs=' + test.filterSection;
  if (test.filterLevel) vars += (vars ? '&' : '') + '?fl=' + test.filterLevel;
  var rootPath = window.location.href;
  if (rootPath.indexOf('#') > 0) rootPath = rootPath.substring(0, rootPath.indexOf('#'))
  window.location.href = rootPath + vars ? ("#" + vars) : '';
  window.location.reload();
};
test.asyncCallback = function (node, test_Results) {
  // function to evaluate results of async
  if (node.errorThrown) return;
  var testPassed = false;
  test.wasThrown = false;
  var expectedValue = node.expectedValue.substr(20, 999);
  exampleCode = test.formatCode(node.func, true);
  if (typeof test_Results == 'undefined') {
    if (typeof expectedValue == 'undefined') testPassed = true;
  } else {
    if (typeof expectedValue != 'undefined' && test_Results.toString() === expectedValue.toString()) testPassed = true;
  }
  // If test did not pass then remember to we don't get multiple errors
  node.errorThrown = !testPassed;
  // Check assertions
  var gotFailedAssertions = false;
  for (var j in test.assertions) {
    if (!test.assertions[j])
      gotFailedAssertions = true;
  }
  //gotFailedAssertions = true; /////////////////////////////////// FORCE
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
          exampleCode += '✓<b>returns expected results (' + test.expressionInfo(test_Results) + ')</b>'; // ✘
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
      var ref = test.nodes[i].levelText + test.nodes[i].exampleNumber + ' ';
      var indent = '';
      for (j = 0; j < ref.length; j++)
        indent += ' ';
      if (test.wasThrown) {
        process.stdout.write(colors.red('✘') + '\n' + ref + colors.white(' ERROR: idk'));
      } else {
        if (gotFailedAssertions) {
          process.stdout.write(colors.red('✘') + JSON.stringify(test.assertions) + '\n' + ref + colors.white(
            'ASSERTION(s) failed'));
        } else {
          process.stdout.write(colors.red('✘') + '\n' + ref + colors.white(
            'RETURNED: ' + test.expressionInfo(test_Results) +
              '\n' + indent +
              'EXPECTED: ' + test.expressionInfo(test.nodes[i].expectedValue) + '\n'));
        }
      }

    }
  }
};
test.cliCloser = function () {
  // Wait for deferred tasks to finish
  if (test.countPending > 0) {
    if (!test.closerCalled) {
      test.closerCalled = true;
      console.log('\nWaiting for pending async results...');
    }
    setTimeout(test.cliCloser, 0);
  } else {
    var results = '\n ' + test.countTests + ' pass(' + test.countPass + ') fail(' + test.countFail + ') defer(' + test.countDefer + ') ';
    if (test.countFail)
      console.log(colors.inverse(colors.red(results)));
    else
      console.log(colors.inverse(colors.green(results)));

    // Close mongo store
    if (test.mongoStore.mongoDatabaseOpened) {
      try {
        test.mongoStore.mongoDatabase.close();
      }
      catch (err) {
        console.log('err: ' + err);
      }
    }
  }
};
test.updateStats = function () {
  var miniPad, i;
  if (!test.isBrowser) return;
  newtequilaStats = '☠';
  if (test.countPass > 0) newtequilaStats = '☺';
  if (test.countFail > 0) newtequilaStats = '☹';
  if (test.tequilaStats != test.countUnique + newtequilaStats) {
    test.tequilaStats = test.countUnique + newtequilaStats;
    var myName = newtequilaStats + ' ' + test.countUnique.toString();
    for (miniPad = '', i = 0; i < (3 - myName.toString().length); i++) miniPad += '&nbsp;'
    test.btnTequila.innerHTML = 'tequila<br><code class="counter">' + miniPad + myName + '</code>' + '<span class="classic">' + test.helpTestTequila + '</span>';
  }

  // Host Status
  if (undefined == test.hostStoreAvailable) {
    test.btnHost.innerHTML = 'Host<br><code class="counter_yellow">...</code>' + '<span class="classic">' + test.helpHost + '</span>';
  } else {
    if (test.hostStoreAvailable)
      test.btnHost.innerHTML = 'Host<br><code class="counter_green">OK&nbsp;</code>' + '<span class="classic">' + test.helpHost + '</span>';
    else
      test.btnHost.innerHTML = 'Host<br><code class="counter_red">Err</code>' + '<span class="classic">' + test.helpHost + '</span>';
  }

  //

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
};
test.expressionInfo = function (expr) {
  if (typeof expr == 'string') {
    return '"' + expr.replace(/"/g, '\\\"') + '"';
  }

  return expr;
  //return JSON.stringify(expr);
};
test.shouldThrow = function (err, func) {
  var gotError = false;
  try {
    func();
  } catch (e) {
    gotError = true;
    if (err !== undefined)
      if (err.toString() != e.toString() && err.toString() != '*')
        throw('EXPECTED ERROR(' + err + ') GOT ERROR(' + e + ')');
  }
  if (!gotError) {
    throw('EXPECTED ERROR(' + err + ')');
  }
};
test.callTestCode = function (node, funkytown) {
  try {
    test.wasThrown = false;
    return node.func(node, funkytown);
  } catch (e) {
    test.wasThrown = true;
    return e;
  }
};
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
  var adjustSpace = spaces[1];
  var output = '';
  for (i = 1; i < lines.length; i++) { // skip 'function'
    var spaceOut = spaces[i] - adjustSpace;
    for (j = 1; j < spaceOut; j++) output += ' ';
    output += marks[i] + lines[i] + '\n';
  }
  return output;
};
;
/**
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
      test.heading('Attribute.ModelID', function () {
        test.paragraph('Attribute.ModelID defines reference to ID in external mode.');
        test.example('objects created should be an instance of Attribute.ModelID', true, function () {
          return new Attribute.ModelID(new Model()) instanceof Attribute.ModelID;
        });
        test.example('should make sure new operator used', Error('new operator required'), function () {
          Attribute.ModelID();
        });
        test.example('constructor must pass instance of model', Error('must be constructed with Model'), function () {
          new Attribute.ModelID();
        });
        test.example('value is set to value of ID in constructor', 123, function () {
          var model = new Model();
          model.set('id', 123);
          return new Attribute.ModelID(model).value;
        });
        test.example('constructorFunction is set to constructor of model', true, function () {
          var model = new Model();
          model.set('id', 123);
          var attrib = new Attribute.ModelID(model);
          var newModel = new attrib.constructorFunction();
          return newModel instanceof Model;
        });
        test.example('modelType is set from model in constructor', 'Model', function () {
          return new Attribute.ModelID(new Model()).modelType;
        });
        test.example('toString is more descriptive', "ModelID(Model:123)", function () {
          var model = new Model();
          model.set('id', 123);
          return new Attribute.ModelID(model).toString();
        });
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
          test.show(T.getAttributeTypes());
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
        test.example('should accept assignment of correct type and validate incorrect attributeTypes',
          '7 correct assignments 91 errors thrown', function () {
            // Test all known attribute types
            var myTypes = T.getAttributeTypes();
            myTypes.shift(); // not testing ID
            myTypes.pop(); // not testing Object since it matches other types
            test.show(myTypes);
            test.show(T.getAttributeTypes());

            // Now create an array of matching values for each type into myValues
            var myModel = new Model();
            var myGroup = new Attribute({name: 'columns', type: 'Group', value: [new Attribute("Name")]});
            var myTable = new Attribute({name: 'bills', type: 'Table', group: myGroup });
            var myValues = ['Jane Doe', new Date, true, 18, new Attribute.ModelID(new Model()), [], myTable];

            // Loop thru each type
            var theGood = 0;
            var theBad = 0;
            for (var i in myTypes)
              for (var j in myValues) {
                // for the value that works it won't throw error just create and to test
                if (i == j) {
                  theGood++;
                  switch (myTypes[i]) {
                    case 'Table':
                      new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j], group: myGroup});
                      break;
                    default:
                      new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j] });
                      break;
                  }
                } else {
                  // mismatches bad so should throw error (is caught unless no error or different error)
                  theBad++;
                  test.shouldThrow('*', function () {
                    new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j]});
                  });
                }
                // other objects should throw always
                theBad++;
                test.shouldThrow('*', function () {
                  new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: {} });
                });
              }
            return theGood + ' correct assignments ' + theBad + ' errors thrown';
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
          // Note: size property is not "enforced" but for formatting purposes
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
        test.paragraph('Parameter type Model is used to store a reference to another model instance.  ' +
          'The value attribute is a Attribute.ModelID reference to the Model.');

        test.example('must construct with Attribute.ModelID in value', Error('error creating Attribute: value must be Attribute.ModelID'), function () {
          new Attribute({name: 'Twiggy',type: 'Model'});
        });
        test.example("modelType property set from constructor", 'Model', function () {
          return new Attribute(
            {name: 'Twiggy',
            type: 'Model',
            value: new Attribute.ModelID(new Model())
          }).modelType;
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
          test.show(myStuff.getValidationErrors());
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
            new Attribute({name: 'details', type: 'Table'});
          });
        test.example("group property must not be empty array",
          Error('error creating Attribute: group property value must contain at least one Attribute'), function () {
            var cols = new Attribute({name: 'columns', type: 'Group', value: []});
            new Attribute({name: 'details', type: 'Table', group: cols });
          });
      });
      test.heading('Object', function () {
        test.paragraph('Javascript objects ... structure user defined');
        test.example("should have type of 'Object'", 'Object', function () {
          return new Attribute({name: 'stuff', type: 'Object'}).type;
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
            new Attribute('TODO', 'Date').coerce();
          });
          test.shouldThrow(Error('coerce cannot determine appropriate value'), function () {
            new Attribute({name: 'Twiggy',type: 'Model',value: new Attribute.ModelID(new Model())}).coerce();
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
};;
/**
 * tequila
 * command-test
 */
test.runnerCommand = function () {
  test.heading('Command Class', function () {
    test.paragraph('The command design pattern is implemented with this class.  The actual execution of the command ' +
      'can be one of multiple types from simple code to a _Presentation Model_ applied to a _Interface_ implementation.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Command', true, function () {
        return new Command({name: 'about'}) instanceof Command;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Command({name: 'about'});
      });
      test.example('should make sure argument properties are valid', Error('error creating Command: invalid property: sex'), function () {
        new Command({name: 'name', sex: 'female'});
      });
      test.example('defaults name to (unnamed)', '(unnamed)', function () {
        return new Command().name;
      });
      test.example('defaults type to Stub', 'Stub', function () {
        return new Command({name: 'about'}).type;
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('name', function () {
        test.example('identifier name for command', 'about', function () {
          test.shouldThrow(Error('name must be string'), function () {
            new Command({name: 42});
          });
          return new Command({name: 'about'}).name;
        });
      });
      test.heading('description', function () {
        test.example('more descriptive than name (for menus)', 'Tequila Command : Tequila is a beverage made from blue agave.', function () {
          // description set to (name) Command if not specified
          return new Command({name: 'Tequila'}).description + ' : ' +
            new Command({name: 'tequila', description: 'Tequila is a beverage made from blue agave.'}).description;
        });
      });
      test.heading('type', function () {
        test.example('type of command must be valid', Error('Invalid command type: magic'), function () {
          test.show(T.getCommandTypes());
          new Command({name: 'about', type: 'magic' });
        });
      });
      test.heading('contents', function () {
        test.paragraph('Contents is based on the type of command.  See TYPE section for more information for how it ' +
          'applies to each type');
      });
      test.heading('scope', function () {
        test.paragraph('Optional scope property can be used to apply a model or list to a command.');
        test.example('scope must be a Model or a List', Error('optional scope property must be Model or List'), function () {
          new Command({name: 'archiveData', scope: true});
        });
      });
      test.heading('status', function () {
        test.paragraph('The status property is a Number defined as negative(FAIL) positive(SUCCESS) zero(executing) ' +
          'null/undefined(not executing).');
        test.paragraph('Applications can give meaning to numeric values (lt -1 and gt 1) as long as sign is retained.');
      });
      test.heading('timeout', function () {
        test.paragraph('Will use library setting as default, override to set the default timeout for steps used in ' +
          'procedures. Value is milliseconds (1000 = 1 second)');
        test.example('number required', Error('timeout must be a Number'), function () {
          new Command({name: 'options', timeout: true});
        });
      });
      test.heading('bucket', function () {
        test.example('valid property is for app use', 'bucket of KFC', function () {
          return 'bucket of ' + new Command({bucket: 'KFC'}).bucket;
        });

      });
    });
    test.heading('TYPES', function () {
      test.heading('menu', function () {
        test.paragraph('The menu command is passed to _Interface_ for use for in user navigation.  ' +
          'They are embedded in the _Application_ as the primary navigate but can be instantiated and given to ' +
          '_Interface_ in any context.');
        test.paragraph('The _Command_ contents property is an array _Command_ objects.');
        test.example('constructor validates the contents', undefined, function () {
          test.shouldThrow(Error('contents must be array of menu items'), function () {
            new Command({name: 'options', type: 'Menu'});
          });
          test.shouldThrow(Error('contents must be array of menu items'), function () {
            new Command({name: 'options', type: 'Menu', contents: []});
          });
          test.shouldThrow(Error('contents must be array of menu items'), function () {
            new Command({name: 'options', type: 'Menu', contents: [42]});
          });
          // This is a working example:
          new Command({name: 'options', type: 'Menu', contents: [
            'Stooges',                      // strings act as menu titles or non selectable choices
            '-',                            // dash is menu separator
            new Command({name: 'Tequila'})  // use commands for actual menu items
          ]});
        });
      });
      test.heading('Presentation', function () {
        test.example('for Presentation type contents is a Presentation object', undefined, function () {
          test.shouldThrow(Error('contents must be a Presentation'), function () {
            new Command({name: 'options', type: 'Presentation'});
          });
        });
      });
      test.heading('Function', function () {
        test.paragraph('contents contains a javascript function');
        test.example('for Function type contents is a Function', undefined, function () {
          test.shouldThrow(Error('contents must be a Function'), function () {
            new Command({name: 'options', type: 'Function'});
          });
        });
      });
      test.heading('Procedure', function () {
        test.example('for Procedure type contents is a Procedure object', undefined, function () {
          test.shouldThrow(Error('contents must be a Procedure'), function () {
            new Command({name: 'options', type: 'Procedure'});
          });
        });
      });
    });
    test.heading('METHODS', function () {
      test.heading('toString', function () {
        test.example('returns string including name and type', 'I am a Stub Command: Customer', function () {
          return 'I am a ' + new Command({name: 'Customer'});
        });
      });
      test.heading('abort', function () {
        test.paragraph('aborts task');
        test.example('aborted command ends with error status', -1, function () {
          var cmd = new Command();
          cmd.abort();
          return cmd.status;
        });
      });
      test.heading('complete', function () {
        test.paragraph('completes task');
        test.example('call when task complete status', 1, function () {
          var cmd = new Command();
          cmd.complete();
          return cmd.status;
        });
      });
      test.heading('execute', function () {
        test.paragraph('executes task');
        test.example('see integration tests', Error('command not implemented'), function () {
          new Command().execute();
        });
      });
      test.heading('onEvent', function () {
        test.paragraph('Use onEvent(events,callback)');
        test.example('first parameter is a string or array of event subscriptions', Error('subscription string or array required'), function () {
          new Command().onEvent();
        });
        test.example('callback is required', Error('callback is required'), function () {
          new Command().onEvent([]);
        });
        test.example('events are checked against known types', Error('Unknown command event: onDrunk'), function () {
          new Command().onEvent(['onDrunk'], function () {
          });
        });
        test.example('here is a working version', undefined, function () {
          test.show(T.getCommandEvents());
          //  BeforeExecute - callback called before first task executed but after tasks initialized
          //  AfterExecute - callback called after initial task(s) launched (see onCompletion)
          //  Error - error occurred (return {errorClear:true})
          //  Aborted - procedure aborted - should clean up resources
          //  Completed - execution is complete check status property
          new Command().onEvent(['Completed'], function () {
          });
        });
      });
    });
  });
};
;
/**
 * tequila
 * delta-test
 */
test.runnerDelta = function () {
  test.heading('Delta Class', function () {
    test.paragraph('Deltas represent changes to models.  They can be applied to a store then update the model.  ' +
      'They can be stored in logs as a change audit for the model.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Delta', true, function () {
        return new Delta(new Attribute.ModelID(new Model())) instanceof Delta;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Delta();
      });
      test.example('Attribute.ModelID required in constructor', Error('Attribute.ModelID required in constructor'), function () {
        new Delta();
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('dateCreated', function () {
        test.example('set to current date/time on creation', true, function () {
          var delta = new Delta(new Attribute.ModelID(new Model()));
          test.show(delta.dateCreated);
          return delta.dateCreated instanceof Date;
        });
      });
      test.heading('modelID', function () {
        test.example('set from constructor', "ModelID(Model:null)", function () {
          var delta = new Delta(new Attribute.ModelID(new Model()));
          test.show(delta.dateCreated);
          return delta.modelID.toString();
        });
      });
      test.heading('attributeValues', function () {
        test.example('created as empty object', {}, function () {
          // attributeValues - {attribute:[before,after]}  before and after attribute values represent the model
          // attribute value changes. If the model attribute is type Table then attributeValues is array of
          // attributeValues corresponding to model -> attribute -> group....
          return new Delta(new Attribute.ModelID(new Model())).attributeValues;
        });
      });
    });
  });
};
;
/**
 * tequila
 * interface-test
 */
test.runnerInterface = function () {
  test.heading('Interface Class', function () {
    test.paragraph('The Interface Class is an abstraction of a user interface.');
    test.runnerInterfaceMethodsTest(Interface);
  });
};
test.runnerInterfaceMethodsTest = function (SurrogateInterface) {
  test.heading('CONSTRUCTOR', function () {
    test.example('objects created should be an instance of SurrogateInterface', true, function () {
      return new SurrogateInterface() instanceof SurrogateInterface;
    });
    test.example('should make sure new operator used', Error('new operator required'), function () {
      SurrogateInterface();
    });
    test.example('should make sure argument properties are valid', Error('error creating Procedure: invalid property: yo'), function () {
      new SurrogateInterface({yo: 'whatup'});
    });
  });
  test.heading('PROPERTIES', function () {
    test.heading('name', function () {
      test.example('defaults to (unnamed)', '(unnamed)', function () {
        return new SurrogateInterface().name;
      });
    });
    test.heading('description', function () {
      test.example('defaults to a SurrogateInterface', 'a Interface', function () {
        return new SurrogateInterface().description;
      });
    });
  });
  test.heading('METHODS', function () {
    test.heading('toString()', function () {
      test.example('should return a description of the message', 'Punched Card SurrogateInterface', function () {
        return new SurrogateInterface({description: 'Punched Card SurrogateInterface'}).toString();
      });
    });
    test.heading('getValidationErrors()', function () {
      test.example('returns null when no errors', null, function () {
        return new SurrogateInterface().getValidationErrors();
      });
    });
    test.heading('requestResponse({request:object}, callback', function () {
      test.paragraph('Subclasses of SurrogateInterface will use this to submit user (or agent) initiated requests.  ' +
        'It can also be used by the app to push objects to the SurrogateInterface by passing {request:this...');
      test.example('arguments must be in correct format', test.asyncResponse(Error('invalid request: null')), function (testNode, returnResponse) {
        test.shouldThrow(Error('requestResponse arguments required: object, callback'), function () {
          new SurrogateInterface().requestResponse();
        });
        test.shouldThrow(Error('requestResponse arguments required: object, callback'), function () {
          new SurrogateInterface().requestResponse({}); // missing callback
        });
        test.shouldThrow(Error('requestResponse arguments required: object, callback'), function () {
          new SurrogateInterface().requestResponse("hello", function () {
            // function part ok but not passing an object
          });
        });
        test.shouldThrow(Error('requestResponse object has no request property'), function () {
          new SurrogateInterface().requestResponse({}, function () {
            // function part ok but not passing an object
          });
        });
        // Any value can be set to request will be accepted on function call.
        // If the value is not handled then the callback receives an error as the response.
        // null should always return an error.
        new SurrogateInterface().requestResponse({request: null}, function (obj) {
          returnResponse(testNode, obj.response);
        });
      });
    });
    test.heading('canMockResponses()', function () {
      test.example('see if mock responses allowed before testing', test.asyncResponse('mock check done'), function (testNode, returnResponse) {
        var ui = new SurrogateInterface();
        if (ui.canMockResponses()) {
          throw new Error('no test for mock');
        } else {
          test.shouldThrow(Error('mockResponse not available for Interface'), function () {
            new SurrogateInterface().requestResponse({request: null, mockResponse: null}, function (obj) {
              returnResponse(testNode, 'mock check failed');
            });
          });
          returnResponse(testNode, 'mock check done');
        }
      });
    });
  });
};;
/**
 * tequila
 * list-test
 */

test.runnerList = function (SurrogateListClass, inheritanceTest) {
  var inheritanceTestWas = T.inheritanceTest;
  T.inheritanceTest = inheritanceTest;
  test.heading('List Class', function () {
    test.paragraph('Lists are an ordered collection of items.  Each item is an array of values that correspond to the attributes for model used in constructor.');
    test.heading('CONSTRUCTOR', function () {
      test.paragraph('Creation of all Collections must adhere to following examples:');
      test.example('objects created should be an instance of List', true, function () {
        return new SurrogateListClass(new Model) instanceof List;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        List();
      });
      test.example('must be instantiated with model parameter.  The model attributes represent the list columns.', Error('argument required: model'), function () {
        new List();
      });
    });
    test.heading('PROPERTIES', function () {
    });
    test.heading('METHODS', function () {
      test.heading('length()', function () {
        test.example('length method returns the number of items in the list.', 0, function () {
          return new List(new Model).length();
        });
      });
      test.heading('clear()', function () {
        test.example('clear the list.', 0, function () {
          return new List(new Model).addItem(new Model).clear().length();
        });
      });
      test.heading('get(attributeName)', function () {
        test.paragraph('Gets value of attribute for given item.');
        test.example('throws error if no current item', Error('list is empty'), function () {
          new List(new Model()).get('id'); // see integration tests
        });
      });
      test.heading('set(attributeName,value)', function () {
        test.paragraph('Sets value of attribute for given item.');
        test.example('throws error if no current item', Error('list is empty'), function () {
          new List(new Model()).set('id'); // see integration tests
        });
        test.example('throws an error if the attribute does not exists', Error('attribute not valid for list model'), function () {
          var list = new List(new Model);
          list.addItem(new Model);
          list.set('whatever');
        });
      });
      test.heading('addItem()', function () {
        test.example('add item to list verify length is correct.', 1, function () {
          var list = new List(new Model);
          return list.addItem(new Model).length(); // returns ref for method chaining
        });
      });
      test.heading('removeItem()', function () {
        test.example('add then item to list verify length is correct.', 0, function () {
          var list = new List(new Model);
          return list.addItem(new Model).removeItem().length(); // returns ref for method chaining
        });
      });
      test.heading('nextItem()', function () {
        test.example('move to next item in list', Error('list is empty'), function () {
          new List(new Model).nextItem(); // see integration tests
        });
      });
      test.heading('previousItem()', function () {
        test.example('move to the previous item in list', Error('list is empty'), function () {
          new List(new Model).previousItem(); // see integration tests
        });
      });
      test.heading('firstItem()', function () {
        test.example('move to the first item in list', Error('list is empty'), function () {
          new List(new Model).firstItem(); // see integration tests
        });
      });
      test.heading('lastItem()', function () {
        test.example('move to the last item in list', Error('list is empty'), function () {
          new List(new Model).lastItem(); // see integration tests
        });
      });
      test.heading('sort(key)', function () {
        test.example('sort 1,2 in reverse order and return first element', Error('sort order required'), function () {
          new List(new Model).sort(); // see integration tests
        });
      });
    });
  });
  T.inheritanceTest = inheritanceTestWas;
};
;
/**
 * tequila
 * message-test
 */
test.runnerMessage = function () {
  test.heading('Message Class', function () {
    test.paragraph('Messages are used by Transport to send to host or UI.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Message', true, function () {
        return new Message('Null') instanceof Message;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Message('Null');
      });
      test.example('first parameter is required', Error('message type required'), function () {
        new Message();
      });
      test.example('first parameter must be valid message type', Error('Invalid message type: http://www.youtube.com/watch?v=2o7V1f7lbk4'), function () {
        test.show(T.getMessageTypes());
        new Message('http://www.youtube.com/watch?v=2o7V1f7lbk4');
      });
    });
    test.heading('METHODS', function () {
      test.heading('toString()', function () {
        test.example('should return a description of the message', 'Null Message', function () {
          return new Message('Null').toString();
        });
      });
    });
  });
};;
/**
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
      test.example('can supply attributes in constructor in addition to ID default', 'scrabble', function () {
        var play = new SurrogateModelClass({attributes: [new Attribute('game')]});
        play.set('game', 'scrabble'); // this would throw error if attribute did not exist
        return play.get('game');
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
      test.heading('value', function () {

      });

    });
    test.heading('METHODS', function () {
      test.heading('toString()', function () {
        test.example('should return a description of the model', true, function () {
          return new SurrogateModelClass().toString().length>0;
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
          m1.set('name', 'Bar');
          m2.set('name', 'Bar');
          // First demonstrate instance ref versus anothel model with equal attributes
          test.assertion(m1 === m3); // assigning one model to variable references same instance
          test.assertion(m3.get('name') === 'Bar'); // m3 changed when m1 changed
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
      test.heading('get(attributeName)', function () {
        test.example('returns undefined if the attribute does not exist', undefined, function () {
          test.assertion(new SurrogateModelClass().get('whatever') === undefined)
        });
        test.example("returns the value for given attribute", 42, function () {
          var question = new SurrogateModelClass({attributes: [new Attribute('answer', 'Number')]});
          question.attributes[1].value = 42;
          return question.get('answer');
        });
      });
      test.heading('set(attributeName,value)', function () {
        test.example('throws an error if the attribute does not exists', Error('attribute not valid for model'), function () {
          new SurrogateModelClass().set('whatever');
        });
        test.example("sets the value for given attribute", 42, function () {
          var question = new SurrogateModelClass({attributes: [new Attribute('answer', 'Number')]});
          question.set('answer', 42);
          return question.attributes[1].value;
        });
      });

    });
  });
  T.inheritanceTest = inheritanceTestWas;
};
;
/**
 * tequila
 * procedure-test
 */
test.runnerProcedure = function () {
  test.heading('Procedure Class', function () {
    test.paragraph('The _Procedure_ class manages a set of _Command_ objects.  It provides a pattern for handling ' +
      'asynchronous and synchronous command execution.');
    test.paragraph('_Command_ objects create and manage the _Procedure_ object.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Procedure', true, function () {
        return new Procedure() instanceof Procedure;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Procedure();
      });
      test.example('should make sure argument properties are valid', Error('error creating Procedure: invalid property: yo'), function () {
        new Procedure({yo: 'whatup'});
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('tasks', function () {
        test.paragraph('Tasks is an array of objects that represent each step of the procedure.  See TASKS section ' +
          'below for each property of this unnamed object (task array element).');
        test.example('tasks can be falsy if no tasks defined otherwise it has to be an array',
          Error('error creating Procedure: tasks is not an array'), function () {
            new Procedure({tasks: true});
          });
        test.example('the parameters must be valid for the object in each element of the array',
          Error('error creating Procedure: invalid task[0] property: clean'), function () {
          new Procedure({tasks: [
            {clean: 'room'}
          ]})
        });
      });
      test.heading('tasksNeeded', function () {
        test.paragraph('Total tasks that will execute (does not include skipped tasks).');
        test.paragraph('_See Integration Tests for usage_');
      });
      test.heading('tasksCompleted', function () {
        test.paragraph('Number of tasks completed and started (does not include skipped tasks)');
        test.paragraph('_See Integration Tests for usage_');
      });
    });
    test.heading('TASKS', function () {
      test.paragraph('Each element of the array tasks is an object with the following properties:');
      test.heading('label', function () {
        test.paragraph('optional label for this task task element');
        test.example('if used it must be a string', Error('error creating Procedure: task[0].label must be string'), function () {
          new Procedure({tasks: [
            {label: true}
          ]});
        });
      });
      test.heading('command', function () {
        test.paragraph('Command to execute for this task');
        test.example('if used it must be a string', Error('error creating Procedure: task[0].command must be a Command object'), function () {
          new Procedure({tasks: [
            {command: true}
          ]});
        });
      });
      test.heading('requires', function () {
        test.paragraph('Establish other tasks that must be complete before this task is executed.  ' +
          'Pass as array of or single element. Can be string(for label label) or number(for array index).  ' +
          'Use -1 for previous task, null for no dependencies');
        test.example('test it', undefined, function () {
          test.shouldThrow(Error('invalid type for requires in task[0]'), function () {
            new Procedure({tasks: [
              {requires: new Date() }
            ]});
          });
          // if number supplied it is index in array
          test.shouldThrow(Error('missing task #1 for requires in task[0]'), function () {
            new Procedure({tasks: [
              {command: new Procedure({}), requires: 1 }
            ]});
          });
          test.shouldThrow(Error('task #-2 invalid requires in task[0]'), function () {
            new Procedure({tasks: [
              {command: new Procedure({}), requires: -2 }
            ]});
          });
          // requires defaults to -1 which means the previous element in the array so essentially the default
          // is sequential processing.  Set to null for no dependencies which makes it asynchronous -1 means
          // previous element is ignored for first index and is the default
          var proc = new Procedure({tasks: [
            {command: new Command({})}
          ]});
          test.assertion(proc.tasks[0].requires == -1);
        });
      });
    });
    test.heading('METHODS', function () {
      test.heading('getValidationErrors', function () {
        test.example('should return array of validation errors', 'falsy', function () {
          if (!new Procedure().getValidationErrors()) return 'falsy'
        });
      });
    });

  });
};
;
/**
 * tequila
 * store-test
 */
test.runnerStore = function () {
  test.heading('Store Class', function () {
    test.paragraph('The store class is used for object persistence.');
    test.heading('CONSTRUCTOR', function () {
      test.runnerStoreConstructor(Store);
    });
    test.runnerStoreMethods(Store);
  });
};
test.runnerStoreConstructor = function (SurrogateStore) {
  test.example('objects created should be an instance of Store', true, function () {
    return new SurrogateStore() instanceof Store;
  });
  test.example('should make sure new operator used', Error('new operator required'), function () {
    SurrogateStore();
  });
  test.example('should make sure properties are valid', Error('error creating Store: invalid property: food'), function () {
    new SurrogateStore({food: 'twinkies'});
  });
};
test.runnerStoreMethods = function (SurrogateStore) {
  test.heading('METHODS', function () {
    var services = new SurrogateStore().getServices();
    test.example('getStoreInterface() returns an object with interface for the Store.', undefined, function () {
      test.show(services);
      test.assertion(services instanceof Object);
      test.assertion(typeof services['isReady'] == 'boolean'); // don't use until
      test.assertion(typeof services['canGetModel'] == 'boolean'); // define all allowed methods...
      test.assertion(typeof services['canPutModel'] == 'boolean');
      test.assertion(typeof services['canDeleteModel'] == 'boolean');
      test.assertion(typeof services['canGetList'] == 'boolean');
    });
    test.heading('toString()', function () {
      test.example('should return a description of the Store', "ConvenienceStore: 7-Eleven", function () {
        var cStore = new SurrogateStore();
        test.show(cStore.toString());
        cStore.name = '7-Eleven';
        cStore.storeType = 'ConvenienceStore';
        test.show(cStore.toString());
        return cStore.toString();
      });
    });
    test.heading('onConnect()', function () {
      test.example('must pass url string', Error('argument must a url string'), function () {
        new SurrogateStore().onConnect();
      });
      test.example('must pass callback function', Error('argument must a callback'), function () {
        new SurrogateStore().onConnect("");
      });
      if (services['isReady']) {
        test.example('return store and undefined error upon successful connection to remote store.', test.asyncResponse(true), function (testNode, returnResponse) {
          new SurrogateStore().onConnect('', function (store, err) {
            if (err) {
              returnResponse(testNode, err);
            } else {
              returnResponse(testNode, store instanceof Store);
            }
          });
        });
      } else {
        test.paragraph('see integration test for ' + new SurrogateStore().storeType);
      }
    });
    test.heading('getModel()', function () {
      if (services['canGetModel']) {
        test.example('must pass valid model', Error('argument must be a Model'), function () {
          new SurrogateStore().getModel();
        });
        test.example('model must have no validation errors', Error('model has validation errors'), function () {
          var m = new Model();
          m.attributes = null;
          new SurrogateStore().getModel(m);
        });
        test.example('ID attribute must have truthy value', Error('ID not set'), function () {
          new SurrogateStore().getModel(new Model());
        });
        test.example('callback function required', Error('callback required'), function () {
          var m = new Model();
          m.attributes[0].value = 1;
          new SurrogateStore().getModel(m);
        });
        if (services['isReady']) {
          test.example('returns error when model not found', test.asyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStore().getModel(m, function (mod, err) {
              if (err) {
                returnResponse(testNode, err);
              } else {
                returnResponse(testNode, mod);
              }
            });
          });
        } else {
          test.paragraph('skipping tests since store is not ready');
        }
      } else {
        test.example('getModel() is not implemented', Error(new SurrogateStore().storeType + ' does not provide getModel'), function () {
          new SurrogateStore().getModel();
        });
      }
    });
    test.heading('putModel(model)', function () {
      if (services['canPutModel']) {
        test.example('must pass valid model', Error('argument must be a Model'), function () {
          new SurrogateStore().putModel();
        });
        test.example('model must have no validation errors', Error('model has validation errors'), function () {
          var m = new Model();
          m.attributes = null;
          new SurrogateStore().putModel(m);
        });
        test.example('callback function required', Error('callback required'), function () {
          var m = new Model();
          m.attributes[0].value = 1;
          new SurrogateStore().putModel(m);
        });
        if (services['isReady']) {
          test.example('returns error when model not found', test.asyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStore().putModel(m, function (mod, err) {
              if (err) {
                returnResponse(testNode, err);
              } else {
                returnResponse(testNode, mod);
              }
            });
          });
          test.example('creates new model when ID is not set', test.asyncResponse(true), function (testNode, returnResponse) {
            var m = new Model();
            new SurrogateStore().putModel(m, function (mod, err) {
              if (err) {
                returnResponse(testNode, err);
              } else {
                returnResponse(testNode, mod.get('id') ? true : false);
              }
            });
          });
        } else {
          test.paragraph('skipping tests since store is not ready');
        }
      } else {
        test.example('putModel() is not implemented', Error('Store does not provide putModel'), function () {
          new SurrogateStore().putModel();
        });
      }
    });
    test.heading('deleteModel(model)', function () {
      if (services['canDeleteModel']) {
        test.example('must pass valid model', Error('argument must be a Model'), function () {
          new SurrogateStore().deleteModel();
        });
        test.example('model must have no validation errors', Error('model has validation errors'), function () {
          var m = new Model();
          m.attributes = null;
          new SurrogateStore().deleteModel(m);
        });
        test.example('callback function required', Error('callback required'), function () {
          var m = new Model();
          m.attributes[0].value = 1;
          new SurrogateStore().deleteModel(m);
        });
        if (services['isReady']) {
          test.example('returns error when model not found', test.asyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStore().deleteModel(m, function (mod, err) {
              if (err) {
                returnResponse(testNode, err);
              } else {
                returnResponse(testNode, mod);
              }
            });
          });
        } else {
          test.paragraph('skipping tests since store is not ready');
        }
      } else {
        test.example('deleteModel() is not implemented', Error('Store does not provide deleteModel'), function () {
          new SurrogateStore().deleteModel();
        });
      }
    });
    test.heading('getList(model, filter, order)', function () {
      test.paragraph('This method will clear and populate the list with collection from store.  ' +
        'The **filter** property can be used to query the store.  ' +
        'The **order** property can specify the sort order of the list.  ' +
        '_See integration test for more info._');
      if (services['isReady'] && services['canGetList']) {
        test.example('returns a List populated from store', undefined, function () {
          test.shouldThrow(Error('argument must be a List'),function(){
            new SurrogateStore().getList();
          })
          test.shouldThrow(Error('filter argument must be Object'),function(){
            new SurrogateStore().getList(new List(new Model()));
          })
          test.shouldThrow(Error('callback required'),function(){
            new SurrogateStore().getList(new List(new Model()),[]);
          })
          // See integration tests for examples of usage
        });
      } else {
        if (services['isReady'] && services['canGetList']) {
          test.example('returns a List populated from store', Error('Store does not provide getList'), function () {
            return new SurrogateStore().getList();
          });
        } else {
          test.xexample('returns a List populated from store', Error('Store does not provide getList'), function () {
            return new SurrogateStore().getList();
          });
        }
      }
    });
  });
  test.heading('PROPERTIES', function () {
    test.heading('name', function () {
      test.example('name of store can be set in constructor', 'punchedCards', function () {
        return new SurrogateStore({name: 'punchedCards'}).name;
      });
    });
    test.heading('storeType', function () {
      test.paragraph('storeType defaults to Store Class Name but can be set to suite the app architecture.');
      test.example('storeType can be set in constructor', 'legacyStorage', function () {
        return new SurrogateStore({storeType: 'legacyStorage'}).storeType;
      });
    });
  });
};;
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
      test.heading('isServer()');
      test.paragraph('This method returns true running as server under node.');
      test.example('check against known invocation', true, function (test) {
        // When tests launch test.isBrowser is set - compare to library test for node
        return test.isBrowser != Tequila().isServer();
      });

      test.heading('contains(array,object)');
      test.paragraph('This method returns true or false as to whether object is contained in array.');
      test.example('object exists in array', true, function () {
        return Tequila().contains(['moe', 'larry', 'curley'], 'larry');
      });
      test.example('object does not exist in array', false, function () {
        return Tequila().contains(['moe', 'larry', 'curley'], 'shemp');
      });
      test.heading('getInvalidProperties(args,allowedProperties)');
      test.paragraph('Functions that take an object as it\'s parameter use this to validate the ' +
        'properties of the parameter by returning any invalid properties');
      test.example('valid property', 'Kahn', function () {
        // got Kahn and value backwards so Kahn is an unknown property
        return Tequila().getInvalidProperties({name: 'name', Kahn: 'value'}, ['name', 'value'])[0];
      });
      test.example('invalid property', 0, function () {
        // no unknown properties
        return Tequila().getInvalidProperties({name: 'name', value: 'Kahn'}, ['name', 'value']).length;
      });
      test.heading('getVersion()');
      test.paragraph('This method returns the tequila library version.');
      test.example('tequila library version', 2, function () {
        var libraryVersion = Tequila().getVersion();
        test.show(libraryVersion)
        return (libraryVersion.split(".").length - 1);
      });
      test.heading('inheritPrototype(p)');
      test.paragraph('This method returns a object that inherits properties from the prototype object p');
      test.example('new objects are instance of inherited object', undefined, function () {
        Thing = function (name) { // Create class and 2 subclasses
          this.name = name;
        };
        Car = function (name) {
          Thing.call(this, name); // apply Thing constructor
          this.canBeDriven = true;
        };
        Car.prototype = T.inheritPrototype(Thing.prototype); // <- proper usage
        Food = function (name) {
          Thing.call(this, name); // apply Thing constructor
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
};;
/**
 * tequila
 * transport-test
 */

test.runnerTransport = function () {
  test.heading('Transport Class', function () {
//    if (typeof io == 'undefined') {
      test.examplesDisabled = true;
      test.paragraph('tests disabled socket.io too spammy in console');
//      test.paragraph('tests disabled socket.io not detected');
//    }
    test.paragraph('Handle message passing between host and UI.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Transport', true, function () {
        return new Transport("*wtf*", function () {
        }) instanceof Transport;
      });
      test.example('must be instantiated with new', Error('new operator required'), function () {
        Transport("", function () {
        });
      });
      test.example('must pass url string', Error('argument must a url string'), function () {
        new Transport();
      });
      test.paragraph('The connection success is signaled via callback. use function(msg){} for' +
        'callback.  msg.Connection indications success, msg.Error for failure (msg.contents' +
        'contains error).');
      test.example('must pass callback function', Error('argument must a callback'), function () {
        new Transport('');
      });
      test.example('url must be valid', test.asyncResponse('Error Message: cannot connect'), function (testNode, returnResponse) {
        new Transport('*url*', function (message) {
          returnResponse(testNode, message);
        }, this);
      });
    });
    test.heading('METHODS', function () {
      test.heading('send(message)', function () {
        test.paragraph('send() is used to send messages to host or UI.  Any errors returned are based on state checks' +
          ' and not resulting from async errors.' +
          ' If confirmation is needed provide callback to notify message has been sent or error has occurred.');
        test.example('message param required', Error('message required'), function () {
          new Transport("", function () {
          }).send();
        });
        test.example('message param must be type Message', Error('parameter must be instance of Message'), function () {
          new Transport("", function () {
          }).send('money');
        });
        test.example('Transport must be connected (async error message)', test.asyncResponse('Error Message: not connected'), function (testNode, returnResponse) {
          new Transport("*bad*", function () {
            this.send(new Message('Null'), function (msg) {
              returnResponse(testNode, msg);
            });
          });
        });
        test.example('optional callback must be function', Error('argument must a callback'), function () {
          new Transport("", function () {
          }).send(new Message('Null'), Infinity);
        });
        test.example('if callback used messages sent are acknowledged', test.asyncResponse(true), function (testNode, returnResponse) {
          test.hostStore.transport.send(new Message('Null'), function (msg) {
            returnResponse(testNode, msg);
          });
        });
      });
      test.heading('close()', function () {
        test.xexample('Transport must be connected (async error message)', test.asyncResponse('jobs done'), function (testNode, returnResponse) {
          new Transport("", function () {
            this.close(); // TODO can't open 2 transports to same URL so can't test this since it conflicts with hostStore
            returnResponse(testNode, "jobs done");
          });
        });
      });
    });
    test.examplesDisabled = false;
  });
};
;
/**
 * tequila
 * application-test
 */
test.runnerApplicationModel = function () {
  test.heading('Application Model', function () {
    test.paragraph('Information about the application is modeled here.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Application', true, function () {
        return new Application() instanceof Application;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(Application, true);
      });
    });
    test.heading('METHODS', function () {
      test.heading('run()', function () {
        test.paragraph('The run method executes the application.');
        test.example('with no parameters default command will be executed', Error('command not implemented'), function () {
          new Application().run();
        });
      });
      test.heading('setInterface(interface)', function () {
        test.paragraph('Setting the interface for the application determines the primary method of user interaction.');
        test.example('must supply Interface object', Error('instance of Interface a required parameter'), function () {
          new Application().setInterface();
        });
      });
      test.heading('getInterface()', function () {
        test.paragraph('returns primary user interface for application');
        test.example('get default interface for applications', 'a Interface', function () {
          return new Application().getInterface().toString();
        });
      });
    });
  });
};
;
/**
 * tequila
 * log-test
 */
test.runnerLogModel = function () {
  test.heading('Log Model', function () {
    test.paragraph('Multi purpose log model.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Workspace', true, function () {
        return new Log() instanceof Log;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(Log, true);
      });
      test.heading('ATTRIBUTES', function () {
        test.example('following attributes are defined:', undefined, function () {
          var log = new Log('what up'); // default attributes and values
          test.assertion(log.get('id') !== undefined);
          test.assertion(log.get('dateLogged') instanceof Date);
          test.show(log.get('dateLogged'));
          test.assertion(log.get('logType') == 'Text');
          test.assertion(log.get('importance') == 'Info');
          test.assertion(log.get('contents') == 'what up');
        });
      });
      test.heading('LOG TYPES', function () {
        test.example('must be valid', Error('Unknown log type: wood'), function () {
          test.show(T.getLogTypes());
          new Log({logType: 'wood'}); // default attributes and values
        });
        test.example('Delta is simple text message', 'Info: sup', function () {
          return new Log('sup');
        });
        test.example('Text is simple text message', 'Info: (delta)', function () {
          var delta = new Delta(new Attribute.ModelID(new Model()));
          return new Log({logType: 'Delta', contents: delta}).toString();
        });
      });
    });
  });
};
;
/**
 * tequila
 * presentation-test
 */
test.runnerPresentation = function () {
  test.heading('Presentation Model', function () {

    test.paragraph('The Presentation Model represents the way in which a model is to be presented to the user.  ' +
      'The presentation is meant to be a "hint" to a Interface object.  ' +
      'The specific Interface object will represent the model data according to the Presentation object.');

    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of User', true, function () {
        return new Presentation() instanceof Presentation;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(Presentation, true);
      });
    });

    test.heading('PROPERTIES', function () {
      test.heading('model', function () {
        test.paragraph('points to model from which presentation is created and CRUD op');
      });
      test.heading('ID', function () {
        test.paragraph('the ID of the model being presented - if null then new (n/a if no model)');
      });
      test.heading('attributes', function () {
        test.paragraph('if null then model-attributes used for presentation (one or other needed)');
      });
      test.heading('commands', function () {
        test.paragraph('commands available, if string then built in predefined command ex: \'store\'');
      });
    });

    test.heading('ATTRIBUTES', function () {
      test.paragraph('Presentation extends model and inherits the attributes property.  All Presentation objects ' +
        'have the following attributes:');
    });
    test.example('following attributes are defined:', undefined, function () {
      var presentation = new Presentation(); // default attributes and values
      test.assertion(presentation.get('id') === null);
      test.assertion(presentation.get('name') === null);
    });


  });
};
;
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
        test.runnerModel(User, true);
      });
    });
    test.heading('ATTRIBUTES', function () {
      test.example('following attributes are defined:', undefined, function () {
        var user = new User(); // default attributes and values
        test.assertion(user.get('id') === null);
        test.assertion(user.get('name') === null);
        test.assertion(user.get('active') === false);
        test.assertion(user.get('password') === null);
        test.assertion(user.get('firstName') === null);
        test.assertion(user.get('lastName') === null);
        test.assertion(user.get('email') === null);
      });
    });
  });
};
;
/**
 * tequila
 * workspace-test
 */
test.runnerWorkspace = function () {
  test.heading('Workspace Model', function () {
    test.paragraph('A workspace is a collection of active deltas for a user.  The GUI could represent that as open' +
      'tabs for instance.  Each tab a model view.  The deltas represent the change in model state');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Workspace', true, function () {
        return new Workspace() instanceof Workspace;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(Workspace, true);
      });
    });
    test.heading('ATTRIBUTES', function () {
      test.example('following attributes are defined:', undefined, function () {
        var user = new Workspace(); // default attributes and values
        test.assertion(user.get('id') !== undefined);
        test.assertion(user.get('user') instanceof Attribute.ModelID);
        test.assertion(user.get('user').modelType == 'User');
        test.assertion(typeof user.get('deltas') == 'object');
      });
    });
  });
};;
/**
 * tequila
 * memory-test
 */
test.runnerMemoryStore = function () {
  test.heading('MemoryStore', function () {
    test.paragraph('The MemoryStore is a simple volatile store.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of MemoryStore', true, function () {
        return new MemoryStore() instanceof MemoryStore;
      });
      test.runnerStoreConstructor(MemoryStore);
    });
    test.runnerStoreMethods(MemoryStore);
  });
};
;
/**
 * tequila
 * mongo-test
 */

test.runnerMongoStore = function () {
  test.heading('MongoStore', function () {
    test.paragraph('The MongoStore is a simple volatile store.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of MongoStore', true, function () {
        return new MongoStore() instanceof MongoStore;
      });
      test.runnerStoreConstructor(MongoStore);
    });
    test.runnerStoreMethods(MongoStore);
  });
};
;
/**
 * tequila
 * remote-test
 */
test.runnerRemoteStore = function () {
  test.heading('RemoteStore', function () {
    test.paragraph('The RemoteStore is a store that is maintained by a remote host.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of RemoteStore', true, function () {
        return new RemoteStore() instanceof RemoteStore;
      });
      test.runnerStoreConstructor(RemoteStore);
    });
    test.runnerStoreMethods(RemoteStore);
  });
};
;
/**
 * tequila
 * local-test
 */
test.runnerLocalStore = function () {
  test.heading('Local Store', function () {
    test.paragraph('The LocalStore is a simple volatile store.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of LocalStore', true, function () {
        return new LocalStore() instanceof LocalStore;
      });
      test.runnerStoreConstructor(LocalStore);
    });
    test.runnerStoreMethods(LocalStore);
  });
};
;
/**
 * tequila
 * redis-test
 */
test.runnerRedisStore = function () {
  test.heading('Redis Store', function () {
    test.paragraph('The RedisStore is a simple volatile store.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of RedisStore', true, function () {
        return new RedisStore() instanceof RedisStore;
      });
      test.runnerStoreConstructor(RedisStore);
    });
    test.runnerStoreMethods(RedisStore);
  });
};
;
/**
 * tequila
 * bootstrap3-test.js
 */
test.runnerBootstrap3Interface = function () {
  test.heading('Bootstrap3Interface', function () {
  });
};
;
/**
 * tequila
 * command-line-test
 */
test.runnerCommandLineInterface = function () {
  test.heading('CommandLineInterface', function () {

  });

};
;
/**
 * tequila
 * mock-test.js
 */
test.runnerMockInterface = function () {
  test.heading('MockInterface', function () {

  });

};
;
/**
 * tequila
 * test-list-integration
 */
test.runnerListIntegration = function () {
  test.heading('List Integration', function () {
    test.heading('List methods are tested here', function () {
      test.example('list movement and sorting', undefined, function () {
        // Create actor class
        var Actor = function (args) {
          Model.call(this, args);
          this.modelType = "Actor";
          this.attributes.push(new Attribute('name'));
          this.attributes.push(new Attribute('born', 'Number'));
          this.attributes.push(new Attribute('isMale', 'Boolean'));
        };
        Actor.prototype = T.inheritPrototype(Model.prototype);

        // Create list of actors
        var actor = new Actor();
        var actors = new List(actor);
        var actorsInfo = [
          // Actor              Born  Male
          ['Jack Nicholson', 1937, true],
          ['Meryl Streep', 1949, false],
          ['Marlon Brando', 1924, true],
          ['Cate Blanchett', 1969, false],
          ['Robert De Niro', 1943, true],
          ['Judi Dench', 1934, false],
          ['Al Pacino', 1940, true],
          ['Nicole Kidman', 1967, false],
          ['Daniel Day-Lewis', 1957, true],
          ['Shirley MacLaine', 1934, false],
          ['Dustin Hoffman', 1937, true],
          ['Jodie Foster', 1962, false],
          ['Tom Hanks', 1956, true],
          ['Kate Winslet', 1975, false],
          ['Anthony Hopkins', 1937, true],
          ['Angelina Jolie', 1975, false],
          ['Paul Newman', 1925, true],
          ['Sandra Bullock', 1964, false],
          ['Denzel Washington', 1954, true],
          ['Renée Zellweger', 1969, false]
        ];

        // Build List
        for (var i in actorsInfo) {
          if (actorsInfo[i][2]) { // for some populate model then add to list
            actor.set('name', actorsInfo[i][0]);
            actor.set('born', actorsInfo[i][1]);
            actor.set('isMale', actorsInfo[i][2]);
            actors.addItem(actor);
          } else {
            actors.addItem(); // add blank then set attribs
            actors.set('name', actorsInfo[i][0]);
            actors.set('born', actorsInfo[i][1]);
            actors.set('isMale', actorsInfo[i][2]);
          }
        }

        // Test movement thru list
        actors.firstItem();
        test.assertion(actors.get('name') == 'Jack Nicholson');
        test.shouldThrow(Error('item not found'), function () {
          actors.previousItem();  // can't go past top
        });
        actors.nextItem();
        test.assertion(actors.get('name') == 'Meryl Streep');
        actors.lastItem();
        test.assertion(actors.get('name') == 'Renée Zellweger');

        // Sort the list
        actors.sort({born: -1});  // Youngest actor
        actors.firstItem();
        test.assertion(actors.get('name') == 'Kate Winslet' || actor.get('name') == 'Angelina Jolie');
        actors.sort({born: 1});  // Oldest actor
        actors.firstItem();
        test.assertion(actors.get('name') == 'Marlon Brando');
      });


      test.xexample('Test variations on getList method.', test.asyncResponse(true), function (testNode, returnResponse) {
        var self = this;
        var storeBeingTested = test.integrationStore.name + ' ' + test.integrationStore.storeType;
        test.show(storeBeingTested);

        // Create list of actors
        self.actorsInfo = [
          // Actor Born Male Oscards
          ['Jack Nicholson', new Date("01/01/1937"), true, 3],
          ['Meryl Streep', Date("01/01/1949"), false, 3],
          ['Marlon Brando', Date("01/01/1924"), true, 2],
          ['Cate Blanchett', Date("01/01/1969"), false, 1],
          ['Robert De Niro', Date("01/01/1943"), true, 2],
          ['Judi Dench', Date("01/01/1934"), false, 1],
          ['Al Pacino', Date("01/01/1940"), true, 1],
          ['Nicole Kidman', Date("01/01/1967"), false, null],
          ['Daniel Day-Lewis', Date("01/01/1957"), true, null],
          ['Shirley MacLaine', Date("01/01/1934"), false, null],
          ['Dustin Hoffman', Date("01/01/1937"), true, null],
          ['Jodie Foster', Date("01/01/1962"), false, null],
          ['Tom Hanks', Date("01/01/1956"), true, null],
          ['Kate Winslet', Date("01/01/1975"), false, null],
          ['Anthony Hopkins', Date("01/01/1937"), true, null],
          ['Angelina Jolie', Date("01/01/1975"), false, null],
          ['Paul Newman', Date("01/01/1925"), true, null],
          ['Sandra Bullock', Date("01/01/1964"), false, null],
          ['Denzel Washington', Date("01/01/1954"), true, null],
          ['Renée Zellweger', Date("01/01/1969"), false, null]
        ];

        // Create actor class
        self.Actor = function (args) {
          Model.call(this, args);
          this.modelType = "Actor";
          this.attributes.push(new Attribute('name'));
          this.attributes.push(new Attribute('born', 'Date'));
          this.attributes.push(new Attribute('isMale', 'Boolean'));
          this.attributes.push(new Attribute('oscarWs', 'Number'));
        };
        self.Actor.prototype = T.inheritPrototype(Model.prototype);
        self.actor = new self.Actor(); // instance to use for stuff

        // Make sure store starts in known state.  Stores such as mongoStore will retain test values.
        // So... use getList to get all Actors then delete them from the Store
        self.list = new List(new self.Actor());
        self.oldActorsKilled = 0;
        self.oldActorsFound = 0;
        try {
          self.killhim = new self.Actor();
          test.integrationStore.getList(self.list, [], function (list, error) {
            if (typeof error != 'undefined') {
              returnResponse(testNode, error);
              return;
            }
            if (list._items.length < 1)
              storeActors();
            else {
              self.oldActorsFound = list._items.length;
              for (var i = 0; i < list._items.length; i++) {
                self.killhim.set('id', list._items[i][0]);
                test.integrationStore.deleteModel(self.killhim, function (model, error) {
                  if (typeof error != 'undefined') {
                    console.log('error deleting: ' + JSON.stringify(error));
                  }
                  if (++self.oldActorsKilled >= self.oldActorsFound) {
                    storeActors();
                  }
                })
              }
            }
          });
        }
        catch (err) {
          returnResponse(testNode, err);
          return;
        }

        // Callback after model cleaned
        // now, build List and add to store
        function storeActors() {
          self.actorsStored = 0;
          for (var i in self.actorsInfo) {
            self.actor.set('ID', null);
            self.actor.set('name', self.actorsInfo[i][0]);
            self.actor.set('born', self.actorsInfo[i][1]);
            self.actor.set('isMale', self.actorsInfo[i][2]);
            test.integrationStore.putModel(self.actor, actorStored);
          }
        }

        // Callback after actor stored
        function actorStored(model, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          if (++self.actorsStored >= self.actorsInfo.length) {
            getAllActors();
          }
        }

        // test getting all 20
        function getAllActors() {
          try {
            test.integrationStore.getList(self.list, {}, function (list, error) {
              if (typeof error != 'undefined') {
                returnResponse(testNode, error);
                return;
              }
              test.assertion(list._items.length == 20);
              getTomHanks();
            });
          }
          catch (err) {
            returnResponse(testNode, err);
            return;
          }
        }

        // only one Tom Hanks
        function getTomHanks() {
          try {
            test.integrationStore.getList(self.list, {name: "Tom Hanks"}, function (list, error) {
              if (typeof error != 'undefined') {
                returnResponse(testNode, error);
                return;
              }
              test.assertion(list._items.length == 1);
              getD();
            });
          }
          catch (err) {
            returnResponse(testNode, err);
            return;
          }
        }

        // 3 names begin with D
        // test RegExp
        function getD() {
          try {
            test.integrationStore.getList(self.list, {name: /^D/}, function (list, error) {
              if (typeof error != 'undefined') {
                returnResponse(testNode, error);
                return;
              }
              test.assertion(list._items.length == 3);
              getRZ();
            });
          }
          catch (err) {
            returnResponse(testNode, err);
            return;
          }
        }

        // Renée Zellweger only female starting name with 'R'
        // test filter 2 properties (logical AND)
        function getRZ() {
          try {
            test.integrationStore.getList(self.list, {name: /^R/, isMale: false}, function (list, error) {
              if (typeof error != 'undefined') {
                returnResponse(testNode, error);
                return;
              }
              test.assertion(list._items.length == 1);
              list._items.length && test.assertion(list.get('name') == 'Renée Zellweger');
              getAlphabetical();
            });
          }
          catch (err) {
            returnResponse(testNode, err);
            return;
          }
        }

        // Retrieve list alphabetically by name
        // test order parameter
        function getAlphabetical() {
          try {
            test.integrationStore.getList(self.list, {}, { name: 1 }, function (list, error) {
              if (typeof error != 'undefined') {
                returnResponse(testNode, error);
                return;
              }
              list.firstItem();
              test.assertion(list.get('name') == 'Al Pacino');
              list.lastItem();
              test.assertion(list.get('name') == 'Tom Hanks');
              returnResponse(testNode, true);
            });
          }
          catch (err) {
            returnResponse(testNode, err);
            return;
          }
        }


      });
    });
  });
};
;
/**
 * tequila
 * test-store-integration
 */
test.runnerStoreIntegration = function () {
  test.heading('Store Integration', function () {
    test.heading('CRUD (Create Read Update Delete)', function () {
      test.example('Exercise all store function for one store.', test.asyncResponse(true), function (testNode, returnResponse) {
        var self = this;
        var storeBeingTested = test.integrationStore.name + ' ' + test.integrationStore.storeType;
        test.show(storeBeingTested);

        // If store is not ready then get out...
        if (!test.integrationStore.getServices().isReady) {
          returnResponse(testNode, Error('Store is not ready.'));
          return;
        }

        // setup stooge class
        self.Stooge = function (args) {
          Model.call(this, args);
          this.modelType = "Stooge";
          this.attributes.push(new Attribute('name'));
        };
        self.Stooge.prototype = T.inheritPrototype(Model.prototype);

        // create initial stooges
        self.moe = new self.Stooge();
        self.moe.set('name', 'Moe');
        self.larry = new self.Stooge();
        self.larry.set('name', 'Larry');
        self.shemp = new self.Stooge();
        self.shemp.set('name', 'Shemp');

        // IDs after stored will be here
        self.stoogeIDsStored = [];
        self.stoogesRetrieved = [];
        self.oldStoogesFound = 0;
        self.oldStoogesKilled = 0;

        // Make sure store starts in known state.  Stores such as mongoStore will retain test values.
        // So... use getList to get all stooges then delete them from the Store
        var useListToCleanStart = test.integrationStore.getServices().canGetList;
        if (useListToCleanStart) {
          var list = new List(new self.Stooge());
          try {
            self.killhim = new self.Stooge();
            test.integrationStore.getList(list, [], function (list, error) {
              if (typeof error != 'undefined') {
                returnResponse(testNode, error);
                return;
              }
              if (list._items.length < 1)
                storeStooges();
              else
                self.oldStoogesFound = list._items.length;
              for (var i = 0; i < list._items.length; i++) {
                self.killhim.set('id', list._items[i][0]);
                test.integrationStore.deleteModel(self.killhim, function (model, error) {
                  if (typeof error != 'undefined') {
                    console.log('error deleting: ' + JSON.stringify(error));
                  }
                  if (++self.oldStoogesKilled >= self.oldStoogesFound) {
                    storeStooges();
                  }
                })
              }
            });
          }
          catch (err) {
            returnResponse(testNode, err);
          }
        } else {
          // TODO May have to delete manually or expire for redis ?
          storeStooges();
        }

        // Callback to store new stooges
        function storeStooges() {
          test.show(self.oldStoogesFound);
          test.show(self.oldStoogesKilled);
          test.integrationStore.putModel(self.moe, stoogeStored);
          test.integrationStore.putModel(self.larry, stoogeStored);
          test.integrationStore.putModel(self.shemp, stoogeStored);
        }

        // callback after storing stooges
        function stoogeStored(model, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          try {
            self.stoogeIDsStored.push(model.get('id'));
            if (self.stoogeIDsStored.length == 3) {
              test.assertion(true); // Show we made it this far
              // Now that first 3 stooges are stored lets retrieve and verify
              var actors = [];
              for (var i = 0; i < 3; i++) {
                actors.push(new self.Stooge());
                actors[i].set('id', self.stoogeIDsStored[i]);
                test.integrationStore.getModel(actors[i], stoogeRetrieved);
              }
            }
          }
          catch (err) {
            returnResponse(testNode, err);
          }
        }

        // callback after retrieving stored stooges
        function stoogeRetrieved(model, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          self.stoogesRetrieved.push(model);
          if (self.stoogesRetrieved.length == 3) {
            test.assertion(true); // Show we made it this far
            // Now we have stored and retrieved (via IDs into new objects).  So verify the stooges made it
            test.assertion(self.stoogesRetrieved[0] !== self.moe && // Make sure not a reference but a copy
              self.stoogesRetrieved[0] !== self.larry && self.stoogesRetrieved[0] !== self.shemp);
            var s = []; // get list of names to see if all stooges made it
            for (var i = 0; i < 3; i++) s.push(self.stoogesRetrieved[i].get('name'));
            test.show(s);
            test.assertion(T.contains(s, 'Moe') && T.contains(s, 'Larry') && T.contains(s, 'Shemp'));
            // Replace Shemp with Curly
            var didPutCurly = false;
            for (i = 0; i < 3; i++) {
              if (self.stoogesRetrieved[i].get('name') == 'Shemp') {
                didPutCurly = true;
                self.stoogesRetrieved[i].set('name', 'Curly');
                try {
                  test.integrationStore.putModel(self.stoogesRetrieved[i], stoogeChanged);
                }
                catch (err) {
                  returnResponse(testNode, err);
                }
              }
            }
            if (!didPutCurly) {
              returnResponse(testNode, Error("Can't find Shemp!"));
            }
          }
        }

        // callback after storing changed stooge
        function stoogeChanged(model, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          test.assertion(model.get('name') == 'Curly');
          var curly = new self.Stooge();
          curly.set('id', model.get('id'));
          try {
            test.integrationStore.getModel(curly, storeChangedShempToCurly);
          }
          catch (err) {
            returnResponse(testNode, err);
          }
        }

        // callback after retrieving changed stooge
        function storeChangedShempToCurly(model, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          test.assertion(model.get('name') == 'Curly');
          // Now test delete
          self.deletedModelId = model.get('id'); // Remember this
          test.integrationStore.deleteModel(model, stoogeDeleted)
        }

        // callback when Curly is deleted
        function stoogeDeleted(model, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          // model parameter is what was deleted
          test.assertion(model.get('id') == null); // ID is removed
          test.assertion(model.get('name') == 'Curly'); // the rest remains
          // Is it really dead?
          var curly = new self.Stooge();
          curly.set('id', self.deletedModelId);
          test.integrationStore.getModel(curly, hesDeadJim);
        }

        // callback after lookup of dead stooge
        function hesDeadJim(model, error) {
          if (typeof error != 'undefined') {
            if (error != 'Error: id not found in store') {
              returnResponse(testNode, error);
              return;
            }
          } else {
            returnResponse(testNode, Error('no error deleting stooge when expected'));
            return;
          }
          // Skip List test if subclass can't do
          if (!test.integrationStore.getServices().canGetList) {
            returnResponse(testNode, true);
          } else {
            // Now create a list from the stooge store
            var list = new List(new self.Stooge());
            try {
              test.integrationStore.getList(list, [], listReady);
            }
            catch (err) {
              returnResponse(testNode, err);
            }
          }
        }

        // callback after list created from store
        function listReady(list, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          test.assertion(list instanceof List);
          test.assertion(list.length() == 2);
          list.firstItem();
          test.assertion(list.get('name') == 'Moe');
          list.nextItem();
          test.assertion(list.get('name') == 'Larry');
          returnResponse(testNode, true);
        }
      });
    });
  });
};
;
/**
 * tequila
 * test-command-integration
 */
test.runnerCommandIntegration = function () {
  test.heading('Command Integration', function () {
    test.paragraph('test each command type');

    // Stub
    test.example('Stub', Error('command not implemented'), function () {
      var cmd = new Command({
        name: 'stubCommand',
        description: 'stub command test',
        type: 'Stub'
      });
      test.show(cmd);
      cmd.execute();
    });

    // Menu
    test.example('Menu', Error('command not implemented'), function () {
      var cmd = new Command({
        name: 'menuCommand',
        description: 'menu command test',
        type: 'Menu',
        contents: ['Hello World']
      });
      test.show(cmd);
      cmd.execute();
    });

    // Presentation
    test.example('Presentation', Error('command not implemented'), function () {
      var cmd = new Command({
        name: 'presentationCommand',
        description: 'presentation command test',
        type: 'Presentation',
        contents: new Presentation()
      });
      test.show(cmd);
      cmd.execute();
    });

    // Function
    test.example('Function test straight up', test.asyncResponse('Hola! BeforeExecute AfterExecute Adious! funk Completed'), function (testNode, returnResponse) {
      var cmd = new Command({
        type: 'Function',
        contents: function () {
          this.bucket += ' funk';
          this.complete();
        }
      });
      cmd.bucket = 'Hola!';
      // Monitor all events
      cmd.onEvent(['BeforeExecute', 'AfterExecute', 'Error', 'Aborted', 'Completed'], function (event) {
        this.bucket += ' ' + event;
        if (event == 'Completed')
          returnResponse(testNode, this.bucket);
      });
      cmd.execute();
      cmd.bucket += ' Adious!';
    });

    // Function error
    test.example('Function test with error', test.asyncResponse('Hola! BeforeExecute AfterExecute Adious! funk Error Completed'), function (testNode, returnResponse) {
      var cmd = new Command({
        type: 'Function',
        contents: function () {
          this.bucket += ' funk';
          throw new Error('function go boom!');
        }
      });
      cmd.bucket = 'Hola!';
      // Monitor all events
      cmd.onEvent('*', function (event) { // * for all events
        this.bucket += ' ' + event;
        if (event == 'Completed') returnResponse(testNode, this.bucket);
      });
      cmd.execute();
      cmd.bucket += ' Adious!';
    });

    // Function abort
    test.example('Function test with abort', test.asyncResponse('Hola! BeforeExecute AfterExecute Adious! funk Aborted Completed'), function (testNode, returnResponse) {
      var cmd = new Command({
        type: 'Function',
        contents: function () {
          this.bucket += ' funk';
          this.abort();
        }
      });
      cmd.bucket = 'Hola!';
      // Monitor all events
      cmd.onEvent(['BeforeExecute', 'AfterExecute', 'Error', 'Aborted', 'Completed'], function (event) {
        this.bucket += ' ' + event;
        if (event == 'Completed') returnResponse(testNode, this.bucket);
      });
      cmd.execute();
      cmd.bucket += ' Adious!';
    });

    // Procedure
    test.example('Procedure', Error('command not implemented'), function () {
      var cmd = new Command({
        name: 'procedureCommand',
        description: 'procedure command test',
        type: 'Procedure',
        contents: new Procedure()
      });
      test.show(cmd);
      cmd.execute();
    });
  });
};
;
/**
 * tequila
 * test-procedure-integration
 */
test.runnerProcedureIntegration = function () {
  test.heading('Procedure Integration', function () {
  });
};
;
/**
 * tequila
 * tequila-spec
 */
test.start();
test.heading('Library', function () {
  test.runnerTequila();
});
test.heading('Classes', function () {
  test.paragraph('These objects make up the core "classes" and are extended via javascript prototype inheritance.');
  test.runnerAttribute();
  test.runnerCommand();
  test.runnerDelta();
  test.runnerInterface();
  test.runnerList(List,false);
  test.runnerMessage();
  test.runnerModel(Model,false);
  test.runnerProcedure();
  test.runnerStore();
  test.runnerTransport();
});
test.heading('Interfaces', function () {
  test.paragraph('These core interfaces are included in the library.');
  test.runnerMockInterface();
  test.runnerBootstrap3Interface();
  test.runnerCommandLineInterface();
});
test.heading('Models', function () {
  test.paragraph('These core models are included in the library.');
  test.runnerApplicationModel();
  test.runnerLogModel();
  test.runnerPresentation();
  test.runnerUserModel();
  test.runnerWorkspace();
});
test.heading('Stores', function () {
  test.paragraph('These core stores are included in the library.');
  test.runnerMemoryStore();
  test.runnerMongoStore();
  test.runnerRemoteStore();
  test.runnerLocalStore();
  test.runnerRedisStore();
});
test.heading('Integration Tests', function () {
  test.paragraph('These set of tests run through a series of operations with multiple assertions inside each example.  ' +
    'If any assertion fails the test is failed.');
  test.runnerListIntegration();
  test.runnerStoreIntegration();
  test.runnerProcedureIntegration();
  test.runnerCommandIntegration();
});
test.stop();
;
/**
 * tequila
 * node-test-tail
 */
test.runner(false);
process.on('exit', function () {
  process.exit(test.countFail || test.criticalFail ? 1 : 0);
});