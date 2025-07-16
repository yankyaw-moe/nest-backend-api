import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Res,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { Response } from 'express';
import * as fastcsv from 'fast-csv';

@Controller('listing')
export class ListingController {
  constructor(private readonly service: ListingService) {}

  @Post()
  async create(@Body() dto: CreateListingDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.softDelete(id);
    return { success: true };
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('category') category?: string,
    @Query('sortField')
    sortField: 'createdAt' | 'title' | 'price' = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
  ) {
    return this.service.findAll(
      Number(page),
      Number(limit),
      search,
      category,
      sortField,
      sortOrder,
      createdFrom,
      createdTo,
    );
  }

  @Get('report')
  async report(
    @Res() res: Response,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('category') category?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
  ) {
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 1000;
    const searchStr = search || '';
    const sortFieldVal =
      sortField === 'title' || sortField === 'price' ? sortField : 'createdAt';
    const sortOrderVal = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const { data } = await this.service.getReportData(
      pageNum,
      limitNum,
      searchStr,
      category,
      sortFieldVal,
      sortOrderVal,
      createdFrom,
      createdTo,
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="listing_report.csv"',
    );
    // Map data to custom headers
    const mapped = data.map((row: any) => ({
      ID: row.listing_id || row.id,
      Title: row.listing_title || row.title,
      Category: row.listing_category || row.category,
      Description: row.listing_description || row.description,
      Price: row.listing_price || row.price,
      Location: row.listing_location || row.location,
      Phone: row.listing_phone || row.phone,
      CreatedAt: row.listing_createdAt || row.createdAt,
    }));
    const headers = [
      'ID',
      'Title',
      'Category',
      'Description',
      'Price',
      'Location',
      'Phone',
      'CreatedAt',
    ];
    const csvStream = fastcsv.format({ headers });
    csvStream.pipe(res);
    mapped.forEach((row) => csvStream.write(row));
    csvStream.end();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
