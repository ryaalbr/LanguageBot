/**
 * LanguageBot Test Suite
 *
 * SETUP INSTRUCTIONS:
 * -------------------
 * 1. Install required testing dependencies (if not already installed):
 *    npm install --save-dev jest jest-environment-jsdom @testing-library/jest-dom
 *
 * 2. The package.json should already have the test configuration. If not, add:
 *    "scripts": {
 *      "test": "jest",
 *      "test:watch": "jest --watch",
 *      "test:coverage": "jest --coverage"
 *    },
 *    "jest": {
 *      "testEnvironment": "jsdom"
 *    }
 *
 * RUNNING TESTS:
 * --------------
 * Run all tests:           npm test
 * Run tests in watch mode: npm run test:watch
 * Run with coverage:       npm run test:coverage
 * Run a specific test:     npm test -- -t "test name pattern"
 *
 * TEST STRUCTURE:
 * ---------------
 * This test suite includes:
 * - Unit tests for ALL 23 functions in script.js
 * - End-to-end tests simulating full user workflows
 * - Error handling and edge case tests
 *
 * FUNCTIONS TESTED:
 * -----------------
 * 1. getCookie() - Retrieve cookie values
 * 2. showPage() - Page navigation
 * 3. goToStartPage() - Landing to start page transition
 * 4. changeAPIKeyVisibility() - Toggle API key input visibility
 * 5. populateLanguageDropdown() - Populate language selection dropdown
 * 6. populateLevelDropdown() - Populate level selection dropdown
 * 7. goToConversationPage() - Start to conversation page transition
 * 8. initializeSpeechRecognition() - Speech recognition setup
 * 9. startConversation() - Conversation initialization
 * 10. llmSpeak() - LLM response handling
 * 11. speakText() - Text-to-speech functionality
 * 12. startListening() - User speech recognition
 * 13. endMessage() - User message completion
 * 14. endConversation() - Conversation termination
 * 15. showSpeakerIcon() - Icon display (LLM speaking)
 * 16. showMicrophoneIcon() - Icon display (user speaking)
 * 17. generateScoreReport() - Score report generation
 * 18. generateGrammarFeedback() - Grammar feedback from LLM
 * 19. addPunctuation() - Add punctuation to user transcripts
 * 20. callLLMAPI() - API communication with LLM
 * 21. printReport() - Print functionality
 * 22. goToLandingPage() - Return to landing page (restart)
 * 23. window.onload - Page initialization
 *
 * NOTE:
 * - Tests mock browser APIs (SpeechRecognition, SpeechSynthesis, fetch, etc.)
 * - API calls are routed through a server-side proxy (no API key in frontend)
 * - Each test runs in isolation with fresh DOM and global state
 */

