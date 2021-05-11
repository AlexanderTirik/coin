const fs = require('fs');

const getData = () => {
    return fs.readFileSync('chain.txt', 'utf8', function(err, data) {
        if (err) throw err;
        return data;
    });
}

const writeData = (data) => {
    return fs.writeFileSync('chain.txt', data, function(err, data) {
        if (err) throw err;
    });
}

module.exports.getData = getData;
module.exports.writeData = writeData;