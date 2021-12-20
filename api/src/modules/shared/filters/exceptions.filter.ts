import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

import * as ErrorStackParser from "error-stack-parser";
import { ConfigService } from "../services";

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(protected readonly _configService: ConfigService) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const apiResponse: {
      statusCode: number;
      error?: { details?: unknown; stack?: Array<string> };
    } = {
      statusCode: status,
    };

    if (this._configService.isDevelopment()) {
      apiResponse.error = {};

      apiResponse.error.details = exception.message;
      if (exception instanceof HttpException) {
        apiResponse.error.details = exception.getResponse();
      }
      apiResponse.error.stack = ErrorStackParser.parse(exception).map(
        (stackFrame) =>
          `${stackFrame.functionName} (${stackFrame.fileName}:${stackFrame.lineNumber}:${stackFrame.columnNumber})`,
      );
    }

    response.status(status).json(apiResponse);
  }
}
