import pool from '../config/database';


export interface LogEntry {
  id?: number;
  action: 'login' | 'logout';
  timestamp: Date;
  device_info: string;
  ip_address: string;
  user_timezone?: string;
}

export const insertLog = async (logEntry: Omit<LogEntry, 'id'>) => {
  try {
    const result = await pool.query(
      'INSERT INTO logs (action, timestamp, device_info, ip_address, user_timezone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        logEntry.action, 
        logEntry.timestamp, 
        logEntry.device_info,
        logEntry.ip_address,
        logEntry.user_timezone || 'Asia/Jakarta'
      ]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error inserting log:', err);
    throw new Error('Failed to insert log');
  }
};

export const getLogs = async (userTimezone: string = 'Asia/Jakarta') => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        action,
        timestamp AT TIME ZONE 'UTC' AT TIME ZONE $1 as timestamp,
        device_info,
        ip_address,
        COALESCE(user_timezone, $1) as user_timezone
      FROM logs 
      ORDER BY timestamp DESC
    `, [userTimezone]);
    return result.rows;
  } catch (err) {
    console.error('Error fetching logs:', err);
    throw new Error('Failed to fetch logs');
  }
};

export const updateLog = async (id: number, logEntry: Partial<LogEntry>) => {
  try {
    const setClause = Object.keys(logEntry)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = Object.values(logEntry);
    
    const result = await pool.query(
      `UPDATE logs SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Log not found');
    }
    
    return result.rows[0];
  } catch (err) {
    console.error('Error updating log:', err);
    throw new Error('Failed to update log');
  }
};

export const deleteLog = async (id: number) => {
  try {
    const result = await pool.query(
      'DELETE FROM logs WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Log not found');
    }
    
    return result.rows[0];
  } catch (err) {
    console.error('Error deleting log:', err);
    throw new Error('Failed to delete log');
  }
};