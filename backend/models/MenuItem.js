const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
    {
        imgUrl: { type: String },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        ingredients: { type: String, default: "No ingredients were provided." },
        recipe: { type: String, default: "No recipe was provided." },
        description: { type: String, default: "No description was provided." },
        type: {
            type: String,
            enum: ["Full Course", "Dessert", "Appetizers", "Salads", "Alcoholic Drink", "Non-Alcoholic", "Misc"],
            default: "Misc",
            required: true,
        },

        companyID: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    },
    { timestamps: true }
);

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
module.exports = MenuItem;
