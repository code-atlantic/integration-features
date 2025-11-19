module.exports = {
	...require('@wordpress/scripts/config/jest-unit.config'),
	testPathIgnorePatterns: [
		'/node_modules/',
		'/release/',
	],
};
