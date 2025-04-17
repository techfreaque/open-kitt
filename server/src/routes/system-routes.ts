import express from 'express';
import { getSystemInfo, executeSystemCommand } from '../system/system-monitor.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get system information
router.get('/info', (req, res) => {
  try {
    const info = getSystemInfo();
    res.status(200).json(info);
  } catch (error) {
    logger.error(`Error getting system info: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: 'Failed to get system information' });
  }
});

// Execute a system command
router.post('/execute', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    const result = await executeSystemCommand(command);
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    logger.error(`Error executing command: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: 'Failed to execute command' });
  }
});

export default router;
