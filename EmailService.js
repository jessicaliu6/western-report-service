const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'westernreporttesting@gmail.com',
        pass: 'qrwvsjqrchjrryku',
    },
});

/**
 * 
 * @param report The report object
 * @param image An image file object from Upload API
 * @returns response of transporter to send email
 */
const sendEmail = async (report, image) => {
    if (image)
        console.log(`Sending email for report ${report.id} with image ${image.name} ...`)
    else
        console.log(`Sending email for report ${report.id} without image ...`)

    const text = `
    ${report.firstName} ${report.lastName}

    ${report.email}
    ${report.phoneNumber}

    ${report.category}
    ${report.location.name}
    ${report.location.address}

    ${report.description}
    `;

    const mailOptions = {
        from: 'westernreporttesting@gmail.com',
        to: 'westernreporttesting@gmail.com',
        subject: `${report.firstName} ${report.lastName} - ${report.category}`,
        text,
    };

    if (image) {
        mailOptions.attachments = [{
            filename: image.name,
            content: image.data,
            contentType: image.mimetype,
            encoding: image.encoding
        }]
    }

    try {
        response = await transporter.sendMail(mailOptions);
        // console.log('Email sent: ', {response});
        if (image)
            console.log(`Email sent for report ${report.id} with image ${image.name}.`);
        else
            console.log(`Email sent for report ${report.id}.`);
        return response;
    } catch (error) {
        console.log({error})
        throw 'Error occurred when send email';
    }
};

module.exports = { sendEmail }