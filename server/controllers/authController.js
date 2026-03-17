const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await userModel.findUserByEmail(email);

        if (existingUser)
            return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        await userModel.createUser(name, email, hashedPassword);

        res.json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findUserByEmail(email);

        if (!user)
            return res.status(404).json({ message: "User not found" });

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword)
            return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
