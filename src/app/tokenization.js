const strAuthYourVariable = 'YOUR_AUTHORIZATION_TOKEN';

// Function to display messages in specific areas
function displayMessage(message, elementId) {
    document.getElementById(elementId).textContent = JSON.stringify(message, null, 2);
}

// Function executed when the IFrame is rendered successfully
function onShieldconexRendered() {
    // This function should not be used to indicate success, but to handle post-render logic.
    // Display a message to indicate iframe rendering.
    displayMessage('IFrame rendering initiated.', 'iframe-render-status');
}

// Function executed when an error occurs
function onShieldconexError(error) {
    displayMessage({ error: error.message }, 'error-messages');
}

// Function executed when a token is received
function onShieldconexToken(tokenData) {
    displayMessage(tokenData, 'token-data');
    console.log('Token Data:', tokenData);

    // Send a request to read the tokenized data
    axios({
        method: 'post',
        headers: {
            "Authorization": strAuthYourVariable,
            "Accept": 'application/json',
            "Content-Type": 'application/json'
        },
        url: 'https://secure-cert.shieldconex.com/api/tokenization/read',
        data: JSON.stringify({ "bfid": tokenData.bfid })
    }).then(function (response) {
        console.log('Got the tokens', response.data.values);
        displayMessage(response.data.values, 'tokenized-data');

        // Example function to get values based on the received token
        fnGetValues(tokenData.bfid, response.data.values);
    }).catch(function (error) {
        console.error('Error retrieving tokens:', error);
        displayMessage({ error: error.message }, 'error-messages');
    });
}

// Function to get real data values after tokenization
var fnGetValues = function (strBfid, arrValues) {
    axios({
        method: 'post',
        headers: {
            "Authorization": strAuthYourVariable,
            "Accept": 'application/json',
            "Content-Type": 'application/json'
        },
        url: 'https://secure-cert.shieldconex.com/api/tokenization/detokenize',
        data: JSON.stringify({ "bfid": strBfid, "values": arrValues })
    }).then(function (response) {
        console.log('Got the values', response.data.values);
        displayMessage(response.data.values, 'real-data-values');
    }).catch(function (error) {
        console.error('Error getting real data values:', error);
        displayMessage({ error: error.message }, 'error-messages');
    });
};

// Event listener for the "Go" button
document.getElementById('loadIframeBtn').addEventListener('click', function () {
    // Get the template ID from the input box
    var templateId = document.getElementById('templateIdInput').value;

    // Check if templateId is not empty
    if (templateId) {
        // ShieldConex IFrame Configuration
        var config = {
            baseUrl: 'https://secure-cert.shieldconex.com',
            templateId: templateId,
            parent: 'frame1',
            attributes: {
                width: "600px",
                height: "600px",
                frameborder: 0
            }
        };

        // Create and render the ShieldConex IFrame
        var scfr = new ShieldconexIFrame(config);

        // Assign the functions from the external JavaScript file
        scfr.onRendered = onShieldconexRendered;
        scfr.onError = onShieldconexError;
        scfr.onToken = onShieldconexToken;

        // Render the IFrame
        scfr.render();
    } else {
        alert('Please enter a Template ID.');
    }
});

// Listen for messages from the iframe
window.addEventListener('message', function (event) {
    // Ensure the message is from the correct origin
    if (event.origin !== 'https://secure-cert.shieldconex.com') {
        return;
    }

    // Handle specific messages from the iframe
    if (event.data === 'templateLoaded') {
        displayMessage('Template loaded successfully.', 'iframe-render-status');
    } else if (event.data === 'templateNotFound') {
        displayMessage('Template not found. Please check the Template ID and try again.', 'error-messages');
    } else {
        displayMessage('Unknown message received: ' + event.data, 'error-messages');
    }
});
