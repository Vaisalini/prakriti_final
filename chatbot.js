
const responses = {
    welcome: "Welcome to Prakriti! Do you wish to take up dosha quiz?",
    quizStart: "Great! Let's get started with the dosha quiz.",
    question1: "My natural frame can best be described as?\nAnswer Choices:\na.) Slight and narrow\nb.) Average, with good muscle tone\nc.) Sturdy and strong",
    question2: "My lifelong tendency with weight has been\nAnswer Choices:\na.) I typically don’t gain weight easily, or I have trouble keeping it on\nb.) I can gain or lose weight easily, depending on what I focus on\nc.) I tend to gain weight easily and can have difficulty losing it",
    question3: "Most of my life, my body temperature has felt:\nAnswer Choices:\na.) Cold—my hands and feet are usually cold and I prefer warm environments\nb.) Warm—I am usually warm regardless of the season and prefer cool environments\nc.) Comfortable—I am adaptable to most temperatures",
    question4: "In general, my appetite is:\nAnswer Choices:\na.) Inconsistent—my hunger fluctuates and I tend to nibble, or sometimes forget to eat\nb.) Strong—I feel ravenous and can get irritable if I eat late; I don’t like to skip meals\nc.) Steady—I tend to feel full for a while after meals and can comfortably delay eating if I need to",
    question5: "In general, my stamina over the day is:\nAnswer Choices:\na.) Mild—I tend to start strong with lots of energy, but lose steam\nb.) Average—but I can push myself with a mind-over-matter attitude when needed\nc.) Enduring—I have great stamina but don’t typically like to test it",
    doshaResult: "Based on your answers, your predominant dosha is: ",
    farewell: "Thank you for taking the dosha quiz! Your responses have been recorded.",
    default: "I'm sorry, I didn't understand that. Can you please choose 'yes' or 'no'?",
};

// Flag to track the state of the conversation
let quizStarted = false;
let currentQuestion = 1;
let userAnswers = [];

function sendMessage() {
    var userInput = document.getElementById('user-input');
    var message = userInput.value.trim().toLowerCase();

    if (message !== '') {
        appendMessage('user', message);

        // Process user input and provide responses
        var response = processInput(message);

        // Simulate a typing delay before showing the response
        setTimeout(function () {
            appendMessage('bot', response);
        }, 500);

        userInput.value = '';
    }
}

function processInput(message) {
    message = message.toLowerCase();

    if (!quizStarted) {
        // Check if the user wants to take the dosha quiz
        if (message.includes('yes')) {
            quizStarted = true;
            return responses.quizStart + '\n' + responses.question1;
        } else if (message.includes('no')) {
            quizStarted = false;
            return responses.farewell;
        } else {
            return responses.welcome;
        }
    } else {
        // Process quiz questions and record user answers
        switch (currentQuestion) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                if (message.includes('a') || message.includes('b') || message.includes('c')) {
                    userAnswers.push(message.toUpperCase());
                    currentQuestion++;
                    if (currentQuestion <= 5) {
                        return responses['question' + currentQuestion];
                    } else {
                        quizStarted = false;
                        // Determine dosha based on answers
                        var doshaResult = determineDosha();
                        return doshaResult;
                    }
                } else {
                    return responses.default;
                }
            default:
                return responses.default;
        }
    }
}

function determineDosha() {
    // Count occurrences of A, B, and C in user answers
    var countA = userAnswers.filter(answer => answer === 'A').length;
    var countB = userAnswers.filter(answer => answer === 'B').length;
    var countC = userAnswers.filter(answer => answer === 'C').length;

    // Determine dosha based on the highest count
    var doshatype;
    if (countA > countB && countA > countC) {
        doshatype = "VATTA";
    } else if (countB > countA && countB > countC) {
        doshatype = "PITTA";
    } else if(countA===countB && countA > countC){
        doshatype = "VATTA-PITTA";
    } else if(countB===countC && countC > countA){
        doshatype = "PITTA-KAPHA";
    
    }else if(countA===countC && countA > countB){
        doshatype = "VATTA-KAPHA";
    }
    else {
        doshatype = "KAPHA";
    }

    // Now, you can push the doshatype to your Firebase database
    var user = firebase.auth().currentUser;
            if (user) {
                var userId = user.uid;
                database.ref('users/patients/' + userId).update({
                    doshatype: doshatype
                });
            }

    // Add a line with a link for more details
    var detailsMessage = "Based on your answers, your predominant dosha is: " + doshatype +
                        "&nbsp;<a href='javascript:redirectDoshaPage(\"" + doshatype.toLowerCase() + "\")'>(Click here)</a> &nbsp for more details.";


    return detailsMessage;
}

// Function to redirect to dosha-specific pages
function redirectDoshaPage(doshaType) {
    var pageName = doshaType.toLowerCase() + '.html';
    window.location.href = pageName;
}

function appendMessage(sender, message) {
    var chatBox = document.getElementById('chat-box');
    var newMessage = document.createElement('div');
    newMessage.className = sender + "-container"; // Add a class for styling

    // Create a container for the logo and message content
    var contentContainer = document.createElement('div');
    contentContainer.className = 'content-container';

    // Create an image element for the logo (only for bot messages)
    if (sender === 'bot') {
        var logoContainer = document.createElement('div');
        logoContainer.className = 'logo-container';

        var logo = document.createElement('img');
        logo.src = 'botlogo.png'; // Set the path to your logo image
        logoContainer.appendChild(logo);

        contentContainer.appendChild(logoContainer);
    }

    // Create a div for the message content
    var messageDiv = document.createElement('div');
    messageDiv.className = sender + '-message';
    messageDiv.innerHTML = message; // Use innerHTML to render the link as clickable

    // Append the message content to the content container
    contentContainer.appendChild(messageDiv);

    // Append the content container to the new message div
    newMessage.appendChild(contentContainer);

    chatBox.appendChild(newMessage);

    // Scroll to the bottom to show the latest message
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.addEventListener("DOMContentLoaded", function () {
    const inputField = document.getElementById("user-input");

    inputField.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent form submission or default action
            sendMessage();      // Call your message handling function
        }
    });
});
