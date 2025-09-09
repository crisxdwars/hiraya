 document.addEventListener('DOMContentLoaded', function() {
    
    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const codeBlock = button.closest('.code-container').querySelector('.code-block code');
            const textToCopy = codeBlock.innerText;

            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        });
    });

});