import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'SubRace'
    });

    const [rows] = await connection.execute('SELECT * FROM races');

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // pour autoriser CORS si nécessaire
      },
    });
  } catch (error) {
    console.error('Error fetching races:', error);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
export async function POST(req) {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'SubRace'
        });

        const body = await req.json();
        const { day, followers_number, winner, second, third,postId,mediaId } = body;

        const [result] = await connection.execute('INSERT INTO races (day, followers_number, winner, second, third, postId, mediaId) VALUES (?, ?, ?, ?, ?, ?, ?)', [day, followers_number, winner, second, third,postId,mediaId]);

        return new Response(JSON.stringify({ id: result.insertId }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating race:', error);
        return new Response(JSON.stringify({ error: 'Database error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

