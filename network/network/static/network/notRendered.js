export function follow(event, userId) {
    event.preventDefault();

    const followBtn = document.querySelector('#followBtn');
    const isFollowing = followBtn.getAttribute('data-following') === 'true';

    fetch(`/follow/${userId}`, {
        method: "POST",
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(data.error);
        } else {
            
            if (isFollowing) {
                followBtn.textContent = 'Follow';
                followBtn.classList.remove('btn-danger');
                followBtn.classList.add('btn-primary');
                followBtn.setAttribute('data-following', 'false');
            } else {
                followBtn.textContent = 'Unfollow';
                followBtn.classList.remove('btn-primary');
                followBtn.classList.add('btn-danger');
                followBtn.setAttribute('data-following', 'true');
            }

            const followersCount = document.querySelector('#followersCount');
            const followingCount = document.querySelector('#followingCount');

            followersCount.innerHTML = data.followersCount;
            followingCount.innerHTML = data.followingCount;
        }
    })
    .catch(error => console.error('Error:', error));
}

export function fetchData(url, method = "GET") {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    return fetch(url, {
        method: method,
        headers: {
            'X-CSRFToken': csrftoken,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

export function renderPost(post, currentUser) {
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
                <button class="btn" id="like-post-${post.id}">
                    <i class="bi bi-suit-heart"></i> <span id="like-count-${post.id}">${post.likes}</span>
                </button>
                ${currentUser === post.sender ? `
                    <button class="btn edit-post" id="edit-post-${post.id}" data-id="${post.id}">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                ` : ` `
                }
            </div>
        </div>
    </div>
    `;
}


let currentPage = 1;

export function updatePagination(data) {
    const paginationContainer = document.querySelector("#pagination");
    paginationContainer.innerHTML = "";

    const totalPages = data.total_pages;

    if (data.has_previous) {
        const prevButton = document.createElement('button');
        prevButton.className = 'btn btn-primary mx-2';
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => Show(currentPage - 1));
        paginationContainer.appendChild(prevButton);
    }

    if (totalPages > 1) {
        for (let page = 1; page <= totalPages; page++) {
            const pageButton = document.createElement('button');
            pageButton.className = `btn ${page === currentPage ? 'btn-secondary' : 'btn-primary'} mx-2`;
            pageButton.textContent = page;
            pageButton.addEventListener('click', () => Show(page));
            paginationContainer.appendChild(pageButton);
        }
    }

    if (data.has_next) {
        const nextButton = document.createElement('button');
        nextButton.className = 'btn btn-primary mx-2';
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => Show(currentPage + 1));
        paginationContainer.appendChild(nextButton);
    }
}
