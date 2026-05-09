export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
  },
  port: parseInt(process.env.PORT || '3000', 10),
});
