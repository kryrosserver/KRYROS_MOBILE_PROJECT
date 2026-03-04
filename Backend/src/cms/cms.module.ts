import { Module } from '@nestjs/common';
import { CMSService } from './cms.service';
import { CMSController } from './cms.controller';

@Module({
  providers: [CMSService],
  controllers: [CMSController],
  exports: [CMSService],
})
export class CMSModule {}
