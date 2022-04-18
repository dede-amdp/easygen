# **read_file.js**
## **Introduction**
> This tool can be used to generate documentation starting from the comments written into a coding file.

By selecting one or more files, this tool will parse through the files looking for comments blocks **containing at least the \@name field within them**:
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
## **Definitions**
> These are the variable definitions for the file

|Field|Description|
|:---:|:---|
|**variables**|- List files: list of files used to create the documentation<br>        - HTMLElement file_sel: file selector HTML element used to select the files<br>        - HTMLElement files_done: used to show the user which file have been parsed<br>        - String List code_del: contains the code snippet delimiters `\@codestart` and `\@codeend`<br>        - String field_delimiter: contains the fields delimiter `\@`<br>        - JSONObject _delimiters: contains the delimiters of the comments for each language;<br>                                    Put first the delimiters that use more characters (order is important)<br>        - JSONObject _multiline_delimiters: contains the starting and ending delimiters of the multiline comments|
## **ChangeEventListener**
> Event listener attached to the file_sel variable to read the files once they are selected and loaded

The event listener uses the read method to read the files and extract from them the documentation.
## **indexOfAll**
> finds all the indexes of the pattern specified within the string

|Field|Description|
|:---:|:---|
|**variables**|- String str: the string that needs to be checked<br>    - String pattern: pattern to search for within the string|
|**returns**|Integer List of all the indexes|
## **escape_string**
> escapes all the comment symbols

using the file extension the method looks for comment symbols and escapes them so that they can be ignored in the `remove_comment_symbols` method
|Field|Description|
|:---:|:---|
|**variables**|- String string: string within which the character have to be escaped<br>    - String file_extension: extension of the file used to check which comment symbols need to be used|
|**returns**|String with the comment symbols escaped|
## **get_only_comment_blocks**
> extracts only the block comments from the file

|Field|Description|
|:---:|:---|
|**variables**|- String text: file text<br>        - String start_del: delimiter used to find the start of the comment block<br>        - String end_del: delimiter used to find the end of the comment block|
|**returns**|String List containing only the comment blocks|
### include code snippets
```js        // it uses the code delimiters \@codestart and \@codeend (contained in the variable code_del) to check where the code 
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
```
## **split_by_delimiter**
> splits a comment block by using a delimiter (if not escaped)

|Field|Description|
|:---:|:---|
|**variables**|- String text: comment block text<br>        - String del: delimiter used to divide the comment block|
|**returns**|String List containing all the strings into which the comment block was divided|
## **async read_files**
> reads and parses all the files in a file list and then starts the download of the documentation extracted from them

|Field|Description|
|:---:|:---|
|**variables**|- File List files: list of files to be read|
|**returns**|None|
## **async read_fileblock**
> finds the comment blocks inside the file and uses them to create a markdown file for documentation

|Field|Description|
|:---:|:---|
|**variables**|- File file: file that has to be parsed|
|**returns**|String containing the markdown documentation that was extracted|
## **remove_comment_symbols**
> removes all the useless comment symbols within a comment block

|Field|Description|
|:---:|:---|
|**variables**|- String text: contains the comment block<br>        - String List comment_symbols: list of comment symbols to be removed|
|**returns**|String containing the comment block stripped of all the useless comment symbols|
## **de_escape**
> removed the escape characters

this method is used to lean untouched the comment symbols within the code snippet blocks
|Field|Description|
|:---:|:---|
|**variables**|- String text: string within which the escape characters need to be removed|
|**returns**|String with escape characters removed|
## **to_md**
> create a markdown file containing the extracted documentation

the function goes through the comment blocks previously read and parsed (via the read_fileblock method) and 
    it builds step by step a file containing all the information of the comment block: this lets the use write only the comments
    on a file and afterwards the user can write automatically the documentation using this tool.
|Field|Description|
|:---:|:---|
|**variables**|- JSONObject comments: contains all the comment blocks defined in the file<br>        - String file_name: the name of the file from which the comment blocks were extracted|
|**returns**|String containing the documentation for the file|
## **download**
> this method download the documentation built with this tool

this method simply assign to an `a` HTMLElement the data to be downloaded
|Field|Description|
|:---:|:---|
|**variables**|- String text: the documentation to be downloaded|
|**returns**|None|
---

generated with [EasyGen](http://easygen.altervista.org/) - [On Github](https://github.com/dede-amdp/easygen).