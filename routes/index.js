/* eslint-disable max-len */
/* eslint-disable brace-style */
/* eslint-disable prefer-template */
/* eslint-disable no-tabs */
/* eslint-disable global-require */
/**
 // eslint-disable-next-line max-len
 * This file scans through the current directory using each file as a route with the name of the file(without the extension) as the route
 * @param app
 */
module.exports = (app) => {
	// eslint-disable-next-line no-tabs
	require('fs').readdirSync(__dirname).forEach((fileName) => {
		const routeName = fileName.split('.')[0]
		if (routeName !== 'index')
		// eslint-disable-next-line import/no-dynamic-require
		{ app.use(`/${routeName}`, require('./' + fileName)) }
	})
}
