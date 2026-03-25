import { identifySkillsFromText } from './src/modules/users/resume.service.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sdjmp').then(async () => {
    try {
        console.log('Connected to DB. Testing fallback skills...');
        const skills = await identifySkillsFromText('I am an expert in React, Node.js, Python, and AWS.');
        console.log('Resulting extracted skills:', skills);
    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
}).catch(console.error);
