const auth = firebase.auth();
const database = firebase.database();

// Declare a global variable to store user information
let currentUserInfo;

// Check if the user is logged in
auth.onAuthStateChanged(function (user) {
  if (user) {
      // User is signed in
      displayUserInfo(user.uid);
  } else {
      // No user is signed in
      window.location.href = 'index.html'; // Redirect to login page if not logged in
  }
});

// Function to display user information on the dashboard
function displayUserInfo(userId) {
    // Check if the user exists in the patients sub-branch
    var patientsRef = database.ref('users/patients/' + userId);
    patientsRef.once('value')
      .then(function (patientsSnapshot) {
        if (patientsSnapshot.exists()) {
          currentUserInfo = patientsSnapshot.val();
          displayUserDataOnDashboard();
        } else {
          // Check if the user exists in the doctors sub-branch
          var doctorsRef = database.ref('users/doctors/' + userId);
          doctorsRef.once('value')
            .then(function (doctorsSnapshot) {
              if (doctorsSnapshot.exists()) {
                currentUserInfo = doctorsSnapshot.val();
                displayUserDataOnDashboard();
              } else {
                // Handle the case where user data doesn't exist in either branch
                console.error('User data not found in patients or doctors branch');
              }
            })
            .catch(function (error) {
              console.error('Error retrieving user information:', error);
            });
        }
      })
      .catch(function (error) {
        console.error('Error retrieving user information:', error);
      });
  }
  
  // Function to display user data on the dashboard
  function displayUserDataOnDashboard() {
    console.log(currentUserInfo);
    document.getElementById('full-name').innerText += currentUserInfo.full_name;
    document.getElementById('email').innerText += currentUserInfo.email;
    document.getElementById('gender').innerText += currentUserInfo.gender;
    document.getElementById('age').innerText += currentUserInfo.age;
    document.getElementById('address').innerText += currentUserInfo.address;
    // Additional fields can be displayed as needed
  }
  