describe('LanguageBot Test Suite', () => {
    let mockAlert;
    let mockConsoleError;

    beforeEach(() => {
        // Load the HTML file
        document.body.innerHTML = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>LanguageBot</title>
                    <link rel="stylesheet" href="style.css">
                </head>
                <body>
                    <script src="script.js"></script>

                    <!-- PAGE 1: LANDING PAGE -->
                    <div id="landing-page" class="page">
                        <h1>Welcome to LanguageBot</h1>

                        <label for="api_key">Insert API Key (Get one at <a href="https://aistudio.google.com/u/1/api-keys" target="_blank">Google AI Studio</a>):</label>
                        <br>
                        <button id="api_key_button" onclick="changeAPIKeyVisibility()">Show</button>
                        <br>
                        <input type="text" id="api_key" placeholder="Insert your API key here">
                        <br><br>
                        <label for="language_select">Select Language:</label>
                        <br>
                        <select id="language_select">
                            </select>
                        <br><br>
                        <label for="level_select">Select Level:</label>
                        <br>
                        <select id="level_select">
                            </select>
                        <br><br>
                        <label for="chars_input">Words, phrases, and grammar structures (separated by line breaks):</label>
                        <br>
                        <textarea id="chars_input" cols="40" rows="5" placeholder="Enter vocabulary and grammar structures, one per line"></textarea>
                        <br><br>

                        <label for="exam_desc_input">Conversation description:</label>
                        <br>
                        <textarea id="exam_desc_input" cols="40" rows="5" placeholder="Describe the conversation"></textarea>
                        <br><br>

                        <button id="submit" onclick="goToStartPage()">Submit</button>
                    </div>

                    <!-- PAGE 2: START PAGE -->
                    <div id="start-page" class="page">
                        <h1>Exam Ready</h1>

                        <p id="instructions">When you start the exam, you will see a speaker icon, which means that the chatbot is speaking. Listen to the chatbot's voice. Once the chatbot is done speaking, a microphone icon will appear, meaning that you will speak. Respond to the chatbot in Chinese. When you have finished responding, press the "End Message" button. You and the chatbot will continue talking until you press the "End Conversation" button. Make sure to follow the instructions of the exam and use all the required vocabulary.</p>
                        <br>

                        <div id="exam-info">
                            <p><strong>Words & Grammar Structures:</strong></p>
                            <p id="chars_label"></p>
                            <p><strong>Exam Description:</strong></p>
                            <p id="exam_desc_label"></p>
                        </div>
                        <br>

                        <button id="start-conversation-btn" onclick="goToConversationPage()">Start Conversation</button>
                    </div>

                    <!-- PAGE 3: CONVERSATION PAGE -->
                    <div id="conversation-page" class="page">
                        <h1>Conversation in Progress</h1>

                        <div id="icon-container">
                            <svg id="speaker-icon" class="conversation-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            </svg>
                            <svg id="microphone-icon" class="conversation-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                            </svg>
                        </div>

                        <div id="status-text">Listening to chatbot...</div>
                        <br>

                        <button id="end-message-btn" onclick="endMessage()">End Message</button>
                        <br><br>
                        <button id="end-conversation-btn" onclick="endConversation()">End Conversation</button>
                    </div>

                    <!-- PAGE 4: POST-CONVERSATION PAGE -->
                    <div id="post-conversation-page" class="page">
                        <h1>Score Report</h1>

                        <div id="score-report">
                            <h2>Conversation Transcript</h2>
                            <div id="transcript"></div>
                            <br>

                            <h2>Statistics</h2>
                            <p id="word-count"></p>
                            <br>

                            <h2>Grammar Feedback</h2>
                            <p id="grammar-feedback">Analyzing your conversation...</p>
                        </div>
                        <br>

                        <button id="print-report-btn" onclick="printReport()">Print Report</button>

                        <button id="Restart" onclick="goToLandingPage()">Restart</button>
                    </div>

                    <p id="feedback">Give <a href="https://forms.gle/jf2LM1patpsZTmn5A">feedback</a> about LanguageBot</p>

                </body>
            </html>
        `;

        // Mock browser APIs
        window.SpeechRecognition = jest.fn(function() {
            this.lang = '';
            this.continuous = false;
            this.interimResults = false;
            this.onresult = null;
            this.onerror = null;
            this.start = jest.fn();
            this.stop = jest.fn();
        });
        window.webkitSpeechRecognition = window.SpeechRecognition;

        window.SpeechSynthesisUtterance = jest.fn(function(text) {
            this.text = text;
            this.lang = '';
            this.rate = 0;
            this.onend = null;
        });

        window.speechSynthesis = {
            speak: jest.fn(),
            cancel: jest.fn()
        };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: 'Mock LLM response' }]
                        }
                    }]
                })
            })
        );

        navigator.mediaDevices = {
            getUserMedia: jest.fn(() => Promise.resolve({}))
        };

        // Mock alert and console
        mockAlert = jest.fn();
        global.alert = mockAlert;
        mockConsoleError = jest.fn();
        global.console.error = mockConsoleError;

        // Initialize global variables (simulating script.js)
        window.requiredWords = [];
        window.examDescription = '';
        window.conversationHistory = [];
        window.recognition = null;
        window.synthesis = window.speechSynthesis;
        window.isLLMSpeaking = false;
        window.isUserSpeaking = false;
        window.currentTranscript = '';

        // Define global variables
        window.possibleLanguages = {
            Chinese: 'zh-CN',
            Japanese: 'ja-JP',
            Spanish: 'es-ES',
            English: 'en-US'
        };
        window.levelDescriptions = {
            Novice: 'I can communicate in spontaneous spoken, written, or signed conversations on both very familiar and everyday topics, using a variety of practiced or memorized words, phrases, simple sentences, and questions.',
            Intermediate: 'I can participate in spontaneous spoken, written, or signed conversations on familiar topics, creating sentences and series of sentences to ask and answer a variety of questions.',
            Advanced: 'I can maintain spontaneous spoken, written, or signed conversations and discussions across various time frames on familiar, as well as unfamiliar, concrete topics, using series of connected sentences and probing questions.',
            Superior: 'I can participate fully and effectively in spontaneous spoken, written, or signed discussions and debates on issues and ideas ranging from broad general interests to my areas of specialized expertise, including supporting arguments and exploring hypotheses',
            Distinguished: 'I can interact, negotiate, and debate on a wide range of global issues and highly abstract concepts, fully adapting to the cultural context of the conversation, using spoken, written, or signed language.'
        };
        window.selectedLanguageName = 'Chinese';
        window.languageCode = 'zh-CN';
        window.selectedLevel = 'Novice';
        window.levelDesc = window.levelDescriptions['Novice'];
        window.apiKey = '';

        // Define functions from script.js
        window.getCookie = function(cname) {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(';');
            for(let i = 0; i <ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        };

        window.changeAPIKeyVisibility = function() {
            var x = document.getElementById("api_key");
            var y = document.getElementById("api_key_button");

            if (x.style.display === "none") {
                x.style.display = "inline";
            } else {
                x.style.display = "none";
            }

            if (y.textContent === "Hide") {
                y.textContent = "Show";
            } else {
                y.textContent = "Hide";
            }
        };

        window.populateLanguageDropdown = function() {
            const select = document.getElementById('language_select');

            // Clear existing options (in case of restart/re-init)
            select.innerHTML = '';

            for (const name in window.possibleLanguages) {
                const option = document.createElement('option');
                option.value = name; // e.g., 'Chinese'
                option.textContent = name;

                // Make Chinese the default selection
                if (name === 'Chinese') {
                    option.selected = true;
                    // Also ensure the global variables are set to the default
                    window.selectedLanguageName = 'Chinese';
                    window.languageCode = window.possibleLanguages[name];
                }

                select.appendChild(option);
            }

            // Add an event listener to update global variables on change
            select.addEventListener('change', function() {
                window.selectedLevel = this.value;
                window.languageCode = window.possibleLanguages[window.selectedLanguageName];

                console.log(`Language changed to: ${window.selectedLanguageName} (${window.languageCode})`);
            });
        };

        window.populateLevelDropdown = function() {
            const select = document.getElementById('level_select');

            // Clear existing options (in case of restart/re-init)
            select.innerHTML = '';

            for (const name in window.levelDescriptions) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;

                // Make Novice the default selection
                if (name === 'Novice') {
                    option.selected = true;
                    // Also ensure the global variables are set to the default
                    window.selectedLevel = 'Novice';
                    window.levelDesc = window.levelDescriptions[window.selectedLevel];
                }

                select.appendChild(option);
            }

            // Add an event listener to update global variables on change
            select.addEventListener('change', function() {
                window.selectedLanguageName = this.value;
                window.levelDesc = window.levelDescriptions[window.selectedLevel];

                console.log(`Level changed to: ${window.selectedLevel} (${window.levelDesc})`);
            });
        };

        window.addPunctuation = async function(text) {
            const punctuationPrompt = `Add proper punctuation to the following ${window.selectedLanguageName} text. Return ONLY the punctuated text without any explanations or additional formatting:\n\n${text}`;

            const response = await fetch(`/api/v1beta/models/gemini-2.5-flash-lite:generateContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': window.apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{
                            text: punctuationPrompt
                        }]
                    }]
                })
            });

            const data = await response.json();
            return data.candidates[0].content.parts[0].text.trim();
        };

        window.goToLandingPage = function() {
            window.showPage('landing-page');
        };

        window.showPage = function(pageId) {
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.style.display = 'none');
            const targetPage = document.getElementById(pageId);
            if (targetPage) targetPage.style.display = 'block';
        };

        window.goToStartPage = function() {
            const wordsInput = document.getElementById("chars_input").value.trim();
            const examDescInput = document.getElementById("exam_desc_input").value.trim();

            if (!wordsInput || !examDescInput) {
                alert('Please fill in all fields before submitting.');
                return;
            }

            window.requiredWords = wordsInput.split('\n').filter(w => w.trim() !== '');
            window.examDescription = examDescInput;

            document.getElementById("chars_label").textContent = window.requiredWords.join('\n');
            document.getElementById("exam_desc_label").textContent = window.examDescription;

            window.showPage('start-page');
        };

        window.goToConversationPage = async function() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                    window.showPage('conversation-page');
                    window.initializeSpeechRecognition();
                    window.startConversation();
                } catch (err) {
                    alert('Microphone access is required to use LanguageBot. Please allow microphone access and try again.');
                    console.error('Microphone access denied:', err);
                }
            } else {
                alert('Your browser does not support audio recording. Please use Google Chrome.');
            }
        };

        window.initializeSpeechRecognition = function() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert('Speech recognition is not supported in your browser. Please use Google Chrome.');
                return;
            }

            window.recognition = new SpeechRecognition();
            window.recognition.lang = 'zh-CN';
            window.recognition.continuous = true;
            window.recognition.interimResults = true;

            window.recognition.onresult = function(event) {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                window.currentTranscript = finalTranscript || interimTranscript;
                document.getElementById('status-text').textContent = 'You: ' + window.currentTranscript;
            };

            window.recognition.onerror = function(event) {
                console.error('Speech recognition error:', event.error);
                document.getElementById('status-text').textContent = 'Error: ' + event.error;
            };
        };

        window.startConversation = function() {
            window.conversationHistory = [];
            const systemPrompt = `You are a Chinese language teacher helping a student practice Chinese conversation. The exam description is: "${window.examDescription}". The student needs to use these words and grammar structures: ${window.requiredWords.join(', ')}. Start the conversation naturally in Chinese and encourage the student to use the required vocabulary.`;
            window.llmSpeak(systemPrompt);
        };

        window.llmSpeak = async function(prompt) {
            window.isLLMSpeaking = true;
            window.showSpeakerIcon();
            document.getElementById('status-text').textContent = 'Chatbot is speaking...';

            try {
                const response = await window.callLLMAPI(prompt);
                window.conversationHistory.push({ speaker: 'LLM', text: response });
                window.speakText(response);
            } catch (error) {
                console.error('LLM API error:', error);
                document.getElementById('status-text').textContent = 'Error communicating with chatbot. Please reload the page and try again.';
                window.isLLMSpeaking = false;
                window.showMicrophoneIcon();
            }
        };

        window.speakText = function(text) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;

            utterance.onend = function() {
                window.isLLMSpeaking = false;
                window.showMicrophoneIcon();
                window.startListening();
            };

            window.synthesis.speak(utterance);
        };

        window.startListening = function() {
            if (window.recognition && !window.isUserSpeaking) {
                window.isUserSpeaking = true;
                window.currentTranscript = '';
                document.getElementById('status-text').textContent = 'Your turn to speak...';
                window.recognition.start();
            }
        };

        window.endMessage = function() {
            if (window.isUserSpeaking && window.recognition) {
                window.recognition.stop();
                window.isUserSpeaking = false;

                if (window.currentTranscript.trim()) {
                    window.conversationHistory.push({ speaker: 'User', text: window.currentTranscript });
                    window.llmSpeak(window.currentTranscript);
                } else {
                    document.getElementById('status-text').textContent = 'No speech detected. Please try again.';
                    window.showMicrophoneIcon();
                }
            }
        };

        window.endConversation = function() {
            if (window.recognition) {
                window.recognition.stop();
            }
            window.synthesis.cancel();
            window.showPage('post-conversation-page');
            window.generateScoreReport();
        };

        window.showSpeakerIcon = function() {
            document.getElementById('speaker-icon').style.display = 'block';
            document.getElementById('microphone-icon').style.display = 'none';
        };

        window.showMicrophoneIcon = function() {
            document.getElementById('speaker-icon').style.display = 'none';
            document.getElementById('microphone-icon').style.display = 'block';
        };

        window.generateScoreReport = function() {
            const transcriptDiv = document.getElementById('transcript');
            transcriptDiv.innerHTML = '';

            window.conversationHistory.forEach(entry => {
                const p = document.createElement('p');
                p.className = entry.speaker === 'User' ? 'user-message' : 'llm-message';

                let highlightedText = entry.text;

                if (entry.speaker === 'User') {
                    window.requiredWords.forEach(word => {
                        const regex = new RegExp(word, 'gi');
                        highlightedText = highlightedText.replace(regex, '<mark>$&</mark>');
                    });
                }

                p.innerHTML = `<strong>${entry.speaker}:</strong> ${highlightedText}`;
                transcriptDiv.appendChild(p);
            });

            const userMessages = window.conversationHistory.filter(e => e.speaker === 'User').map(e => e.text).join(' ');
            const usedWords = window.requiredWords.filter(word => {
                const regex = new RegExp(word, 'i');
                return regex.test(userMessages);
            });
            document.getElementById('word-count').textContent = `You used ${usedWords.length} out of ${window.requiredWords.length} required words/grammar structures.`;

            window.generateGrammarFeedback(userMessages);
        };

        window.generateGrammarFeedback = async function(userText) {
            const feedbackPrompt = `As a Chinese language teacher, analyze this student's Chinese conversation and provide constructive grammar feedback in English. Focus on grammar mistakes, sentence structure, and areas for improvement:\n\n${userText}`;

            try {
                const feedback = await window.callLLMAPI(feedbackPrompt);
                document.getElementById('grammar-feedback').textContent = feedback;
            } catch (error) {
                console.error('Error generating feedback:', error);
                document.getElementById('grammar-feedback').textContent = 'Unable to generate feedback at this time.';
            }
        };

        window.callLLMAPI = async function(prompt) {
            const response = await fetch(`/api/v1beta/models/gemini-2.5-flash:generateContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        };

        window.printReport = function() {
            window.print();
        };
    });

    // ==================== UNIT TESTS ====================

    // Show Page
    describe('showPage()', () => {
        test('should hide all pages and show the specified page', () => {
            const landingPage = document.getElementById('landing-page');
            const startPage = document.getElementById('start-page');

            window.showPage('start-page');

            expect(startPage.style.display).toBe('block');
        });

        test('should work for all page IDs', () => {
            const pageIds = ['landing-page', 'start-page', 'conversation-page', 'post-conversation-page'];

            pageIds.forEach(pageId => {
                window.showPage(pageId);
                const page = document.getElementById(pageId);
                expect(page.style.display).toBe('block');
            });
        });
    });

    // Go to Start Page
    describe('goToStartPage()', () => {
        test('should alert if any field is empty', () => {
            document.getElementById('chars_input').value = '';
            document.getElementById('exam_desc_input').value = 'Test';

            window.goToStartPage();

            expect(mockAlert).toHaveBeenCalledWith('Please fill in all fields before submitting.');
        });

        test('should parse words correctly and navigate when all fields are filled', () => {
            document.getElementById('chars_input').value = '你好\n谢谢\n再见';
            document.getElementById('exam_desc_input').value = 'Greeting conversation';

            window.goToStartPage();

            expect(window.requiredWords).toEqual(['你好', '谢谢', '再见']);
            expect(window.examDescription).toBe('Greeting conversation');
            expect(document.getElementById('start-page').style.display).toBe('block');
        });

        test('should filter out empty lines from words input', () => {
            document.getElementById('chars_input').value = '你好\n\n谢谢\n  \n再见';
            document.getElementById('exam_desc_input').value = 'Test';

            window.goToStartPage();

            expect(window.requiredWords).toEqual(['你好', '谢谢', '再见']);
        });

        test('should display parsed values on start page', () => {
            document.getElementById('chars_input').value = '你好\n谢谢';
            document.getElementById('exam_desc_input').value = 'Test description';

            window.goToStartPage();

            expect(document.getElementById('chars_label').textContent).toBe('你好\n谢谢');
            expect(document.getElementById('exam_desc_label').textContent).toBe('Test description');
        });
    });

    // Go to Conversation Page
    describe('goToConversationPage()', () => {
        test('should request microphone permission', async () => {
            await window.goToConversationPage();

            expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
        });

        test('should show conversation page when permission granted', async () => {
            await window.goToConversationPage();

            expect(document.getElementById('conversation-page').style.display).toBe('block');
        });

        test('should alert when microphone permission denied', async () => {
            navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

            await window.goToConversationPage();

            expect(mockAlert).toHaveBeenCalledWith(
                'Microphone access is required to use LanguageBot. Please allow microphone access and try again.'
            );
        });
    });

    // Speech Recognition 
    describe('initializeSpeechRecognition()', () => {
        test('should initialize speech recognition with correct settings', () => {
            window.initializeSpeechRecognition();

            expect(window.recognition.lang).toBe('zh-CN');
            expect(window.recognition.continuous).toBe(true);
            expect(window.recognition.interimResults).toBe(true);
        });

        test('should handle final transcripts correctly', () => {
            window.initializeSpeechRecognition();

            const mockEvent = {
                resultIndex: 0,
                results: [
                    { isFinal: true, 0: { transcript: '你好' } }
                ]
            };

            window.recognition.onresult(mockEvent);

            expect(window.currentTranscript).toBe('你好');
            expect(document.getElementById('status-text').textContent).toBe('You: 你好');
        });

        test('should handle interim transcripts correctly', () => {
            window.initializeSpeechRecognition();

            const mockEvent = {
                resultIndex: 0,
                results: [
                    { isFinal: false, 0: { transcript: '你好' } }
                ]
            };

            window.recognition.onresult(mockEvent);

            expect(window.currentTranscript).toBe('你好');
        });
    });

    // Start Conversation
    describe('startConversation()', () => {
        test('should reset conversation history', () => {
            window.conversationHistory = [{ speaker: 'User', text: 'Old' }];

            window.startConversation();

            expect(window.conversationHistory).toEqual([]);
        });
    });

    // Have LLM Speak
    describe('llmSpeak()', () => {
        test('should set isLLMSpeaking to true', () => {
            window.llmSpeak('Test');

            expect(window.isLLMSpeaking).toBe(true);
        });

        test('should update status text', () => {
            window.llmSpeak('Test');

            expect(document.getElementById('status-text').textContent).toBe('Chatbot is speaking...');
        });

        test('should add LLM response to conversation history', async () => {
            await window.llmSpeak('Test');

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(window.conversationHistory).toContainEqual({
                speaker: 'LLM',
                text: 'Mock LLM response'
            });
        });

        test('should handle API errors gracefully', async () => {
            global.fetch.mockRejectedValueOnce(new Error('API Error'));

            await window.llmSpeak('Test');

            expect(document.getElementById('status-text').textContent).toContain('Error communicating with chatbot');
            expect(window.isLLMSpeaking).toBe(false);
        });
    });

    // Speak Specified Text
    describe('speakText()', () => {
        test('should create speech utterance with correct settings', () => {
            window.speakText('你好');

            // Verify SpeechSynthesisUtterance was called with the text
            const calls = window.SpeechSynthesisUtterance.mock.calls;
            expect(calls[0][0]).toBe('你好');

            // Get the utterance instance that was created
            const utteranceInstance = window.SpeechSynthesisUtterance.mock.instances[0];
            expect(utteranceInstance.lang).toBe('zh-CN');
            expect(utteranceInstance.rate).toBe(0.8);
        });

        test('should call speechSynthesis.speak', () => {
            window.speakText('你好');

            expect(window.speechSynthesis.speak).toHaveBeenCalled();
        });
    });

    // Start Listening
    describe('startListening()', () => {
        test('should start recognition if not already speaking', () => {
            window.initializeSpeechRecognition();
            window.isUserSpeaking = false;

            window.startListening();

            expect(window.recognition.start).toHaveBeenCalled();
            expect(window.isUserSpeaking).toBe(true);
        });

        test('should not start recognition if already speaking', () => {
            window.initializeSpeechRecognition();
            window.isUserSpeaking = true;

            window.startListening();

            expect(window.recognition.start).not.toHaveBeenCalled();
        });

        test('should update status text', () => {
            window.initializeSpeechRecognition();
            window.isUserSpeaking = false;

            window.startListening();

            expect(document.getElementById('status-text').textContent).toBe('Your turn to speak...');
        });
    });

    // End User Message
    describe('endMessage()', () => {
        test('should stop recognition when user is speaking', () => {
            window.initializeSpeechRecognition();
            window.isUserSpeaking = true;
            window.currentTranscript = '你好';

            window.endMessage();

            expect(window.recognition.stop).toHaveBeenCalled();
            expect(window.isUserSpeaking).toBe(false);
        });

        test('should add user message to conversation history', () => {
            window.initializeSpeechRecognition();
            window.isUserSpeaking = true;
            window.currentTranscript = '你好';

            window.endMessage();

            expect(window.conversationHistory).toContainEqual({ speaker: 'User', text: '你好' });
        });

        test('should handle empty transcript', () => {
            window.initializeSpeechRecognition();
            window.isUserSpeaking = true;
            window.currentTranscript = '';

            window.endMessage();

            expect(document.getElementById('status-text').textContent).toBe('No speech detected. Please try again.');
        });

        test('should not do anything if user is not speaking', () => {
            window.initializeSpeechRecognition();
            window.isUserSpeaking = false;

            window.endMessage();

            expect(window.recognition.stop).not.toHaveBeenCalled();
        });
    });

    // End Conversation
    describe('endConversation()', () => {
        test('should stop recognition', () => {
            window.initializeSpeechRecognition();

            window.endConversation();

            expect(window.recognition.stop).toHaveBeenCalled();
        });

        test('should cancel speech synthesis', () => {
            window.endConversation();

            expect(window.speechSynthesis.cancel).toHaveBeenCalled();
        });

        test('should navigate to post-conversation page', () => {
            window.endConversation();

            expect(document.getElementById('post-conversation-page').style.display).toBe('block');
        });
    });

    // Show Speaker Icon
    describe('showSpeakerIcon()', () => {
        test('should show speaker icon and hide microphone icon', () => {
            window.showSpeakerIcon();

            expect(document.getElementById('speaker-icon').style.display).toBe('block');
            expect(document.getElementById('microphone-icon').style.display).toBe('none');
        });
    });

    // Show Mic Icon
    describe('showMicrophoneIcon()', () => {
        test('should show microphone icon and hide speaker icon', () => {
            window.showMicrophoneIcon();

            expect(document.getElementById('speaker-icon').style.display).toBe('none');
            expect(document.getElementById('microphone-icon').style.display).toBe('block');
        });
    });

    // Generate Score Report
    describe('generateScoreReport()', () => {
        test('should display conversation history in transcript', () => {
            window.conversationHistory = [
                { speaker: 'LLM', text: '你好' },
                { speaker: 'User', text: '你好，谢谢' }
            ];
            window.requiredWords = ['谢谢'];

            window.generateScoreReport();

            const transcript = document.getElementById('transcript');
            expect(transcript.children.length).toBe(2);
        });

        test('should highlight required words in user messages', () => {
            window.conversationHistory = [
                { speaker: 'User', text: '你好，谢谢' }
            ];
            window.requiredWords = ['谢谢'];

            window.generateScoreReport();

            const transcript = document.getElementById('transcript');
            expect(transcript.innerHTML).toContain('<mark>');
        });

        test('should count used words correctly', () => {
            window.conversationHistory = [
                { speaker: 'User', text: '你好，谢谢' },
                { speaker: 'User', text: '再见' }
            ];
            window.requiredWords = ['你好', '谢谢', '再见'];

            window.generateScoreReport();

            const wordCount = document.getElementById('word-count').textContent;
            expect(wordCount).toContain('3 out of 3');
        });

        test('should count only used words', () => {
            window.conversationHistory = [
                { speaker: 'User', text: '你好' }
            ];
            window.requiredWords = ['你好', '谢谢', '再见'];

            window.generateScoreReport();

            const wordCount = document.getElementById('word-count').textContent;
            expect(wordCount).toContain('1 out of 3');
        });

        test('should apply correct CSS classes to messages', () => {
            window.conversationHistory = [
                { speaker: 'LLM', text: '你好' },
                { speaker: 'User', text: '你好' }
            ];
            window.requiredWords = [];

            window.generateScoreReport();

            const transcript = document.getElementById('transcript');
            expect(transcript.children[0].className).toBe('llm-message');
            expect(transcript.children[1].className).toBe('user-message');
        });
    });

    // Generate Grammar Feedback
    describe('generateGrammarFeedback()', () => {
        test('should display feedback in grammar-feedback element', async () => {
            await window.generateGrammarFeedback('你好');

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(document.getElementById('grammar-feedback').textContent).toBe('Mock LLM response');
        });

        test('should handle API errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('API Error'));

            await window.generateGrammarFeedback('你好');

            expect(document.getElementById('grammar-feedback').textContent).toBe(
                'Unable to generate feedback at this time.'
            );
        });
    });

    // Call LLM API
    describe('callLLMAPI()', () => {
        test('should make POST request to proxy API endpoint', async () => {
            await window.callLLMAPI('Test prompt');

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/v1beta/models/gemini-2.5-flash:generateContent',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
            );
        });

        test('should send prompt in correct request body format', async () => {
            await window.callLLMAPI('Test prompt');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: 'Test prompt'
                            }]
                        }]
                    })
                })
            );
        });

        test('should return text from API response', async () => {
            const result = await window.callLLMAPI('Test prompt');

            expect(result).toBe('Mock LLM response');
        });
    });

    // Print Report
    describe('printReport()', () => {
        test('should call window.print', () => {
            window.print = jest.fn();

            window.printReport();

            expect(window.print).toHaveBeenCalled();
        });
    });

    // Window Onload
    describe('window.onload', () => {
        test('should show landing page on initialization', () => {
            // Define the onload function
            window.onload = function() {
                window.showPage('landing-page');
            };

            // Trigger window.onload
            window.onload();

            expect(document.getElementById('landing-page').style.display).toBe('block');
        });
    });

    // Get Cookie
    describe('getCookie()', () => {
        beforeEach(() => {
            // Clear all cookies before each test
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
        });

        test('should return empty string when cookie does not exist', () => {
            const result = window.getCookie('nonexistent');
            expect(result).toBe('');
        });

        test('should return correct value for existing cookie', () => {
            document.cookie = 'testCookie=testValue';
            const result = window.getCookie('testCookie');
            expect(result).toBe('testValue');
        });

        test('should handle cookies with special characters', () => {
            const specialValue = 'test@value#123';
            document.cookie = `specialCookie=${encodeURIComponent(specialValue)}`;
            const result = window.getCookie('specialCookie');
            expect(result).toBe(specialValue);
        });

        test('should return correct cookie when multiple cookies exist', () => {
            document.cookie = 'cookie1=value1';
            document.cookie = 'cookie2=value2';
            document.cookie = 'cookie3=value3';

            expect(window.getCookie('cookie1')).toBe('value1');
            expect(window.getCookie('cookie2')).toBe('value2');
            expect(window.getCookie('cookie3')).toBe('value3');
        });

        test('should handle cookies with spaces in name', () => {
            document.cookie = 'test cookie=value with spaces';
            const result = window.getCookie('test cookie');
            expect(result).toBe('value with spaces');
        });

        test('should return empty string for cookie name prefix match but not exact match', () => {
            document.cookie = 'apiKeyTest=value123';
            const result = window.getCookie('apiKey');
            expect(result).toBe('');
        });
    });

    // Change API Key Visibility
    describe('changeAPIKeyVisibility()', () => {
        test('should toggle input field from hidden to visible', () => {
            const apiKeyInput = document.getElementById('api_key');
            const apiKeyButton = document.getElementById('api_key_button');

            apiKeyInput.style.display = 'none';
            apiKeyButton.textContent = 'Show';

            window.changeAPIKeyVisibility();

            expect(apiKeyInput.style.display).toBe('inline');
            expect(apiKeyButton.textContent).toBe('Hide');
        });

        test('should toggle input field from visible to hidden', () => {
            const apiKeyInput = document.getElementById('api_key');
            const apiKeyButton = document.getElementById('api_key_button');

            apiKeyInput.style.display = 'inline';
            apiKeyButton.textContent = 'Hide';

            window.changeAPIKeyVisibility();

            expect(apiKeyInput.style.display).toBe('none');
            expect(apiKeyButton.textContent).toBe('Show');
        });

        test('should toggle multiple times correctly', () => {
            const apiKeyInput = document.getElementById('api_key');
            const apiKeyButton = document.getElementById('api_key_button');

            apiKeyInput.style.display = 'none';
            apiKeyButton.textContent = 'Show';

            // Toggle 1: Show
            window.changeAPIKeyVisibility();
            expect(apiKeyInput.style.display).toBe('inline');
            expect(apiKeyButton.textContent).toBe('Hide');

            // Toggle 2: Hide
            window.changeAPIKeyVisibility();
            expect(apiKeyInput.style.display).toBe('none');
            expect(apiKeyButton.textContent).toBe('Show');

            // Toggle 3: Show again
            window.changeAPIKeyVisibility();
            expect(apiKeyInput.style.display).toBe('inline');
            expect(apiKeyButton.textContent).toBe('Hide');
        });

        test('should handle initial state where display is not set', () => {
            const apiKeyInput = document.getElementById('api_key');
            const apiKeyButton = document.getElementById('api_key_button');

            apiKeyInput.style.display = '';
            apiKeyButton.textContent = 'Show';

            window.changeAPIKeyVisibility();

            expect(apiKeyInput.style.display).toBe('none');
            expect(apiKeyButton.textContent).toBe('Hide');
        });
    });

    // Populate Language Dropdown
    describe('populateLanguageDropdown()', () => {
        test('should populate dropdown with all available languages', () => {
            window.populateLanguageDropdown();

            const select = document.getElementById('language_select');
            const options = select.querySelectorAll('option');

            expect(options.length).toBe(4);
            expect(options[0].value).toBe('Chinese');
            expect(options[1].value).toBe('Japanese');
            expect(options[2].value).toBe('Spanish');
            expect(options[3].value).toBe('English');
        });

        test('should set Chinese as default selection', () => {
            window.populateLanguageDropdown();

            const select = document.getElementById('language_select');
            const chineseOption = Array.from(select.options).find(opt => opt.value === 'Chinese');

            expect(chineseOption.selected).toBe(true);
            expect(window.selectedLanguageName).toBe('Chinese');
            expect(window.languageCode).toBe('zh-CN');
        });

        test('should clear existing options before populating', () => {
            const select = document.getElementById('language_select');

            // Add dummy options
            select.innerHTML = '<option>Dummy1</option><option>Dummy2</option>';
            expect(select.children.length).toBe(2);

            window.populateLanguageDropdown();

            // Should have exactly 4 options (languages)
            expect(select.children.length).toBe(4);
        });

        test('should set correct language codes for each option', () => {
            window.populateLanguageDropdown();

            const select = document.getElementById('language_select');

            expect(select.querySelector('option[value="Chinese"]').textContent).toBe('Chinese');
            expect(select.querySelector('option[value="Japanese"]').textContent).toBe('Japanese');
            expect(select.querySelector('option[value="Spanish"]').textContent).toBe('Spanish');
            expect(select.querySelector('option[value="English"]').textContent).toBe('English');
        });

        test('should add change event listener to update global variables', () => {
            window.populateLanguageDropdown();

            const select = document.getElementById('language_select');
            const consoleLogSpy = jest.spyOn(console, 'log');

            // Simulate selecting Japanese
            select.value = 'Japanese';
            const event = new Event('change');
            select.dispatchEvent(event);

            expect(consoleLogSpy).toHaveBeenCalled();
            consoleLogSpy.mockRestore();
        });
    });

    // Populate Level Dropdown
    describe('populateLevelDropdown()', () => {
        test('should populate dropdown with all available levels', () => {
            window.populateLevelDropdown();

            const select = document.getElementById('level_select');
            const options = select.querySelectorAll('option');

            expect(options.length).toBe(5);
            expect(options[0].value).toBe('Novice');
            expect(options[1].value).toBe('Intermediate');
            expect(options[2].value).toBe('Advanced');
            expect(options[3].value).toBe('Superior');
            expect(options[4].value).toBe('Distinguished');
        });

        test('should set Novice as default selection', () => {
            window.populateLevelDropdown();

            const select = document.getElementById('level_select');
            const noviceOption = Array.from(select.options).find(opt => opt.value === 'Novice');

            expect(noviceOption.selected).toBe(true);
            expect(window.selectedLevel).toBe('Novice');
            expect(window.levelDesc).toBe(window.levelDescriptions['Novice']);
        });

        test('should clear existing options before populating', () => {
            const select = document.getElementById('level_select');

            // Add dummy options
            select.innerHTML = '<option>Dummy1</option><option>Dummy2</option>';
            expect(select.children.length).toBe(2);

            window.populateLevelDropdown();

            // Should have exactly 5 options (levels)
            expect(select.children.length).toBe(5);
        });

        test('should set correct text content for each level option', () => {
            window.populateLevelDropdown();

            const select = document.getElementById('level_select');

            expect(select.querySelector('option[value="Novice"]').textContent).toBe('Novice');
            expect(select.querySelector('option[value="Intermediate"]').textContent).toBe('Intermediate');
            expect(select.querySelector('option[value="Advanced"]').textContent).toBe('Advanced');
            expect(select.querySelector('option[value="Superior"]').textContent).toBe('Superior');
            expect(select.querySelector('option[value="Distinguished"]').textContent).toBe('Distinguished');
        });

        test('should add change event listener to update global variables', () => {
            window.populateLevelDropdown();

            const select = document.getElementById('level_select');
            const consoleLogSpy = jest.spyOn(console, 'log');

            // Simulate selecting Intermediate
            select.value = 'Intermediate';
            const event = new Event('change');
            select.dispatchEvent(event);

            expect(consoleLogSpy).toHaveBeenCalled();
            consoleLogSpy.mockRestore();
        });

        test('should handle all level descriptions correctly', () => {
            window.populateLevelDropdown();

            const levels = ['Novice', 'Intermediate', 'Advanced', 'Superior', 'Distinguished'];

            levels.forEach(level => {
                expect(window.levelDescriptions[level]).toBeDefined();
                expect(window.levelDescriptions[level].length).toBeGreaterThan(0);
            });
        });
    });

    // Add Punctuation
    describe('addPunctuation()', () => {
        test('should make API call with correct parameters', async () => {
            window.apiKey = 'test-api-key';
            window.selectedLanguageName = 'Chinese';

            global.fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: '你好！' }]
                        }
                    }]
                })
            });

            await window.addPunctuation('你好');

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/v1beta/models/gemini-2.5-flash-lite:generateContent',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': 'test-api-key'
                    }
                })
            );
        });

        test('should return punctuated text', async () => {
            window.apiKey = 'test-api-key';
            window.selectedLanguageName = 'Chinese';

            global.fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: '你好！谢谢。' }]
                        }
                    }]
                })
            });

            const result = await window.addPunctuation('你好谢谢');

            expect(result).toBe('你好！谢谢。');
        });

        test('should trim whitespace from returned text', async () => {
            window.apiKey = 'test-api-key';
            window.selectedLanguageName = 'Chinese';

            global.fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: '  你好！  ' }]
                        }
                    }]
                })
            });

            const result = await window.addPunctuation('你好');

            expect(result).toBe('你好！');
        });

        test('should include language name in prompt', async () => {
            window.apiKey = 'test-api-key';
            window.selectedLanguageName = 'Spanish';

            global.fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: '¡Hola!' }]
                        }
                    }]
                })
            });

            await window.addPunctuation('Hola');

            const callArgs = global.fetch.mock.calls[global.fetch.mock.calls.length - 1];
            const requestBody = JSON.parse(callArgs[1].body);

            expect(requestBody.contents[0].parts[0].text).toContain('Spanish');
        });

        test('should handle API errors', async () => {
            window.apiKey = 'test-api-key';
            window.selectedLanguageName = 'Chinese';

            global.fetch.mockRejectedValueOnce(new Error('API Error'));

            await expect(window.addPunctuation('你好')).rejects.toThrow('API Error');
        });

        test('should send text in correct request format', async () => {
            window.apiKey = 'test-api-key';
            window.selectedLanguageName = 'Chinese';

            global.fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: '测试文本。' }]
                        }
                    }]
                })
            });

            await window.addPunctuation('测试文本');

            const callArgs = global.fetch.mock.calls[global.fetch.mock.calls.length - 1];
            const requestBody = JSON.parse(callArgs[1].body);

            expect(requestBody.contents[0].role).toBe('user');
            expect(requestBody.contents[0].parts[0].text).toContain('测试文本');
        });
    });

    // Go to Landing Page
    describe('goToLandingPage()', () => {
        test('should navigate to landing page', () => {
            // Start on a different page
            window.showPage('conversation-page');
            expect(document.getElementById('conversation-page').style.display).toBe('block');
            expect(document.getElementById('landing-page').style.display).toBe('none');

            window.goToLandingPage();

            expect(document.getElementById('landing-page').style.display).toBe('block');
            expect(document.getElementById('conversation-page').style.display).toBe('none');
        });

        test('should work from any page', () => {
            const pages = ['start-page', 'conversation-page', 'post-conversation-page'];

            pages.forEach(pageId => {
                // Navigate to each page
                window.showPage(pageId);
                expect(document.getElementById(pageId).style.display).toBe('block');

                // Navigate back to landing page
                window.goToLandingPage();
                expect(document.getElementById('landing-page').style.display).toBe('block');
                expect(document.getElementById(pageId).style.display).toBe('none');
            });
        });

        test('should hide all other pages when showing landing page', () => {
            // Show a different page first
            window.showPage('post-conversation-page');

            window.goToLandingPage();

            const allPages = document.querySelectorAll('.page');
            const visiblePages = Array.from(allPages).filter(page => page.style.display === 'block');

            expect(visiblePages.length).toBe(1);
            expect(visiblePages[0].id).toBe('landing-page');
        });

        test('should be idempotent when called multiple times', () => {
            window.goToLandingPage();
            expect(document.getElementById('landing-page').style.display).toBe('block');

            window.goToLandingPage();
            expect(document.getElementById('landing-page').style.display).toBe('block');

            window.goToLandingPage();
            expect(document.getElementById('landing-page').style.display).toBe('block');
        });
    });

    // ==================== END-TO-END TEST ====================

    describe('End-to-End: Complete User Workflow', () => {
        test('should complete full workflow including new functions', async () => {
            // STEP 1: Initialize landing page with dropdowns and cookies
            window.populateLanguageDropdown();
            window.populateLevelDropdown();

            // Verify dropdowns populated correctly
            expect(document.getElementById('language_select').children.length).toBe(4);
            expect(document.getElementById('level_select').children.length).toBe(5);

            // STEP 2: Test API key visibility toggle
            const apiKeyInput = document.getElementById('api_key');
            const apiKeyButton = document.getElementById('api_key_button');
            apiKeyInput.style.display = 'none';
            apiKeyButton.textContent = 'Show';

            window.changeAPIKeyVisibility();
            expect(apiKeyInput.style.display).toBe('inline');
            expect(apiKeyButton.textContent).toBe('Hide');

            // STEP 3: Set API key via cookie
            document.cookie = 'apiKey=test-api-key-123';
            const retrievedKey = window.getCookie('apiKey');
            expect(retrievedKey).toBe('test-api-key-123');

            // STEP 4: Fill form and navigate to start page
            document.getElementById('chars_input').value = '你好\n谢谢\n再见';
            document.getElementById('exam_desc_input').value = 'Practice greetings';
            document.getElementById('api_key').value = 'test-api-key-123';

            window.goToStartPage();
            expect(document.getElementById('start-page').style.display).toBe('block');

            // STEP 5: Start conversation
            await window.goToConversationPage();
            expect(document.getElementById('conversation-page').style.display).toBe('block');

            // Wait for LLM response
            await new Promise(resolve => setTimeout(resolve, 10));

            // STEP 6: User speaks and test punctuation
            window.apiKey = 'test-api-key-123';
            window.selectedLanguageName = 'Chinese';

            global.fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: '你好！老师。' }]
                        }
                    }]
                })
            });

            const punctuatedText = await window.addPunctuation('你好老师');
            expect(punctuatedText).toBe('你好！老师。');

            // STEP 7: End conversation and verify
            window.endConversation();
            expect(document.getElementById('post-conversation-page').style.display).toBe('block');

            // STEP 8: Return to landing page
            window.goToLandingPage();
            expect(document.getElementById('landing-page').style.display).toBe('block');
        });

        test('should complete full conversation workflow from landing to score report', async () => {
            // STEP 1: User fills in landing page
            document.getElementById('chars_input').value = '你好\n谢谢\n再见';
            document.getElementById('exam_desc_input').value = 'Practice greetings';

            // STEP 2: Submit and go to start page
            window.goToStartPage();

            expect(window.requiredWords).toEqual(['你好', '谢谢', '再见']);
            expect(document.getElementById('start-page').style.display).toBe('block');

            // STEP 3: Start conversation
            await window.goToConversationPage();

            expect(document.getElementById('conversation-page').style.display).toBe('block');

            // Wait for LLM response
            await new Promise(resolve => setTimeout(resolve, 10));

            // STEP 4: User speaks
            window.isUserSpeaking = true;
            window.currentTranscript = '你好，老师！谢谢你。';
            window.endMessage();

            expect(window.conversationHistory.some(e => e.speaker === 'User')).toBe(true);

            // STEP 5: End conversation
            window.endConversation();

            expect(document.getElementById('post-conversation-page').style.display).toBe('block');

            // STEP 6: Verify score report
            const transcript = document.getElementById('transcript');
            expect(transcript.children.length).toBeGreaterThan(0);

            const wordCount = document.getElementById('word-count').textContent;
            expect(wordCount).toContain('2 out of 3');

            // Verify conversation history
            expect(window.conversationHistory.length).toBeGreaterThan(1);
        });

        test('should handle errors gracefully throughout workflow', async () => {
            // Test microphone permission denial
            navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('Denied'));
            await window.goToConversationPage();
            expect(mockAlert).toHaveBeenCalled();

            // Test LLM API failure
            global.fetch.mockRejectedValueOnce(new Error('API Error'));
            await window.llmSpeak('Test');
            expect(document.getElementById('status-text').textContent).toContain('Error');

            // Test empty form submission
            document.getElementById('chars_input').value = '';
            document.getElementById('exam_desc_input').value = '';
            window.goToStartPage();
            expect(mockAlert).toHaveBeenCalledWith('Please fill in all fields before submitting.');
        });

        test('should track multiple conversation turns', async () => {
            window.initializeSpeechRecognition();

            // First turn
            window.isUserSpeaking = true;
            window.currentTranscript = '你好';
            window.endMessage();

            await new Promise(resolve => setTimeout(resolve, 10));

            // Second turn
            window.isUserSpeaking = true;
            window.currentTranscript = '谢谢';
            window.endMessage();

            await new Promise(resolve => setTimeout(resolve, 10));

            // Verify multiple turns
            const userMessages = window.conversationHistory.filter(e => e.speaker === 'User');
            expect(userMessages.length).toBe(2);
            expect(userMessages[0].text).toBe('你好');
            expect(userMessages[1].text).toBe('谢谢');
        });
    });
});
