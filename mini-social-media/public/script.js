const currentUserId = 1;

// Load posts
async function loadPosts() {

    const response = await fetch("/api/posts");

    const posts = await response.json();

    const postsContainer =
        document.getElementById("posts");

    postsContainer.innerHTML = "";

    posts.forEach(post => {

        const postElement =
            document.createElement("div");

        postElement.className = "post";

        postElement.innerHTML = `
            <h3>@${post.username}</h3>

            <p>${post.content}</p>

            <p>
                ❤️ ${post.likes} Likes
            </p>

            <button
                class="like-btn"
                onclick="likePost(${post.id})">
                Like
            </button>

            <button
                onclick="addComment(${post.id})">
                Comment
            </button>
        `;

        postsContainer.appendChild(postElement);
    });
}

// Create post
async function createPost() {

    const content =
        document.getElementById("postContent").value;

    if (content.trim() === "") {
        alert("Please enter a post");
        return;
    }

    const response = await fetch("/api/posts", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            user_id: currentUserId,
            content: content
        })

    });

    if (response.ok) {

        document.getElementById("postContent").value = "";

        loadPosts();

    } else {

        alert("Failed to create post");
    }
}

// Like post
async function likePost(postId) {

    const response = await fetch(
        `/api/posts/${postId}/like`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                user_id: currentUserId
            })
        }
    );

    if (response.ok) {
        loadPosts();
    } else {
        alert("Post already liked");
    }
}

// Add comment
async function addComment(postId) {

    const comment =
        prompt("Enter your comment:");

    if (!comment) {
        return;
    }

    await fetch(
        `/api/posts/${postId}/comments`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                user_id: currentUserId,
                comment: comment
            })
        }
    );

    alert("Comment added");
}

loadPosts();