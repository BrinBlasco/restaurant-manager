import React from "react";
import s from "./TestPage.module.css";
import Button from "@components/Button";

const TestPage = () => {
    return (
        <>
            <div className={s.main}>
                <div className={s.wrapper}>
                    <h1>Login</h1>
                    <form className={s.form}>
                        <div className={s.formField}>
                            <label htmlFor="addItemIngredients">Ingredients</label>
                            <input id="addItemIngredients" />
                        </div>
                        <Button size="small">Yes</Button>
                    </form>
                </div>
            </div>
        </>
    );
    // // Define the structure of your login form
    // const loginFormMask = {
    //     username: {
    //         label: "Username",
    //         type: "text",
    //         placeholder: "Enter your username",
    //         required: true,
    //     },
    //     password: {
    //         label: "Password",
    //         type: "password",
    //         placeholder: "Enter your password",
    //         required: true,
    //     },
    //     rememberMe: {
    //         label: "Remember Me",
    //         type: "checkbox",
    //         defaultValue: false, // Checkboxes often need a boolean default
    //     },
    // };
    // // Define the structure of a more complex form
    // const profileFormMask = {
    //     fullName: {
    //         label: "Full Name",
    //         type: "text",
    //         placeholder: "John Doe",
    //         required: true,
    //     },
    //     email: {
    //         label: "Email Address",
    //         type: "email",
    //         placeholder: "john.doe@example.com",
    //         required: true,
    //     },
    //     bio: {
    //         label: "Biography",
    //         type: "textarea",
    //         placeholder: "Tell us about yourself...",
    //     },
    //     country: {
    //         label: "Country",
    //         type: "select",
    //         placeholder: "Select your country",
    //         required: true,
    //         options: [
    //             { value: "us", label: "United States" },
    //             { value: "ca", label: "Canada" },
    //             { value: "gb", label: "United Kingdom" },
    //             { value: "au", label: "Australia" },
    //         ],
    //     },
    // };
    // // Function to handle the form submission data
    // const handleLoginSubmit = (formData) => {
    //     console.log("Login Attempt:", formData);
    //     // Here you would typically send the data to your backend API
    //     // e.g., fetch('/api/login', { method: 'POST', body: JSON.stringify(formData) ... })
    //     alert(`Submitting login for: ${formData.username}`);
    // };
    // const handleProfileSubmit = (formData) => {
    //     console.log("Profile Update:", formData);
    //     alert(`Updating profile for: ${formData.fullName}`);
    // };
    // return (
    //     <div>
    //         <GeneralizedForm
    //             title="Login"
    //             mask={loginFormMask}
    //             onSubmit={handleLoginSubmit}
    //             submitButtonText="Log In"
    //         />
    //         <hr style={{ margin: "40px 0" }} />
    //         <GeneralizedForm
    //             title="Edit Profile"
    //             mask={profileFormMask}
    //             onSubmit={handleProfileSubmit}
    //             submitButtonText="Save Changes"
    //         />
    //     </div>
    // );
};

export default TestPage;
