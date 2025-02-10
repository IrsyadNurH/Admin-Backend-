import { Pool } from 'pg';
import pool from '../config/database';

export interface LogEntry {
  id?: number;
  action: 'login' | 'logout';
  timestamp: Date;
  user_email: string;
}

export const insertLog = async (logEntry: Omit<LogEntry, 'id'>) => {
  try {
    const result = await pool.query(
      'INSERT INTO logs (action, timestamp, user_email) VALUES ($1, $2, $3) RETURNING *',
      [logEntry.action, logEntry.timestamp, logEntry.user_email]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error inserting log:', err);
    throw new Error('Failed to insert log');
  }
};

export const getLogs = async () => {
  try {
    const result = await pool.query(
      'SELECT * FROM logs ORDER BY timestamp DESC'
    );
    return result.rows;
  } catch (err) {
    console.error('Error fetching logs:', err);
    throw new Error('Failed to fetch logs');
  }
};