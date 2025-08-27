import mysql from 'mysql2/promise';

export async function StoreUserData (data) {

// Connexion à la base
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'SubRace'
});

let count = data.length;
console.log(count + ' followers trouvé.');


// Insertion dans la base
for (let follower of data) {
  const [username, image] = follower;
  try {
    await connection.execute(
      'INSERT INTO followers (username, image_url) VALUES (?, ?)',
      [username, image]
    );
    console.log('👌new follower:',username)
  } catch (error) {
    count --;
    // console.error('Error inserting follower:', error);
  }
}


await connection.end();

return('✅ ' + count + ' Followers insérés dans MySQL');

}