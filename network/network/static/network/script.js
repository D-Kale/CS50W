import { Create, Show, SpecificUser, loadFollowingPosts, EditPost, LikePost, setupLikeButtons } from "../network/fetchs.js/";

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
                        SpecificUser(userId);
                    });
                });
            });
        });
    }

    document.querySelector("#CreatePost").addEventListener("submit", function(event) {
        event.preventDefault();
        CreatePost(event);
    });

    Show().then(posts => {
        posts.forEach(postdata => {
            const postId = postdata.id;
            const userId = postdata.senderId;

            document.querySelector("#post-" + postId).addEventListener("click", function() {
                ShowUser(userId);
            });

            const likeButton = document.querySelector(`#like-post-${postId}`);
            if (likeButton) {
                likeButton.addEventListener("click", () => {
                    LikePost(postId);
                });
            }

            const editButton = document.querySelector(`#edit-post-${postId}`);
            if (editButton) {
                editButton.addEventListener("click", function() {
                    const postId = this.getAttribute("data-id");
                    loadPostIntoForm(postId);
                });
            }
            
        });
    });

    setupLikeButtons(); 
});


function CreatePost(event) {
    event.preventDefault();

    const postId = document.querySelector("#post-id").value;
    const content = document.querySelector("#content").value;

    const formData = new FormData();
    formData.append("content", content);

    if (postId) {
        EditPost(formData, postId);
    } else {
        Create(formData);
    }
    
    // Limpiar campos del formulario
    document.querySelector("#post-id").value = "";
    document.querySelector("#content").value = '';
}

function ShowUser(id) {
    document.querySelector("#post-space").style.display = "none";
    document.querySelector("#user-space").style.display = "block";
    SpecificUser(id);
}

function loadPostIntoForm(postId) {
    fetch(`/api/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            document.querySelector("#BlockPostText").innerHTML = "Edit Post"
            document.querySelector("#post-id").value = post.id;
            document.querySelector("#content").value = post.postText;
        })
        .catch(error => {
            console.error("Error al cargar el post:", error);
        });
}
