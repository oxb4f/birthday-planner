import {
  Param,
  Req,
  Res,
  Get,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response, Request } from "express";
import { contentType } from "mime-types";
import { PinoLogger } from "nestjs-pino";

import { FileService } from "../services";

export abstract class FileController {
  constructor(
    protected readonly _fileService: FileService,
    protected readonly _logger: PinoLogger,
  ) {}

  @Get("file/download-file/:bucket/files/:key")
  public async downloadFile(
    @Req() req: Request,
    @Res() res: Response,
    @Param("bucket") bucket: string,
    @Param("key") key: string,
  ): Promise<void> {
    const mimeType = contentType(key);
    if (!mimeType) {
      throw new HttpException(
        "Cannot get mime type from file key",
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this._fileService.downloadFile(bucket, `files/${key}`, res, {
        mimeType,
        range: req.headers.range,
      });
    } catch (error) {
      this._logger.error(error);

      throw new HttpException("Cannot get file", HttpStatus.BAD_REQUEST);
    }
  }
}
