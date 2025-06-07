document.addEventListener('DOMContentLoaded', () => {
    const logsContainer = document.getElementById('logs-container');
    const slotsContainer = document.getElementById('slots-container');
    const addSlotBtn = document.getElementById('add-slot-btn');
    const slotModal = document.getElementById('slot-modal');
    const closeModalBtn = slotModal.querySelector('.close-btn');
    const saveSlotBtn = document.getElementById('save-slot-btn');

    const latestPictureImg = document.getElementById('latest-picture');
    const noPictureMessage = document.getElementById('no-picture-message');

    let currentSlots = [];

    // Function to display the latest picture
    function displayLatestPicture() {
        const imageUrl = '/pictures/temp_img.jpg';
        // Check if latestPictureImg element exists
        if (latestPictureImg) {
            // Append a timestamp to prevent caching if the image updates frequently
            latestPictureImg.src = `${imageUrl}?t=${new Date().getTime()}`;
            latestPictureImg.style.display = 'block';
            if (noPictureMessage) { // Check if noPictureMessage element exists
                 noPictureMessage.style.display = 'none';
            }
        } else if (noPictureMessage) { // If image element doesn't exist, but message element does
            noPictureMessage.textContent = "Latest picture display element not found.";
            noPictureMessage.style.display = 'block';
        }
    }

    // Fetch initial data
    fetch('/api/initial-data')
        .then(response => response.json())
        .then(data => {
            currentSlots = data.slots || [];
            renderSlots();
            data.initialMessages.forEach(log => appendLog(log));
            // displayLatestPicture(); // Called at the end of DOMContentLoaded instead
        })
        .catch(error => console.error('Error fetching initial data:', error));

    // SSE for logs
    const eventSource = new EventSource('/events');
    eventSource.onmessage = event => {
        appendLog(event.data);
    };
    eventSource.onerror = error => {
        console.error('SSE error:', error);
        appendLog('Error connecting to real-time log updates.');
    };

    function appendLog(message) {
        const logEntry = document.createElement('div');
        logEntry.textContent = message; // Server sends plain text, no need to escape here for textContent
        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight; // Scroll to bottom
    }

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
            // Potentially alert the user or disable save button.
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
        document.getElementById('slot-message1').value = slot.message1 || 'New Message 1';
        document.getElementById('slot-message2').value = slot.message2 || 'New Message 2';
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
                // alert("New slot added. You can now edit it."); // Consider if alert is needed or if modal opening is enough

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

        // Basic client-side validation example
        // if (slotData.message1.trim() === "" || slotData.message2.trim() === "") {
        //     alert("Message 1 and Message 2 cannot be empty.");
        //     return;
        // } // This check is now removed
        if (isNaN(slotData.hour) || slotData.hour < 0 || slotData.hour > 23) {
            alert("Hour must be between 0 and 23.");
            return;
        }
        // Add more validations as needed, mirroring backend if possible

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
            // If a pictureSlot was saved, attempt to display it.
            // This assumes that saving a slot might change the "latest picture".
            // if (slotData.pictureSlot) { // Removed dynamic picture display based on slot
            //     displayLatestPicture(slotData.pictureSlot);
            // } else {
            // } // All calls to displayLatestPicture with arguments are removed.
            // The new displayLatestPicture() will be called on load and potentially by an interval.
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

    // Initial call to display a picture if one is available (e.g. from a default slot)
    // This needs a defined logic, e.g., finding the first active slot with a picture.
    // For now, it will show "No picture available yet." by default.
    // displayLatestPicture(findInitialPicture(currentSlots)); // Removed

    // Placeholder: How to determine the "latest" picture?
    // Option 1: Backend sends it in /api/initial-data.
    // Option 2: SSE event specifically for picture updates.
    // Option 3: Client derives it (e.g., picture from the most recently active slot, or a designated "main" picture slot).

    displayLatestPicture(); // Call it on load

    // Potentially set an interval if the image is expected to change dynamically
    // and you want the UI to refresh it without a full page reload.
    // setInterval(displayLatestPicture, 60000); // Refresh every 60 seconds, for example
});

// Example helper: function findInitialPicture(slots) { // This helper is no longer used
//    const activeSlotWithPic = slots.find(s => s.active && s.pictureSlot);
//    return activeSlotWithPic ? activeSlotWithPic.pictureSlot : null;
// }
