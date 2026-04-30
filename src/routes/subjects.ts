import { ilike, or, and, getTableColumns, eq } from 'drizzle-orm';
import express from 'express';
import { departments, subjects } from '../db/schema/index.js';
import { db } from '../db';
import { sql } from 'drizzle-orm';


const router = express.Router();

//Get all subjects with optional search, filtering and pagination
router.get('/', async(req, res) => {
    try{
        const { search, department, page = 1, limit = 10 } = req.query;
        // const currentPage = Math.max(1, +page);
        // const limitPerPage = Math.max(1, +limit);
        const currentPage = Math.max(1, parseInt(page as string, 10) || 1);
        const limitPerPage = Math.max(1, parseInt(limit as string, 10) || 10);

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        //if search query is provided, add condition to filter by name or code
        if(search){
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)

                )
            );
        }


        //if department filter is provided, add condition to filter by department name
        if (department){
            // filterConditions.push(ilike(departments.name, `%${department}%`));
            const deptPattern = `%${String(department).replace(/%/g, '\\%')}%`;
            filterConditions.push(ilike(departments.name, deptPattern));
        }

        //combine all filters using AND operator if any exist
        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(subjects)
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db.select({
            ...getTableColumns(subjects),
            department: {...getTableColumns(departments)}
        }).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(whereClause)
        .orderBy(subjects.createAt)
        .limit(limitPerPage)
        .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page:currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        });


    } catch (e){
        console.error(`GET /subjects error: ${e}`);
        res.status(500).json({error: 'Failed to get subjects'});


    }
});

export default router;