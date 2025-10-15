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
            const result = new Function(`return ${sanitizedExpression}`)();
            
            // Ensure the result is a finite number.
            if (typeof result !== 'number' || !isFinite(result)) {
                return 'error';
            }
            return result;
        } catch (error) {
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
            
            const messageWrapper = document.createElement('div');
            messageWrapper.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

            const messageBubble = document.createElement('div');
            messageBubble.className = `max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${isUser ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`;
            messageBubble.textContent = msg.text;

            messageWrapper.appendChild(messageBubble);
            chatFeed.appendChild(messageWrapper);
        });
        
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    /**
     * Adds a new message to the history, saves it, and re-renders the chat.
     * @param {string} sender - 'user' or 'ai'.
     * @param {string} text - The message content.
     */
    function addMessage(sender, text) {
        messages.push({ sender, text });
        saveMessagesToCache();
        renderMessages();
    }
    
    /**
     * **[NEU]** Generates and adds the AI's response to the chat.
     * Checks for conversational phrases before attempting to calculate.
     * @param {string} userInput - The text entered by the user.
     */
    function generateAiResponse(userInput) {
        const lowerCaseInput = userInput.toLowerCase().trim();
        let response = '';

        // 1. Check for specific conversational phrases
        if (lowerCaseInput.includes('wie gehts') || lowerCaseInput.includes('wie geht es dir')) {
            response = 'Danke der Nachfrage! Als KI habe ich keine Gefühle, aber ich bin voll funktionsfähig und bereit, dir zu helfen. 😊';
        } else if (lowerCaseInput.includes('danke') || lowerCaseInput.includes('dankeschön')) {
            response = 'Gern geschehen! Womit kann ich sonst noch helfen?';
        } else if (lowerCaseInput === 'hallo' || lowerCaseInput === 'hi' || lowerCaseInput === 'hey') {
            response = 'Hallo! Du kannst mir eine Rechenaufgabe stellen.';
        } else if (lowerCaseInput.includes('wer bist du')) {
            response = 'Ich bin ein einfacher KI-Chatbot, der aktuell darauf spezialisiert ist, mathematische Aufgaben zu lösen.';
        } else {
            // 2. If no phrase matches, try to calculate
            const result = calculate(userInput);
            if (result !== 'error') {
                response = `Das Ergebnis ist: ${result}`;
            } else {
                // 3. If calculation fails, give a default response
                response = 'Das habe ich nicht verstanden. Ich kann im Moment hauptsächlich rechnen. Versuche es doch mal mit "5 * (10 + 2)".';
            }
        }
        
        addMessage('ai', response);
    }

    // --- Event Handlers ---

    /**
     * Handles the form submission event.
     * @param {Event} event - The form submission event.
     */
    function handleSendMessage(event) {
        event.preventDefault();
        const userInput = messageInput.value.trim();
        
        if (userInput === '') return;

        addMessage('user', userInput);
        messageInput.value = '';

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
            messages.push({
                sender: 'ai',
                text: 'Hallo! Stell mir eine Rechenaufgabe.'
            });
        }
    }
    
    // --- Initialization ---
    chatForm.addEventListener('submit', handleSendMessage);
    loadMessagesFromCache();
    renderMessages();
});
