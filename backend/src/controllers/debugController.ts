import { Request, Response } from 'express';

const getSequelize = () => {
  const db = require('../config/database');
  return db.sequelize;
};

const sequelize = getSequelize();
const { QueryTypes } = require('sequelize');

// GET /debug/schema - Voir la structure des tables
export const getSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    // Récupérer la structure de toutes les tables
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `, { type: QueryTypes.SELECT });

    const schema: any = {};

    for (const table of tables as any[]) {
      const tableName = table.table_name;
      
      const columns = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '${tableName}'
        ORDER BY ordinal_position
      `, { type: QueryTypes.SELECT });

      schema[tableName] = columns;
    }

    res.json({
      success: true,
      schema
    });
  } catch (error: any) {
    console.error('Erreur getSchema:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
