import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import studentRoutes from './routes/student.routes';
import attendanceRoutes from './routes/attendance.routes';
import sessionRoutes from './routes/session.routes';
import adminRoutes from './routes/admin.routes';
import publicRoutes from './routes/public.routes';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

app.use('/api/students/', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('User connected', socket.id);
    socket.on('joinSession', (sessionId) => {
        socket.join(sessionId);
    });
    socket.on('disconnect', () => {});
});

const port = process.env.PORT || 4000;

// Use server.listen (not app.listen) so Socket.io works
server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
