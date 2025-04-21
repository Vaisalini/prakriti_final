const auth = firebase.auth();
const database = firebase.database();

// Logout function
function logout() {
    auth.signOut().then(() => {
        // Redirect to index.html after successful logout
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Error during logout:", error);
    });
}

// Attach the logout function to the logout button click event
document.querySelector('.logout').addEventListener('click', logout);