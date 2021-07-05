const fs = require("fs");

function genAddress() {
    let data = {
        USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        FundToken: "0x2b80ad8f804f59f1baa637acd1ae500cdf52ae3c",
        Exchange: "0x2e0e4648292ce2e7848f1ddc463742f7fcc72f4f",
        Fluidity: "0xa53c6a16763bba96530032aed8b376ea04c67079",
        Liquidation: "0xd02af13b31f1672c9c60a5076612f3dec7d5af61",
        Depot: "0x0fda0cdce3c8ed59dc72f37c3e7ead67d592ef47",
        ExchangeRates: "0xcD69c2aa247A1022aCC72Fccb26C7A2145a50237",
        SystemSetting: "0x7B0be81c4F64be30aF95f3Ba0D189dD51c2383be",
    };

    fs.access("./build/address", (err) => {
        if (err) {
            fs.mkdirSync("./build/address");
        }

        fs.writeFile(
            "./build/address/address.json",
            JSON.stringify(data),
            function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log("OK!");
            }
        );
    });
}

genAddress()
