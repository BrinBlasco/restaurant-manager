document.addEventListener("DOMContentLoaded", () => {
    // --- Mock Data ---
    // Roles should ideally be fetched or consistent with roles.js
    let mockRoles = JSON.parse(localStorage.getItem("mockRoles")) || [
        { id: "manager", name: "Manager" },
        { id: "chef", name: "Chef" },
        { id: "waiter", name: "Waiter" },
        { id: "menu_editor", name: "Menu Editor" },
        { id: "admin", name: "Administrator" }, // Added admin role
    ];

    let mockEmployees = JSON.parse(localStorage.getItem("mockEmployees")) || [
        {
            upid: "UPID_ALICE123",
            name: "Alice Wonderland",
            email: "alice@example.com",
            roles: ["manager", "admin"],
        },
        {
            upid: "UPID_BOB456",
            name: "Bob The Builder",
            email: "bob@example.com",
            roles: ["chef", "menu_editor"],
        },
        {
            upid: "UPID_CHARLIE789",
            name: "Charlie Chaplin",
            email: "charlie@example.com",
            roles: ["waiter"],
        },
        { upid: "UPID_DAVID007", name: "David Copperfield", email: "david@example.com", roles: [] }, // Employee with no roles yet
    ];

    // Persist data to localStorage for basic simulation between pages
    const saveData = () => {
        localStorage.setItem("mockEmployees", JSON.stringify(mockEmployees));
        // We don't save roles here, roles.js manages that primarily
    };

    // --- DOM Elements ---
    const employeeListContainer = document.getElementById("employee-list");
    const showAssignFormBtn = document.getElementById("show-assign-form-btn");
    const employeeFormContainer = document.getElementById("employee-form-container");
    const employeeForm = document.getElementById("employee-access-form");
    const formPlaceholder = document.getElementById("form-placeholder");
    const formTitle = document.getElementById("employee-form-title");
    const upidInput = document.getElementById("upid");
    const findUserBtn = document.getElementById("find-user-btn");
    const userDetailsReadonly = document.getElementById("user-details-readonly");
    const userNameDisplay = document.getElementById("user-name-display");
    const userEmailDisplay = document.getElementById("user-email-display");
    const assignRolesListDiv = document.getElementById("assign-roles-list");
    const cancelBtn = employeeForm.querySelector(".cancel-edit-btn");
    const hrSeparator = userDetailsReadonly.nextElementSibling; // Get the <hr>
    const searchInput = document.getElementById("employee-search");

    // --- State ---
    let selectedEmployeeUPID = null;
    let currentFormMode = "placeholder"; // 'placeholder', 'assign', 'edit'

    // --- Rendering ---
    function renderEmployeeList(employeesToRender = mockEmployees) {
        employeeListContainer.innerHTML = ""; // Clear list
        if (employeesToRender.length === 0) {
            employeeListContainer.innerHTML =
                '<div class="list-card"><p>No employees found matching your search.</p></div>';
            return;
        }

        employeesToRender.forEach((emp) => {
            const card = document.createElement("div");
            card.className = "list-card employee-card";
            card.dataset.upid = emp.upid;
            if (emp.upid === selectedEmployeeUPID) {
                card.classList.add("selected");
            }

            const rolesHtml = emp.roles
                .map((roleId) => {
                    const role = mockRoles.find((r) => r.id === roleId);
                    return `<span class="role-tag">${role ? role.name : "Unknown Role"}</span>`;
                })
                .join("");

            card.innerHTML = `
                <div class="card-main-info">
                    <span class="upid-display">${emp.upid}</span>
                    <strong class="name-display">${emp.name}</strong>
                    <span class="email-display">${emp.email}</span>
                </div>
                <div class="roles-assigned">
                    ${
                        rolesHtml ||
                        '<span style="color: var(--secondary-text-color); font-size: 0.9em;">No roles assigned</span>'
                    }
                </div>
                <div class="card-actions">
                    <button class="btn btn-secondary btn-sm edit-employee-btn">Edit Roles</button>
                </div>
            `;

            // Event listener for selecting the card / triggering edit
            card.addEventListener("click", (e) => {
                if (!e.target.classList.contains("edit-employee-btn")) {
                    // If clicking card but not the button, still select
                    handleSelectEmployee(emp.upid);
                }
            });
            card.querySelector(".edit-employee-btn").addEventListener("click", () => {
                handleSelectEmployee(emp.upid);
            });

            employeeListContainer.appendChild(card);
        });
    }

    function populateRoleCheckboxes(assignedRoles = []) {
        assignRolesListDiv.innerHTML = ""; // Clear existing
        if (mockRoles.length === 0) {
            assignRolesListDiv.innerHTML =
                "<p><em>No roles defined. Please create roles on the Roles page first.</em></p>";
            return;
        }
        mockRoles.forEach((role) => {
            const isChecked = assignedRoles.includes(role.id);
            const div = document.createElement("div");
            div.classList.add("checkbox-item");
            div.innerHTML = `
                <input type="checkbox" id="role-assign-${role.id}" name="roles" value="${
                role.id
            }" ${isChecked ? "checked" : ""}>
                <label for="role-assign-${role.id}">${role.name}</label>
            `;
            assignRolesListDiv.appendChild(div);
        });
    }

    // --- UI Updates ---
    function showForm(mode, employee = null) {
        currentFormMode = mode;
        formPlaceholder.classList.add("hidden");
        employeeForm.classList.remove("hidden");
        hrSeparator.classList.add("hidden"); // Hide separator initially

        if (mode === "edit") {
            if (!employee) return; // Should not happen
            selectedEmployeeUPID = employee.upid;
            formTitle.textContent = `Edit Roles for ${employee.name}`;
            upidInput.value = employee.upid;
            upidInput.readOnly = true;
            findUserBtn.classList.add("hidden"); // Hide find button when editing
            // Simulate finding user details & populating roles
            userNameDisplay.textContent = employee.name;
            userEmailDisplay.textContent = employee.email;
            userDetailsReadonly.classList.remove("hidden");
            hrSeparator.classList.remove("hidden");
            populateRoleCheckboxes(employee.roles);
        } else {
            // mode === 'assign'
            selectedEmployeeUPID = null; // Clear selection
            formTitle.textContent = "Assign Roles to New/Existing User";
            employeeForm.reset(); // Clear form fields
            upidInput.readOnly = false;
            findUserBtn.classList.remove("hidden");
            userDetailsReadonly.classList.add("hidden");
            assignRolesListDiv.innerHTML =
                "<p><em>Enter UPID and click Find to load roles.</em></p>";
        }
        updateSelectedCardVisualState(); // Update highlighting in the list
    }

    function showPlaceholder() {
        currentFormMode = "placeholder";
        selectedEmployeeUPID = null; // Clear selection state
        formPlaceholder.classList.remove("hidden");
        employeeForm.classList.add("hidden");
        userDetailsReadonly.classList.add("hidden");
        hrSeparator.classList.add("hidden");
        updateSelectedCardVisualState(); // Remove highlighting
    }

    function updateSelectedCardVisualState() {
        document.querySelectorAll(".employee-card").forEach((card) => {
            if (card.dataset.upid === selectedEmployeeUPID) {
                card.classList.add("selected");
            } else {
                card.classList.remove("selected");
            }
        });
    }

    // --- Event Handlers ---
    function handleSelectEmployee(upid) {
        const employee = mockEmployees.find((emp) => emp.upid === upid);
        if (employee) {
            showForm("edit", employee);
        }
    }

    function handleFindUser() {
        const upid = upidInput.value.trim();
        if (!upid) {
            alert("Please enter a UPID.");
            return;
        }
        // --- Simulation: Find user in mock data ---
        const foundUser = mockEmployees.find((emp) => emp.upid === upid);

        if (foundUser) {
            userNameDisplay.textContent = foundUser.name;
            userEmailDisplay.textContent = foundUser.email;
            userDetailsReadonly.classList.remove("hidden");
            hrSeparator.classList.remove("hidden");
            populateRoleCheckboxes(foundUser.roles); // Populate roles checkboxes based on found user
            // Don't make UPID readonly here, allow saving for this UPID
        } else {
            alert(
                `User with UPID "${upid}" not found (in this simulation). You can still assign roles, and if saved, this will be treated as a new user invite (in a real app).`
            );
            userDetailsReadonly.classList.add("hidden");
            hrSeparator.classList.add("hidden");
            // Allow assigning roles even if user not found yet
            populateRoleCheckboxes([]); // Show empty checkboxes
        }
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const upid = formData.get("upid");
        const assignedRoles = formData.getAll("roles");

        if (!upid) {
            alert("UPID cannot be empty.");
            return;
        }

        console.log("Simulating: Saving roles for UPID:", upid, "Roles:", assignedRoles);

        // --- Simulation: Update mock data ---
        const employeeIndex = mockEmployees.findIndex((emp) => emp.upid === upid);
        if (employeeIndex !== -1) {
            // Update existing employee
            mockEmployees[employeeIndex].roles = assignedRoles;
            console.log("Existing employee roles updated.");
        } else {
            // Add as new employee (basic simulation) - requires name/email in real app
            // For now, just add with UPID and roles if details aren't shown
            if (userDetailsReadonly.classList.contains("hidden")) {
                // If user details weren't loaded (e.g. new user) - use placeholder name/email
                mockEmployees.push({
                    upid: upid,
                    name: `User ${upid}`,
                    email: "unknown@example.com",
                    roles: assignedRoles,
                });
                console.log("New employee entry created (basic).");
            } else {
                // User details were loaded via Find, but somehow index was -1 (error case)
                alert("Error: Could not find employee to update after finding them.");
                return; // Don't proceed
            }
        }
        saveData(); // Persist changes
        renderEmployeeList(); // Update the table view
        showPlaceholder(); // Go back to placeholder state
        alert(`Role assignments saved for ${upid}.`);
        // --- End Simulation ---
    }

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredEmployees = mockEmployees.filter(
            (emp) =>
                emp.upid.toLowerCase().includes(searchTerm) ||
                emp.name.toLowerCase().includes(searchTerm) ||
                emp.email.toLowerCase().includes(searchTerm)
        );
        renderEmployeeList(filteredEmployees);
    }

    // --- Initial Setup ---
    showAssignFormBtn.addEventListener("click", () => showForm("assign"));
    cancelBtn.addEventListener("click", showPlaceholder);
    findUserBtn.addEventListener("click", handleFindUser);
    employeeForm.addEventListener("submit", handleFormSubmit);
    searchInput.addEventListener("input", handleSearch);

    // Load initial data
    renderEmployeeList();
    showPlaceholder(); // Start in placeholder state
});
