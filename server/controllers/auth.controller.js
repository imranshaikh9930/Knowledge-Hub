const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

const registerController = async (req, res) => {
    const { name, email, password, role } = req.body;
  
    try {
      const isEmailExist = await User.findOne({ email });
  
      if (isEmailExist) {
        return res.status(400).json({ message: "Email Already Exists" });
      }
  
      const passwordHash = await bcrypt.hash(
        password,
        parseInt(process.env.SALT)
      );
  
      // Default role will be "user" if not provided
      const newUser = await User.create({
        name,
        email,
        password: passwordHash,
        role: role || "user",
      });
  
      // Include role & name properly in token payload
      const token = jwt.sign(
        { id: newUser._id, role: newUser.role, name: newUser.name },
        process.env.SECRET_KEY,
        { expiresIn: "7d" }
      );
  
      res.status(201).json({
        message: "User created Successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
const loginController =  async (req, res) => {
    const { email, password } = req.body
    try {

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not exists please Register !!" });
        }

        const isPassword = await bcrypt.compare(password, user.password);

        if (!isPassword) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: user._id, email: user.email ,role:user.role}, process.env.SECRET_KEY, { expiresIn: "7d" });

        res.status(200).json({ message: "User login Successfully", user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {registerController,loginController}