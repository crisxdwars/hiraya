const textbox = document.getElementById('codeEditor');
const resultBox = document.getElementById('output');
const compileButton = document.getElementById('compileBtn');
const clearButton = document.getElementById('clearBtn');
const copyButton = document.getElementById('copyBtn');
const languagePicker = document.getElementById('languageSelect');
const editorTitle = document.getElementById('editorTitle');
const outputTitle = document.getElementById('outputTitle');


function checkJavaCode(userCode) {
    const problemsFound = [];
    const allLines = userCode.split('\n');
    if (!userCode.includes('class')) {
        problemsFound.push('Warning: No class definition found');
    }
    const leftBrackets = (userCode.match(/{/g) || []).length;
    const rightBrackets = (userCode.match(/}/g) || []).length;
    if (leftBrackets !== rightBrackets) {
        problemsFound.push(`Error: Unbalanced braces (${leftBrackets} opening, ${rightBrackets} closing)`);
    }
    const leftParens = (userCode.match(/\(/g) || []).length;
    const rightParens = (userCode.match(/\)/g) || []).length;
    if (leftParens !== rightParens) {
        problemsFound.push(`Error: Unbalanced parentheses (${leftParens} opening, ${rightParens} closing)`);
    }
    if (userCode.includes('class') && !userCode.includes('main')) {
        problemsFound.push('Warning: No main method found');
    }
    
    allLines.forEach((currentLine, idx) => {
        const cleanLine = currentLine.trim();
        if (cleanLine.length > 0 && 
            !cleanLine.startsWith('//') && 
            !cleanLine.startsWith('/*') && 
            !cleanLine.startsWith('*') &&
            !cleanLine.startsWith('import') &&
            !cleanLine.startsWith('package') &&
            !cleanLine.endsWith('{') && 
            !cleanLine.endsWith('}') && 
            !cleanLine.endsWith(';') &&
            cleanLine !== '') {
            
            if (!cleanLine.match(/^(public|private|protected|static|final|class|interface|enum|if|else|for|while|do|switch|case|default|try|catch|finally|return)/)) {
                problemsFound.push(`Line ${idx + 1}: Possible missing semicolon`);
            }
        }
    });
    
    return problemsFound;
}
function runJavaCode(userCode) {
    try {
        const outputMessages = [];
        const mainMethodMatch = userCode.match(/public\s+static\s+void\s+main\s*\([^)]*\)\s*{([\s\S]*?)(?:}\s*$|}\s*(?:public|private|protected|static))/m);
        
        if (!mainMethodMatch) {
            return {
                success: false,
                output: 'Error: No main method found'
            };
        }
        
        let mainCode = mainMethodMatch[1];
        
        const methodRegex = /(?:public|private|protected)?\s*static\s+(\w+)\s+(\w+)\s*\(([^)]*)\)\s*{([^}]*)}/g;
        const methods = {};
        let methodMatch;
        
        while ((methodMatch = methodRegex.exec(userCode)) !== null) {
            const returnType = methodMatch[1];
            const methodName = methodMatch[2];
            const params = methodMatch[3];
            const body = methodMatch[4];
            
            if (methodName !== 'main') {
                methods[methodName] = { returnType, params, body };
            }
        }
        
        mainCode = mainCode.replace(/System\.out\.println\s*\(\s*([^)]+)\s*\)\s*;/g, (match, content) => {
            return `__javaLog(${content});`;
        });
        
        mainCode = mainCode.replace(/System\.out\.print\s*\(\s*([^)]+)\s*\)\s*;/g, (match, content) => {
            return `__javaPrint(${content});`;
        });
        
        mainCode = mainCode.replace(/\b(String|int|double|float|boolean|long|char)\s+/g, 'let ');
        
        Object.keys(methods).forEach(methodName => {
            const method = methods[methodName];
            const paramNames = method.params.split(',').map(p => p.trim().split(/\s+/).pop()).filter(p => p);
            
            let functionBody = method.body;
            functionBody = functionBody.replace(/\b(String|int|double|float|boolean|long|char)\s+/g, 'let ');
            functionBody = functionBody.replace(/return\s+/g, 'return ');
            
            const functionCode = `const ${methodName} = (${paramNames.join(', ')}) => { ${functionBody} };`;
            mainCode = functionCode + '\n' + mainCode;
        });
        
        const logFunction = `
            const __javaLog = (...args) => {
                outputMessages.push(args.map(arg => String(arg)).join(''));
            };
            const __javaPrint = (...args) => {
                if (outputMessages.length === 0) {
                    outputMessages.push('');
                }
                outputMessages[outputMessages.length - 1] += args.map(arg => String(arg)).join('');
            };
        `;
        
        eval(logFunction + mainCode);
        
        if (outputMessages.length > 0) {
            return {
                success: true,
                output: outputMessages.join('\n')
            };
        } else {
            return {
                success: true,
                output: 'Program executed successfully (no output)'
            };
        }
    } catch (err) {
        return {
            success: false,
            output: `Runtime Error: ${err.message}`
        };
    }
}

