import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getTrades,
  getTrade,
  addTrade,
  updateTrade,
  deleteTrade,
  exportCSV,
  uploadScreenshot
} from '../controllers/tradeController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// All routes require authentication
router.use(protect);

router.get('/', getTrades);
router.get('/export/csv', exportCSV);
router.post('/', addTrade);
router.post('/upload', upload.single('screenshot'), uploadScreenshot);
router.get('/:id', getTrade);
router.put('/:id', updateTrade);
router.delete('/:id', deleteTrade);

export default router;