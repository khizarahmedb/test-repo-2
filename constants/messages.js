const successJson = (body, msg) => {
    return {
        body : body,
        message : msg,
        hasError : false
    }
}

const Messages = {
    UserNotFound: 'Admin not found',
    UserHasLoggedOut: 'This admin has logged out',
    UserCreatedSuccessfully: 'Admin created successfully',
    UserFetchedSuccessfully: 'Admin fetched successfully',
    UserIsNotVerified: 'Admin is not verified in the system',
    InvalidCredentials: 'Invalid credentials',
    InvalidEmail: 'Please provide a valid email',
    UserLogoutSuccessfully: 'Admin logged out successfully',
    LoginSuccessful: 'Login successful',
    TokenDecodeFailure: 'Unable to find x-token in the headers',
    TokenExpired: 'Your access token has been expired',
    OTPSentSuccessfully: 'Otp has been sent successfully',
    UserHasSuc: 'Otp has been sent successfully',
    OTPNotSentForVerification: 'Please hit send-otp api first',
    OTPExpired: 'Your otp has been expired',
    InvalidOtp: 'The otp is invalid',
    UserIsAlreadyVerified: 'This admin is already verified',
    OTPVerifiedSuccessfully: 'Otp verified successfully',
    OTPIsRequired: 'Otp is required for verification',
    EmailIsRequired: 'Email is required',
    EmailSentSuccessfully: 'Email sent successfully',
    UsernameIsRequired: 'Username is required',
    UserUpdatedSuccessfully: 'User updated successfully',
}

const errorJson = (msg, errorDetails) => {
    return {
        body : {errorDetails},
        message : msg,
        hasError : true
    }
}




module.exports = {
    successJson,
    errorJson, 
    Messages,
}