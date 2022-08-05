/*
To make formatting the documentation easier the function used to format each field are separated from the rest of the code
*/
function format_name(name) {
    return `\n## ${name}`;
}

function format_brief(brief) {
    return `\n> ${brief}`;
}

function format_notes(notes) {
    return `\n${notes}`;
}

function format_inputs(inputs) {
    return `\n### Inputs\n${inputs}`;
}

function format_outputs(outputs) {
    return `\n### Outputs\n${outputs}`;
}

function format_code(code) {
    return `\n\`\`\`c\n${code}\n\`\`\``;
}

function format_other(tag, content) {
    let name = ""
    for (let word of tag.split(" ")) {
        name += word[0].toUpperCase() + word.slice(1) + " ";
    }
    return `\n|**${name.trim()}**|${content}|`;
}