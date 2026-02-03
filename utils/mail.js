import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const templatePath = path.join(process.cwd(), 'utils/student-welcome.html');

// Preparing Student Email Content
const renderStudentEmail = (data) => {
	let template = fs.readFileSync(templatePath, 'utf-8');

	return template
		.replace(/{{name}}/g, data.name)
		.replace(/{{provisionalNo}}/g, data.provisionalNo)
		.replace(/{{password}}/g, data.password)
		.replace(/{{loginLink}}/g, data.loginLink);
};

// Send Email via Nodemailer as a transport and Mailtrap as a SMTP
const sendEmail = async ({ email, subject, text, html }) => {
	const transporter = nodemailer.createTransport({
		host: process.env.MAILTRAP_SMTP_HOST,
		port: Number(process.env.MAILTRAP_SMTP_PORT),
		auth: {
			user: process.env.MAILTRAP_SMTP_USER,
			pass: process.env.MAILTRAP_SMTP_PASS
		}
	});

	const mail = {
		from: 'hello@techmastersedu.in',
		to: email,
		subject,
		text,
		html
	};

	try {
		await transporter.sendMail(mail);
	} catch (error) {
		console.error(
			'Email service failed silently. Make sure that you have provided your MAILTRAP credentials in the .env file'
		);
		console.error('Error sending email:', error);
	}
};

export { renderStudentEmail, sendEmail };
