/*
@name Introduction
@brief This tool can be used to generate documentation starting from the comments written into a coding file.
@note By selecting one or more files, this tool will parse through the files looking for comments blocks **containing at least the \@name field within them**:
if a block like that is found, this tool will automatically extract the comment block and insert it into a markdown file formatting it in the following way:
# name
> brief ...

note ...
|Field|Description|
|:---:|:---|
|field name|attribute description|
|field name|attribute description|
...
|field name|attribute description|

```c
code_block()
```

\-\-\- <- line

If more than one file is provided, each file will be parsed and concatenated to the previous one, but each file "section" will start with its name.
Right now this tool supports the C style comments, python comments and MATLAB comments but in future it might support other languages.

Because the output file is a markdown file, markdown syntax and HTML can be used as well within the comments (it all depends on the software used to read the files).

# Installation
If you want to create a desktop app for your personal use, just use this:

```console
git clone https://github.com/dede-amdp/easygen.git
cd easygen
npm install
npm start
```
# Contributing
You are free to clone and modify the repository, I archived the repo just because I don't know how to use github (no joke, I wouldn't know how to manage pull requests etc...)

# Edits
The tool is easily configurable, just add the comment symbols (both the comment block symbols and single line comment symbols) to the `_delimites` and `_multiline_delimiters` variables with key equal to the extension of the file you want to add support to, by doing so the app will automatically be able to recognize comment blocks and extract documentation from them.

# How to Start the app
Just use this command within the cloned repo or find the `out` folder and find the executable file.
```console
npm start
```
 */

/*
    @name Definitions
    @brief These are the variable definitions for the file
    @variables
        - List files: list of files used to create the documentation
        - HTMLElement file_sel: file selector HTML element used to select the files
        - HTMLElement files_done: used to show the user which file have been parsed
        - String List code_del: contains the code snippet delimiters `\@codestart` and `\@codeend`
        - String field_delimiter: contains the fields delimiter `\@`
        - JSONObject _delimiters: contains the delimiters of the comments for each language;
                                    Put first the delimiters that use more characters (order is important)
        - JSONObject _multiline_delimiters: contains the starting and ending delimiters of the multiline comments
 */
var files = [];
const file_sel = document.getElementById('file-selector');
const files_done = document.getElementById('files-done-par');
const code_del = ["@codestart", "@codeend"];
const field_delimiter = "@";
const _delimiters = {
    'c': ['/*', '*/', '//', '/', '*'],
    'cs': ['/*', '*/', '//', '/', '*'],
    'cpp': ['/*', '*/', '//', '/', '*'],
    'js': ['/*', '*/', '//', '/', '*'],
    'java': ['/*', '*/', '//', '/', '*'],
    'py': ["'''", "'", "#"],
    'm': ["%{", "}%", "{", "}", "%"]
};
const _multiline_delimiters = {
    'c': ['/*', '*/'],
    'cs': ['/*', '*/'],
    'cpp': ['/*', '*/'],
    'js': ['/*', '*/'],
    'java': ['/*', '*/'],
    'py': ["'''", "'''"],
    'm': ["%{", "}%"]
};

document.getElementById('supported').innerHTML = Object.keys(_delimiters).map((str) => ` \`${str}\``);

/*
    @name ChangeEventListener
    @brief Event listener attached to the file_sel variable to read the files once they are selected and loaded
    @note The event listener uses the read method to read the files and extract from them the documentation.
 */
file_sel.addEventListener('change', async (event) => {
    files = event.target.files;
    document.getElementById("loading").style.display = "block";
    files_done.innerHTML = '';
    await read_files(files);
});


/*
    @name indexOfAll
    @brief finds all the indexes of the pattern specified within the string
    @variables
    - String str: the string that needs to be checked
    - String pattern: pattern to search for within the string
    @returns Integer List of all the indexes
 */
