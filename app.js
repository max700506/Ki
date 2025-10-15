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
        const sanitizedExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');
        
        if (sanitizedExpression !== expression || sanitizedExpression.trim() === '') {
            return 'error';
        }
        
        try {
            const result = new Function(`return ${sanitizedExpression}`)();
            
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
        chatFeed.innerHTML = '';
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
     * **[ERWEITERT]** Generates and adds the AI's response to the chat.
     * Checks for a wider range of conversational phrases and topics.
     * @param {string} userInput - The text entered by the user.
     */
    function generateAiResponse(userInput) {
        const lowerCaseInput = userInput.toLowerCase().trim();
        let response = '';

        // 1. Check for specific conversational phrases
        if (lowerCaseInput.includes('wie gehts') || lowerCaseInput.includes('wie geht es dir')) {
            response = 'Danke der Nachfrage! Als KI habe ich keine Gefühle, aber ich bin voll funktionsfähig und bereit, dir zu helfen. 😊';
        } else if (lowerCaseInput.includes('danke') || lowerCaseInput.includes('dankeschön')) {
            response = 'Gern geschehen! Wenn du noch etwas brauchst, sag einfach Bescheid.';
        } else if (lowerCaseInput === 'hallo' || lowerCaseInput === 'hi' || lowerCaseInput === 'hey' || lowerCaseInput === 'servus') {
            response = 'Hallo! Wie kann ich dir heute helfen? Du kannst mir eine Rechenaufgabe stellen oder einfach nur plaudern.';
        } else if (lowerCaseInput.includes('wer bist du') || lowerCaseInput.includes('was bist du')) {
            response = 'Ich bin ein KI-Chatbot. Meine Hauptaufgabe ist es, mathematische Ausdrücke zu berechnen, aber ich lerne ständig dazu.';
        } else if (lowerCaseInput.includes('was kannst du tun') || lowerCaseInput.includes('was sind deine fähigkeiten')) { // NEU
            response = 'Ich kann für dich rechnen! Gib einfach eine mathematische Aufgabe ein. Außerdem kann ich ein paar einfache Fragen beantworten und dir einen Witz erzählen.';
        } else if (lowerCaseInput.includes('erzähl mir einen witz') || lowerCaseInput.includes('kennst du einen witz')) { // NEU
            const jokes = [
                "Warum hat der Mathematiker seine Hose nass gemacht? Weil er die Wurzel aus -1 gezogen hat!",
                "Was ist die Lieblingsspeise eines Programmierers? Ein Bit-Menü.",
                "Treffen sich zwei Magneten. Sagt der eine: 'Was soll ich heute bloß anziehen?'",
                "Warum können Geister so schlecht lügen? Weil man direkt durch sie hindurchsieht!"
            ];
            response = jokes[Math.floor(Math.random() * jokes.length)];
        } else if (lowerCaseInput.includes('wie alt bist du')) { // NEU
            response = 'Ich existiere nur als Code und habe kein Alter im menschlichen Sinne. Aber ich wurde erst kürzlich programmiert!';
        } else if (lowerCaseInput.includes('tschüss') || lowerCaseInput.includes('auf wiedersehen') || lowerCaseInput.includes('bis dann')) { // NEU
            response = 'Bis bald! Zögere nicht, wiederzukommen, wenn du Hilfe brauchst. 👋';
        } else {
            // 2. If no phrase matches, try to calculate
            const result = calculate(userInput);
            if (result !== 'error') {
                response = `Das Ergebnis ist: ${result}`;
            } else {
                // 3. If calculation fails, give a more helpful default response
                response = 'Das habe ich nicht ganz verstanden. Du kannst mich zum Beispiel Folgendes fragen:\n\n• "5 * (10 + 2)"\n• "Wer bist du?"\n• "Erzähl mir einen witz"';
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
                text: 'Hallo! Stell mir eine Rechenaufgabe oder frag mich etwas.'
            });
        }
    }
    
    // --- Initialization ---
    chatForm.addEventListener('submit', handleSendMessage);
    loadMessagesFromCache();
    renderMessages();
});
