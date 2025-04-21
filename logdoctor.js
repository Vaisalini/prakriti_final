
document.addEventListener("DOMContentLoaded", function () {
    
    const auth = firebase.auth();
    const database = firebase.database();
    let currentUserInfo;

    // Check if the user is logged in
    auth.onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in
            getUserInfo(user.uid);
            displayAppointments();
        } else {
            // No user is signed in
            window.location.href = 'welcome.html'; // Redirect to login page if not logged in
        }
    });

    function getUserInfo(userId) {
        var userRef = database.ref('users/doctors/' + userId);

        userRef.once('value')
            .then(function (snapshot) {
                currentUserInfo = snapshot.val();
                console.log(currentUserInfo);
            })
            .catch(function (error) {
                console.error('Error retrieving user information:', error);
            });
    }

    // Function to display appointments on the dashboard
    function displayAppointments() {
        const appointmentsRef = database.ref("appointments");

        // Retrieve all appointments
        appointmentsRef.once('value')
            .then(function (snapshot) {
                const appointmentsContainer = document.getElementById('bookedSlotsContainer');

                // Clear existing content
                appointmentsContainer.innerHTML = '';

                snapshot.forEach(function (childSnapshot) {
                    const appointmentData = childSnapshot.val();
                    if (appointmentData.doctorName === currentUserInfo.full_name) {
                        // Create a table row for each appointment
                        const appointmentRow = document.createElement('tr');

                        // Populate the row with appointment details
                        appointmentRow.innerHTML = `
                            <td>${appointmentData.name}</td>
                            <td>${appointmentData.date}</td>
                            <td>${appointmentData.time}</td>
                            <td>${appointmentData.serviceType}</td>
                            
                        `;

                        // Append the row to the table
                        appointmentsContainer.appendChild(appointmentRow);
                    }
                });
            })
            .catch(function (error) {
                console.error('Error retrieving appointments:', error);
            });
    }

   
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
});


