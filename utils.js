// Backend Functions
async function generateUsage(client, phone, enroll_date) {
    // Assuming data usage only matters starting in 2010
    const start_date = new Date(
        Math.max(new Date(2010, 0, 1).getTime(), new Date(enroll_date).getTime())
    );
    const end_date = new Date();

    const usage_data = [];
    for (let date = start_date; date <= end_date; date.setDate(date.getDate() + 7)) {
        const usage = (Math.floor(Math.random() * 40) + 10) * 7; //Change into weekly usage data for space reasons

        await client.query( // Need to figure out concurrency for this without generating duplicate usage
            'INSERT INTO usage (phone, date_rec, used) VALUES ($1, $2, $3)',
            [phone, date, usage]
        );
    }
}

module.exports = { generateUsage };