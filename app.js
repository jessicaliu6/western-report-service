const express = require('express');
const fileUpload = require('express-fileupload');

const dbService = require('./DBService')
const emailService = require('./EmailService')

const app = express();
app.use(express.json())
app.use(
    fileUpload({
        limits: {
            fileSize: 20000000, // 20MB, should be good enough for most photo
        },
        abortOnLimit: true,
    })
);
/**
 * Parse row of western_report table query result
 * @param r row of western_report table query result
 * @return a report in API format
 */
const validateReport = (r) => {
    // Required fields
    if (!r.hasOwnProperty('category')) {
        throw new Error('Missing "category"');
    }
    if (!r.hasOwnProperty('firstName')) {
        throw new Error('Missing "firstName"');
    }
    if (!r.hasOwnProperty('lastName')) {
        throw new Error('Missing "lastName"');
    }
    if (!r.hasOwnProperty('description')) {
        throw new Error('Missing "description"');
    }
    if (!r.hasOwnProperty('location')) {
        throw new Error('Missing "location"');
    }
    if (!r.location.hasOwnProperty('name')) {
        throw new Error('Missing "location.name"');
    }
    if (!r.location.hasOwnProperty('address')) {
        throw new Error('Missing "location.address"');
    }
    if (!r.location.hasOwnProperty('latitude')) {
        throw new Error('Missing "location.latitude"');
    }
    if (!r.location.hasOwnProperty('longitude')) {
        throw new Error('Missing "location.longitude"');
    }

    // Optional fields
    if (!r.hasOwnProperty('phoneNumber')) {
        r.phoneNumber = '';
    }
    if (!r.hasOwnProperty('email')) {
        r.email = '';
    }
}

/**
 * API to check Health
 * @param req HTTP request.
 * @param res HTTP response.
 */
app.get("/", async (req, res) => {
    const data = {'health': 'ok'};
    return res.type('application/json').send(data);
});

/**
 * API to fetch most recent 20 reports within recent 2 weeks
 * @param req HTTP request.
 * @param res HTTP response. Return reports
 * @error
 *      500 - Internal Server Error
 */
app.get("/reports", async (req, res) => {
    try {
        const reports = await dbService.getReports();
        data = { reports }
        return res.type('application/json').send(data);
    } catch (e) {
        console.error("Internal Server Error", e);
        return res.sendStatus(500);
    };
});

/**
 * API to fetch most recent 20 reports within recent 2 weeks
 * @param req HTTP request.
 * @param res HTTP response. Return reports
 * @error
 *      404 - Not Found - cannot find report
 *      500 - Internal Server Error
 */
app.get("/report/:id", async (req, res) => {
    try {
        const report = await dbService.getReport(req.params.id);
        if (report == null)
            return res.sendStatus(404);

        return res.type('application/json').send(report);
    } catch (e) {
        console.error("Internal Server Error", e);
        return res.sendStatus(500);
    };
});

/**
 * API to add a report
 * @param req HTTP request. Its req.body hold report to add
 * @param res HTTP response. Return added report includes report ID
 * @error
 *      400 - Bad Request - validation error
 *      500 - Internal Server Error
 */
app.post("/report", async (req, res) => {
    const report = req.body
    try {
        validateReport(report);
    } catch (e) {
        console.error("Validation Error", e);
        return res.sendStatus(400); // Bad request
    };

    try {
        const result = await dbService.addReport(report);
        if (!report.hasImage) {
            await emailService.sendEmail(result, null);
        }
        return res.type('application/json').send(result);
    } catch (e) {
        console.error("Internal Server Error", e);
        return res.sendStatus(500);
    };
});

/**
 * Upload image file, then composite and send an email
 * @param req HTTP request. Its req.body hold report to add
 * @param res HTTP response. Return added report includes report ID
 * @error
 *      400 - Bad Request - no files, not image file
 *      404 - Not Found - cannot find report
 *      500 - Internal Server Error
 */
app.post("/upload", async (req, res) => {
    try {
        // console.log('upload: req.headers: \n', req.headers);
        // console.log('upload: req.body: \n', req.body); // {}
        console.log('Uploading files: ', req.files);

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.sendStatus(400); // Bad request
        }

        const id = Object.keys(req.files)[0];

        const image = req.files[id];

        // If does not have image mime type prevent from uploading
        if (!/^image/.test(image.mimetype))
            return res.sendStatus(400); // Bad request

        const report = await dbService.getReport(id);
        if (report == null) {
            return res.sendStatus(404); // Not found
        }

        console.log('Found report: ', report);

        // TODO don't wait sendEmail finish ?
        await emailService.sendEmail(report, image);

        return res.sendStatus(200);
    } catch (error) {
        console.error("Internal Server Error", e);
        return res.sendStatus(500);
    }
});

const port = process.env.PORT || 3001;
const server = app.listen(port, () => console.log(`Western Report Service app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
