const dataSource = process.env.DATA_SOURCE || "memory";

if (!["memory", "database"].includes(dataSource)) {
  throw new Error("DATA_SOURCE must be memory or database");
}

const config = {
  dataSource,
  port: process.env.PORT || 3001,
};

module.exports = config;
