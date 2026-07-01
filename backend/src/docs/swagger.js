const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskFlow API",
      version: "1.0.0",
      description:
        "REST API with JWT auth and role based access control, built as part of a backend intern assignment. Covers user registration/login and CRUD on a tasks resource.",
    },
    servers: [{ url: "/api/v1", description: "v1" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // pulls the @swagger comment blocks straight out of the route/controller files
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

module.exports = swaggerJsdoc(options);
