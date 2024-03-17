




document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    fetchComments();
});

function fetchComments() {
    console.log('Fetching comments...');
    fetch('/comments')
    .then(response => response.json())
    .then(comments =>{
        const commentsSection = document.getElementById('comments-section');
         if(commentsSection) {
            renderComments(comments);
         } else {
            console.error('Element with ID  "comments-section" not found.');
         }
        
    })
    .catch(error=> console.error('Error fetching comments:', error));
}

function renderComments(comments) {
    const commentsSection = document.getElementById('comments-section');
    commentsSection.innerHTML = '';

    comments.forEach (comment => {
        const commentElement = document.createElement('div');
        commentElement.innerHTML = `<strong>${comment.author}:</strong> ${comment.text}`;
        commentsSection.appendChild(commentElement);

    });
}

function submitComment() {
    const authorInput = document.getElementById('author');
    const textInput = document.getElementById('commentText');

    const newComment = {
        author: authorInput.value,
        text: textInput.value,
    };

    fetch('/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newComment),    
    })
    .then(response => response.json())
    .then(comment => {
        fetchComments();
        authorInput.value = '';
        textInput.value = '';
    })
    .catch(error => console.error('Error submitting comment:', error));
}

/* SEARCH FUNCTIONALITY */


function performSearch() {
    const searchQuery = document.getElementById('searchInput').value;

    console.log('Performing search for: searchQuery');

    // document.getElementById('searchInput').value = '';

    // const searchResultsContainer = document.getElementById('searchResultsContainer');
    // searchResultsContainer.innerHTML = '';

    fetch(`/search?q=${encodeURIComponent(searchQuery)}`)
    .then(response => response.json())
    .then(searchResults => {
        console.log('Search results:', searchResults);

        // searchResults.forEach(result => {
        //     const resultElement = document.createElement('div');
        //     resultElement.textContent = result.title;
        //     searchResultsContainer.appendChild(resultElement);
        // });
     const resultsContainer = document.getElementById('searchResultsContainer');
     resultsContainer.innerHTML = 'Search results:' + 
     searchResults.map(page => `<a href="${page.url}">${page.title}</a>`).join(',');   
    })
    .catch(error => console.error('Error fetching search results:', error));
    return false;
}

/* REGISTRATION FUNCTION*/

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
    registerForm.addEventListener('submit', performRegistration);
    }
});

async function performRegistration(event) {
    if (event) {
    event.preventDefault();
    }
    
    console.log('Registration form submitted');

    const emailInput = document.getElementById('emailInput');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');

    const newUser = {
        email: emailInput.value,
        username: usernameInput.value,
        password: passwordInput.value,
    };

    fetch('/register', {
        method: 'POST',
        headers: {
            'content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);

        if (data.success) {
            alert(data.message);
        } else {
            alert('Registration failed. please try again.');
        }
    })
    .catch(error => {
        console.error('Error during registration:', error);

        alert('An error occured during registration. please try again later.');
    });
}

/* LOGIN FUNCTION*/

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', performLogin);
    }
});

