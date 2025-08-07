const { Client, BusinessConsultant, ConsultantService } = require('../models/associations.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign({ 
        id: user.id,
        email: user.email, 
        role: user.role 
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
    });
};

const registerClient = async (data) => {
    const { name, phone, email, password } = data;

    if (!name || !email || !password) {
        throw new Error('Please provide all required fields');
    }

    // תיקון הלוגיקה: אם הסיסמה לא עומדת בתנאים, זרוק שגיאה
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+=\-~`[\]{}|\\:";'<>?,./]{6,}$/.test(password)) {
        throw new Error('Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
    }

    const existingClient = await Client.findOne({ where: { email } });

    if (existingClient) {
        throw new Error('Client already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const client = await Client.create({
        name,
        phone,
        email,
        password: hashedPassword,
    });

    if (!client) {
        throw new Error('Error creating client');
    }

    return generateToken(client.email, 'client');
};

const login = async (data) => {
    const { email, password } = data;

    if (!email || !password) {
        throw new Error('Please provide email and password');
    }

    const manager = await BusinessConsultant.findOne({ 
        where: { email: email },
        attributes: ['id', 'name', 'email', 'password', 'role'] // ללא profile_image בינתיים
    });
    if (manager && await bcrypt.compare(password, manager.password)) {
        return generateToken(manager.email, 'manager');
    }

    const client = await Client.findOne({ 
        where: { email: email },
        attributes: ['id', 'name', 'email', 'password'] // ללא profile_image בינתיים
    });
    if (!client || !(await bcrypt.compare(password, client.password))) {
        throw new Error('Invalid email or password');
    }

    return generateToken(client.email, 'client');
};

const registerBusinessConsultant = async (data) => {
    const { name, phone, email, password ,role} = data;
    
    if (!name || !email || !password) {
        throw new Error('Please provide all required fields');
    }

    // אותה validation כמו ב-registerClient - עקביות
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()]{6,}$/.test(password)) {
        throw new Error('Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
    }

    const existingBusinessConsultant = await BusinessConsultant.findOne({ where: { email } });

    if (existingBusinessConsultant) {
        throw new Error('BusinessConsultant already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const manager = await BusinessConsultant.create({
        name,
        phone,
        email,
        password: hashedPassword,
        role: role || "consultant"
    });
    

    if (!manager) {
        throw new Error('Error creating manager');
    }

    return generateToken(manager.email, 'manager');
};

module.exports = {
    registerClient,
    login,
    registerBusinessConsultant,
    
};


