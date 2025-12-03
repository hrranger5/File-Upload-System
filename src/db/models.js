// src/db/models.js (extend your existing models file)
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(process.env.DB_URL, { dialect: 'mysql', logging: false });

// Existing Intern model assumed
const Intern = sequelize.define('Intern', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false }
  // ...
});

// FileRecord model
const FileRecord = sequelize.define('FileRecord', {
  intern_id: { type: DataTypes.INTEGER, allowNull: false },
  filename: { type: DataTypes.STRING, allowNull: false },
  original_name: { type: DataTypes.STRING },
  content_type: { type: DataTypes.STRING },
  size: { type: DataTypes.INTEGER },
  storage_path: { type: DataTypes.STRING },
  url: { type: DataTypes.STRING },
  uploaded_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
}, {
  tableName: 'file_records',
  timestamps: false
});

Intern.hasMany(FileRecord, { foreignKey: 'intern_id' });
FileRecord.belongsTo(Intern, { foreignKey: 'intern_id' });

module.exports = { sequelize, Intern, FileRecord };
