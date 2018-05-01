module.exports = {
    pg: {
        logging: process.env.PG__LOGGING ? JSON.parse(process.env.PG__LOGGING) : false,
        uri: process.env.DATABASE_URL,
    },
    app: {
        port: process.env.PORT || 3000,
        uploadDir: process.cwd() + '/uploads',
        autoJobs: process.env.AUTO_JOBS === 'TRUE',
        skipJobs: process.env.SKIP_JOBS ? process.env.SKIP_JOBS.split(', ') : [],
    },
    jobs: {
        leadsGetAll: {
            name: 'leads_get_all',
            cron: '0 5 */1 * * *',
        },
        leadsGetSold: {
            name: 'leads_get_sold',
            cron: '0 15 */1 * * *',
        },
        leadsFromXlsx: {
            name: 'leads_from_xlsx',
            cron: '0 0 */1 * * *',
        },
        fetchEmails: {
            name: 'fetch_emails',
            cron: '0 25 */1 * * *',
        },
        parseXlsxJob: {
            name: 'parse_xlsx_files',
            cron: '0 27 */1 * * *',
        },
        notifications: {
            name: 'notifications',
            cron: '0 0 */1 * * *',
        },
        // fetch conversions from hasoffers API
        fetchAdvExpenses: {
            name: 'fetch_adv_expenses',
            cron: '0 */14 * * * *',
        }
    },
    leadsPedia: {
        hostname: 'https://api.leadspedia.com',
        apiKey: process.env.LEADSPEDIA_KEY,
        apiSecret: process.env.LEADSPEDIA_SECRET,
        requestDelay: 200,
        requestBulkSize: process.env.LEADSPEDIA_API_BULKSIZE || 5,
    },
};
