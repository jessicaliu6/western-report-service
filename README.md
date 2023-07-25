# western-report-service

The service for Western Report.

Repo: https://github.com/jessicaliu6/western-report-service.git

## deploy on render

The code is deployed and run on render (https://render.com) with a fully managed PostgreSQL instance on Render.

### Check code deployment status

Login to render and check dashboard:

https://dashboard.render.com

To check app health:
```
curl https://western-report-service-9u2f.onrender.com/
```

### PostgreSQL on render
```
PostgreSQL instance: western-report-instance
PostgreSQL dbname: western_report_db
User: admin
Region: Ohio (US East)
PostgreSQL Version: 15
```

## Setup Google account to use gmail

This service use gmail to send email. 
- A gmail account is needed. 
- Generate an App Password in Google account
  Login to Google account, search App Password
- Use Google user with App Password with nodemailer

Check the following doc for detail:
https://miracleio.me/snippets/use-gmail-with-nodemailer/

## APIs

The service support 3 APIs
| API          | Description         |
|--------------|---------------------|
| GET /        | Check health        |
| GET /reports | GET list of reports |
| POST /report | Add new report      |

## Build and test locally

Build: yarn

Start: node app.js

This will run the service on http://localhost:3001

Can use curl to test APIs
```
curl http://localhost:3001

curl http://localhost:3001/reports

curl -d '{"category": "Plumbing", "firstName": "Jessica", "lastName": "Liu", "phoneNumber": "666-777-8888", "email": "abc@gmail.com", "description":"desc 2","location": {"name": "location 2", "address": "address 2", "latitude": 43.0110, "longitude": -81.2717}}' -H 'Content-Type: application/json' http://localhost:3001/report
```

