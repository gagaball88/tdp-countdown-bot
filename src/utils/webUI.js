import logger from "./logger.js";
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';

var data = "";
var clients = [];

const app = express();
const PORT = 8080;
let configPath = './config/config.json'

export async function startServer() {

    let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
	// -------------------------------
	// MAIN PAGE (SSE + TABBED UI)
	// -------------------------------
	// -------------------------------
	// MAIN PAGE (SSE + TABBED UI)
	// -------------------------------
	app.get("/", (req, res) => {
		// 1) Split the SSE `data` into lines for the initial display
		const initialMessages = data
			.split("<br>")
			.filter((msg) => msg.trim() !== "") // remove empty messages
			.map((msg) => `<div class="message">${msg}</div>`)
			.join("");
	
		// 2) Build the tab titles
		const slots = config.slots
			.map(
				(slot, index) => `
		<div class="tab" onclick="openTab(event, 'slot${index}')">
			Slot ${index + 1}
		</div>
		`
			)
			.join("");
	
		// 3) Build the tab contents (forms for each slot)
		const slotForms = config.slots
			.map((slot, index) => {
				return `
			<div id="slot${index}" class="tabcontent">
			<h2>Slot ${index + 1}</h2>
			<form id="form${index}">
				<label>Hour:</label>
				<input type="number" name="hour" value="${slot.hour}" required><br>
	
				<label>Day:</label>
				<input type="number" name="day" value="${slot.day}" required><br>
	
				<label>Month:</label>
				<input type="number" name="month" value="${slot.month}" required><br>
	
				<label>Year:</label>
				<input type="number" name="year" value="${slot.year}" required><br>
	
				<label>Message 1:</label>
				<input type="text" name="message1" value="${slot.message1.replace(
						/"/g,
						"&quot;"
					)}" required><br>
	
				<label>Message 2:</label>
				<input type="text" name="message2" value="${slot.message2.replace(
						/"/g,
						"&quot;"
					)}" required><br>
	
				<label>Message End:</label>
				<input type="text" name="messageEnd" value="${slot.messageEnd?.replace(
						/"/g,
						"&quot;"
					) || ""}"><br>
	
				<label>Picture End:</label>
				<input type="text" name="pictureEnd" value="${slot.pictureEnd || ""}"><br>
	
				<label>Active:</label><br>
				<input type="checkbox" class="checkbox-round" name="active" ${slot.active ? "checked" : ""
					}><br>
	
				<label>Mode:</label>
				<input type="text" name="mode" value="${slot.mode || ""}"><br>
	
				<label>Accuracy:</label>
				<input type="number" name="accuracy" value="${slot.accuracy || 5
					}"><br>
	
				<label>Day Count:</label><br>
				<input type="checkbox" class="checkbox-round" name="dayCount" ${slot.dayCount ? "checked" : ""
					}><br>
	
				<label>Picture Slot:</label>
				<input type="text" name="pictureSlot" value="${slot.pictureSlot || ""
					}"><br>
	
				<label>Post Time:</label>
				<input type="number" name="postTime" value="${slot.postTime || 0
					}"><br>
	
				<button type="button" onclick="saveSlot(${index})">
				Save
				</button>
				<button type="button" onclick="deleteSlot(${index})">
				Delete
				</button>
			</form>
			</div>
		`;
			})
			.join("");
	
		// 4) Combine everything into a single HTML response
		res.send(`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<title>TDP Countdown Bot</title>
			<style>
				/* Basic Dark Theme */
				body {
					font-family: Arial, sans-serif;
					background-color: #121212;
					color: #e0e0e0;
					margin: 0;
					padding: 20px;
				}
				h1 {
					text-align: center;
					margin-bottom: 20px;
				}
	
				/* Page layout: split into 50% for SSE and 50% for image */
				.container {
					display: flex;
					justify-content: space-between;
                    align-items: stretch;
					margin-bottom: 20px;
				}
	
				/* Left Section (SSE box) */
				#output {
					background-color: #1e1e1e;
					border: 1px solid #444;
					border-radius: 8px;
					padding: 15px;
					//max-height: 200px;
					overflow-y: auto;
					margin-bottom: 20px;
					width: 48%; /* Adjust width to 48% */
                    height: 100%; /* Ensure height fills the container */
				}
				.message {
					padding: 5px;
					border-bottom: 1px solid #444;
				}
				.message:last-child {
					border-bottom: none;
				}
				.message:hover {
					background-color: #333;
				}
	
				/* Right Section (image) */
				#image-container {
					width: 48%; /* Adjust width to 48% */
					text-align: center;
                    height: 100%; /* Ensure height fills the container */
				}
				#image-container img {
					width: 100%; /* Make image fill the container */
					border-radius: 8px;
					border: 1px solid #444;
                    height: 100%; /* Ensure image height is 100% */
                    object-fit: cover; /* Ensures the image covers the available space without distorting */
				}
	
				/* Tab Navigation */
				.tab {
					display: inline-block;
					padding: 10px;
					margin: 5px;
					background-color: #1e1e1e;
					border: 1px solid #444;
					cursor: pointer;
					border-radius: 4px;
				}
				.tab:hover {
					background-color: #333;
				}
				.tabcontent {
					display: none; /* Hidden by default */
					margin-top: 20px;
					background-color: #1e1e1e;
					padding: 15px;
					border-radius: 8px;
					border: 1px solid #444;
				}
				.tabcontent.active {
					display: block; /* Shown when active */
				}
				.checkbox-round {
					width: 32px;
					height: 32px;
					cursor: pointer;    
					background-color: #2c2c2c;
					border-radius: 50%;
					border: 1px solid #444;
					appearance: none;
					-webkit-appearance: none;
					outline: none;
					margin-left: 10px;
				}
				.checkbox-round:checked {
					background-color: white;
					border: 5px solid #444;
				}
				form {
					max-width: 600px;      /* Limit how wide the form can get */
					margin: 0 auto;        /* Center the form horizontally */
					padding: 20px;         /* Add internal spacing */
					background-color: #1e1e1e;
					border-radius: 8px;
					border: 1px solid #444;
				}
				label {
					display: inline-block;
					margin-bottom: 6px;
					font-weight: bold;
					font-size: 16px;
					color: #ccc;           /* Lighter label color */
				}
				input[type="text"],
				input[type="number"] {
					width: 100%;          /* Fill the container width */
					box-sizing: border-box; 
					padding: 10px;        /* Increase padding for a bigger clickable area */
					margin-bottom: 15px;  /* Spacing between fields */
					border-radius: 6px;   /* Rounded corners */
					border: 1px solid #444;  /* Slightly visible border */
					background-color: #2c2c2c; /* Dark background (if you're using a dark theme) */
					color: #e0e0e0;       /* Text color for dark theme */
					font-size: 16px;
				}
				input[type="checkbox"] {
					width: 32px;
					height: 32px;
					accent-color: #555;
					margin-right: 8px;
					margin-bottom: 10px;
					margin-left: 10px;
					cursor: pointer;
					border-radius: 6px;
				}
				button {
					margin-top: 20px;
					background-color: #333;
					color: #e0e0e0;
					border: 1px solid #444;
					border-radius: 4px;
					padding: 5px 10px;
					cursor: pointer;
					margin-right: 10px;
				}
				button:hover {
					background-color: #555;
				}
				/* Responsive design */
				@media (max-width: 600px) {
					body {
						padding: 10px;
					}
					#output {
						padding: 10px;
						max-height: 150px;
					}
					.tab {
						display: block;
						margin: 5px 0;
					}
				}
			</style>
		</head>
		<body>
			<h1>TDP Countdown Bot</h1>
	
			<div class="container">
				<!-- Left Section: SSE Output -->
				<div id="output">${initialMessages}</div>
	
				<!-- Right Section: Image -->
				<div id="image-container">
					<img src="./pictures/temp_img.jpg" alt="Image">
				</div>
			</div>
	
			<!-- Tabbed Interface -->
			<div id="tabs">${slots}</div>
			<div id="slotForms">${slotForms}</div>
			<button  class="addSlotBtn" onclick="addSlot()">Add New Slot</button>
	
			<script>
				// ---------------------------
				// SSE LISTENER FOR NEW MESSAGES
				// ---------------------------
				const evtSource = new EventSource("/events");
				const output = document.getElementById("output");
				evtSource.onmessage = (event) => {
					const messageDiv = document.createElement("div");
					messageDiv.classList.add("message");
					messageDiv.textContent = event.data; // Add new data
					output.appendChild(messageDiv); // Append new message
					output.scrollTop = output.scrollHeight; // Scroll to bottom
				};
	
				// ---------------------------
				// TAB LOGIC
				// ---------------------------
				function openTab(evt, tabName) {
					const tabcontent = document.getElementsByClassName("tabcontent");
					for (let i = 0; i < tabcontent.length; i++) {
						tabcontent[i].classList.remove("active");
					}
					const tabs = document.getElementsByClassName("tab");
					for (let i = 0; i < tabs.length; i++) {
						tabs[i].classList.remove("active");
					}
					document.getElementById(tabName).classList.add("active");
				}
	
				// ---------------------------
				// SLOT OPERATIONS
				// ---------------------------
                function saveSlot(index) {
					const form = document.getElementById("form" + index);
					const formData = new FormData(form);
					const slotData = {};
					formData.forEach((value, key) => {
						if (key === "active" || key === "dayCount") {
							slotData[key] = form[key].checked;
						} else {
							slotData[key] = value;
						}
					});
					fetch("/saveSlot/" + index, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(slotData)
					})
					.then((res) => res.json())
					.then((data) => {
						console.log(data.message);
						location.reload();
					})
					.catch((err) => console.error(err));
				}

				function deleteSlot(index) {
					fetch("/deleteSlot/" + index, {
						method: "DELETE"
					})
					.then((res) => res.json())
					.then((data) => {
						console.log(data.message);
						location.reload();
					})
					.catch((err) => console.error(err));
				}

				function addSlot() {
					fetch("/addSlot", {
						method: "POST"
					})
					.then((res) => res.json())
					.then((data) => {
						console.log(data.message);
				
						// Get the new slot index from the response
						const newIndex = data.index;
				
						// Add the new tab dynamically
						const newTab = document.createElement("div");
						newTab.classList.add("tab");
						newTab.addEventListener('click', function() {
                            openTab(event, 'slot' + newIndex);
                        });
						newTab.textContent = 'Slot ' + (newIndex + 1);
						document.getElementById("tabs").appendChild(newTab);
				
						// Add the new tab content dynamically
						const newTabContent = document.createElement("div");
						newTabContent.id = 'slot' + newIndex;
						newTabContent.classList.add("tabcontent");
				
						const heading = document.createElement("h2");
						heading.textContent = 'Slot ' + (newIndex + 1);
						newTabContent.appendChild(heading);
				
						const form = document.createElement("form");
						form.id = 'form' + newIndex;
				
						// Create the input fields and labels dynamically
						const fields = [
							{ label: "Hour:", name: "hour", type: "number", value: "0" },
							{ label: "Day:", name: "day", type: "number", value: "1" },
							{ label: "Month:", name: "month", type: "number", value: "1" },
							{ label: "Year:", name: "year", type: "number", value: "2025" },
							{ label: "Message 1:", name: "message1", type: "text", value: "" },
							{ label: "Message 2:", name: "message2", type: "text", value: "" },
							{ label: "Message End:", name: "messageEnd", type: "text", value: "" },
							{ label: "Picture End:", name: "pictureEnd", type: "text", value: "" },
							{ label: "Mode:", name: "mode", type: "text", value: "countdown" },
							{ label: "Accuracy:", name: "accuracy", type: "number", value: "5" },
							{ label: "Picture Slot:", name: "pictureSlot", type: "text", value: "" },
							{ label: "Post Time:", name: "postTime", type: "number", value: "0" }
                             ];
				
						fields.forEach(field => {
							const label = document.createElement("label");
							label.textContent = field.label;
							form.appendChild(label);
				
							const input = document.createElement("input");
							input.type = field.type;
							input.name = field.name;
							input.value = field.value;
							form.appendChild(input);
							form.appendChild(document.createElement("br"));
						});
				
						// Create Active checkbox
						const activeLabel = document.createElement("label");
						activeLabel.textContent = "Active:";
						form.appendChild(activeLabel);
						const activeCheckbox = document.createElement("input");
						activeCheckbox.type = "checkbox";
						activeCheckbox.name = "active";
						activeCheckbox.checked = true;
						form.appendChild(activeCheckbox);
						form.appendChild(document.createElement("br"));
				
						// Create Day Count checkbox
						const dayCountLabel = document.createElement("label");
						dayCountLabel.textContent = "Day Count:";
						form.appendChild(dayCountLabel);
						const dayCountCheckbox = document.createElement("input");
						dayCountCheckbox.type = "checkbox";
						dayCountCheckbox.name = "dayCount";
						dayCountCheckbox.checked = true;
						form.appendChild(dayCountCheckbox);
						form.appendChild(document.createElement("br"));
				
						// Create Save and Delete buttons
						const saveButton = document.createElement("button");
						saveButton.type = "button";
						saveButton.textContent = "Save";
                        saveButton.addEventListener('click', function() {
                            saveSlot(newIndex);
                        });
						form.appendChild(saveButton);

						const deleteButton = document.createElement("button");
						deleteButton.type = "button";
						deleteButton.textContent = "Delete";
                        deleteButton.addEventListener('click', function() {
                            deleteSlot(newIndex);
                        });
						form.appendChild(deleteButton);

						newTabContent.appendChild(form);
						document.getElementById("slotForms").appendChild(newTabContent);
                            
                        openTab(event, 'slot' + newIndex);
					})
					.catch((err) => console.error(err));
				}
			</script>
            <script>
                window.onload = function() {
                    // Get the height of the image after it's loaded
                    const img = document.querySelector("#image-container img");
                    const output = document.getElementById("output");

                    // Set the max height of the SSE box to match the height of the image
                    img.onload = function() {
                        const imgHeight = img.clientHeight; // Get the height of the image
                        output.style.maxHeight = imgHeight + "px"; // Set the max height of the SSE box
                    };
                    if (img.complete) {
                        const imgHeight = img.clientHeight;
                        output.style.maxHeight = imgHeight + "px";
                    }
                };
            </script>
		</body>
		</html>
	`);
	});
	
    // -------------------------------
    // SSE ENDPOINT
    // -------------------------------
    app.get("/events", (req, res) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        // Add this client to the list
        clients.push(res);

        // Remove the client when it disconnects
        req.on("close", () => {
            clients = clients.filter((client) => client !== res);
        });
    });

    app.use("/pictures", express.static("pictures"));

    // -------------------------------
    // POST /refreshData (optional, if you have it)
    // Example usage: curl -X POST http://localhost:8080/refreshData -H "Content-Type:application/json" -d '{"newData":"Hello!"}'
    app.post("/refreshData", (req, res) => {
        const { newData } = req.body;
        data += "<br>" + newData;
        // Notify all connected SSE clients
        clients.forEach((client) => {
            client.write(`data: ${newData}\n\n`);
        });
        res.json({ message: "Data refreshed successfully." });
    });

    // -------------------------------
    // SLOT OPERATIONS
    // -------------------------------
    app.post("/saveSlot/:index", (req, res) => {
        const index = parseInt(req.params.index, 10);
        config.slots[index] = {
            ...config.slots[index],
            ...req.body,
            hour: parseInt(req.body.hour, 10),
            day: parseInt(req.body.day, 10),
            month: parseInt(req.body.month, 10),
            year: parseInt(req.body.year, 10),
            accuracy: parseInt(req.body.accuracy, 10),
            postTime: parseInt(req.body.postTime, 10),
            active: req.body.active === true || req.body.active === "true",
            dayCount: req.body.dayCount === true || req.body.dayCount === "true"
        };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        res.json({ message: "Slot saved successfully." });
    });

    app.delete("/deleteSlot/:index", (req, res) => {
        const index = parseInt(req.params.index, 10);
        config.slots.splice(index, 1);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        res.json({ message: "Slot deleted successfully." });
    });

    app.post("/addSlot", (req, res) => {
        const newSlot = {
            hour: 0,
            day: 1,
            month: 1,
            year: 2025,
            message1: "",
            message2: "",
            messageEnd: "",
            pictureEnd: "",
            active: true,
            mode: "countdown",
            accuracy: 5,
            dayCount: true,
            pictureSlot: "",
            postTime: 0
        };
        config.slots.push(newSlot);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        res.json({
            message: "New slot added successfully.",
            index: config.slots.length - 1  // Return the index of the new slot
        });
    });

    // -------------------------------
    // START THE SERVER
    // -------------------------------
    app.listen(PORT, () => {
        logger(`Server running on port ${PORT}`);
    });
}

export async function refreshData(newData) {
    data += newData + "<br>";
    clients.forEach((client) => {
        client.write('data: ' + newData + "\n\n");
    });
}