languagePicker.addEventListener('change', (e) => {
    const pickedLanguage = e.target.value;
    textbox.value = starterCodes[pickedLanguage];
    resultBox.innerHTML = '<div class="output-empty">Run your code to see output here...</div>';
});

compileButton.addEventListener('click', () => {
    const whatUserWrote = textbox.value;
    const currentLanguage = languagePicker.value;
    
    resultBox.innerHTML = '';

    if (!whatUserWrote.trim()) {
        resultBox.innerHTML = '<div class="output-error">Error: No code to run!</div>';
        return;
    }

    if (currentLanguage === 'java') {
        resultBox.innerHTML = '<div class="output-warning">Running Java code...</div>';
        
        setTimeout(() => {
            const result = runJavaCode(whatUserWrote);
            
            if (result.success) {
                resultBox.innerHTML = `<div class="output-success">${result.output}</div>`;
            } else {
                resultBox.innerHTML = `<div class="output-error">${result.output}</div>`;
            }
        }, 500);
        return;
    }

    resultBox.innerHTML = '<div class="output-warning">Compiling C# code...</div>';

    setTimeout(() => {
        const foundProblems = checkCSharpCode(whatUserWrote);
        
        if (foundProblems.length > 0) {
            let msg = '<div class="output-error">Compilation Results:</div>\n';
            foundProblems.forEach(problem => {
                const isJustWarning = problem.startsWith('Warning');
                const whichClass = isJustWarning ? 'output-warning' : 'output-error';
                msg += `<div class="${whichClass}">${problem}</div>\n`;
            });
            
            if (!foundProblems.some(e => e.startsWith('Error'))) {
                msg += '\n<div class="output-success">✓ Compilation successful with warnings!</div>';
                msg += '\n<div style="color: #6b7280; margin-top: 1rem;">Note: This is a basic syntax validator. For full compilation and execution, use a C# compiler.</div>';
            }
            
            resultBox.innerHTML = msg;
        } else {
            resultBox.innerHTML = `<div class="output-success">✓ C# code compiled successfully!</div>
<div class="output-success">✓ No syntax errors detected</div>

<div style="color: #6b7280; margin-top: 1rem;">Note: This is a basic syntax validator. For full compilation and execution, use:</div>
<div style="color: #9ca3af; margin-top: 0.5rem; font-family: 'JetBrains Mono', monospace;">
csc YourFile.cs
YourFile.exe
</div>`;
        }
    }, 800);
});

clearButton.addEventListener('click', () => {
    textbox.value = '';
    resultBox.innerHTML = '<div class="output-empty">Run your code to see output here...</div>';
});

copyButton.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(textbox.value);
        const oldText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        copyButton.style.backgroundColor = '#10b981';
        setTimeout(() => {
            copyButton.textContent = oldText;
            copyButton.style.backgroundColor = '#374151';
        }, 2000);
    } catch (err) {
        resultBox.innerHTML = '<div class="output-error">Failed to copy code</div>';
    }
});

textbox.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const whereItStarts = textbox.selectionStart;
        const whereItEnds = textbox.selectionEnd;
        textbox.value = textbox.value.substring(0, whereItStarts) + '    ' + textbox.value.substring(whereItEnds);
        textbox.selectionStart = textbox.selectionEnd = whereItStarts + 4;
    }
});

textbox.addEventListener('input');
textbox.addEventListener('scroll', scrollTogether);

textbox.value = starterCodes.java;