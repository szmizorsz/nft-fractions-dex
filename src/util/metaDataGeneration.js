const ipfsClient = require('ipfs-http-client')

async function metaDataGeneration() {
    const ipfs = ipfsClient({ host: "ipfs.infura.io", port: 5001, protocol: "https" })

    const metaData1 = {
        "name": "Red hat satellite robo",
        "description": "It can detect signals from the universe.",
        "image": "https://robohash.org/1"
    }
    const file1 = await ipfs.add(Buffer.from(JSON.stringify(metaData1)));
    console.log(file1.path);

    const metaData2 = {
        "name": "Orange head robo",
        "description": "It can scan with his eyes for miles away.",
        "image": "https://robohash.org/2"
    }
    const file2 = await ipfs.add(Buffer.from(JSON.stringify(metaData2)));
    console.log(file2.path);

    const metaData3 = {
        "name": "Purple head robo",
        "description": "It can open a can with his head.",
        "image": "https://robohash.org/3"
    }
    const file3 = await ipfs.add(Buffer.from(JSON.stringify(metaData3)));
    console.log(file3.path);

    const metaData4 = {
        "name": "Big purple head robo",
        "description": "It can easily clean up with his head.",
        "image": "https://robohash.org/4"
    }
    const file4 = await ipfs.add(Buffer.from(JSON.stringify(metaData4)));
    console.log(file4.path);

    const metaData5 = {
        "name": "Green head robo",
        "description": "It can dive deep into any liquid.",
        "image": "https://robohash.org/5"
    }
    const file5 = await ipfs.add(Buffer.from(JSON.stringify(metaData5)));
    console.log(file5.path);

}

metaDataGeneration();