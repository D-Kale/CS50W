import { follow, fetchData, updatePagination } from "../notRendered.js";

export function Show(page = 1) {
    return fetchData(`/api/posts?page=${page}`)
    .then(data => {
        const postsContainer = document.querySelector("#Posts");
        postsContainer.innerHTML = ""

        const postdata = data.posts;

        postdata.forEach(post => {
            postsContainer.innerHTML += renderPost(post)
        })
        
        updatePagination(data)

        return postdata

    })
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
                <div id="userPosts"> </div>
            </div>
        </div>
        `;

        user.posts = user.posts.reverse();

        user.posts.forEach(post => {
            document.querySelector("#userPosts").innerHTML += renderPost(post);
        });

        const followForm = document.querySelector('#followUser');
        followForm.addEventListener('submit', (event) => { follow(event, userId); });
    });
}

export function loadFollowingPosts() {
    return fetchData("/api/following-posts")
    .then(data => {

        const postsContainer = document.querySelector("#Posts");

        document.querySelector("#post-space").style.display = "block"
        document.querySelector("#user-space").style.display ="none"

        postsContainer.innerHTML = "";

        if (data.length > 0) {
            data.forEach(post => {
                postsContainer.innerHTML += renderPost(post)
            });
            return data
        } else {
            postsContainer.innerHTML = "<p>No posts from users you follow.</p>";
        }
    })
    .catch(error => console.error('Error:', error));
}

export function Create(formData){
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

function renderPost(post) {
    return `
    <div class="card mb-4">
        <div class="card-header">
            <div class="post-header">
                <span class="font-weight-bold" id="post-${post.id}">@${post.sender}</span>
            </div>
        </div>
        <div class="card-body pb-0">
            <p class="mb-0">${post.postText}</p>
            <br>
            <p class="mb-0">${post.timeData}</p>
        </div>
        <div class="card-footer">
            <div class="post-actions">
                <button class="btn">
                    <i class="bi bi-suit-heart"></i> ${post.likes}
                </button>
                <button class="btn">
                    <i class="bi bi-chat"></i>
                </button>
                <button class="btn">
                    <i class="bi bi-reply-fill"></i>
                </button>
            </div>
        </div>
    </div>
    `;
}