function indexOfAll(str, pattern) {
    var indexes = [];
    var to_check = str.substring(0);
    var i, n;
    while (to_check.length > 0) {
        n = indexes.length;
        i = to_check.indexOf(pattern);
        if (i < 0) break;
        if (n > 0)
            indexes.push(indexes[n - 1] + i);
        else
            indexes.push(i);
        to_check = to_check.substring(i + 1);
    }
    return indexes;
}


/*
    @name escape_string
    @brief escapes all the comment symbols
    @note using the file extension the method looks for comment symbols and escapes them so that they can be ignored in the `remove_comment_symbols` method
    @variables
    - String string: string within which the character have to be escaped
    - String file_extension: extension of the file used to check which comment symbols need to be used
    @returns String with the comment symbols escaped
 */
function escape_string(string, file_extension) {
    var new_string = '';
    for (var i = string.length - 1; i > 0; i--) {
        new_string = string[i] + new_string;
        if (_delimiters[file_extension].includes(string[i])) {
            new_string = '\\' + new_string;
        }
    }
    return new_string;
}

/*
    @name get_only_comment_blocks
    @brief extracts only the block comments from the file
    @variables
        - String text: file text
        - String start_del: delimiter used to find the start of the comment block
        - String end_del: delimiter used to find the end of the comment block
    @returns String List containing only the comment blocks
 */
function get_only_comment_blocks(text, start_del, end_del, file_extension) {
    var to_return = [];
    var to_check = text.substring(0);
    while (to_check.length > 0 && (to_check.indexOf(start_del) > -1 && to_check.indexOf(end_del) > -1)) {
        var start_index = to_check.indexOf(start_del);
        var end_index = start_index + start_del.length + to_check.substring(start_index + start_del.length).indexOf(end_del);
        var comment_block = to_check.substring(start_index, end_index + end_del.length);
        if (comment_block.includes(code_del[1])) {
            if (comment_block[comment_block.indexOf(code_del[1]) - 1] != '\\') {
                to_check = to_check.substring(end_index + 1);
                continue;
            }
        }
        /*@codestart include code snippets*/
        // it uses the code delimiters \@codestart and \@codeend (contained in the variable code_del) to check where the code
        // snippet is located
        if (comment_block.includes(code_del[0])) {
            // there is a code snippet to be considered
            if (comment_block[comment_block.indexOf(code_del[0]) - 1] != '\\') {
                var delimiter_pos = -1;
                var sub_to_check = to_check.substring(0);
                while (sub_to_check.indexOf(code_del[1]) > -1) {
                    var ind = sub_to_check.indexOf(code_del[1]);
                    if (delimiter_pos < 0) delimiter_pos = ind;
                    else delimiter_pos += ind;
                    if (sub_to_check[ind - 1] != "\\") break;
                    delimiter_pos += code_del[1].length;
                    sub_to_check = to_check.substring(delimiter_pos);
                }
                //var delimiter_pos = to_check.substring(start_index + start_del.length).indexOf(code_del[1])
                var real_end_index = delimiter_pos;
                comment_block = to_check.substring(start_index, real_end_index);
                comment_block = comment_block.substring(0, comment_block.lastIndexOf(start_del) + start_del.length).trim();
                var end_name = start_del.length + comment_block.substring(start_del.length).indexOf(end_del);
                var end_all = end_name + end_del.length + comment_block.substring(end_name + end_del.length).lastIndexOf(start_del);
                comment_block = comment_block.substring(0, end_name) + "\n" + comment_block.substring(end_name + end_del.length, end_all) + end_del; //escape_string around the second string
            }
        }
        /*@codeend*/
        comment_block = comment_block.substring(comment_block.indexOf(start_del) + start_del.length, comment_block.lastIndexOf(end_del));
        var no_space = comment_block.replaceAll(" ", "");
        if (no_space.includes(field_delimiter) && no_space.includes(`${field_delimiter}name`)) {
            //if the codeblock includes the \@name field
            to_return.push([comment_block]);
        } else if (no_space.includes(code_del[0])) {
            var old_block = to_return.pop();
            old_block.push(comment_block)
            to_return.push(old_block);
        }
        to_check = to_check.substring(end_index + 1);
    }
    return to_return;
}

