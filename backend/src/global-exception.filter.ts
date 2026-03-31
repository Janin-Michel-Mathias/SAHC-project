import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode = this.getStatusCode(exception);
    const message = this.getMessage(exception);

    response.status(statusCode).json({
      statusCode,
      message,
    });
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (
      typeof exception === 'object' &&
      exception !== null &&
      'status' in exception &&
      typeof (exception as { status: unknown }).status === 'number'
    ) {
      return (exception as { status: number }).status;
    }

    if (exception instanceof Error) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown): string | string[] {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return response;
      }

      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        return (response as { message: string | string[] }).message;
      }

      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }
}
