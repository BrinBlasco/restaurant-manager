document.addEventListener("DOMContentLoaded", () => {
    // --- Mock Data ---
    // Define permissions with categories
    const mockAvailablePermissions = {
        "User Management": [
            { id: "view_employee_list", description: "View list of employees" },
            {
                id: "view_employee_details",
                description: "View employee profile details (read-only)",
            },
            { id: "assign_employee_roles", description: "Assign/unassign roles to employees" },
            { id: "invite_employee", description: "Add new employees/users by UPID" },
            { id: "deactivate_employee", description: "Deactivate employee accounts" },
        ],
        "Role Management": [
            { id: "view_roles", description: "View list of roles" },
            { id: "create_role", description: "Create new roles" },
            { id: "edit_role_permissions", description: "Change permissions assigned to roles" },
            { id: "delete_role", description: "Delete roles" },
        ],
        "Menu Management": [
            { id: "view_menu", description: "View the menu items" },
            { id: "add_menu_item", description: "Add new items to the menu" },
            { id: "edit_menu_item", description: "Edit existing menu items" },
            { id: "delete_menu_item", description: "Delete items from the menu" },
        ],
        "Operational Access": [
            { id: "access_kitchen_dashboard", description: "Access the kitchen order display" },
            {
                id: "access_waiter_interface",
                description: "Access the waiter POS/ordering interface",
            },
            { id: "view_reports", description: "View sales and operational reports" },
        ],
        "Company Settings": [
            { id: "view_company_details", description: "View company profile info" },
            { id: "edit_company_profile", description: "Edit company name, address etc." },
        ],
        // Add more categories and permissions as needed
    };

    // Load roles from storage or use defaults
    let mockRoles = JSON.parse(localStorage.getItem("mockRoles")) || [
        {
            id: "admin",
            name: "Administrator",
            description: "Full system access",
            permissions: Object.values(mockAvailablePermissions)
                .flat()
                .map((p) => p.id),
        }, // Grant all permissions
        {
            id: "manager",
            name: "Manager",
            description: "Oversees staff and operations",
            permissions: [
                "view_employee_list",
                "assign_employee_roles",
                "view_reports",
                "view_roles",
                "view_menu",
            ],
        },
        {
            id: "chef",
            name: "Chef",
            description: "Manages kitchen and menu",
            permissions: [
                "access_kitchen_dashboard",
                "add_menu_item",
                "edit_menu_item",
                "view_menu",
            ],
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
            permissions: ["view_menu", "add_menu_item", "edit_menu_item", "delete_menu_item"],
        },
    ];

    // Persist data to localStorage
    const saveData = () => {
        localStorage.setItem("mockRoles", JSON.stringify(mockRoles));
        // When roles change, we might need to update employees page view next time it loads
        // For simulation, we just save roles here. Employees page loads roles on its init.
    };

    // --- DOM Elements ---
    const roleListContainer = document.getElementById("role-list");
    const showCreateFormBtn = document.getElementById("show-create-form-btn");
    const roleFormContainer = document.getElementById("role-form-container");
    const roleForm = document.getElementById("role-edit-form");
    const formPlaceholder = document.getElementById("form-placeholder");
    const formTitle = document.getElementById("role-form-title");
    const roleIdInput = document.getElementById("role-id");
    const roleNameInput = document.getElementById("role-name");
    const roleDescInput = document.getElementById("role-desc");
    const assignPermissionsListDiv = document.getElementById("assign-permissions-list");
    const cancelBtn = roleForm.querySelector(".cancel-edit-btn");

    // --- State ---
    let selectedRoleID = null;
    let currentFormMode = "placeholder"; // 'placeholder', 'create', 'edit'

    // --- Rendering ---
    function renderRoleList(rolesToRender = mockRoles) {
        roleListContainer.innerHTML = ""; // Clear list
        if (rolesToRender.length === 0) {
            roleListContainer.innerHTML =
                '<div class="list-card"><p>No roles defined yet.</p></div>';
            return;
        }

        rolesToRender.forEach((role) => {
            const card = document.createElement("div");
            card.className = "list-card role-card";
            card.dataset.roleId = role.id;
            if (role.id === selectedRoleID) {
                card.classList.add("selected");
            }

            const permissionsSummary =
                role.permissions.length > 0
                    ? `${role.permissions.length} permission${
                          role.permissions.length === 1 ? "" : "s"
                      } assigned`
                    : "No permissions assigned";

            card.innerHTML = `
                <div class="card-main-info">
                    <strong class="role-name-display">${role.name}</strong>
                    <span class="role-desc-display">${role.description || "No description"}</span>
                    <p class="permissions-summary">${permissionsSummary}</p>
                </div>
                <div class="card-actions">
                     <button class="btn btn-secondary btn-sm edit-role-btn">Edit</button>
                     ${
                         role.id !== "admin" // Prevent deleting the default admin role (example)
                             ? `<button class="btn btn-danger btn-sm delete-role-btn">Delete</button>`
                             : ""
                     }
                </div>
            `;

            // Event listener for selecting the card / triggering edit/delete
            card.addEventListener("click", (e) => {
                // If clicking card but not buttons
                if (!e.target.closest("button")) {
                    handleSelectRole(role.id);
                }
            });
            card.querySelector(".edit-role-btn")?.addEventListener("click", () =>
                handleSelectRole(role.id)
            );
            card.querySelector(".delete-role-btn")?.addEventListener("click", () =>
                handleDeleteRole(role.id, role.name)
            );

            roleListContainer.appendChild(card);
        });
    }

    function populatePermissionCheckboxes(assignedPermissions = []) {
        assignPermissionsListDiv.innerHTML = ""; // Clear existing

        for (const category in mockAvailablePermissions) {
            const groupDiv = document.createElement("div");
            groupDiv.classList.add("permission-group");

            const title = document.createElement("h4");
            title.classList.add("permission-group-title");
            title.textContent = category;
            groupDiv.appendChild(title);

            mockAvailablePermissions[category].forEach((perm) => {
                const isChecked = assignedPermissions.includes(perm.id);
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("checkbox-item");
                itemDiv.innerHTML = `
                    <input type="checkbox" id="perm-${perm.id}" name="permissions" value="${
                    perm.id
                }" ${isChecked ? "checked" : ""}>
                    <label for="perm-${perm.id}">
                        ${perm.id}
                        <span class="perm-desc">${perm.description}</span>
                    </label>
                `;
                // <label for="perm-${perm.id}">${perm.description} <code>${perm.id}</code></label>
                groupDiv.appendChild(itemDiv);
            });
            assignPermissionsListDiv.appendChild(groupDiv);
        }
    }

    // --- UI Updates ---
    function showForm(mode, role = null) {
        currentFormMode = mode;
        formPlaceholder.classList.add("hidden");
        roleForm.classList.remove("hidden");

        if (mode === "edit") {
            if (!role) return;
            selectedRoleID = role.id;
            formTitle.textContent = `Edit Role: ${role.name}`;
            roleIdInput.value = role.id; // Set hidden ID for submission
            roleNameInput.value = role.name;
            roleDescInput.value = role.description || "";
            populatePermissionCheckboxes(role.permissions);
        } else {
            // mode === 'create'
            selectedRoleID = null; // Clear selection
            formTitle.textContent = "Create New Role";
            roleForm.reset(); // Clear form fields
            roleIdInput.value = ""; // Ensure hidden ID is empty
            populatePermissionCheckboxes([]); // Show all unchecked
        }
        updateSelectedCardVisualState(); // Update highlighting in the list
    }

    function showPlaceholder() {
        currentFormMode = "placeholder";
        selectedRoleID = null; // Clear selection state
        formPlaceholder.classList.remove("hidden");
        roleForm.classList.add("hidden");
        updateSelectedCardVisualState(); // Remove highlighting
    }

    function updateSelectedCardVisualState() {
        document.querySelectorAll(".role-card").forEach((card) => {
            if (card.dataset.roleId === selectedRoleID) {
                card.classList.add("selected");
            } else {
                card.classList.remove("selected");
            }
        });
    }

    // --- Event Handlers ---
    function handleSelectRole(roleId) {
        const role = mockRoles.find((r) => r.id === roleId);
        if (role) {
            showForm("edit", role);
        }
    }

    function handleDeleteRole(roleIdToDelete, roleNameToDelete) {
        if (roleIdToDelete === "admin") {
            alert("The default Administrator role cannot be deleted.");
            return;
        }
        if (
            confirm(
                `Are you sure you want to delete the role "${roleNameToDelete}"?\nThis cannot be undone and will remove the role from all assigned employees.`
            )
        ) {
            console.log(`Simulating: Deleting role ${roleIdToDelete}`);

            // --- Simulation: Update mock data ---
            // 1. Remove role from mockRoles
            mockRoles = mockRoles.filter((r) => r.id !== roleIdToDelete);

            // 2. Remove this role from any employees who have it (load/save employee data)
            let currentEmployees = JSON.parse(localStorage.getItem("mockEmployees")) || [];
            currentEmployees.forEach((emp) => {
                emp.roles = emp.roles.filter((rId) => rId !== roleIdToDelete);
            });
            localStorage.setItem("mockEmployees", JSON.stringify(currentEmployees)); // Save updated employees

            saveData(); // Save updated roles
            renderRoleList(); // Re-render role list
            showPlaceholder(); // Go back to placeholder
            alert(`Role "${roleNameToDelete}" deleted.`);
            // --- End Simulation ---
        }
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const roleId = formData.get("roleId"); // Hidden field
        const roleName = formData.get("roleName").trim();
        const roleDescription = formData.get("roleDescription").trim();
        const assignedPermissions = formData.getAll("permissions");

        if (!roleName) {
            alert("Role Name cannot be empty.");
            return;
        }

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
                // Check if name changed and if new name already exists (excluding itself)
                if (
                    roleName !== mockRoles[roleIndex].name &&
                    mockRoles.some(
                        (r) => r.id !== roleId && r.name.toLowerCase() === roleName.toLowerCase()
                    )
                ) {
                    alert(`Error: A different role named "${roleName}" already exists.`);
                    return;
                }
                mockRoles[roleIndex] = {
                    ...mockRoles[roleIndex],
                    name: roleName,
                    description: roleDescription,
                    permissions: assignedPermissions,
                };
                alert(`Role "${roleName}" updated.`);
            } else {
                alert(`Error: Role with ID ${roleId} not found for update.`);
                return; // Don't proceed
            }
        } else {
            // Creating new role
            // Basic validation: Check if name already exists
            if (mockRoles.some((r) => r.name.toLowerCase() === roleName.toLowerCase())) {
                alert(`Error: A role named "${roleName}" already exists.`);
                return; // Prevent saving
            }
            // Simple ID generation (replace spaces, lower case) - ensure unique in real app
            let newRoleId = roleName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_|_$/g, "");
            let counter = 1;
            let originalId = newRoleId;
            while (mockRoles.some((r) => r.id === newRoleId)) {
                newRoleId = `${originalId}_${counter++}`;
            }

            mockRoles.push({
                id: newRoleId,
                name: roleName,
                description: roleDescription,
                permissions: assignedPermissions,
            });
            alert(`Role "${roleName}" created.`);
        }
        saveData(); // Persist changes
        renderRoleList(); // Update table
        showPlaceholder(); // Go back to placeholder state
        // --- End Simulation ---
    }

    // --- Initial Setup ---
    showCreateFormBtn.addEventListener("click", () => showForm("create"));
    cancelBtn.addEventListener("click", showPlaceholder);
    roleForm.addEventListener("submit", handleFormSubmit);

    // Load initial data
    renderRoleList();
    showPlaceholder(); // Start in placeholder state
});