async function performLogin(event) {
    if (event) {
        event.preventDefault();
    }

    console.log('Login form submitted');

    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');

    const credentials = {
        username: usernameInput.value,
        password: passwordInput.value,
    };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        const data = await response.json();

        console.log(data);

        if (data.success) {
            alert(data.message);
            window.location.href = '/profile.html';
        } else {
            alert('Login failed. Please check your credentials.');
        }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occured during login. Please try again later.');
        }
    }

    /* POSTING RECIPES FUNCTION */

    document.addEventListener('DOMContentLoaded', () => {
        const postForm = document.getElementById('postForm');
        const postsContainer = document.getElementById('postsContainer');
        const logoutButton = document.getElementById('logoutButton');

        if (postForm) {
            postForm.addEventListener('submit', createPost);
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                window.location.href = '/logout';
            });
        }

        fetchUserPosts();
    });

    

    function createPost(event) {
        if (event.target.id === 'postForm') { 
        event.preventDefault();

        const postContent = document.getElementById('postContent').value;
        const postImage = document.getElementById('postImage').files[0];

        const formData = new FormData();
        formData.append('postContent', postContent);
        formData.append('postImage', postImage);

        fetch('/create-post', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            fetchUserPosts();
        })
        .catch(error => {
            console.error('Error creating post:', error);
        });
    }
}

    function fetchUserPosts() {
        fetch('/user-posts')
        .then(response => response.json())
        .then(posts => {
            console.log('Fetched posts:', posts);
            const postsContainer = document.getElementById('postsContainer');
            postsContainer.innerHTML ='';
            if (Array.isArray(posts)) {
            posts.forEach(post => {
                const postElement = document.createElement('div');
                
                const contentElement = document.createElement('p');
                contentElement.textContent = `Content: ${post.content}`;

                const createdAt = new Date(post.created_at);
                const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    timeZoneName: 'short'
                }).format(createdAt);

                

                const imageElement = document.createElement('img');
                imageElement.src = post.imageUrl;
                imageElement.alt = 'Post Image';

                const createElement = document.createElement('p');
                createElement.textContent = `Created at: ${formattedCreatedAt}`;
                

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => editPost(post.id, post.content));

                function editPost(postId, currentContent) {
                    const newContent = prompt('Edit your post:', currentContent);

                    if (newContent !== null) {
                        fetch(`/edit-post/${postId}`, {
                            method: 'POST',
                            headers: {
                                'content-Type': 'application/json',
                            },
                            body: JSON.stringify({newContent}),
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log(data);
                            fetchUserPosts();
                    })
                    .catch(error => {
                        console.error('Error editing post:', error);
                });
                }
                }

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deletePost(post.id));

                function deletePost(postId) {
                    const confirmDelete = confirm('Are you sure you want to delete this post?');

                    if (confirmDelete) {
                    fetch(`/delete-post/${postId}`, {
                        method: 'DELETE',
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        fetchUserPosts();
                    })
                    .catch(error => {
                    console.error('Error deleting post:', error);
                    });
                    }
                    }
                
                postElement.appendChild(contentElement);
                postElement.appendChild(imageElement);
                postElement.appendChild(createElement);
                postElement.appendChild(editButton);
                postElement.appendChild(deleteButton);

                postsContainer.appendChild(postElement);
            });
        } else {
            console.error('Invalid posts data:', posts);
        }         
            })
            .catch(error => {
                console.error('Error fetching user posts:', error);
            });
    }

    function editPost(postId) {
        console.log(`Editing post with ID: ${postId}`);
    }

    function deletePost(postId) {
        console.log(`Deleting post with ID: ${postId}`)
    }

    // BLOG PAGE
    document.addEventListener('DOMContentLoaded', () => {
        const blogPostsContainer = document.getElementById('blogPostsContainer');
        const commentForm = document.getElementById('commentForm');

        
        fetch('/blog-posts')
            .then(response => response.json())
            .then(posts => {
                if (Array.isArray(posts)) {
                    posts.forEach(post => {
                        const postElement = document.createElement('article');

                        const contentElement = document.createElement('p');
                        contentElement.textContent = post.content;

                        const imageElement = document.createElement('img');
                        imageElement.src = post.imageUrl;
                        imageElement.alt = 'Post Image';

                        const createdAtElement = document.createElement('p');
                        const createdAt = new Date(post.created_at);
                        const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric',
                            timeZoneName: 'short'
                        }).format(createdAt);

                        createdAtElement.textContent = `created at: ${formattedCreatedAt}`;

                        const commentForm = document.createElement('form');
                        commentForm.innerHTML = `
                            <textarea id="commentContent" placeholder="Add a comment"></textarea>
                            <button type="submit">Add Comment</button>
                            `;
                        const commentsContainer = document.createElement('div');

                        console.log('Fetching comments for post', post.id);
                        function fetchUserPosts() {
                        fetch(`/post-comments/${post.id}`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`Error fetching comments for post ${post.id}`);
                                }
                                return response.json();
                            })
                                .then(comments => {
                                    console.log('Fetched comments:', comments);
                                    if (comments && comments.length > 0) {
                                        comments.forEach(comment => {
                                            const commentElement = document.createElement('div');
                                            const username = comment.username || '';
                                            const content = comment.content || 'No content';
                                            commentElement.textContent = `${username}: ${content}`;
                                            commentsContainer.appendChild(commentElement);

                                            
                                    });
                                } else {
                                    console.log('no comments found for post', post.id);
                                  } 
                                })
                                .catch(error => {
                                    console.error(error.message);
                            });
                        }

                        commentForm.addEventListener('submit', (event) => {
                            event.preventDefault();
                            
                            const commentContent = document.getElementById('commentContent').value;
                        

                            console.log('Submitting comment for post', post.id);
                            fetch(`/add-comment/${post.id}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ content: commentContent, content: commentContent} ),
                            })
                                .then(response => response.json())
                                .then(data => {
                                    console.log('Comment added successfully', data);
                                    fetchUserPosts();
                                })
                                .catch(error => {
                                    console.error('Error adding comment:', error);
                                });
                        });

                        postElement.appendChild(contentElement);
                        postElement.appendChild(imageElement);
                        postElement.appendChild(createdAtElement);
                        postElement.appendChild(commentForm);
                        postElement.appendChild(commentsContainer);


                        blogPostsContainer.appendChild(postElement);
                    });
                } else {
                    console.error('Invalid posts data:', posts);
                }
            })
            .catch(error => {
                console.error('Error fetching blog posts:', error);
            });
        });

     
        
  

