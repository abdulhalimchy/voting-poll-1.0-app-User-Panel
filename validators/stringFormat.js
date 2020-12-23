//Remove extra white space from the string.
const removeExtraWhiteSpace = (str) =>{
    str = str.trim();
    let targetStr="";
    let cnt=0;
    for(let ch of str){
        if(ch==' '){
            cnt++;
            if(cnt==1){
                targetStr+=' ';
            }
        }else{
            cnt=0;
            targetStr+=ch;
        }
    }
    return targetStr;
}


//Get a Specific length random string
const randomString = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 } 


 const getDateAndTime = (date)=>{
    let months=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(months[date.getMonth()]); //January is 0!
    let yyyy = date.getFullYear();
    let hh = String(date.getHours()).padStart(2, '0');
    let min = String(date.getMinutes()).padStart(2, '0');
    // let ss = String(date.getSeconds()).padStart(2, '0'); // for seconds

    date = dd + ' ' + mm + ' ' + yyyy + ' ' + hh + ':' + min;
    return date;
}

module.exports ={
    removeExtraWhiteSpace,
    randomString,
    getDateAndTime
}