const sequelize = require('../db')
const Sequelize = require('sequelize');
const {
    INTEGER,
    STRING
} = Sequelize;
const Tag = sequelize.define('tag', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: INTEGER(11)
    },
    name: {
        type: STRING(255),
        unique: true,
        allowNull: false
    },
    articleId: {
        type: INTEGER(11),
        allowNull: false
    }
})
Tag.associate = function (models) {
    models.tag.belongsTo(models.article, {
        foreignKey: 'articleId',
        targetKey: 'id',
    })
}
module.exports = Tag;