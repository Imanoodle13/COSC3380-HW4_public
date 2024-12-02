// Backend Functions

// Needed to change from one by one insertions to batch insertions
async function generateUsage(client, phone, enroll_date) {
    const end_date = new Date();

    const usage_data = [];
    for (let date = new Date(enroll_date); date <= end_date; date.setDate(date.getDate() + 7)) {
        const usage = (Math.floor(Math.random() * 40) + 10) * 7; // Weekly usage data
        usage_data.push([phone, new Date(date).toISOString().split("T")[0], usage]); // Format date as YYYY-MM-DD
    }

    const placeholders = usage_data
        .map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`)
        .join(", ");

    const query = `
        INSERT INTO usage (phone, date_rec, used)
        VALUES ${placeholders}
    `;

    const queryValues = usage_data.flat();

    // Execute batch insert
    await client.query(query, queryValues);

}

module.exports = { generateUsage };