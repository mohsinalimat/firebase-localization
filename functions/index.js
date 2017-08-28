"use strict";

const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: 'https://app-localization-2f645.firebaseio.com'
})

// https://github.com/firebase/functions-samples
// https://us-central1-app-localization-2f645.cloudfunctions.net/[function]
exports.test = functions.https.onRequest((request, response) => {
	response.json({property:123})
	console.log('this is a sample log')
})

exports.exportAndroid = functions.https.onRequest((request, response) => {
	var locale = request.query.locale
	response.set("content-disposition", `attachment; filename="strings-${locale}.xml"`)

	var dbRef = admin.database().ref('translations')

	return dbRef.once('value').then(function(snapshot) {
		response.send(generateAndroid(locale, snapshot.val()))
	})
})

exports.exportIOS = functions.https.onRequest((request, response) => {
	var locale = request.query.locale
	response.set("content-disposition", `attachment; filename="Localizable-${locale}.strings"`)

	var dbRef = admin.database().ref('translations')

	return dbRef.once('value').then(function(snapshot) {
		response.send(generateIOS(locale, snapshot.val()))
	})
})

function generateAndroid(locale, entries)
{
	var result = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
	result += "<resources>\n"

	for (var entry in entries)
	{
		var value = entries[entry].locales[locale].value
		
		result += `\t<string name="${entry}">${value}"</string>\n`
	}

	result += "</resources>"

	return result
}

function generateIOS(locale, entries)
{
	var result = ''

	for (var entry in entries)
	{
		var value = entries[entry].locales[locale].value

		result += `"${entry}" = "${value}";\n`
	}

	return result
}