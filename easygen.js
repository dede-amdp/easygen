/*
#@
@name: EasyGen
@notes: EasyGen can be used to extract comments and generate documentation from any code file. To use it, just add in **multiline comments** the characters `#@` to start the documentation section and `@#` to end it.
Within the start and end symbols, **fields** can be defined by using _tags_: each tag is defined by using the `@` character followed by a string without spaces and ended with the `:` character, after which the contents of the field can be added.
There are special tags that behave in a specific way:
* name: it is used to define the name of the method/section that is currently being defined;
* brief: it is the summary of what the section being described does;
* notes: can be used to explain in detail the section taken into consideration;
* inputs/outputs: used to describe the inputs and the outputs of a method.
Other tags can be used and their contents will be added to a table.
Code snippets can be added to the documentation by using the `#@codestart@#` and `#@codeend@#` symbols, used to indicate which part of the code has to be included as snippets in the documentation.
## Installation
If you want to create a desktop app for your personal use, just use this:

```console
git clone https://github.com/dede-amdp/easygen.git
cd easygen
npm install
npm start
```
## Contributing
You are free to clone and modify the repository, I archived the repo just because I don't know how to use github (no joke, I wouldn't know how to manage pull requests etc...)

## How to Start the app
Just use this command within the cloned repo or find the `out` folder and find the executable file.
```console
npm start
```
@#
*/

/*
#@
@name: Global Definitions
@notes: It's the section where the global variables are defined:
- list files: it's a list that will contain all the files uploaded by the user;
- HTMLElement file_sel: points to the file selector on the page;
- HTMLElement files_done: points to the paragraph that will contain the list of used files;
Also, an event listener is attached to the file selector:
@#
*/
var files = [];
const file_sel = document.getElementById('file-selector');
const files_done = document.getElementById('files-done-par');

/* #@codestart@# */
// the event listener attached to the file selector
file_sel.addEventListener('change', async (event) => {
    files = event.target.files; // get the files list
    document.getElementById("loading").style.display = "block"; // show the loading animation
    files_done.innerHTML = ''; // reset the files_done paragraph
    await read_files(files); // start reading files
});
/* #@codeend@# */

/*
#@
@name: read_files
@brief: it reads each file and generates the documentation
@notes: from each file, the function will extract the documentation based on the `#@` and `@#` symbols: everything between these two symbols will be taken into consideration
@inputs:
- list files: list of files to use to generate the documentation;
@outputs:
the function does not return any value but it will run the `download` function.
@#
*/
async function read_files(files) {
    var text = '';
    for (var f of Object.values(files)) {
        /* #@codestart@# */
        let documentation = generate_docs(await f.text());
        /* #@codeend@# */
        if (documentation != "") {
            let title = f.name.split(".")[0];
            text += `# ${title[0].toUpperCase() + title.slice(1)}\n${documentation}\n---\n`;
            files_done.innerHTML += `✔️ ${f.name}<br>`;
        } else {
            files_done.innerHTML += `❌ ${f.name}<br>`;
        }
    }
    files_done.innerHTML += `<br><div class="center">✔️ Your Docs are ready!<div><br>`;
    download(text);
}

function download(text) {
    document.getElementById("loading").style.display = "none";
    var element = document.getElementById('download-btn');
    var to_download = text + '\ngenerated with [EasyGen](http://easygen.altervista.org/) - [On Github](https://github.com/dede-amdp/easygen).';
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(to_download));
    element.setAttribute('download', 'documentation.md');
}

/*
#@
@name: generate_docs
@brief: Generated the documentation extracting the comments data from the file
@notes: it will read the chosen file and will look for the `#@`, which indicates the start of a documentation block,
then it will divide it in fields, that start with a tag of the time `@tag-name`, then the extracted fields will be used to 
create the documentation
@inputs:
- string string: the contents of the chosen file
@outputs:
- string result: the generated documentation 
@#
*/
function generate_docs(string) {
    let documentation = lexer(string);
    let result = "";
    for (let fields of documentation) {
        let description =
            `${fields.name != undefined ? format_name(fields.name) : ""}` +
            `${fields.brief != undefined ? format_brief(fields.brief) : ""}\n` +
            `${fields.notes != undefined ? format_notes(fields.notes) : ""}` +
            `${fields.inputs != undefined ? format_inputs(fields.inputs) : ""}\n` +
            `${fields.outputs != undefined ? format_outputs(fields.outputs) : ""}\n`;
        excluded = ["name", "brief", "notes", "inputs", "outputs"];
        let table = "";
        for (let field of Object.keys(fields)) {
            if (!excluded.includes(field)) {
                if (field.substring(0, field.length - 1) == "_code_snippet_") {
                    description += format_code(fields[field]) + "\n";
                } else {
                    if (table == "") table = `|Field Name|Description|\n|:---:|:---:|\n`;
                    table += format_other(field, fields[field]) + "\n";
                }
            }
        }
        result += `\n${description} \n${table}\n---`;
    }
    return result;
}