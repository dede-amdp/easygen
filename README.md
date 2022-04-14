<style>*{font-family:'Consolas ligaturized v2';}</style>

# read_file.js Description

## **Introduction**

**This tool can be used to generate documentation starting from the comments written into a coding file.**

By selecting one or more files, this tool will parse through the files looking for comments blocks **containing at least the \@brief and \@name fields within them**:
if a block like that is found, this tool will automatically extract the comment block and insert it into a markdown file formatting it in the following way:

# name

** brief ...**
note ...
|Attribute|Description|
|:---:|:---|
|attribute name|attribute description|
|attribute name|attribute description|
...
|attribute name|attribute description|
\-\-\- <- line

If more than one file is provided, each file will be parsed and concatenated to the previous one, but each file "section" will start with its name.
Right now this tool only supports the C style comments but in future it might support other languages.

Because the output file is a markdown file, markdown syntax and HTML can be used as well within the comments.

## **Definitions**

**These are the variable definitions for the file**

|   Attribute   | Description                                                                                                                                  |
| :-----------: | :------------------------------------------------------------------------------------------------------------------------------------------- |
| **variables** | - List files: list of files used to create the documentation<br> - HTMLElement file_sel: file selector HTML element used to select the files |

## **ChangeEventListener**

**Event listener attached to the file_sel variable to read the files once they are selected and loaded**

The event listener uses the read method to read the files and extract from them the documentation.

## **get_only_comment_blocks**

**extracts only the block comments from the file**

|   Attribute   | Description                                                                                                                                                                      |
| :-----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **variables** | - String text: file text<br> - String start_del: delimiter used to find the start of the comment block<br> - String end_del: delimiter used to find the end of the comment block |
|  **returns**  | String List containing only the comment blocks                                                                                                                                   |

## **split_by_delimiter**

**splits a comment block by using a delimiter (if not escaped)**

|   Attribute   | Description                                                                                    |
| :-----------: | :--------------------------------------------------------------------------------------------- |
| **variables** | - String text: comment block text<br> - String del: delimiter used to divide the comment block |
|  **returns**  | String List containing all the strings into which the comment block was divided                |

## **async read_files**

**reads and parses all the files in a file list and then starts the download of the documentation extracted from them**

|   Attribute   | Description                                 |
| :-----------: | :------------------------------------------ |
| **variables** | - File List files: list of files to be read |
|  **returns**  | None                                        |

## **async read_fileblock**

**finds the comment blocks inside the file and uses them to create a markdown file for documentation**

|   Attribute   | Description                                                     |
| :-----------: | :-------------------------------------------------------------- |
| **variables** | - File file: file that has to be parsed                         |
|  **returns**  | String containing the markdown documentation that was extracted |

## **remove_comment_symbols**

**removes all the useless comment symbols within a comment block**

|   Attribute   | Description                                                                                                        |
| :-----------: | :----------------------------------------------------------------------------------------------------------------- |
| **variables** | - String text: contains the comment block<br> - String List comment_symbols: list of comment symbols to be removed |
|  **returns**  | String containing the comment block stripped of all the useless comment symbols                                    |

## **to_md**

**create a markdown file containing the extracted documentation**

the function goes through the comment blocks previously read and parsed (via the read_fileblock method) and
it builds step by step a file containing all the information of the comment block: this lets the use write only the comments
on a file and afterwards the user can write automatically the documentation using this tool.
|Attribute|Description|
|:---:|:---|
|**variables**|- JSONObject comments: contains all the comment blocks defined in the file<br> - String file_name: the name of the file from which the comment blocks were extracted|
|**returns**|String containing the documentation for the file|

## **download**

**this method download the documentation built with this tool**

this method simply creates an `a` HTMLElement to download the text that then gets destroyed (leaving the dom untouched)
|Attribute|Description|
|:---:|:---|
|**variables**|- String text: the documentation to be downloaded|
|**returns**|None|

---
