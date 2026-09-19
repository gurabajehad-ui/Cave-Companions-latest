import express from 'express';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';
import { query } from '../pg.js';
import crypto from 'crypto';

export const circleRoutes = express.Router();

// Get user's circles
circleRoutes.get('/', requireAuth, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        // Fetch circles where the user is a member
        const result = await query(`
            SELECT c.*, cm.role, cm.joined_at, cm.status,
            (SELECT COUNT(*) FROM circle_members WHERE circle_id = c.id) as member_count
            FROM circles c
            JOIN circle_members cm ON c.id = cm.circle_id
            WHERE cm.user_id = $1 AND cm.status = 'ACTIVE'
            ORDER BY c.created_at DESC
        `, [userId]);

        res.json({ success: true, circles: result.rows });
    } catch (error) {
        console.error('Error fetching circles:', error);
        res.status(500).json({ success: false, message: 'সার্কেল তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।' });
    }
});

// Create a circle
circleRoutes.post('/', requireAuth, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'সার্কেলের নাম আবশ্যক' });
        }

        // Transaction
        const circleId = crypto.randomUUID();
        const memberId = crypto.randomUUID();
        
        await query('BEGIN');
        
        await query(`
            INSERT INTO circles (id, name, description, admin_id)
            VALUES ($1, $2, $3, $4)
        `, [circleId, name, description, userId]);

        await query(`
            INSERT INTO circle_members (id, circle_id, user_id, role)
            VALUES ($1, $2, $3, 'ADMIN')
        `, [memberId, circleId, userId]);

        await query('COMMIT');

        res.json({ success: true, circleId, message: 'সার্কেল তৈরি করা হয়েছে' });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error creating circle:', error);
        res.status(500).json({ success: false, message: 'সার্কেল তৈরি করা যায়নি। আবার চেষ্টা করুন।' });
    }
});

// Get circle details
circleRoutes.get('/:id', requireAuth, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const circleId = req.params.id;

        // Verify membership
        const membershipCheck = await query(`
            SELECT role FROM circle_members 
            WHERE circle_id = $1 AND user_id = $2 AND status = 'ACTIVE'
        `, [circleId, userId]);

        if (membershipCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const circleRes = await query(`SELECT * FROM circles WHERE id = $1`, [circleId]);
        if (circleRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'সার্কেল পাওয়া যায়নি' });
        }

        const membersRes = await query(`
            SELECT cm.user_id, cm.role, u.full_name, u.gender 
            FROM circle_members cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.circle_id = $1 AND cm.status = 'ACTIVE'
        `, [circleId]);

        // Get aggregate Salah data for today for all members
        const todayStr = new Date().toISOString().split('T')[0];
        const attendancesRes = await query(`
            SELECT pa.prayer_type, COUNT(DISTINCT pa.user_id) as count
            FROM prayer_attendances pa
            JOIN circle_members cm ON pa.user_id = cm.user_id
            WHERE cm.circle_id = $1 AND cm.status = 'ACTIVE' 
              AND pa.date = $2
            GROUP BY pa.prayer_type
        `, [circleId, todayStr]);

        const aggregateProgress: Record<string, number> = {
            fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0
        };

        attendancesRes.rows.forEach(r => {
            aggregateProgress[r.prayer_type] = parseInt(r.count, 10);
        });

        res.json({ 
            success: true, 
            circle: circleRes.rows[0],
            members: membersRes.rows,
            aggregateProgress
        });
    } catch (error) {
        console.error('Error fetching circle details:', error);
        res.status(500).json({ success: false, message: 'সার্কেল তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।' });
    }
});

// Create Invite
circleRoutes.post('/:id/invites', requireAuth, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const circleId = req.params.id;

        // Verify admin role
        const membershipCheck = await query(`
            SELECT role FROM circle_members 
            WHERE circle_id = $1 AND user_id = $2 AND role = 'ADMIN' AND status = 'ACTIVE'
        `, [circleId, userId]);

        if (membershipCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'অনুমতি নেই' });
        }

        const inviteId = crypto.randomUUID();
        const inviteCode = crypto.randomUUID().substring(0, 8).toUpperCase();
        
        await query(`
            INSERT INTO circle_invites (id, circle_id, invite_code, created_by)
            VALUES ($1, $2, $3, $4)
        `, [inviteId, circleId, inviteCode, userId]);

        res.json({ success: true, inviteCode });
    } catch (error) {
        console.error('Error creating invite:', error);
        res.status(500).json({ success: false, message: 'ইনভাইট তৈরি করা যায়নি' });
    }
});

// Join Circle
circleRoutes.post('/join', requireAuth, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const { inviteCode } = req.body;

        if (!inviteCode) {
            return res.status(400).json({ success: false, message: 'ইনভাইট কোড আবশ্যক' });
        }

        const inviteRes = await query(`
            SELECT * FROM circle_invites 
            WHERE invite_code = $1 AND revoked_at IS NULL
        `, [inviteCode]);

        if (inviteRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'ইনভাইট কোডটি সঠিক নয় অথবা মেয়াদোত্তীর্ণ' });
        }

        const circleId = inviteRes.rows[0].circle_id;

        // Check max members
        const memberCountRes = await query(`
            SELECT COUNT(*) as count FROM circle_members WHERE circle_id = $1 AND status = 'ACTIVE'
        `, [circleId]);
        if (parseInt(memberCountRes.rows[0].count, 10) >= 20) {
            return res.status(400).json({ success: false, message: 'সার্কেলটি সম্পূর্ণ' });
        }

        // Check if already a member
        const existingCheck = await query(`
            SELECT * FROM circle_members WHERE circle_id = $1 AND user_id = $2
        `, [circleId, userId]);

        if (existingCheck.rows.length > 0) {
            if (existingCheck.rows[0].status === 'ACTIVE') {
                 return res.status(400).json({ success: false, message: 'আপনি ইতিমধ্যে এই সার্কেলের সদস্য' });
            } else {
                 await query(`UPDATE circle_members SET status = 'ACTIVE', joined_at = CURRENT_TIMESTAMP WHERE id = $1`, [existingCheck.rows[0].id]);
            }
        } else {
            const memberId = crypto.randomUUID();
            await query(`
                INSERT INTO circle_members (id, circle_id, user_id, role)
                VALUES ($1, $2, $3, 'MEMBER')
            `, [memberId, circleId, userId]);
        }

        res.json({ success: true, circleId, message: 'সার্কেলে স্বাগতম' });
    } catch (error) {
        console.error('Error joining circle:', error);
        res.status(500).json({ success: false, message: 'সার্কেলে যুক্ত হওয়া যায়নি' });
    }
});

