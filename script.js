 document.addEventListener('DOMContentLoaded', function() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('visible');
        }, 100 * (index + 1));
    });
})