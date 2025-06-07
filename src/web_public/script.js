document.addEventListener('DOMContentLoaded', () => {
    const logsContainer = document.getElementById('logs-container');
    const slotsContainer = document.getElementById('slots-container');
    const addSlotBtn = document.getElementById('add-slot-btn');
    const slotModal = document.getElementById('slot-modal');
    const closeModalBtn = slotModal.querySelector('.close-btn');
    const saveSlotBtn = document.getElementById('save-slot-btn');

    const latestPictureImg = document.getElementById('latest-picture');
    const noPictureMessage = document.getElementById('no-picture-message');

    // Global Settings Elements
    const debuggingEnvCheckbox = document.getElementById('debuggingEnv');
    const tumblrBlogNameInput = document.getElementById('tumblrBlogName');
    const discordChannelNameInput = document.getElementById('discordChannelName');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // Log Level Toggles
    const logLevelToggles = {
        DEBUG: document.getElementById('log-debug'),
        INFO: document.getElementById('log-info'),
        WARN: document.getElementById('log-warn'),
        ERROR: document.getElementById('log-error')
    };

    let currentSlots = [];
    let allLogs = []; // Stores all log messages

    // Function to display the latest picture
    function displayLatestPicture() {
        const imageUrl = '/pictures/temp_img.jpg';
        if (latestPictureImg && noPictureMessage) { // Ensure both elements are found
            latestPictureImg.src = `${imageUrl}?t=${new Date().getTime()}`;

            latestPictureImg.onload = () => {
                latestPictureImg.style.display = 'block';
                noPictureMessage.style.display = 'none';
            };

            latestPictureImg.onerror = () => {
                latestPictureImg.style.display = 'none';
                noPictureMessage.textContent = 'No picture available or picture failed to load.';
                noPictureMessage.style.display = 'block';
            };
        } else {
            // Fallback if elements are not found, though they are defined as constants
            if (noPictureMessage) {
                 noPictureMessage.textContent = "Image display components not found in HTML.";
                 noPictureMessage.style.display = 'block';
            }
            console.error("latestPictureImg or noPictureMessage element not found.");
        }
    }

    // Fetch initial data
    fetch('/api/initial-data')
        .then(response => response.json())
        .then(data => {
            currentSlots = data.slots || [];
            renderSlots();
            allLogs = data.initialMessages || []; // Store initial logs
            renderFilteredLogs(); // Render logs based on default toggle states
        })
        .catch(error => console.error('Error fetching initial data:', error));

    // Fetch initial global settings
    if (debuggingEnvCheckbox && tumblrBlogNameInput && discordChannelNameInput) { // Ensure elements exist
        fetch('/api/settings')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error fetching settings! status: ${response.status}`);
                }
                return response.json();
            })
            .then(settings => {
                debuggingEnvCheckbox.checked = settings.debuggingEnv || false;
                tumblrBlogNameInput.value = settings.tumblrBlogName || '';
                discordChannelNameInput.value = settings.discordChannelName || '';
            })
            .catch(error => {
                console.error('Error fetching global settings:', error);
                appendLog(`Error fetching global settings: ${error.message}`);
            });
    } else {
        console.warn('Global settings UI elements not found. Skipping fetch and population.');
    }

    // SSE for logs
    const eventSource = new EventSource('/events');
    eventSource.onmessage = event => {
        try {
            const data = JSON.parse(event.data);
            if (data && data.type === "new_picture") {
                displayLatestPicture();
            } else {
                // If it's not a new_picture event, treat it as a log message
                appendLog(event.data);
            }
        } catch (e) {
            // If parsing fails, assume it's a plain text log message
            appendLog(event.data);
        }
    };
    eventSource.onerror = error => {
        console.error('SSE error:', error);
        const errorLog = "ERROR: Error connecting to real-time log updates.";
        allLogs.push(errorLog);
        appendLog(errorLog);
    };

    // Parses log level from message string. Expects "LEVEL: message"
    function parseLogLevel(message) {
        const parts = message.match(/^([A-Z]+):/);
        if (parts && parts.length > 1) {
            const level = parts[1].toUpperCase();
            if (['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(level)) {
                return level;
            }
        }
        return 'INFO'; // Default level if parsing fails or level is unknown
    }

    function renderFilteredLogs() {
        logsContainer.innerHTML = ''; // Clear existing logs
        allLogs.forEach(message => {
            const level = parseLogLevel(message);
            if (logLevelToggles[level] && logLevelToggles[level].checked) {
                const logEntry = document.createElement('div');
                logEntry.textContent = message;
                logEntry.classList.add(`log-${level.toLowerCase()}`); // Optional: for level-specific styling
                logsContainer.appendChild(logEntry);
            }
        });
        logsContainer.scrollTop = logsContainer.scrollHeight; // Scroll to bottom
    }

    function appendLog(message) {
        const level = parseLogLevel(message);
        if (logLevelToggles[level] && logLevelToggles[level].checked) {
            const logEntry = document.createElement('div');
            logEntry.textContent = message;
            logEntry.classList.add(`log-${level.toLowerCase()}`);
            logsContainer.appendChild(logEntry);
            logsContainer.scrollTop = logsContainer.scrollHeight;
        }
    }

    // Add event listeners to log level toggles
    Object.values(logLevelToggles).forEach(toggle => {
        if (toggle) { // Ensure toggle element exists
            toggle.addEventListener('change', renderFilteredLogs);
        }
    });

    function renderSlots() {
        slotsContainer.innerHTML = ''; // Clear existing slots
        currentSlots.forEach((slot, index) => {
            const slotDiv = document.createElement('div');
            slotDiv.classList.add('slot-summary');
            const day = String(slot.day).padStart(2, '0');
            const month = String(slot.month).padStart(2, '0');
            const year = slot.year;
            const hour = String(slot.hour).padStart(2, '0');
            const postHour = String(slot.postTime).padStart(2, '0');

            slotDiv.innerHTML = `
                <h4>Slot ${index + 1} (Mode: ${slot.mode})</h4>
                <p>Date: ${day}.${month}.${year}</p>
                <p>Time: ${hour}:00</p>
                <p>Post Time: ${postHour}:00</p>
                <p>Message1: ${slot.message1.substring(0, 50)}...</p>
                <p>Active: ${slot.active}</p>
                <button class="edit-slot-btn" data-index="${index}">Edit</button>
                <button class="delete-slot-btn" data-index="${index}">Delete</button>
            `;
            slotsContainer.appendChild(slotDiv);
        });

        document.querySelectorAll('.edit-slot-btn').forEach(btn => {
            btn.addEventListener('click', () => openSlotModal(parseInt(btn.dataset.index)));
        });
        document.querySelectorAll('.delete-slot-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteSlot(parseInt(btn.dataset.index)));
        });
    }

    function openSlotModal(index = null) {
        console.log(`openSlotModal received index: ${index} (type: ${typeof index})`); // Log received index

        const slot = index !== null && currentSlots[index] !== undefined ? currentSlots[index] : {};
        // Ensure 'slot-index' input exists before trying to set its value
        const slotIndexInput = document.getElementById('slot-index');

        if (slotIndexInput) {
            slotIndexInput.value = index !== null ? String(index) : ''; // Explicitly use String()
            console.log(`Set #slot-index input value to: '${slotIndexInput.value}'`);
        } else {
            console.error("#slot-index input field not found!");
            // If this happens, the form can't be saved correctly.
        }

        // Populate the rest of the form...
        document.getElementById('slot-hour').value = slot.hour !== undefined ? slot.hour : new Date().getHours();
        document.getElementById('slot-day').value = slot.day !== undefined ? slot.day : new Date().getDate();
        document.getElementById('slot-month').value = slot.month !== undefined ? slot.month : new Date().getMonth() + 1;
        document.getElementById('slot-year').value = slot.year !== undefined ? slot.year : new Date().getFullYear();
        document.getElementById('slot-accuracy').value = slot.accuracy !== undefined ? slot.accuracy : 5;
        document.getElementById('slot-postTime').value = slot.postTime !== undefined ? slot.postTime : 0;
        document.getElementById('slot-active').checked = slot.active !== undefined ? slot.active : true;
        document.getElementById('slot-dayCount').checked = slot.dayCount !== undefined ? slot.dayCount : true;
        document.getElementById('slot-message1').value = slot.message1 || '';
        document.getElementById('slot-message2').value = slot.message2 || '';
        document.getElementById('slot-mode').value = slot.mode || 'countdown';
        document.getElementById('slot-messageEnd').value = slot.messageEnd || '';
        document.getElementById('slot-pictureEnd').value = slot.pictureEnd || '';
        document.getElementById('slot-pictureSlot').value = slot.pictureSlot || '';

        slotModal.style.display = 'block';
    }

    closeModalBtn.addEventListener('click', () => {
        slotModal.style.display = 'none';
    });

    addSlotBtn.addEventListener('click', () => {
        let originalAddSlotData; // Variable to store data from /addSlot response

        fetch('/addSlot', { method: 'POST' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error when adding slot! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data_from_addSlot => {
                originalAddSlotData = data_from_addSlot; // Store the response
                if (originalAddSlotData.message === "New slot added successfully." && originalAddSlotData.index !== undefined) {
                    // Successfully added, now refresh the full list of slots
                    return fetch('/api/initial-data');
                } else {
                    // Handle cases where addSlot didn't succeed as expected or index is missing
                    throw new Error(originalAddSlotData.message || "Failed to add slot or received invalid data from server.");
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error when fetching initial data! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data_from_initialData => {
                currentSlots = data_from_initialData.slots || [];
                renderSlots(); // Re-render the main slots display
                // Now open the modal for the newly added slot, using the stored index
                if (originalAddSlotData && originalAddSlotData.index !== undefined) {
                    console.log(`Calling openSlotModal with index from addSlot response: ${originalAddSlotData.index}`);
                    openSlotModal(originalAddSlotData.index);
                } else {
                    // This case should ideally be caught by earlier error handling
                    console.error("Error: Could not retrieve index of newly added slot for opening modal.");
                    alert("Error: Could not open the new slot for editing. Please refresh and try again.");
                }
            })
            .catch(error => {
                console.error('Error during add slot process:', error);
                alert(`Error during add slot process: ${error.message}`);
            });
    });

    saveSlotBtn.addEventListener('click', () => {
        const index = document.getElementById('slot-index').value;
        const isNewSlot = index === '';

        const slotData = {
            hour: parseInt(document.getElementById('slot-hour').value),
            day: parseInt(document.getElementById('slot-day').value),
            month: parseInt(document.getElementById('slot-month').value),
            year: parseInt(document.getElementById('slot-year').value),
            accuracy: parseInt(document.getElementById('slot-accuracy').value),
            postTime: parseInt(document.getElementById('slot-postTime').value),
            active: document.getElementById('slot-active').checked,
            dayCount: document.getElementById('slot-dayCount').checked,
            message1: document.getElementById('slot-message1').value,
            message2: document.getElementById('slot-message2').value,
            mode: document.getElementById('slot-mode').value,
            messageEnd: document.getElementById('slot-messageEnd').value,
            pictureEnd: document.getElementById('slot-pictureEnd').value,
            pictureSlot: document.getElementById('slot-pictureSlot').value,
        };

        if (isNaN(slotData.hour) || slotData.hour < 0 || slotData.hour > 23) {
            alert("Hour must be between 0 and 23.");
            return;
        }

        const url = `/saveSlot/${index}`;
        console.log(`Saving slot with index: ${index}, URL: ${url}`); // New logging line
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slotData)
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status === 200) {
                alert(body.message);
                slotModal.style.display = 'none';
                // Refresh slots from server
                return fetch('/api/initial-data');
            } else {
                // Handle errors, potentially displaying specific validation messages from server
                let errorMessage = body.message || "Failed to save slot.";
                if (body.errors) {
                    errorMessage += "\n" + Object.values(body.errors).join("\n");
                }
                throw new Error(errorMessage);
            }
        })
        .then(response => response.json())
        .then(data => {
            currentSlots = data.slots || [];
            renderSlots();
        })
        .catch(error => {
            console.error('Error saving slot:', error);
            alert(`Error saving slot: ${error.message}`);
        });
    });

    function deleteSlot(index) {
        if (!confirm(`Are you sure you want to delete slot ${index + 1}?`)) {
            return;
        }
        fetch(`/deleteSlot/${index}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.message === "Slot deleted successfully.") {
                     // Refresh slots from server
                    return fetch('/api/initial-data');
                } else {
                    throw new Error(data.message || "Failed to delete slot.");
                }
            })
            .then(response => response.json())
            .then(data => {
                currentSlots = data.slots || [];
                renderSlots();
            })
            .catch(error => {
                console.error('Error deleting slot:', error);
                alert(`Error deleting slot: ${error.message}`);
            });
    }

    displayLatestPicture(); // Call it on load

    // Event listener for saving global settings
    if (saveSettingsBtn && debuggingEnvCheckbox && tumblrBlogNameInput && discordChannelNameInput) {
        saveSettingsBtn.addEventListener('click', () => {
            const settingsData = {
                debuggingEnv: debuggingEnvCheckbox.checked,
                tumblrBlogName: tumblrBlogNameInput.value,
                discordChannelName: discordChannelNameInput.value
            };

            fetch('/api/settings/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsData)
            })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                if (status === 200) {
                    alert(body.message || "Global settings saved successfully.");
                } else {
                    let errorMessage = body.message || "Failed to save global settings.";
                    if (body.errors) {
                        errorMessage += "\n" + Object.values(body.errors).join("\n");
                    }
                    throw new Error(errorMessage);
                }
            })
            .catch(error => {
                console.error('Error saving global settings:', error);
                alert(`Error saving global settings: ${error.message}`);
            });
        });
    } else {
        console.warn('#save-settings-btn or other settings UI elements not found. Global settings cannot be saved via UI.');
    }

    //Interval dynamic image change
    setInterval(displayLatestPicture, 60000); // Refresh every 60 seconds

    // Dark Mode Toggle Functionality
    const darkModeToggle = document.getElementById('darkModeToggle');

    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        if (darkModeToggle) darkModeToggle.checked = true;
    }

    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        if (darkModeToggle) darkModeToggle.checked = false;
    }

    // Check localStorage for dark mode preference
    // Default to dark mode if no preference is set
    if (localStorage.getItem('darkMode') === 'disabled') {
        disableDarkMode();
    } else {
        enableDarkMode(); // Default to dark mode
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            if (darkModeToggle.checked) {
                enableDarkMode();
            } else {
                disableDarkMode();
            }
        });
    }
});
