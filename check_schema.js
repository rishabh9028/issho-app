const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hndpzvtowutejpbsdgmu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZHB6dnRvd3V0ZWpwYnNkZ211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzQ2NDYsImV4cCI6MjA4ODk1MDY0Nn0.1Q_t-2fdkAgZxQSLG2HmgvPVm_4AbTa2VrasFrSMMdo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const tables = ['bookings', 'profiles', 'spaces'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`Error fetching ${table}:`, error);
        } else if (data && data.length > 0) {
            console.log(`Columns in ${table}:`, Object.keys(data[0]));
        } else {
            console.log(`No data in ${table}`);
        }
    }
}
checkSchema();
