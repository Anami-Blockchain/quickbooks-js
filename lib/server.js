/*
 * This file is part of quickbooks-js
 * https://github.com/RappidDevelopment/quickbooks-js
 *
 * Based on qbws: https://github.com/johnballantyne/qbws
 *
 * (c) 2015 johnballantyne
 * (c) 2016 Rappid Development LLC
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*
 * Server.js
 *
 * This class will star the SOAP service
 * and start listening for requests from
 * a Quickbooks Web Connector
 */

//////////////////
//
// Private
//
//////////////////

var generate = require('self-signed');

var pems = generate({name: 'localhost', city: 'city', state: 'state', organization: 'netchain', unit: 'netchain'}, {keySize: 1024, expire: 2 * 365 * 24 * 60 * 60 * 1000});

/**
 * Node.js' HTTPS Library
 *
 * https://nodejs.org/dist/latest-v6.x/docs/api/https.html
 */
var https = require('https');

/**
 * Node.js' File System API
 *
 * https://nodejs.org/dist/latest-v6.x/docs/api/fs.html
 */
var fs = require('fs');

/**
 * A SOAP client and server
 * for Node.js
 *
 * https://github.com/vpulim/node-soap
 */
var soap = require('soap');

/**
 * An HTTPS server that will be used
 * to listen for SOAP requests.
 */
var options = {
    key: pems.private,
    cert: pems.cert
};
var server = https.createServer(options, function(req, res) {
    res.end('404: Not Found: ' + req.url);
});

var port = process.env.QB_SOAP_PORT || 8000;

/**
 * A constant for the WSDL filename.
 * @type {string}
 */
var WSDL_FILENAME = '/qbws.wsdl';

/**
 * Fetches the WSDL file for the
 * SOAP service.
 *
 * @returns {string} contents of WSDL file
 */
function buildWsdl() {
    var wsdl = fs.readFileSync(__dirname + WSDL_FILENAME, 'utf8');

    return wsdl;
}

//////////////////
//
// Public
//
//////////////////

module.exports = Server;

function Server() {
    this.wsdl = buildWsdl();
    this.webService = require('./web-service');
}

Server.prototype.run = function() {
    var soapServer;
    server.listen(port);
    soapServer = soap.listen(server, '/wsdl', this.webService.service, this.wsdl);
    console.log('Quickbooks SOAP Server listening on port ' + port);
    console.log(`current working directory ${process.cwd()}`);
};

Server.prototype.setQBXMLHandler = function(qbXMLHandler) {
    this.webService.setQBXMLHandler(qbXMLHandler);
};

Server.prototype.setAuthHandler = function(qbAuthentication) {
    this.webService.setAuthHandler(qbAuthentication);
};
