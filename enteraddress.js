
document.addEventListener("DOMContentLoaded", function () {
    const auth = firebase.auth();
const database = firebase.database();

    // Define the submitAddress function
    function submitAddress() {
        const newAddress = document.getElementById('doctorAddress').value;

        // Get the current user
        const user = auth.currentUser;

        if (user) {
            const userId = user.uid;

            // Update address in 'doctors' section
            const doctorRef = database.ref('users/doctors/' + userId);
            doctorRef.update({
                address: newAddress
            })
            .then(function () {
                console.log('Address updated successfully for doctor.');
                alert("Address updated successfully");

                // Redirect back to the doctor dashboard or perform other actions as needed
                window.location.href = 'logdoctor.html';
            })
            .catch(function (error) {
                console.error('Error updating address for doctor:', error);
            });
        }
    }

    // Add an event listener to the submit button
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.addEventListener('click', submitAddress);
    }
});
