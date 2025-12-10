const { Client } = require('pg');

async function checkUser() {
  const client = new Client({
    connectionString: 'postgresql://postgres:123@localhost:9018/chat_user_service',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const result = await client.query(
      "SELECT user_id, username, email, status, created_at FROM users WHERE email = 'tam117@gmail.com'"
    );

    console.log('\n📊 Query result:');
    if (result.rows.length === 0) {
      console.log('❌ User NOT FOUND in database');
    } else {
      console.log('✅ User found:', result.rows[0]);
    }

    // Check all users
    const allUsers = await client.query('SELECT user_id, username, email, status FROM users');
    console.log('\n👥 All users in database:', allUsers.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUser();
