const messagesCollection = 'fakemessages1';
const sentMessagesCollection = 'messages';

const chatDiv = document.getElementById('chat');
const firstName = document.getElementById('fname');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');

async function fetchMessages() {
    const response = await pb.collection(messagesCollection).getFullList(); 
    return response;
}

function displayMessages(messages) {
	if(messages.length === 0) return;
    chatDiv.innerHTML = ''; 

    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${msg.username}: ${msg.content}`; 
		chatDiv.appendChild(messageElement);
    });
}

async function sendMessage(content, username) {
	const data = {
		"username": username,
		"content": content,
		"created_at": new Date().toISOString()
	};

	await pb.collection(sentMessagesCollection).create(data);

	cacheMessage(username, content);
    sessionStorage.setItem('hasSentMessage', 'true'); // Store state in sessionStorage
}

function cacheMessage(username, content) {
	const messagesCache = JSON.parse(localStorage.getItem('localMessages')) || [];
	messagesCache.push({ username, content, created_at: new Date().toISOString() });
	localStorage.setItem('localMessages', JSON.stringify(messagesCache));
}

function disableInputFields() {
    messageInput.disabled = true;
    sendButton.disabled = true;
    messageInput.placeholder = "Message already sent";
}

function enableInputFields() {
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.placeholder = "Type a message...";
}

sendButton.addEventListener('click', async () => {
    const message = messageInput.value.trim();
	const username = firstName.value.trim();

    if (sessionStorage.getItem('hasSentMessage') === 'true') {
        alert("You have already sent a message!");
        return;
    }

    if (message) {
        await sendMessage(message, username);
        disableInputFields();
        messageInput.value = ''; 
        await loadMessages();
    }
});

async function loadMessages() {
	const localMessages = JSON.parse(localStorage.getItem('localMessages')) || [];
    const messages = await fetchMessages();
	
    displayMessages([...messages, ...localMessages]);
}

window.resetSession = function () {
    sessionStorage.removeItem('hasSentMessage');
    localStorage.clear();
    enableInputFields();
    console.log("Session reset. You can send a message again.");
};


// Check session storage on page load
if (sessionStorage.getItem('hasSentMessage') === 'true') {
    disableInputFields(); // Disable inputs if the user has already sent a message
} else {
    enableInputFields(); // Ensure inputs are enabled if no message has been sent
}


setInterval(loadMessages, 5000);

loadMessages();
