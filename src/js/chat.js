document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const chatTitle = document.getElementById('chatTitle');

    // Store conversation history
    let conversationHistory = [];

    // Get character name from URL hash
    const characterKey = window.location.hash.substring(1) || 'luffy';
    const character = CHARACTER_PROMPTS[characterKey] || CHARACTER_PROMPTS.luffy;
    
    // Character color scheme
    const characterColors = {
        luffy: '#E62C39',     // red
        zoro: '#28a745',      // green
        nami: '#fd7e14',      // orange
        usopp: '#ffc107',     // yellow
        sanji: '#007bff',     // blue
        chopper: '#e83e8c',   // pink
        robin: '#6f42c1',     // purple
        franky: '#17a2b8',    // light blue
        brook: '#343a40',     // black
        jinbe: '#CC7722'      // ochre
    };

    // Character image file extensions
    const characterImageExtensions = {
        luffy: 'png',
        zoro: 'jpg',
        nami: 'png',
        usopp: 'png',
        sanji: 'jpg',
        chopper: 'jpg',
        robin: 'jpg',
        franky: 'jpg',
        brook: 'jpg',
        jinbe: 'jpg'
    };

    // Set CSS custom properties for the current character
    const characterColor = characterColors[characterKey] || characterColors.luffy;
    document.documentElement.style.setProperty('--character-color', characterColor);
    
    // Update chat title with character name
    chatTitle.textContent = `${character.name} Chat`;

    // Clear fake chat history and add character-specific greeting
    function initializeChat() {
        chatMessages.innerHTML = '';
        conversationHistory = []; // Reset conversation history
        
        // Add character-specific greeting
        const greetings = {
            luffy: "Hey! I'm Luffy! I'm gonna be the Pirate King! Wanna join my crew? Do you have any meat?",
            zoro: "I'm Zoro. I'm training to become the world's greatest swordsman. What do you want?",
            nami: "Hi there! I'm Nami, the navigator. Are you here to discuss treasure maps or weather patterns?",
            usopp: "I am the great Captain Usopp! I have 8,000 followers and I've defeated countless enemies! ...Okay, maybe not that many, but I'm still brave!",
            sanji: "Welcome! I'm Sanji, the cook. Can I prepare something delicious for you? And if you're a beautiful lady... *heart eyes*",
            chopper: "H-hello! I'm Chopper, the doctor! Don't think I'm happy to meet you or anything! *does happy dance*",
            robin: "Hello. I'm Robin, the archaeologist. I find ancient history fascinating... along with the various ways civilizations have met their demise.",
            franky: "SUPER! I'm Franky, the shipwright! Check out these awesome modifications! *strikes pose*",
            brook: "Yohohoho! I'm Brook, the musician! Pleased to meet you! Say, you wouldn't happen to be wearing panties, would you? Skull joke!",
            jinbe: "Greetings. I am Jinbe, helmsman of the Straw Hat Pirates. It's an honor to make your acquaintance."
        };
        
        const greeting = greetings[characterKey] || greetings.luffy;
        addMessage(greeting, false);
        
        // Add greeting to conversation history
        conversationHistory.push({
            role: "assistant",
            content: greeting
        });
    }

    // Initialize chat with character-specific content
    initializeChat();

    // Function to add message to chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        let displayContent = content;
        let emotion = 'neutral';
        
        // Add profile picture for bot messages
        if (!isUser) {
            // Parse emotion from content
            const emotionMatch = content.match(/\[emotion:\s*(\w+)\]/i);
            if (emotionMatch) {
                emotion = emotionMatch[1].toLowerCase();
                displayContent = content.replace(emotionMatch[0], '').trim();
            }
            
            const profilePic = document.createElement('div');
            profilePic.className = 'profile-pic';
            const img = document.createElement('img');
            const fileExtension = 'jpg';//characterImageExtensions[characterKey] || 'jpg';
            img.src = `assets/img/chat/${characterKey}_${emotion}.${fileExtension}`;
            img.alt = character.name;
            profilePic.appendChild(img);
            messageDiv.appendChild(profilePic);
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = displayContent;
        
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

    // Function to call Gemini API through Vercel function with conversation history
        async function callGeminiAPI(userMessage) {
            const systemPrompt = character.systemPrompt + " At the end of your response, include your current emotion in the format [emotion: emotion_name] where emotion_name is one of neutral, happy, scared, mad, sad. Choose the emotion that best matches your current feeling based on the conversation.";
            
            // Add user message to conversation history
            conversationHistory.push({
                role: "user",
                content: userMessage
            });
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    systemPrompt: systemPrompt,
                    characterName: character.name,
                    conversationHistory: conversationHistory.slice(-10) // Send last 10 messages to avoid token limits
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.response) {
                // Add assistant response to conversation history
                conversationHistory.push({
                    role: "assistant",
                    content: data.response
                });
                
                return data.response;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error calling API:', error);
            const errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again later.";
            
            // Add error message to conversation history
            conversationHistory.push({
                role: "assistant",
                content: errorMessage
            });
            
            return errorMessage;
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

    // Function to clear conversation history (optional)
    function clearConversation() {
        initializeChat();
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
    
    // Optional: Add clear conversation button functionality
    const clearButton = document.getElementById('clearButton');
    if (clearButton) {
        clearButton.addEventListener('click', clearConversation);
    }
});
