// *********** Upload file to Cloudinary ******************** //
const cloudName = 'yanninthesky';
// const unsignedUploadPreset = 'st4y3ops';
// const secret = document.getElementById("inputSecret").value;
// console.log(secret);
const myApiKey = '872373128264639';
const myPublicId = 'grafitti';

const CryptoJS = require("crypto-js");

const createURLSearchParams = (data) => {
  const params = new URLSearchParams();
  Object.keys(data).forEach(key => params.append(key, data[key]));
  // console.log(params.toString());
  return params;
};

const generateSignature = (publicId, secret, now) => {
  return CryptoJS.SHA1(`public_id=${publicId}&timestamp=${now}${secret}`).toString();
};

const uploadFile = (image, secret) => {
  const now = Date.now() / 1000 || 0;
  const mySignature = generateSignature(myPublicId, secret, now);
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const data = {
    file: image,
    timestamp: now,
    public_id: myPublicId,
    api_key: myApiKey,
    signature: mySignature
    // upload_preset: unsignedUploadPreset
  };
  const params = createURLSearchParams(data);

  fetch(url, {
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
    invalidate: true
  });
};

export { uploadFile };
