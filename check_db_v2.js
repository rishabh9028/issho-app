const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hndpzvtowutejpbsdgmu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZHB6dnRvd3V0ZWpwYnNkZ211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzQ2NDYsImV4cCI6MjA4ODk1MDY0Nn0.1Q_t-2fdkAgZxQSLG2HmgvPVm_4AbTa2VrasFrSMMdo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    try {
        const { data, error } = await supabase
            .from('spaces')
            .select('*');

        if (error) {
            console.error('Error fetching data:', error);
            return;
        }

        if (!data || data.length === 0) {
            console.log('No spaces found.');
            return;
        }

        console.log('Found', data.length, 'spaces.');
        const space = data[0];
        console.log('Columns in spaces table:', Object.keys(space));
        console.log('Sample space availability:', JSON.stringify(space.availability, null, 2));
        
        // Check all spaces for availability
        const spacesWithAvailability = data.filter(s => s.availability && Object.keys(s.availability).length > 0);
        console.log('Spaces with non-empty availability:', spacesWithAvailability.length);
        
        if (spacesWithAvailability.length > 0) {
            console.log('Example availability from space ID:', spacesWithAvailability[0].id);
            console.log(JSON.stringify(spacesWithAvailability[0].availability, null, 2));
        }
    } catch (e) {
        console.error('Fatal error:', e);
    }
}

checkData();
