// Credit: https://gist.github.com/fearspear/4d757e956b0ff92ad0412691fbfc322f
export function generateRandomPassword(
	length: number = 12,
	includeUppercase: boolean = true,
	includeLowercase: boolean = true,
	includeNumbers: boolean = true,
	includeSpecialChars: boolean = false
) {
	const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
	const numberChars = '0123456789';
	const specialChars = '!@#$%^&*()-=_+[]{}|;:,.<>?/';

	let allChars = '';
	let password = '';

	if (includeUppercase) allChars += uppercaseChars;
	if (includeLowercase) allChars += lowercaseChars;
	if (includeNumbers) allChars += numberChars;
	if (includeSpecialChars) allChars += specialChars;

	const allCharsLength = allChars.length;

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(
			(crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)) * allCharsLength
		);
		password += allChars.charAt(randomIndex);
	}

	return password;
}
