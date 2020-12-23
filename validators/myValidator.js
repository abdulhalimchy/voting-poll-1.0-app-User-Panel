// Expression can start only with a letter
// Expression can contain letters or spaces
const isLetterAndSpace = (str) => {
    let re = /^[a-zA-Z][a-zA-Z\s]*$/;
    return re.test(str);
}


// Expression can start only with a letter
// Expression can contain letters or numbers
const isLetterAndNumber = (str) => {
    let re = /^[a-zA-z][a-zA-Z0-9]*$/;
    return re.test(str);
}


//The string is and valid email format? True or False
const isEmail = (email)=>{
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


module.exports = {
    isLetterAndSpace,
    isLetterAndNumber,
    isEmail
}