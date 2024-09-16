function ChangePage(url) {
    document.body.classList.add('hidden');
    
    setTimeout(function() {
        window.location.href = url
    }, 500); 
}