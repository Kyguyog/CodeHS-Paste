document.getElementById("generateBtn").addEventListener("click", () => {
  const code = document.getElementById("code").value;

  // Escape backticks and backslashes
  const escapedCode = code.replace(/\\/g, "\\\\").replace(/`/g, "\\`");

  // Escape ${ } sequences to avoid template literal conflicts
  const safeCode = escapedCode.replace(/\$\{/g, "\\${");

  // Generate the JavaScript command
  const command = `var editor = ace.edit(document.querySelector(".ace_editor"));\n` +
                  `editor.setValue(\`${safeCode}\`);\n` +
                  `editor.clearSelection();`;

  document.getElementById("output").value = command;

  // Auto-select for easy copy
  document.getElementById("output").select();
});