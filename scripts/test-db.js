
import { createClient } from '@supabase/supabase-js';

// Hardcoded from .env just for this test script
const SUPABASE_URL = "https://cxrpqacjcuzfrwwlnotk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cnBxYWNqY3V6ZnJ3d2xub3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4ODk5MTIsImV4cCI6MjA4MDQ2NTkxMn0.OcYjG04VGNGRlKr0au0acm1Q4PXibw4yTwpHR9L7Hjs";

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log('URL:', SUPABASE_URL);

    // 1. Test Select
    console.log('\n--- 1. Testing SELECT on social_complaints ---');
    const { data: selectData, error: selectError } = await supabase
        .from('social_complaints')
        .select('*')
        .limit(1);

    if (selectError) {
        console.error('❌ SELECT Failed:', selectError.message);
        if (selectError.code === '42P01') {
            console.error('   Hint: Table "social_complaints" does not exist. Did you run the migration?');
        }
    } else {
        console.log('✅ SELECT Success. Rows found:', selectData.length);
    }

    // 2. Test Insert (Only works if RLS allows anon or we have a user, usually fails if RLS is on and we are anon)
    console.log('\n--- 2. Testing INSERT (Anon) on social_complaints ---');
    const dummyData = {
        channel: 'TestScript',
        username: 'tester',
        original_complain_text: 'Test insert from script',
        complain_category: 'Lainnya',
        complain_summary: 'Test',
        status: 'Open',
        contact_status: 'Belum Dicoba',
        viral_risk: 'Normal'
    };

    const { data: insertData, error: insertError } = await supabase
        .from('social_complaints')
        .insert([dummyData])
        .select();

    if (insertError) {
        console.error('❌ INSERT Failed:', insertError.message);
        console.error('   Details:', insertError);
        if (insertError.code === '42501') {
            console.log('   Note: RLS Policy Violation is EXPECTED if you are not logged in.');
            console.log('   This confirms the table exists but is protected.');
        }
    } else {
        console.log('✅ INSERT Success:', insertData);
    }
}

testConnection();
