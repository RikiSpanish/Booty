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

    // Function to add typing indicator
    function addTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot typing-indicator';
        messageDiv.id = 'typing-indicator';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = 'Typing...';
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Function to call Gemini API through Vercel function
    async function callGeminiAPI(userMessage) {
        const systemPrompt = "You are a helpful and conversational AI assistant. Please respond in a friendly, engaging manner while being informative and helpful.";
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    systemPrompt: systemPrompt
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.response) {
                return data.response;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error calling API:', error);
            return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
        }
    }

    // Function to send message
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, true);
            messageInput.value = '';
            
            // Disable input while processing
            messageInput.disabled = true;
            sendButton.disabled = true;
            
            // Add typing indicator
            addTypingIndicator();
            
            try {
                // Call Gemini API through Vercel function
                const botResponse = await callGeminiAPI(message);
                
                // Remove typing indicator and add bot response
                removeTypingIndicator();
                addMessage(botResponse, false);
            } catch (error) {
                removeTypingIndicator();
                addMessage("I'm sorry, something went wrong. Please try again.", false);
            } finally {
                // Re-enable input
                messageInput.disabled = false;
                sendButton.disabled = false;
                messageInput.focus();
            }
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !messageInput.disabled) {
            sendMessage();
        }
    });

    // Focus on input when page loads
    messageInput.focus();
});