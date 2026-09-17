import jwt from 'jsonwebtoken';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const token = jwt.sign({ id: 'admin_id', email: 'admin@aarnavstructura.com', role: 'superadmin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

console.log(token);
