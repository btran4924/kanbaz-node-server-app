import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const courses = JSON.parse(readFileSync(join(__dirname, 'courses.json'), 'utf-8'));
const modules = JSON.parse(readFileSync(join(__dirname, 'modules.json'), 'utf-8'));
const assignments = JSON.parse(readFileSync(join(__dirname, 'assignments.json'), 'utf-8'));
const enrollments = JSON.parse(readFileSync(join(__dirname, 'enrollments.json'), 'utf-8'));
const users = JSON.parse(readFileSync(join(__dirname, 'users.json'), 'utf-8'));

const db = {
  courses,
  modules,
  assignments,
  enrollments,
  users,
};

export default db;