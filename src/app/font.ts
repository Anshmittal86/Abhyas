// app/fonts.ts
import localFont from 'next/font/local';

export const copperplate = localFont({
	src: [
		{
			path: '../public/fonts/copperplateGothicBoldRegular.ttf',
			weight: '700',
			style: 'normal'
		}
	],
	variable: '--font-copperplate',
	display: 'swap'
});
