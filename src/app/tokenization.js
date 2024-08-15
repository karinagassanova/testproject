axios({
    "method": 'post',
    "headers": {"Authorization": strAuthYourVariable,"Accept": 'application/json',"Content-Type": 'application/json'},
    "url": 'https://secure-cert.shieldconex.com/api/tokenization/read',
    "data": JSON.stringify({"bfid":objParams.bfid})
}).then(function (objResponse) {
    //this is where you get the tokenized data values to store and use later. KEEP THE ID TOO you need it to get the plain values later
    console.log('got the tokens',objResponse.data.values);
});

var fnGetValues=function(strBfid,arrValues){
    axios({
        "method": 'post',
        "headers": {"Authorization": strAuthYourVariable,"Accept": 'application/json',"Content-Type": 'application/json'},
        "url": 'https://secure-cert.shieldconex.com/api/tokenization/detokenize',
        "data": JSON.stringify({"bfid":strBfid,"values":arrValues})
    }).then(function (objResponse) {
        //this is where you get the real data values to use and wipe from memory ASAP
        console.log('got the values',objResponse.data.values);
    });
}
