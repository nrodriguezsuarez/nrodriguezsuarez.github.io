let D = document;
let $privateKey = D.getElementById('id_privateKey');
let $publicKey = D.getElementById('id_publicKey');
let $base64Response = D.getElementById('id_entry_base64Response');
let $result = D.getElementById('id_result');

let _privateKey;

async function DecryptMessage()
{
    try
    {
        let base64Message = $base64Response.value;
        let arrayBuff =  base64ToArrayBuffer(base64Message)

        let decrypted = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
            },
            _privateKey,
            arrayBuff
        );
        console.log(decrypted);
        $result.textContent = decrypted;
    }catch(err)
    {
        console.log(err);
        $result.textContent = err;
    }

}

async function GenerateKeys()
{
    let keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    );
    _privateKey = keyPair.privateKey;
    /* now when the key pair is generated we are going
       to export them from the keypair
    */
    $publicKey.textContent = await exportPublicKey(keyPair.publicKey);
    $privateKey.textContent = await exportPrivateKey(keyPair.privateKey);
}

async function exportPublicKey(key)
{
    try
    {
        let exportedPublicKey = await window.crypto.subtle.exportKey(
             "spki",
             key
         )
         let base64string = arrayBufferToBase64(exportedPublicKey);     
         console.log(base64string);   
         return base64string;  
    }catch(err)
    {
        console.log(err);
    }
}

async function exportPrivateKey(key)
{
    try
    {
        let exportedPrivateKey = await window.crypto.subtle.exportKey(
             "pkcs8",
             key
        )
        let pem = toPem(exportedPrivateKey);
        console.log(pem);
        return pem;  
    }catch(err)
    {
        console.log(err);
    }
}

function addNewLines(str) {
    var finalString = '';
    while(str.length > 0) {
        finalString += str.substring(0, 64) + '\n';
        str = str.substring(64);
    }

    return finalString;
}

function toPem(privateKey) {
    var b64 = addNewLines(arrayBufferToBase64(privateKey));
    var pem = "-----BEGIN PRIVATE KEY-----\n" + b64 + "-----END PRIVATE KEY-----";
    
    return pem;
}

function arrayBufferToBase64(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';
    for(var i=0; i < byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i]);
    }
    var b64 = window.btoa(byteString);

    return b64;
}

function base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}