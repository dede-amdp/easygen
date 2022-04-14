/**
 * @name Introduction
 * @brief This tool can be used to generate documentation starting from the comments written into a coding file.
 * @note By selecting one or more files, this tool will parse through the files looking for comments blocks **containing at least the \@brief and \@note fields within them**:
 * if a block like that is found, this tool will automatically extract the comment block and insert it into a markdown file formatting it in the following way:
 * # name
 * ** brief ...**
 * note ...
 * |Attribute|Description|
 * |:---:|:---|
 * |attribute name|attribute description|
 * |attribute name|attribute description|
 * ...
 * |attribute name|attribute description|
 *  \-\-\- <- line
 * 
 * If more than one file is provided, each file will be parsed and concatenated to the previous one, but each file "section" will start with its name.
 * Right now this tool only supports the C style comments but in future it might support other languages.
 * 
 * Because the output file is a markdown file, markdown syntax and HTML can be used as well within the comments.
 */

/**
 * @name Definitions
 * @brief These are the variable definitions for the file
 * @variables
 *      - List files: list of files used to create the documentation
 *      - HTMLElement file_sel: file selector HTML element used to select the files
 */
var files = [];
const file_sel = document.getElementById('file-selector');

/**
 * @name ChangeEventListener
 * @brief Event listener attached to the file_sel variable to read the files once they are selected and loaded
 * @note The event listener uses the read method to read the files and extract from them the documentation.
 */
file_sel.addEventListener('change', async (event) => {
    files = event.target.files;
    await read_files(files);
});



/**
 * @name get_only_comment_blocks
 * @brief extracts only the block comments from the file
 * @variables
 *      - String text: file text
 *      - String start_del: delimiter used to find the start of the comment block
 *      - String end_del: delimiter used to find the end of the comment block
 * @returns String List containing only the comment blocks
 */
function get_only_comment_blocks(text, start_del, end_del) {
    var to_return = [];
    var to_check = text.substring(0);
    while (to_check.length > 0 && (to_check.indexOf(start_del) > -1 && to_check.indexOf(end_del) > -1)) {
        var start_index = to_check.indexOf(start_del);
        var end_index = to_check.indexOf(end_del);
        var comment_block = to_check.substring(start_index, end_index + end_del.length);
        var no_space = comment_block.replaceAll(" ", "");
        if (no_space.includes("@") && no_space.includes("@brief") && no_space.includes("@name")) {
            to_return.push(comment_block);
        }
        to_check = to_check.substring(end_index + 1);
    }
    return to_return;
}

/**
 * @name split_by_delimiter
 * @brief splits a comment block by using a delimiter (if not escaped)
 * @variables
 *      - String text: comment block text
 *      - String del: delimiter used to divide the comment block
 * @returns String List containing all the strings into which the comment block was divided
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

/**
 * @name async read_files
 * @brief reads and parses all the files in a file list and then starts the download of the documentation extracted from them
 * @variables
 *      - File List files: list of files to be read
 * @returns None
 */
async function read_files(files) {
    var text = '';
    for (var f of Object.values(files)) {
        text += await read_fileblock(f);
    }
    download(text);
}

/**
 * @name async read_fileblock
 * @brief finds the comment blocks inside the file and uses them to create a markdown file for documentation
 * @variables
 *      - File file: file that has to be parsed
 * @returns String containing the markdown documentation that was extracted
 */
async function read_fileblock(file) {
    var text = await file.text();
    var file_blocks_list = {};
    var blocks_in_file = get_only_comment_blocks(text, "/*", "*/");
    blocks_in_file.forEach(block_text => {
        var block = {}; /*contains all the attributes in a block*/
        var trimmed_text = block_text.trim();
        trimmed_text = remove_comment_symbols(trimmed_text, ["/*", "*/", "//", "*", "/"]);
        var cases_list = split_by_delimiter(trimmed_text, "@");
        cases_list.splice(0, 1);
        //console.log(cases_list);
        cases_list.forEach(c => {
            var str = c.trim();
            var split_index = str.indexOf(" ");
            var case_name = str.substring(0, split_index).replace("\n", '').trim();
            var case_body = str.substring(split_index + 1).trim();
            block[case_name] = case_body;
        });
        file_blocks_list[block['name']] = block;
    });
    return to_md(file_blocks_list, file.name);
}

/**
 * @name remove_comment_symbols
 * @brief removes all the useless comment symbols within a comment block
 * @variables
 *      - String text: contains the comment block
 *      - String List comment_symbols: list of comment symbols to be removed
 * @returns String containing the comment block stripped of all the useless comment symbols
 */
function remove_comment_symbols(text, comment_symbols) {
    var split_text = text.split("\n");
    var new_text = '';
    /*console.log(split_text);*/
    split_text.forEach(line => {
        var str_line = line;
        comment_symbols.forEach(s => str_line = str_line.replace(s, ''));
        new_text += str_line + "\n";
    });
    return new_text;
}

/**
 * @name to_md
 * @brief create a markdown file containing the extracted documentation
 * @note the function goes through the comment blocks previously read and parsed (via the read_fileblock method) and 
 * it builds step by step a file containing all the information of the comment block: this lets the use write only the comments
 * on a file and afterwards the user can write automatically the documentation using this tool.
 * @variables
 *      - JSONObject comments: contains all the comment blocks defined in the file
 *      - String file_name: the name of the file from which the comment blocks were extracted
 * @returns String containing the documentation for the file
 */
function to_md(comments, file_name) {
    //console.log(comments)
    md_text = "";
    md_text += `# ${file_name} Description\n`;
    Object.values(comments).forEach(comment_block => {
        md_text += `## **${comment_block['name']}**\n`;
        md_text += `**${comment_block['brief']}**\n\n`;
        var keys = Object.keys(comment_block);
        if (comment_block['note'])
            md_text += `${comment_block['note']}\n`;
        for (var i = keys.length - 1; i >= 0; i--) {
            if (keys[i] == "name" || keys[i] == "brief" || keys[i] == "note")
                keys.splice(i, 1);
        }
        if (keys.length > 0) {
            md_text += `|Attribute|Description|\n|:---:|:---|\n`;
            for (var k of keys) {
                attribute = comment_block[k];
                if (k != "brief" && k != "name" && k != "note") {
                    md_text += `|**${k.replaceAll("\r\n", "<br>")}**|${attribute.replaceAll("\r\n", "<br>")}|\n`;
                }
            }
        }
    });
    md_text += '---';
    return md_text;
}

/**
 * @name download
 * @brief this method download the documentation built with this tool
 * @note this method simply creates an `a` HTMLElement to download the text that then gets destroyed (leaving the dom untouched)
 * @variables
 *      - String text: the documentation to be downloaded
 * @returns None
 */
function download(text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('<style>*{font-family:\'Consolas ligaturized v2\';}</style>\n' + text));
    element.setAttribute('download', 'documentation.md');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}