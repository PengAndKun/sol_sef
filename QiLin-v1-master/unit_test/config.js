export const providerAddress = "http://127.0.0.1:8545";
export const privateKey = "0xbe92a26cf78a8785d3e02358073a1a1d198e5908801e8bff703391f981959118";

export function abi(name) {
    return require('../build/contracts/' + name + '.json').abi;
}

export function address(name) {
    return require('../build/address/address.json')[name];
}