/*
    @name split_by_delimiter
    @brief splits a comment block by using a delimiter (if not escaped)
    @variables
        - String text: comment block text
        - String del: delimiter used to divide the comment block
    @returns String List containing all the strings into which the comment block was divided
 */
function split_by_delimiter(text, del) {
    var indexes = [];
    var index = 0;
    var to_check = text.substring(0);
    while (to_check.length > 0 && to_check.indexOf(del) > -1) {
        var rel_index = to_check.indexOf(del);
        index += rel_index + 1;
        indexes.push(index - 1);
        to_check = to_check.substring(rel_index + 1);
    }
    for (let i = indexes.length - 1; i > -1; i--) {
        if (indexes[i] - 1 >= 0 && text[indexes[i] - 1] === "\\") {
            indexes.splice(i, 1);
        }
    }
    var string_list = [text.substring(0, indexes[0])];
    let i;
    for (i = 0; i < indexes.length - 1; i++) {
        string_list.push(text.substring(indexes[i] + 1, indexes[i + 1]));
    }
    string_list.push(text.substring(indexes[i] + 1));
    return string_list;
}

/*
    @name async read_files
    @brief reads and parses all the files in a file list and then starts the download of the documentation extracted from them
    @variables
        - File List files: list of files to be read
    @returns None
 */
async function read_files(files) {
    var text = '';
    for (var f of Object.values(files)) {
        var file_extension = f.name.split('.').pop();
        if ((file_extension in _delimiters)) {
            text += await read_fileblock(f);
            files_done.innerHTML += `✔️ ${f.name}<br>`;
        } else {
            files_done.innerHTML += `❌ ${f.name}<br>`;
        }
    }
    files_done.innerHTML += `<br><div class="center">✔️ Your Docs are ready!<div><br>`;
    download(text);
}

/*
    @name async read_fileblock
    @brief finds the comment blocks inside the file and uses them to create a markdown file for documentation
    @variables
        - File file: file that has to be parsed
    @returns String containing the markdown documentation that was extracted
 */
async function read_fileblock(file) {
    var text = await file.text();
    var file_blocks_list = {};
    var file_extension = file.name.split('.').pop();
    var blocks_in_file = get_only_comment_blocks(text, _multiline_delimiters[file_extension][0], _multiline_delimiters[file_extension][1], file_extension);
    if (blocks_in_file.length == 0) return "";
    for (var block_text of blocks_in_file) {
        var block = {}; /*contains all the attributes in a block*/
        for (var i = 0; i < block_text.length; i++) {
            var trimmed_text = block_text[i].trim();
            //trimmed_text = remove_comment_symbols(trimmed_text, _delimiters[file_extension]);
            var cases_list = split_by_delimiter(trimmed_text, field_delimiter);
            cases_list.splice(0, 1);
            for (var c of cases_list) {
                var str = c.trim();
                var split_index, case_name;
                if (i == 0) {
                    split_index = str.indexOf(" ");
                    case_name = str.substring(0, split_index).replace("\n", '').trim();
                }
                else {
                    split_index = str.indexOf("\n");
                    case_name = str.substring(str.indexOf(" "), split_index).replace("\n", '').trim();
                }
                var case_body = str.substring(split_index + 1);
                if (i == 0) case_body = case_body.trim();
                else case_body = case_body.replace('\n', '');
                //if (i != 0) case_body = case_body.replace(" ", '');
                if (i == 0)
                    block[case_name] = case_body;
                else {
                    if (!('codesnippets' in block))
                        block['codesnippets'] = [];
                    block['codesnippets'].push([case_name, case_body]);
                }
            }
        }
        file_blocks_list[block['name']] = block;
    }
    return to_md(file_blocks_list, file.name);
}

