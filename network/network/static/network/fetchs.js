import { follow, fetchData, updatePagination, renderPost } from "../notRendered.js";

export function Show(page = 1) {
    return fetchData(`/api/posts?page=${page}`)
    .then(data => {
        const postsContainer = document.querySelector("#Posts");
        postsContainer.innerHTML = "";

        const postdata = data.posts;
        const currentUser = data.current_user;

        postdata.forEach(post => {
            postsContainer.innerHTML += renderPost(post, currentUser);
        });

        updatePagination(data);
        return postdata;
    });
}

export function SpecificUser(id) {
    return fetchData(`/users/${id}`)
    .then(user => {
        const UserContainer = document.querySelector("#User");
        const userId = user.id;

        UserContainer.innerHTML = `
        <div class="container">
            <div class="row justify-content-center mb-5">
                <div class="w-100">
                    <div class="card text-center">
                        <div class="card-body">
                            <img src="https://api.dicebear.com/6.x/initials/svg?seed=JD" alt="User" width="150" height="150" class="rounded-circle mb-3">
                            <h2 class="card-title">${user.name}</h2>

                            <div class="d-flex justify-content-center mb-3 justify-content-around">
                                <span class="me-3"><strong id="followersCount">${user.followers.length}</strong> followers</span>
                                <span><strong id="followingCount">${user.following.length}</strong> following</span>
                            </div>
                            
                            <form method="post" id="followUser">
                                <button class="btn ${user.is_following ? 'btn-danger' : 'btn-primary'}" id="followBtn" data-following="${user.is_following}">
                                    ${user.is_following ? 'Unfollow' : 'Follow'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h1>Posts</h1>
                <div id="userPosts"></div>
            </div>
        </div>
        `;

        user.posts = user.posts.reverse();
        const currentUser = user.current_user;

        const userPostsContainer = document.querySelector("#userPosts");
        user.posts.forEach(post => {
            userPostsContainer.innerHTML += renderPost(post, currentUser);
        });

        user.posts.forEach(post => {
            const postId = post.id;

            const likeButton = document.querySelector(`#like-post-${postId}`);
            likeButton.addEventListener("click", () => {
                LikePost(postId).then(() => {
                    const likeCountElement = document.querySelector(`#like-count-${postId}`);
                    if (likeCountElement) {
                        likeCountElement.innerHTML = post.likes;
                    }
                });
            });

            const editButton = document.querySelector(`#edit-post-${postId}`);
            if (editButton) {
                editButton.addEventListener("click", function() {
                    loadPostIntoForm(postId);
                });
            }
        });

        const followForm = document.querySelector('#followUser');
        followForm.addEventListener('submit', (event) => { 
            event.preventDefault();
            follow(event, userId);
        });

        return user.posts;
    });
}

export function loadFollowingPosts() {
    return fetchData("/api/following-posts")
    .then(data => {
        const postdata = data.posts;
        const postsContainer = document.querySelector("#Posts");

        document.querySelector("#post-space").style.display = "block";
        document.querySelector("#user-space").style.display = "none";

        postsContainer.innerHTML = "";
        const currentUser = data.current_user;

        if (postdata.length > 0) {
            postdata.forEach(post => {
                postsContainer.innerHTML += renderPost(post, currentUser);
            });
            return postdata;
        } else {
            postsContainer.innerHTML = "<p>No posts from users you follow.</p>";
        }
    })
    .catch(error => console.error('Error:', error));
}

export function Create(formData) {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch("/api/createPost", {
        method: "POST",
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

export function EditPost(formData, postId) {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(`/api/editPost/${postId}`, {
        method: "POST",
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        if (result.message) {
            console.log("Post updated successfully.");
        } else if (result.error) {
            console.log(`Error: ${result.error}`);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

export function LikePost(postid) {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    return fetch(`/likepost/${postid}`, {
        method: "POST",
        headers: {
            'X-CSRFToken': csrftoken
        },
    })
    .then(response => response.json())
    .then(data => {
        const likeButton = document.querySelector(`#like-post-${postid}`);
        const likeCountElement = document.querySelector(`#like-count-${postid}`);

        if (!data.liked) {
            likeButton.innerHTML = `<i class="bi bi-suit-heart-fill"></i> ${data.likes}`;
            likeButton.classList.remove('btn-outline-primary');
            likeButton.classList.add('btn-danger');
        } else {
            likeButton.innerHTML = `<i class="bi bi-suit-heart"></i> ${data.likes}`;
            likeButton.classList.remove('btn-danger');
            likeButton.classList.add('btn-outline-primary');
        }

        if (likeCountElement) {
            likeCountElement.innerHTML = data.likes;
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

export function setupLikeButtons() {
    document.addEventListener('click', function(event) {
        if (event.target.matches('[id^="like-post-"]')) {
            const postId = event.target.id.split('-')[2];
            LikePost(postId);
        }
    });
}



window.Show = Show;