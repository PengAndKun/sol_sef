exports.providerAddress = "https://kovan.infura.io/v3/9ee6887c45cf40f5b6fddc555265509c";

exports.abi = function(name) {
    return require('../build/contracts/' + name + '.json').abi;
}

exports.address = function(network, name) {
    return require('../build/contracts/' + name + '.json').networks[network].address;
}