/*
    @name remove_comment_symbols
    @brief removes all the useless comment symbols within a comment block
    @variables
        - String text: contains the comment block
        - String List comment_symbols: list of comment symbols to be removed
    @returns String containing the comment block stripped of all the useless comment symbols
 */
function remove_comment_symbols(text, comment_symbols) {
    var split_text = text.split("\n");
    var new_text = '';
    for (var line of split_text) {
        var str_line = line;
        for (s of comment_symbols) {
            var indexes = indexOfAll(str_line, s);
            for (var i of indexes) {
                if (str_line[i - 1] == '\\') continue;
                str_line = str_line.substring(0, i) + str_line.substring(i + s.length);
            }
        }
        new_text += str_line.trim() + "\n";
    }
    return new_text;
}

/*
    @name de_escape
    @brief removed the escape characters
    @note this method is used to lean untouched the comment symbols within the code snippet blocks
    @variables
    - String text: string within which the escape characters need to be removed
    @returns String with escape characters removed
 */
function de_escape(text) {
    new_text = text.substring(0).replaceAll("\\", "");
    return new_text;
}

/*
    @name to_md
    @brief create a markdown file containing the extracted documentation
    @note the function goes through the comment blocks previously read and parsed (via the read_fileblock method) and 
    it builds step by step a file containing all the information of the comment block: this lets the use write only the comments
    on a file and afterwards the user can write automatically the documentation using this tool.
    @variables
        - JSONObject comments: contains all the comment blocks defined in the file
        - String file_name: the name of the file from which the comment blocks were extracted
    @returns String containing the documentation for the file
 */
function to_md(comments, file_name) {
    var file_extension = file_name.split('.').pop();
    var md_text = "";
    md_text += `# **${file_name}**\n`;
    for (var comment_block of Object.values(comments)) {
        if ('name' in comment_block)
            md_text += `## **${comment_block['name']}**\n`;
        if ('brief' in comment_block)
            md_text += `> ${comment_block['brief']}\n\n`;
        var keys = Object.keys(comment_block);
        if ('note' in comment_block)
            md_text += `${comment_block['note']}\n`;
        for (var i = keys.length - 1; i >= 0; i--) {
            if (keys[i] == "name" || keys[i] == "brief" || keys[i] == "note" || keys[i] == "codesnippets")
                keys.splice(i, 1);
        }
        if (keys.length > 0) {
            md_text += `|Field|Description|\n|:---:|:---|\n`;
            for (var k of keys) {
                attribute = comment_block[k];
                if (k != "brief" && k != "name" && k != "note") {
                    md_text += `|**${k.replaceAll("\r\n", "<br>")}**|${attribute.replaceAll("\r\n", "<br>")}|\n`;
                }
            }
        }
        if ('codesnippets' in comment_block) {
            for (var code of comment_block['codesnippets']) {
                var attribute = code[1];
                var k = code[0];
                md_text += `### ${k}\n`;
                md_text += "```";
                md_text += `${file_extension}${attribute.replaceAll("\r\n", " \n")}\n`;//de_escape(attribute).replaceAll("\r\n", " \n")}\n`;
                md_text += "```\n";
            }
        }
    }
    md_text += '---\n';
    return md_text;
}

/*
    @name download
    @brief this method download the documentation built with this tool
    @note this method simply assign to an `a` HTMLElement the data to be downloaded
    @variables
        - String text: the documentation to be downloaded
    @returns None
 */
function download(text) {
    document.getElementById("loading").style.display = "none";
    var element = document.getElementById('download-btn');//document.createElement('a');
    //element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('<style>*{font-family:\'Consolas ligaturized v2\';}</style>\n' + text));
    var to_download = text + '\ngenerated with [EasyGen](http://easygen.altervista.org/) - [On Github](https://github.com/dede-amdp/easygen).';
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(to_download));
    element.setAttribute('download', 'documentation.md');
}