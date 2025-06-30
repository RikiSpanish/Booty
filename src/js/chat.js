document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const chatTitle = document.getElementById('chatTitle');

    // Get portfolio name from URL hash
    const portfolioName = window.location.hash.substring(1) || 'portfolio';
    chatTitle.textContent = `${portfolioName.charAt(0).toUpperCase() + portfolioName.slice(1)} Chat`;

    // Function to add message to chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to send message
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, true);
            messageInput.value = '';
            
            // Simulate bot response (you can replace this with actual bot logic)
            setTimeout(() => {
                const responses = [
                    "That's an interesting question! Let me think about that.",
                    "Thanks for your message! I'd be happy to help with that.",
                    "Great point! This project involved a lot of creative problem-solving.",
                    "I appreciate your interest in my work!",
                    "That's exactly the kind of challenge I enjoy working on."
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(randomResponse, false);
            }, 1000);
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Focus on input when page loads
    messageInput.focus();
});