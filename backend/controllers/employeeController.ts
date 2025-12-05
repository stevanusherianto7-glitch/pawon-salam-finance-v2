import { Request, Response } from 'express';
// Assuming Prisma Client is set up
// import { prisma } from '../lib/prisma'; 

export class EmployeeController {

    /**
     * GET /api/employees/next-sequence
     * Calculates the next deterministic ID based on Role, Division, and Date.
     * Format: [PREFIX]-[DEPT]-[YY][SEQ]  (e.g., EMP-FOH-25042)
     */
    static getNextSequence = async (req: Request, res: Response) => {
        try {
            const { role, division, joinDate } = req.query;

            if (!role || !division || !joinDate) {
                return res.status(400).json({ error: "Missing required parameters: role, division, joinDate" });
            }

            // 1. Determine Prefix & Department Code
            const prefix = this.getIDPrefix(String(role), String(division)); // logic helper
            const deptCode = this.getDeptCode(String(role), String(division));

            // 2. Parse Year (YY) from joinDate
            const dateObj = new Date(String(joinDate));
            const year = dateObj.getFullYear().toString().slice(-2); // "25" for 2025

            // 3. Construct ID Pattern for Database Lookup
            // We need to count how many employees exist with this Role + Dept + Year pattern
            // Pattern to match: "EMP-FOH-25%"
            const pattern = `${prefix}-${deptCode}-${year}`;

            // 4. Query Database (Prisma Example)
            // In a real DB, we might use a separate Sequence table to ensure atomic increments,
            // but "Count + 1" is requested.
            /*
            const count = await prisma.employee.count({
              where: {
                id: {
                  startsWith: pattern
                }
              }
            });
            */

            // MOCK DB CALL FOR STRATEGY DEMO
            const count = await this.mockDbCount(pattern);

            // 5. Format Sequence (3 digits)
            const nextSeq = (count + 1).toString().padStart(3, '0');

            // 6. Final ID
            const nextId = `${pattern}${nextSeq}`;

            // 7. Return Result
            // Simulate network delay for "Pulse" effect demonstration
            await new Promise(resolve => setTimeout(resolve, 500));

            return res.status(200).json({
                success: true,
                data: {
                    id: nextId,
                    sequence: nextSeq,
                    pattern: pattern
                }
            });

        } catch (error) {
            console.error("ID Generation Error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    };

    // --- HELPER FUNCTIONS (Business Logic) ---

    private static getIDPrefix(role: string, area: string): string {
        if (role === 'BUSINESS_OWNER') return 'OWN';
        if (role === 'SUPER_ADMIN') return 'SYS';
        if (role.includes('MANAGER')) return 'MGR';
        if (area === 'DAILY_WORKER') return 'DW'; // simplified logic
        return 'EMP';
    }

    private static getDeptCode(role: string, area: string): string {
        if (area === 'FOH') return 'FOH';
        if (area === 'BOH') return 'BOH';
        if (role.includes('HR')) return 'HRD';
        if (role.includes('FINANCE')) return 'FIN';
        return 'GEN';
    }

    private static async mockDbCount(pattern: string): Promise<number> {
        // This would match against real DB
        return 41; // Example: 41 existing employees
    }
}
