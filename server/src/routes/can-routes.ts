import express from 'express';
import { getAllCanMessages, getCanStatus, sendCanMessage } from '../can/can-service.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all CAN messages
router.get('/messages', (req, res) => {
  try {
    const messages = getAllCanMessages();
    res.status(200).json(messages);
  } catch (error) {
    logger.error(`Error getting CAN messages: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: 'Failed to get CAN messages' });
  }
});

// Get CAN status
router.get('/status', (req, res) => {
  try {
    const status = getCanStatus();
    res.status(200).json(status);
  } catch (error) {
    logger.error(`Error getting CAN status: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: 'Failed to get CAN status' });
  }
});

// Send a CAN message
router.post('/send', async (req, res) => {
  try {
    const { id, data } = req.body;
    
    if (!id || !data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid request. Required: id (number) and data (array of numbers)' });
    }
    
    const buffer = Buffer.from(data);
    const success = await sendCanMessage(id, buffer);
    
    if (success) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to send CAN message' });
    }
  } catch (error) {
    logger.error(`Error sending CAN message: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: 'Failed to send CAN message' });
  }
});

export default router;
