let savedpasttext = [];
let savedpastresponse = [];

// Get elements
const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// Create dialogue window
const addMessage = (message, role, imgSrc) => {
  const messageElement = document.createElement('div');
  const textElement = document.createElement('p');
  messageElement.className = `message ${role}`;

  const imgElement = document.createElement('img');
  imgElement.src = imgSrc;

  textElement.innerText = message;

  messageElement.appendChild(imgElement);
  messageElement.appendChild(textElement);
  messagesContainer.appendChild(messageElement);

  const clearDiv = document.createElement("div");
  clearDiv.style.clear = "both";
  messagesContainer.appendChild(clearDiv);
};

// Call backend model
const sendMessage = async (message) => {
  addMessage(message, 'user', '../static/user.jpeg');

  // Loading animation
  const loadingElement = document.createElement('div');
  const loadingtextElement = document.createElement('p');
  loadingElement.className = 'loading-animation';
  loadingtextElement.className = 'loading-text';
  loadingtextElement.innerText = 'Loading....Please wait';

  messagesContainer.appendChild(loadingElement);
  messagesContainer.appendChild(loadingtextElement);

  async function makePostRequest(msg) {
    const url = "/chatbot";  // ✅ FIXED
    const requestBody = { prompt: msg };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      return await response.text();
    } catch (error) {
      console.error('Error:', error);
      return "Server error";
    }
  }

  const res = await makePostRequest(message);

  // Remove loading animation
  loadingElement.remove();
  loadingtextElement.remove();

  addMessage(res, 'aibot', '../static/Bot_logo.png');
};

// Submit handler
messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (message !== '') {
    messageInput.value = '';
    await sendMessage(message);
  }
});

