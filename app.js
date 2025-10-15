// Wait for the entire HTML document to be loaded and parsed
document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM Element Selection ---
    const chatFeed = document.getElementById('chat-feed');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    
    // --- State Management ---
    // Initialize messages array, which will hold the chat history
    let messages = [];

    // --- Core Functions ---

    /**
     * Safely calculates the result of a mathematical expression.
     * @param {string} expression - The mathematical expression to evaluate.
     * @returns {number | string} - The result of the calculation or an 'error' string.
     */
    function calculate(expression) {
        // Allow only numbers, operators, parentheses, and dots to prevent security risks.
        const sanitizedExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');
        
        // If forbidden characters were removed, it's not a valid math expression.
        if (sanitizedExpression !== expression || sanitizedExpression.trim() === '') {
            return 'error';
        }
        
        try {
            // Use the Function constructor as a safer alternative to eval().
            // It doesn't have access to the local scope.
            const result = new Function(`return ${sanitizedExpression}`)();
            
            // Ensure the result is a finite number.
            if (typeof result !== 'number' || !isFinite(result)) {
                return 'error';
            }
            return result;
        } catch (error) {
            // If the expression is syntactically incorrect (e.g., "5 * * 5"), catch the error.
            console.error("Calculation error:", error);
            return 'error';
        }
    }
    
    /**
     * Renders all messages from the `messages` array into the chat feed.
     */
    function renderMessages() {
        chatFeed.innerHTML = ''; // Clear the chat feed before rendering
        messages.forEach(msg => {
            const isUser = msg.sender === 'user';
            
            // Create the outer container for the message bubble
            const messageWrapper = document.createElement('div');
            messageWrapper.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

            // Create the message bubble itself
            const messageBubble = document.createElement('div');
            messageBubble.className = `max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${isUser ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`;
            messageBubble.textContent = msg.text;

            // Append the bubble to its wrapper and the wrapper to the chat feed
            messageWrapper.appendChild(messageBubble);
            chatFeed.appendChild(messageWrapper);
        });
        
        // Automatically scroll to the latest message
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    /**
     * Adds a new message to the history, saves it to the browser cache, and re-renders the chat.
     * @param {string} sender - 'user' or 'ai'.
     * @param {string} text - The message content.
     */
    function addMessage(sender, text) {
        messages.push({ sender, text });
        saveMessagesToCache();
        renderMessages();
    }
    
    /**
     * Generates and adds the AI's response to the chat.
     * @param {string} userInput - The text entered by the user.
     */
    function generateAiResponse(userInput) {
        const result = calculate(userInput);
        
        if (result !== 'error') {
            addMessage('ai', `Das Ergebnis ist: ${result}`);
        } else {
            addMessage('ai', 'Ich kann im Moment nur mathematische Ausdrücke berechnen. Versuche es doch mal mit "5 * 5" oder "(10+2)/3".');
        }
    }

    // --- Event Handlers ---

    /**
     * Handles the form submission event.
     * @param {Event} event - The form submission event.
     */
    function handleSendMessage(event) {
        event.preventDefault(); // Prevent the default page reload on form submission
        const userInput = messageInput.value.trim();
        
        if (userInput === '') return; // Don't send empty messages

        addMessage('user', userInput);
        messageInput.value = ''; // Clear the input field

        // Simulate AI "thinking" for a better user experience
        setTimeout(() => {
            generateAiResponse(userInput);
        }, 500);
    }

    // --- Browser Cache (localStorage) ---

    /**
     * Saves the current chat history to localStorage.
     */
    function saveMessagesToCache() {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }

    /**
     * Loads chat history from localStorage on page load.
     */
    function loadMessagesFromCache() {
        const cachedMessages = localStorage.getItem('chatHistory');
        
        if (cachedMessages) {
            messages = JSON.parse(cachedMessages);
        } else {
            // If no history exists, add a default welcome message from the AI.
            messages.push({
                sender: 'ai',
                text: 'Hallo! Stell mir eine Rechenaufgabe.'
            });
        }
    }
    
    // --- Initialization ---
    
    // Attach the event listener to the form
    chatForm.addEventListener('submit', handleSendMessage);
    
    // Load messages from cache and render them as soon as the app starts
    loadMessagesFromCache();
    renderMessages();
});
