import { prisma } from '@/src/db/client.js';
import { ApiError } from '../utils/api-error.js';

import bcrypt from 'bcrypt';

const adminEmail = process.env.ADMIN_EMAIL ?? '';
const adminPassword = process.env.ADMIN_PASSWORD ?? '';

if (!adminEmail || !adminPassword) {
	throw new ApiError(500, 'Admin email or password not set in environment variables');
}

async function main() {
	const rawPassword = process.env.ADMIN_PASSWORD || '';
	const hashedPassword = await bcrypt.hash(rawPassword, 10);

	await prisma.admin.upsert({
		where: { email: adminEmail },
		update: {},
		create: {
			name: 'admin',
			email: adminEmail,
			password: hashedPassword
		}
	});
	console.log('✅ Admin seeded with hashed password!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
