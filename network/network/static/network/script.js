import { Create, Show, SpecificUser, loadFollowingPosts } from "../network/fetchs.js/";

document.addEventListener("DOMContentLoaded", function() {

    document.querySelector("#user-space").style.display = "none";

    const followingLink = document.querySelector("#followingPage");
    if (followingLink) {
        followingLink.addEventListener("click", (event) => {
            event.preventDefault(); 
            
            loadFollowingPosts().then(data => {
                data.forEach(post => {
                    const postId = post.id;
                    const userId = post.senderId;
                    document.querySelector("#post-" + postId).addEventListener("click", function() {
                        ShowUser(userId)
                    })
                })
            });
        });        
    }

    document.querySelector("#CreatePost").addEventListener("submit", function(event) {
        CreatePost(event);
    });

    Show().then(posts => {
        posts.forEach(postdata => {
            const postId = postdata.id;
            const userId = postdata.senderId;
            document.querySelector("#post-" + postId).addEventListener("click", function() {
                ShowUser(userId);
            });
        });
    });
    

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

function ShowUser(id) {
    document.querySelector("#post-space").style.display = "none"
    document.querySelector("#user-space").style.display ="block"

    SpecificUser(id)
}