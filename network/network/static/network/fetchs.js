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

export function Show() {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch("/api/posts", {
        method: "GET",
        headers: {
            'X-CSRFToken': csrftoken
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(posts => {
        const postsContainer = document.querySelector("#Posts");
        postsContainer.innerHTML = "";  // Limpiar contenido previo

        posts.forEach(post => {
            postsContainer.innerHTML += `
            <div class="card mb-4">
                <div class="card-header">
                    <div class="post-header">
                        <span class="font-weight-bold">@${post.sender}</span>
                    </div>
                </div>
                <div class="card-body pb-0">
                    <p class="mb-0">${post.postText}</p>
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
        });
    })
    .catch(error => {
        console.error("Error:", error);
    });
}
