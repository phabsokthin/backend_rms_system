import bcrypt from "bcryptjs";
import User from "../models/Users.model.js";
import jwt from "jsonwebtoken";
import Blacklist from "../models/Blacklist.model.js";
const JWT_SECRET = process.env.JWT_SECRET;


//** register user */
const register = async (req, res) => {
  try {
    const { username, email, password, status, role } = req.body;


    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // validate role
    const allowedRoles = ["normal", "kitchen", "admin"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.create({
      username,
      email,
      password: hashedPassword,
      status,
      role
    });

    res.status(201).json({
      message: "User registered successfully",
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** get all users */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ username: 1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** delete user */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




/** user login */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    if (user.status === false) {
      return res.status(403).json({ message: "User is inactive" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return success
    res.status(200).json({
      message: "Login successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        status: user.status,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// logout
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(" ")[1];

    // Save token in blacklist
    await Blacklist.create({
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) 
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/** update user */
 const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, status, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate role
    const allowedRoles = ["normal", "kitchen", "admin"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if email is being updated and already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (status !== undefined) user.status = status;
    if (role) user.role = role;

    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        status: user.status,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export { register, getUsers, logout,updateUser };