/*
#@
@name: Lexer
@notes: this file contains the method used to extract the documentation from the code.
@#
*/

/*
#@
@name: Global Definitions
@brief: definitions of the global variables
@notes: the only global variable defined is `tokens` containing the tokens used to find the sections of the documentation.
@#
*/
/* #@codestart@# */
const tokens = {
    open_token: "#@",
    close_token: "@#",
    tag_token: "@",
    description_token: ":",
    cs_token: "#@codestart@#",
    ce_token: "#@codeend@#"
};
/* #@codeend@# */

/*
#@
@name: lexer
@brief: takes the text as input and finds each section
@inputs:
- string text: file content;
@outputs: 
- string tagged: documentation of the file divided by tags.
@#
*/
function lexer(text) {
    let tokenized = text.replaceAll("\r\n", "\n ").split(" "); // takes away the \r character and divides the string by space
    for (let i = tokenized.length - 1; i >= 0; i--) {
        if (tokenized[i] == "") tokenized.splice(i, 1); // removes from the array the empty strings
    }
    let extracted = extract(tokenized); // extract each code section
    let tagged = tag(extracted); // divide by tag
    return tagged;
}

/*
#@
@name: extract
@brief: extracts each section and code snippet from the code
@notes: it looks for the `#@` and `@#` symbols and for the `#@codestart@#` and `#@codeend@#` to divide the comments and take only what's denoted as documentation
@inputs: 
- list tokenized: file content split by space;
@outputs:
- list data: a list containing each field of the documentation.
@#
*/
function extract(tokenized) {
    let indexes = indexize(tokenized, tokens.open_token, tokens.close_token); // find the indexes of each section
    let code_sections = indexize(tokenized, tokens.cs_token, tokens.ce_token); // find the indexes of each code section
    indexes = merge(indexes, code_sections);
    //return [];
    let data = []
    let unique_id = 0;
    for (let i of indexes) {
        let string = tokenized.slice(i.start + 1, i.close).join(" ");
        if (string[0] != "@") {
            let retokenized = string.trim().split("\n");
            for (let k = retokenized.length - 1; k >= 0; k--) {
                if (retokenized[k] == "") retokenized.splice(k, 1);
                else retokenized[k] = retokenized[k].trim();
            }
            retokenized.splice(0, 1);
            retokenized.splice(retokenized.length - 1, 1);
            string = retokenized.join("\n");
            string = `@_code_snippet_${unique_id++}:` + string;
            data[data.length - 1] += string + "\n";
        }
        else data.push(string);
    }
    return data;
}

/*
#@
@name: merge
@brief: merges and sorts the fields of the documentation and the code snippets
@inputs:
- list comments: list of each field indexes taken from the file;
- list code_sections: list of the code sections indexes;
@outputs: 
- list indexes: sorted list of all the indexes.
@#
*/
function merge(comments, code_sections) {
    if (code_sections.length == 0) return comments;
    let indexes = [];
    for (let i = 0; i < comments.length; i++) {
        indexes.push(comments[i]);
    }
    for (let j = 0; j < code_sections.length; j++) {
        let added = false;
        for (let i = 0; i < indexes.length; i++) {
            if (indexes[i].close > code_sections[j].start) {
                indexes.splice(i, 0, code_sections[j]);
                added = true;
                break;
            }
        }
        if (!added) indexes.push(code_sections[j]);
    }
    return indexes;
}

/*
#@
@name: indexize
@brief: finds the starting and ending indexes based on the delimiters `start` and `end`
@notes: it uses the delimiters as arguments to create a list of javascript objects containing the starting and ending indexes of each field
@inputs:
- list tokenized: list of strings taken from the file contents divided by space;
- string start: starting delimiter;
- string end: ending delimiters;
@outputs:
- list indexes: list of starting and ending indexes of each field.
@#
*/
function indexize(tokenized, start, end) {
    let indexes = [];
    for (let i = 0; i < tokenized.length; i++) {
        let token = tokenized[i].trim();
        if (token == start) {
            if (indexes.length == 0 || indexes[indexes.length - 1].close != undefined)
                indexes.push({ start: i });
        } else if (token == end && indexes.length > 0) {
            if (indexes[indexes.length - 1] != undefined && indexes[indexes.length - 1].close == undefined) {
                indexes[indexes.length - 1].close = i;
            }
        }
    }
    return indexes;
}

/*
#@
@name: tag
@brief: takes each field and and divides them in tags and contents
@inputs:
- list extracted: list of the extracted fields;
@outputs:
- list tagged: list of javascript objects containing each field (tag=key).
@#
*/
function tag(extracted) {
    let tagged = []
    for (let data of extracted) {
        let tokenized = data.split(/:|\s/);
        let tags = tokenized.filter((value) => value[0] == "@");
        let regex = new RegExp(`(${tags.join(":|")}:)`);
        let contents = data.split(regex);
        contents = contents.filter((value) => !tags.includes(value.substring(0, value.length - 1)) && value != "");
        if (tags.length != contents.length) {
            tags_string = tags.join("\n") + "\n" + contents.join("\n\n");
            throw Error(`The number of tags is not the same as the number of contents: maybe a tag without contents was added ?\nTags found ${tags.length}, Contents found: ${contents.length}.\n${tags_string}\n`);
            return null;
        }
        let segments = {}
        for (let i = 0; i < tags.length; i++) {
            segments[tags[i].substring(1).toLowerCase()] = contents[i].trim();
        }
        tagged.push(segments);
    }
    return tagged;
}