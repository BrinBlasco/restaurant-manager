document.addEventListener("DOMContentLoaded", () => {
    // --- Mock Data ---
    const mockAvailablePermissions = [
        { id: "view_employee_list", description: "Can view the list of employees" },
        { id: "assign_employee_roles", description: "Can assign roles to employees" },
        { id: "view_roles", description: "Can view the list of roles and their permissions" },
        { id: "create_role", description: "Can create new roles" },
        {
            id: "edit_role_permissions",
            description: "Can change the permissions assigned to a role",
        },
        { id: "delete_role", description: "Can delete roles" },
        { id: "access_kitchen_dashboard", description: "Can access the kitchen dashboard page" },
        { id: "access_waiter_interface", description: "Can access the waiter interface page" },
        { id: "edit_menu_item", description: "Can add, edit, or delete menu items" },
        { id: "view_reports", description: "Can view company reports" },
        { id: "edit_company_profile", description: "Can edit the company profile details" },
        // Add all your granular permissions here
    ];

    let mockRoles = [
        {
            id: "manager",
            name: "Manager",
            description: "Oversees staff and operations",
            permissions: [
                "view_employee_list",
                "assign_employee_roles",
                "view_reports",
                "view_roles",
            ],
        },
        {
            id: "chef",
            name: "Chef",
            description: "Manages kitchen and menu",
            permissions: ["access_kitchen_dashboard", "edit_menu_item"],
        },
        {
            id: "waiter",
            name: "Waiter",
            description: "Takes orders and serves customers",
            permissions: ["access_waiter_interface", "view_menu"],
        },
        {
            id: "menu_editor",
            name: "Menu Editor",
            description: "Specifically manages the menu",
            permissions: ["edit_menu_item", "view_menu"],
        },
    ];

    let mockEmployees = [
        {
            upid: "UPID_ALICE123",
            name: "Alice Wonderland",
            email: "alice@example.com",
            roles: ["manager"],
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
    ];

    // --- Get DOM Elements ---
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");
    const grantAccessBtn = document.getElementById("grant-access-btn");
    const createRoleBtn = document.getElementById("create-role-btn");
    const employeeAccessModal = document.getElementById("employee-access-modal");
    const roleEditModal = document.getElementById("role-edit-modal");
    const modals = document.querySelectorAll(".modal");
    const closeButtons = document.querySelectorAll(".modal .close-btn");
    const cancelButtons = document.querySelectorAll(".modal .cancel-btn");

    const employeeListTableBody = document.getElementById("employee-list");
    const roleListTableBody = document.getElementById("role-list");
    const permissionsDictionaryList = document.getElementById("permissions-dictionary");

    // Employee Access Modal Elements
    const employeeAccessForm = document.getElementById("employee-access-form");
    const upidInput = document.getElementById("upid");
    const findUserBtn = document.getElementById("find-user-btn");
    const userDetailsReadonly = document.getElementById("user-details-readonly");
    const userNameDisplay = document.getElementById("user-name-display");
    const userEmailDisplay = document.getElementById("user-email-display");
    const assignRolesListDiv = document.getElementById("assign-roles-list");
    const employeeAccessModalTitle = document.getElementById("employee-access-modal-title");

    // Role Edit Modal Elements
    const roleEditForm = document.getElementById("role-edit-form");
    const roleIdInput = document.getElementById("role-id");
    const roleNameInput = document.getElementById("role-name");
    const roleDescInput = document.getElementById("role-desc");
    const assignPermissionsListDiv = document.getElementById("assign-permissions-list");
    const roleEditModalTitle = document.getElementById("role-edit-modal-title");

    // --- Utility Functions ---
    function openModal(modal) {
        if (modal) modal.style.display = "block";
    }
    function closeModal(modal) {
        if (modal) modal.style.display = "none";
    }
    function clearForm(form) {
        if (form) form.reset();
        // Also clear dynamic content if needed (like user details, checkbox states)
        if (userDetailsReadonly) userDetailsReadonly.style.display = "none";
        if (assignRolesListDiv)
            assignRolesListDiv.innerHTML =
                "<p><em>(Find user by UPID to see available roles)</em></p>";
        if (assignPermissionsListDiv) populatePermissionsCheckboxes(); // Reset permissions list
        if (roleIdInput) roleIdInput.value = ""; // Clear hidden role ID
        if (upidInput) upidInput.readOnly = false; // Make UPID editable again for add modal
    }

    // --- Populate UI ---
    function populatePermissionsCheckboxes(selectedPermissions = []) {
        assignPermissionsListDiv.innerHTML = ""; // Clear existing
        mockAvailablePermissions.forEach((perm) => {
            const isChecked = selectedPermissions.includes(perm.id);
            const div = document.createElement("div");
            div.classList.add("checkbox-item");
            div.innerHTML = `
                <input type="checkbox" id="perm-${perm.id}" name="permissions" value="${perm.id}" ${
                isChecked ? "checked" : ""
            }>
                <label for="perm-${perm.id}">${perm.description} (<code>${perm.id}</code>)</label>
            `;
            assignPermissionsListDiv.appendChild(div);
        });
    }

    function populateRolesCheckboxes(selectedRoles = []) {
        assignRolesListDiv.innerHTML = ""; // Clear existing
        if (mockRoles.length === 0) {
            assignRolesListDiv.innerHTML =
                '<p><em>No roles defined yet. Create roles in the "Roles & Permissions" tab first.</em></p>';
            return;
        }
        mockRoles.forEach((role) => {
            const isChecked = selectedRoles.includes(role.id);
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

    function renderEmployeeTable() {
        employeeListTableBody.innerHTML = ""; // Clear existing
        mockEmployees.forEach((emp) => {
            const rolesHtml = emp.roles
                .map((roleId) => {
                    const role = mockRoles.find((r) => r.id === roleId);
                    return `<span class="role-tag">${role ? role.name : "Unknown Role"}</span>`;
                })
                .join("");
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${emp.upid}</td>
                <td>${emp.name}</td>
                <td>${emp.email}</td>
                <td>${rolesHtml}</td>
                <td>
                    <button class="btn btn-secondary btn-sm edit-employee-roles-btn" data-upid="${emp.upid}">Edit Roles</button>
                    <!-- Add other actions like deactivate if needed -->
                </td>
            `;
            employeeListTableBody.appendChild(row);
        });
        // Re-attach listeners for edit buttons
        attachEditEmployeeListeners();
    }

    function renderRoleTable() {
        roleListTableBody.innerHTML = ""; // Clear existing
        mockRoles.forEach((role) => {
            const row = document.createElement("tr");
            // Simple permission summary for demo
            const permissionsSummary =
                role.permissions.slice(0, 3).join(", ") +
                (role.permissions.length > 3 ? "..." : "");
            row.innerHTML = `
                <td>${role.name}</td>
                <td>${role.description}</td>
                <td><span title="${role.permissions.join(", ")}">${
                permissionsSummary || "None"
            }</span></td>
                <td>
                     <button class="btn btn-secondary btn-sm edit-role-btn" data-role-id="${
                         role.id
                     }">Edit</button>
                     <button class="btn btn-danger btn-sm delete-role-btn" data-role-id="${
                         role.id
                     }">Delete</button>
                </td>
             `;
            roleListTableBody.appendChild(row);
        });
        // Re-attach listeners for edit/delete buttons
        attachEditDeleteRoleListeners();
    }

    function renderPermissionsDictionary() {
        permissionsDictionaryList.innerHTML = "";
        mockAvailablePermissions.forEach((perm) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${perm.description}</strong> (<code>${perm.id}</code>)`;
            permissionsDictionaryList.appendChild(li);
        });
    }

    // --- Event Listeners ---

    // Tab Switching
    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const targetTab = button.getAttribute("data-tab");
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            tabContents.forEach((content) => content.classList.remove("active"));
            button.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
        });
    });

    // Modal Opening
    grantAccessBtn.addEventListener("click", () => {
        employeeAccessModalTitle.textContent = "Grant Access / Assign Roles";
        clearForm(employeeAccessForm); // Reset form for adding
        openModal(employeeAccessModal);
    });

    createRoleBtn.addEventListener("click", () => {
        roleEditModalTitle.textContent = "Create New Role";
        clearForm(roleEditForm); // Reset form for adding
        populatePermissionsCheckboxes(); // Show all permissions unchecked
        openModal(roleEditModal);
    });

    // Modal Closing
    closeButtons.forEach((button) =>
        button.addEventListener("click", (e) => closeModal(e.target.closest(".modal")))
    );
    cancelButtons.forEach((button) =>
        button.addEventListener("click", (e) => closeModal(e.target.closest(".modal")))
    );
    window.addEventListener("click", (event) => {
        if (event.target.classList.contains("modal")) {
            closeModal(event.target);
        }
    });

    // "Find User" Button (Simulated)
    findUserBtn.addEventListener("click", () => {
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
            userDetailsReadonly.style.display = "block";
            populateRolesCheckboxes(foundUser.roles); // Populate roles checkboxes based on found user
            // If editing, make UPID read-only after finding
            if (employeeAccessModalTitle.textContent.includes("Edit")) {
                upidInput.readOnly = true;
            }
        } else {
            alert(`User with UPID "${upid}" not found (in this simulation).`);
            userDetailsReadonly.style.display = "none";
            assignRolesListDiv.innerHTML = "<p><em>User not found.</em></p>";
        }
        // --- End Simulation ---
    });

    // Form Submission (Employee Access - Add/Edit Roles)
    employeeAccessForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const upid = formData.get("upid");
        const assignedRoles = formData.getAll("roles"); // Gets array of checked role IDs

        console.log("Simulating: Saving roles for UPID:", upid, "Roles:", assignedRoles);

        // --- Simulation: Update mock data ---
        const employeeIndex = mockEmployees.findIndex((emp) => emp.upid === upid);
        if (employeeIndex !== -1) {
            mockEmployees[employeeIndex].roles = assignedRoles;
            console.log("Employee roles updated in mock data.");
            renderEmployeeTable(); // Update the table view
            alert(`Roles updated for ${upid}.`);
        } else {
            // This assumes the user was 'found' - realistically you'd handle adding a new entry if needed
            alert(
                `Error: Employee ${upid} not found during save (should not happen if Find User worked).`
            );
        }
        // --- End Simulation ---

        closeModal(employeeAccessModal);
    });

    // Form Submission (Role Edit - Create/Update Role)
    roleEditForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const roleId = formData.get("roleId"); // Hidden field, empty for new roles
        const roleName = formData.get("roleName");
        const roleDescription = formData.get("roleDescription");
        const assignedPermissions = formData.getAll("permissions"); // Array of checked permission IDs

        console.log("Simulating: Saving role:", {
            roleId,
            roleName,
            roleDescription,
            assignedPermissions,
        });

        // --- Simulation: Update mock data ---
        if (roleId) {
            // Editing existing role
            const roleIndex = mockRoles.findIndex((r) => r.id === roleId);
            if (roleIndex !== -1) {
                mockRoles[roleIndex] = {
                    ...mockRoles[roleIndex],
                    name: roleName,
                    description: roleDescription,
                    permissions: assignedPermissions,
                };
                alert(`Role "${roleName}" updated.`);
            } else {
                alert(`Error: Role with ID ${roleId} not found for update.`);
            }
        } else {
            // Creating new role
            // Basic validation: Check if name already exists
            if (mockRoles.some((r) => r.name.toLowerCase() === roleName.toLowerCase())) {
                alert(`Error: A role named "${roleName}" already exists.`);
                return; // Prevent saving
            }
            const newRoleId = roleName.toLowerCase().replace(/\s+/g, "_"); // Simple ID generation
            mockRoles.push({
                id: newRoleId,
                name: roleName,
                description: roleDescription,
                permissions: assignedPermissions,
            });
            alert(`Role "${roleName}" created.`);
        }
        renderRoleTable(); // Update table
        renderEmployeeTable(); // Update employee table too, as role names might change
        // --- End Simulation ---

        closeModal(roleEditModal);
    });

    // Edit Employee Roles Button Click
    function attachEditEmployeeListeners() {
        document.querySelectorAll(".edit-employee-roles-btn").forEach((button) => {
            // Remove existing listener to prevent duplicates if re-rendering
            button.replaceWith(button.cloneNode(true));
        });
        document.querySelectorAll(".edit-employee-roles-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                const upidToEdit = event.target.getAttribute("data-upid");
                const employee = mockEmployees.find((emp) => emp.upid === upidToEdit);
                if (employee) {
                    employeeAccessModalTitle.textContent = `Edit Roles for ${employee.name} (${upidToEdit})`;
                    clearForm(employeeAccessForm);

                    upidInput.value = employee.upid;
                    // Simulate finding the user to populate details and roles
                    findUserBtn.click(); // Trigger the find user logic programmatically
                    upidInput.readOnly = true; // Make UPID read-only when editing

                    openModal(employeeAccessModal);
                } else {
                    alert("Could not find employee data to edit.");
                }
            });
        });
    }

    // Edit/Delete Role Button Clicks
    function attachEditDeleteRoleListeners() {
        // Use event delegation on the table body for efficiency
        roleListTableBody.replaceWith(roleListTableBody.cloneNode(true)); // Simple way to clear old listeners
        document.getElementById("role-list").addEventListener("click", (event) => {
            const button = event.target.closest("button");
            if (!button) return; // Exit if click wasn't on a button

            const roleIdToActOn = button.getAttribute("data-role-id");
            const role = mockRoles.find((r) => r.id === roleIdToActOn);
            if (!role) {
                alert("Role not found.");
                return;
            }

            if (button.classList.contains("edit-role-btn")) {
                // --- Populate Edit Role Modal ---
                roleEditModalTitle.textContent = `Edit Role: ${role.name}`;
                clearForm(roleEditForm);
                roleIdInput.value = role.id; // Set hidden ID
                roleNameInput.value = role.name;
                roleDescInput.value = role.description;
                populatePermissionsCheckboxes(role.permissions); // Check the role's current permissions
                openModal(roleEditModal);
            } else if (button.classList.contains("delete-role-btn")) {
                // --- Simulate Delete Role ---
                if (
                    confirm(
                        `Are you sure you want to delete the role "${role.name}"? This cannot be undone.`
                    )
                ) {
                    console.log(`Simulating: Deleting role ${roleIdToActOn}`);

                    // --- Simulation: Update mock data ---
                    // 1. Remove role from mockRoles
                    mockRoles = mockRoles.filter((r) => r.id !== roleIdToActOn);

                    // 2. Remove this role from any employees who have it
                    mockEmployees.forEach((emp) => {
                        emp.roles = emp.roles.filter((rId) => rId !== roleIdToActOn);
                    });

                    alert(`Role "${role.name}" deleted.`);
                    renderRoleTable();
                    renderEmployeeTable();
                    // --- End Simulation ---
                }
            }
        });
    }

    // --- Initial Page Load ---
    renderEmployeeTable();
    renderRoleTable();
    renderPermissionsDictionary();
    attachEditEmployeeListeners(); // Attach listeners initially
    attachEditDeleteRoleListeners(); // Attach listeners initially
});
