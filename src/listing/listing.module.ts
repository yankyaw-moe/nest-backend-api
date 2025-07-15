import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './entities/listing.entity';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Listing])],
  providers: [ListingService],
  controllers: [ListingController],
})
export class ListingModule {}
