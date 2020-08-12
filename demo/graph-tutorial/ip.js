'use strict';

const { inRange: rcInRange } = require('range_check');

module.exports = {
    getIPAddresses,
    inRange,
};

function getIPAddresses(flat = true) {
    const { networkInterfaces } = require('os');

    const nets = networkInterfaces();
    const resultsDict = {};
    const resultsArray = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!resultsDict[name]) {
                    resultsDict[name] = [];
                }

                resultsDict[name].push(net.address);
                resultsArray.push(Object.assign({ nic: name }, net));
            }
        }
    }

    return flat ? resultsArray : resultsDict;
}

function inRange(ipAddress) {
    const ips = getIPAddresses(true);
    console.dir(ips, { depth: null });

    console.log(`ipAddress: ${ipAddress}`);
    for (let ip of ips) {
        console.log(`CIDR: ${ip.cidr}`);
        if (rcInRange(ipAddress, ip.cidr)) {
            console.log('MATCH IP!!!')
            return true;
        }
    }

    return false;
}