// Leave Circle
circleRoutes.post('/:id/leave', requireAuth, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const circleId = req.params.id;

        const membership = await query(`SELECT role FROM circle_members WHERE circle_id = $1 AND user_id = $2 AND status = 'ACTIVE'`, [circleId, userId]);
        
        if (membership.rows.length === 0) {
             return res.status(400).json({ success: false, message: 'আপনি এই সার্কেলের সদস্য নন' });
        }

        const role = membership.rows[0].role;
        
        if (role === 'ADMIN') {
             // Admin leaving logic: check if other members exist
             const members = await query(`SELECT id, user_id FROM circle_members WHERE circle_id = $1 AND status = 'ACTIVE' AND user_id != $2 LIMIT 1`, [circleId, userId]);
             
             await query('BEGIN');
             if (members.rows.length > 0) {
                 // Promote another member to admin
                 await query(`UPDATE circle_members SET role = 'ADMIN' WHERE user_id = $1 AND circle_id = $2`, [members.rows[0].user_id, circleId]);
                 // Set current user as inactive
                 await query(`UPDATE circle_members SET status = 'INACTIVE' WHERE circle_id = $1 AND user_id = $2`, [circleId, userId]);
             } else {
                 // Delete circle if empty
                 await query(`DELETE FROM circles WHERE id = $1`, [circleId]);
             }
             await query('COMMIT');
        } else {
            await query(`UPDATE circle_members SET status = 'INACTIVE' WHERE circle_id = $1 AND user_id = $2`, [circleId, userId]);
        }

        res.json({ success: true, message: 'সার্কেল ত্যাগ করা হয়েছে' });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error leaving circle:', error);
        res.status(500).json({ success: false, message: 'সার্কেল ত্যাগ করা যায়নি' });
    }
});

// Delete Circle
circleRoutes.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const circleId = req.params.id;

        const membershipCheck = await query(`
            SELECT role FROM circle_members 
            WHERE circle_id = $1 AND user_id = $2 AND role = 'ADMIN' AND status = 'ACTIVE'
        `, [circleId, userId]);

        if (membershipCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'অনুমতি নেই' });
        }

        await query(`DELETE FROM circles WHERE id = $1`, [circleId]);
        res.json({ success: true, message: 'সার্কেল মুছে ফেলা হয়েছে' });
    } catch (error) {
        console.error('Error deleting circle:', error);
        res.status(500).json({ success: false, message: 'সার্কেল মুছে ফেলা যায়নি' });
    }
});

// Post reminder / encouragement / nosiha
circleRoutes.post('/:id/notify', requireAuth, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const circleId = req.params.id;
        const { type, message } = req.body; 
        // type: 'REMINDER' | 'ENCOURAGEMENT' | 'NOSIHA'

        // verify membership
        const membershipCheck = await query(`SELECT role FROM circle_members WHERE circle_id = $1 AND user_id = $2 AND status = 'ACTIVE'`, [circleId, userId]);
        if (membershipCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'অনুমতি নেই' });
        }

        const circleRes = await query(`SELECT name FROM circles WHERE id = $1`, [circleId]);
        const circleName = circleRes.rows[0].name;

        // Get other members
        const members = await query(`SELECT user_id FROM circle_members WHERE circle_id = $1 AND user_id != $2 AND status = 'ACTIVE'`, [circleId, userId]);
        
        let titleBn = '';
        let messageBn = '';

        if (type === 'REMINDER') {
            titleBn = 'মসজিদের আহ্বান 🕌';
            messageBn = `আপনার Circle (${circleName}) থেকে একজন Companion আপনাকে মসজিদের সালাতের কথা মনে করিয়ে দিয়েছেন।`;
        } else if (type === 'ENCOURAGEMENT') {
            titleBn = 'Circle থেকে উৎসাহ 🤍';
            messageBn = message || `Circle (${circleName}) থেকে একজন Companion আপনাকে উৎসাহ পাঠিয়েছেন।`;
        } else if (type === 'NOSIHA') {
            titleBn = 'Circle থেকে নসিহা 🤍';
            messageBn = message || `Circle (${circleName}) থেকে একজন Companion নসিহা পাঠিয়েছেন।`;
        } else {
             return res.status(400).json({ success: false, message: 'Invalid type' });
        }

        // Send notifications using existing db.createNotification
        for (const m of members.rows) {
            await db.createNotification(m.user_id, 'SYSTEM_ANNOUNCEMENT' as any, titleBn, messageBn, circleId);
        }

        res.json({ success: true, message: 'বার্তা পাঠানো হয়েছে' });
    } catch (error) {
        console.error('Error sending circle notification:', error);
        res.status(500).json({ success: false, message: 'বার্তা পাঠানো যায়নি' });
    }
});

export default circleRoutes;
