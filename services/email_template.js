
//Verification email html template
exports.verifyEmailTemplate = (name, url)=>{
    let template = `<br>
    <img style="width: auto; height: 39px; display: block; margin: auto;" src="https://res.cloudinary.com/dldv6b1ao/image/upload/v1603318393/image-uploads/brand_logo_aar89p.png" alt="Voting Poll">
    <p style="text-align: center; font-weight: bold; color: black; font-size: 16px; margin: 10px 0px 0px 0px;">Hi, ${name}</p>
    <P style="text-align: center; margin-bottom: 24px;">Please verify your email to continue. Click the link below to verify. This link is valid for 24hrs.</P>
    <div style="text-align: center; margin: 10px 0px 0px 0px;"><a href="${url}" style="color: white; background-color: rgb(36, 124, 196); padding: 10px 15px 10px 15px;">CLICK TO VERIFY EMAIL</a></div>
    <P style="text-align: center; margin-top: 30px;">Best Regards - <a href="#" style="color: black"><b>Voting Poll</b></a></p>
    <br>`;
    return template
}

//Reset Password email html template
exports.passResetEmailTemplate = (name, url)=>{
    let template = `<br>
    <img style="width: auto; height: 39px; display: block; margin: auto;" src="https://res.cloudinary.com/dldv6b1ao/image/upload/v1603318393/image-uploads/brand_logo_aar89p.png" alt="Voting Poll">
    <p style="text-align: center; font-weight: bold; color: black; font-size: 16px; margin: 10px 0px 0px 0px;">Hi, ${name}</p>
    <P style="text-align: center; margin-bottom: 24px;">A request to reset your password has been made. If you did not make this request, simply ignore this email. If you did make this request just click the link below:</P>
    <div style="text-align: center; margin: 10px 0px 0px 0px;"><a href="${url}" style="color: white; background-color: rgb(36, 124, 196); padding: 10px 15px 10px 15px;">RESET PASSWORD</a></div>
    <P style="text-align: center; margin-top: 30px;">Note: The above link is valid for 10 minutes</p>
    <br>`;
    return template
}

//Verify to change email, html template
exports.verifyToChangeEmailTemplate = (name, url)=>{
    let template = `<br>
    <img style="width: auto; height: 39px; display: block; margin: auto;" src="https://res.cloudinary.com/dldv6b1ao/image/upload/v1603318393/image-uploads/brand_logo_aar89p.png" alt="Voting Poll">
    <p style="text-align: center; font-weight: bold; color: black; font-size: 16px; margin: 10px 0px 0px 0px;">Hi, ${name}</p>
    <P style="text-align: center; margin-bottom: 24px;">We got a request to change email. Please verify your email to change. Click the link below to verify. This link is valid for 24hrs.</P>
    <div style="text-align: center; margin: 10px 0px 0px 0px;"><a href="${url}" style="color: white; background-color: rgb(36, 124, 196); padding: 10px 15px 10px 15px;">CLICK TO VERIFY EMAIL</a></div>
    <P style="text-align: center; margin-top: 30px;">Note: The above link is valid for 24hrs.</p>
    <br>`;
    return template
}