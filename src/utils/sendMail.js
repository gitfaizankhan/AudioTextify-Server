import nodemailer from "nodemailer";

const sendMail = async (data) => {
  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sciencengg@gmail.com", // Make sure to use an App Password here
        pass: process.env.MAIL_PASSWORD, // App password stored in environment variable
      },
    });

    const mailOptions = {
      from: "sciencengg@gmail.com",
      to: data.receiver,
      subject: "Reset Password OTP",
      text: `Your OTP for password reset is: ${data.otp}`, // Added some extra text for clarity
    };

    const success = await transport.sendMail(mailOptions);
    return success;
  } catch (error) {
    throw new Error("Something went wrong please try again");
  }
};

export default sendMail;
