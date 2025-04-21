const auth = firebase.auth();
const database = firebase.database();

function populateDoctorOptions() {
    const doctorsSelect = document.getElementById("preferredDoctor");

    // Reference to the "users" node in the database
    const usersRef = database.ref('users/doctors');

    // Fetch doctors' names
    usersRef.orderByChild('occupation').equalTo('doctor').once('value')
        .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                const doctorName = childSnapshot.val().full_name;
                const option = document.createElement("option");
                option.value = doctorName;
                option.text = doctorName;
                doctorsSelect.appendChild(option);
            });
        })
        .catch(function (error) {
            console.error('Error retrieving doctor names:', error);
        });
}

// Call the function to populate doctor options
populateDoctorOptions();

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("slotBookingForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Get form data
        const patientName = document.getElementById("patientName").value;
        const date = document.getElementById("appointmentDate").value;
        const time = document.getElementById("appointmentTime").value;
        const serviceType = document.getElementById("appointmentType").value;
        const doctorName = document.getElementById("preferredDoctor").value;

        // Validate the data (you can add your own validation logic here)
        const currentDate = new Date();
        const selectedDate = new Date(date + " " + time);
        
        if (selectedDate <= currentDate) {
            alert("Please select a future date and time.");
            return;
        }

        // Validate the time
        const selectedTime = selectedDate.getHours();
        if (selectedTime < 9 || selectedTime >= 20) {
            alert("Please select a time between 9 am and 8 pm.");
            return;
        }

        // Create a reference to the "appointments" node in your database
        const appointmentsRef = database.ref("appointments");

        // Push the data to the database
        appointmentsRef.push({
            name: patientName,
            date: date,
            time: time,
            serviceType: serviceType,
            doctorName: doctorName,
        })
        .then(() => {
            console.log("Data successfully written to the database");
        })
        .catch((error) => {
            console.error("Error writing to the database:", error);
        });

        // Reset the form
        form.reset();

        alert("Slot booked successfully!");
    });
});
