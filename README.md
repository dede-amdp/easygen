# Easygen


## EasyGen

EasyGen can be used to extract comments and generate documentation from any code file. To use it, just add in **multiline comments** the characters `#@` to start the documentation section and `@#` to end it.
 Within the start and end symbols, **fields** can be defined by using _tags_: each tag is defined by using the `@` character followed by a string without spaces and ended with the `:` character, after which the contents of the field can be added.
 There are special tags that behave in a specific way:
 * name: it is used to define the name of the method/section that is currently being defined;
 * brief: it is the summary of what the section being described does;
 * notes: can be used to explain in detail the section taken into consideration;
 * inputs/outputs: used to describe the inputs and the outputs of a method.
 Other tags can be used and their contents will be added to a table.
 Code snippets can be added to the documentation by using the `#@codestart@# and `#@codeend@#` symbols, used to indicate which part of the code has to be included as snippets in the documentation.

 

---

## Global Definitions

It's the section where the global variables are defined:
 - list files: it's a list that will contain all the files uploaded by the user;
 - HTMLElement file_sel: points to the file selector on the page;
 - HTMLElement files_done: points to the paragraph that will contain the list of used files;
 Also, an event listener is attached to the file selector:


```c
// the event listener attached to the file selector
file_sel.addEventListener('change', async (event) => {
files = event.target.files; // get the files list
document.getElementById("loading").style.display = "block"; // show the loading animation
files_done.innerHTML = ''; // reset the files_done paragraph
await read_files(files); // start reading files
});
```
 

---

## read_files
> it reads each file and generates the documentation

from each file, the function will extract the documentation based on the `#@` and `@#` symbols: everything between these two symbols will be taken into consideration
### Inputs
- list files: list of files to use to generate the documentation;

### Outputs
the function does not return any value but it will run the `download` function.

```c
let documentation = generate_docs(await f.text());
```
 

---

## generate_docs
> Generated the documentation extracting the comments data from the file

it will read the chosen file and will look for the `#@`, which indicates the start of a documentation block,
 then it will divide it in fields, that start with a tag of the time `@tag-name`, then the extracted fields will be used to 
 create the documentation
### Inputs
- string string: the contents of the chosen file

### Outputs
- string result: the generated documentation
 

---
---
# Lexer


## Lexer

this file contains the method used to extract the documentation from the code.

 

---

## Global Definitions
> definitions of the global variables

the only global variable defined is `tokens` containing the tokens used to find the sections of the documentation.


```c
const tokens = {
open_token: "#@",
close_token: "@#",
tag_token: "@",
description_token: ":",
cs_token: "#@codestart@#",
ce_token: "#@codeend@#"
};
```
 

---

## lexer
> takes the text as input and finds each section

### Inputs
- string text: file content;

### Outputs
- string tagged: documentation of the file divided by tags.
 

---

## extract
> extracts each section and code snippet from the code

it looks for the `#@` and `@#` symbols and for the `#@codestart@#` and `#@codeend@#` to divide the comments and take only what's denoted as documentation
### Inputs
- list tokenized: file content split by space;

### Outputs
- list data: a list containing each field of the documentation.
 

---

## merge
> merges and sorts the fields of the documentation and the code snippets

### Inputs
- list comments: list of each field indexes taken from the file;
 - list code_sections: list of the code sections indexes;

### Outputs
- list indexes: sorted list of all the indexes.
 

---

## indexize
> finds the starting and ending indexes based on the delimiters `start` and `end`

it uses the delimiters as arguments to create a list of javascript objects containing the starting and ending indexes of each field
### Inputs
- list tokenized: list of strings taken from the file contents divided by space;
 - string start: starting delimiter;
 - string end: ending delimiters;

### Outputs
- list indexes: list of starting and ending indexes of each field.
 

---

## tag
> takes each field and and divides them in tags and contents

### Inputs
- list extracted: list of the extracted fields;

### Outputs
- list tagged: list of javascript objects containing each field (tag=key).
 

---
---

generated with [EasyGen](http://easygen.altervista.org/) - [On Github](https://github.com/dede-amdp/easygen).