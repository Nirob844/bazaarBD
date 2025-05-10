import { Server } from 'http';
import app from './app';
import { AuthService } from './app/modules/auth/auth.service';
import config from './config';
import { errorlogger, logger } from './shared/logger';
import prisma from './shared/prisma';

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Create super admin if not exists
    await AuthService.createSuperAdmin();

    const server: Server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });

    const exitHandler = () => {
      if (server) {
        server.close(() => {
          logger.info('Server closed');
        });
      }
      process.exit(1);
    };

    const unexpectedErrorHandler = (error: unknown) => {
      errorlogger.error(error);
      exitHandler();
    };

    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received');
      if (server) {
        server.close();
      }
    });
  } catch (error) {
    errorlogger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
