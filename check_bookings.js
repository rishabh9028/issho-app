const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hndpzvtowutejpbsdgmu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZHB6dnRvd3V0ZWpwYnNkZ211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzQ2NDYsImV4cCI6MjA4ODk1MDY0Nn0.1Q_t-2fdkAgZxQSLG2HmgvPVm_4AbTa2VrasFrSMMdo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error fetching bookings:', error);
            return;
        }

        console.log('Bookings table exists. Found', data.length, 'entries.');
    } catch (e) {
        console.error('Fatal error:', e);
    }
}

checkData();
