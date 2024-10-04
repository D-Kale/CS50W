import { Create, Show } from "../network/fetchs.js/";

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#CreatePost").addEventListener("submit", function(event) {
        CreatePost(event);  // Pasar el evento aquí
    });
    
    Show()
});

function CreatePost(event){
    event.preventDefault();

    const content = document.querySelector("#content").value;
    const privacy = document.querySelector("#privacy").value;
    const images = document.querySelector("#images").files;

    const formData = new FormData();
    formData.append("content", content);
    formData.append("privacy", privacy);

    for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
    }

    Create(formData);

    document.querySelector("#content").value = '';
    document.querySelector("#privacy").value = 'PU';
    document.querySelector("#images").value = '';

}
