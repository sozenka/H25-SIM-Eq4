import { Recording, verifyToken } from '../mongodb';

export async function handleGetRecordings(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      throw new Error('Invalid token');
    }

    const recordings = await Recording.find({ userId: decoded.id })
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(recordings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error instanceof Error ? error.message : 'Failed to get recordings' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleSaveRecording(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      throw new Error('Invalid token');
    }

    const { name, notes, duration } = await req.json();
    const recording = await Recording.create({
      userId: decoded.id,
      name,
      notes,
      duration
    });

    return new Response(JSON.stringify(recording), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error instanceof Error ? error.message : 'Failed to save recording' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}