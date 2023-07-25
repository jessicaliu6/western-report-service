const Pool = require('pg').Pool
const pool = new Pool({
  user: 'admin',
  host: 'dpg-civj9jenqql48o6ct570-a.ohio-postgres.render.com',
  database: 'western_report_db',
  password: '1H2s9nqeUf3fNBOC96wGAFr96e0BvS3M',
  port: 5432,
  ssl: true,
  
})


/**
 * Parse row of western_report table query result
 * @param r row of western_report table query result
 * @return a report object
 */
const parseRow = (r) => {
    return {
        id: r.id,
        category: r.category,
        firstName: r.first_name,
        lastName: r.last_name,
        phoneNumber: r.phone_number,
        email: r.email,
        description: r.description,
        location: {
            name: r.location,
            address: r.address,
            latitude: r.latitude,
            longitude: r.longitude,
        }
    }
}

/**
 * Query most recent 20 reports from western_report table within last two weeks
 * @return a list of report objects
 */
const getReports = async () => {
    try {
        const now = new Date();
        const two_weeks_ago = new Date(now - 1000 * 60 * 60 * 24 * 14).toISOString();
    
        const sql = "SELECT * FROM western_report WHERE date_created > $1 ORDER BY date_created DESC LIMIT 20";
        const result = await pool.query(sql, [two_weeks_ago]);
        console.log(result.rows);
        return result.rows.map(parseRow);
    } catch (error) {
        console.log({error})
        throw 'Error occurred when query reports';
    }
}

/**
 * Query a report by id from western_report table
 * @return a report object
 */
const getReport = async (id) => {
    try {
        const sql = "SELECT * FROM western_report WHERE id = $1";
        const result = await pool.query(sql, [id]);
        console.log(result);
        return result.rows.length > 0 ? parseRow(result.rows[0]) : null;
    } catch (error) {
        console.log({error})
        throw 'Error occurred when query report';
    }
}

/**
 * Add a report to western_report table
 * @param report the report need to add to western_report table
 * @return added report object
 */
const addReport = async (report) => {
    try {
        const dateCreated = new Date().toISOString();
        console.log(dateCreated);
        const sql = "INSERT INTO western_report (category, first_name, last_name, phone_number, email, description, " +
                    "location, address, latitude, longitude, date_created) " +
                    "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *";
        const result = await pool.query(sql, [
            report.category, report.firstName, report.lastName, report.email, report.phoneNumber, report.description,
            report.location.name, report.location.address, report.location.latitude, report.location.longitude,
            dateCreated]);
        console.log(result.rows[0]);
        return parseRow(result.rows[0]);
    } catch (error) {
        console.log({error})
        throw 'Error occurred when add report';
    }
}

module.exports = { addReport, getReport, getReports }