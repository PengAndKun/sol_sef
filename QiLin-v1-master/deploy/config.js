exports.providerAddress = "https://kovan.infura.io/v3/529cdad3a6e840f48a0c4173db998f1a";
exports.privateKey = "59cbe8b5015b341cdc66c67e464003418f800948a768409dc2410de0351bbab7";

// 6ae3cefac6dc2843c5c172d36aa8cf54dcfd4478006a6adad54ad278fe62317b
// 59cbe8b5015b341cdc66c67e464003418f800948a768409dc2410de0351bbab7   // 80


exports.abi = function(name) {
    return require('../build/contracts/' + name + '.json').abi;
}

exports.address = function(name) {
    return require('../build/address/address.json')[name];
}
