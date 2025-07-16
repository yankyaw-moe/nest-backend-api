import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, IsNull } from 'typeorm';
import { Listing } from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,
  ) {}

  async create(dto: CreateListingDto): Promise<Listing> {
    // Check for existing active listing with the same title
    const existing = await this.listingRepo.findOne({
      where: { title: dto.title, deletedAt: IsNull() },
    });
    if (existing) {
      throw new BadRequestException(
        'A listing with this title already exists.',
      );
    }
    const listing = this.listingRepo.create(dto);
    return this.listingRepo.save(listing);
  }

  async update(id: string, dto: UpdateListingDto): Promise<Listing | null> {
    await this.listingRepo.update(id, dto);
    return this.listingRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.listingRepo.update(id, { deletedAt: new Date() });
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
    category?: string,
    sortField: 'createdAt' | 'title' | 'price' = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    createdFrom?: string,
    createdTo?: string,
  ): Promise<{
    data: Listing[];
    total: number;
    currentPage: number;
    lastPage: number;
  }> {
    const qb = this.listingRepo
      .createQueryBuilder('listing')
      .where('listing.deletedAt IS NULL');

    if (category) {
      qb.andWhere('listing.category = :category', { category });
    }

    if (search) {
      qb.andWhere(
        'listing.title LIKE :search OR listing.category LIKE :search OR listing.description LIKE :search OR listing.location LIKE :search OR listing.phone LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (createdFrom) {
      qb.andWhere('listing.createdAt >= :createdFrom', { createdFrom });
    }
    if (createdTo) {
      qb.andWhere('listing.createdAt <= :createdTo', { createdTo });
    }

    // Validate sortField
    const allowedSortFields = ['createdAt', 'title', 'price'];
    const sortBy = allowedSortFields.includes(sortField)
      ? sortField
      : 'createdAt';
    const orderBy = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(`listing.${sortBy}`, orderBy)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const lastPage = Math.ceil(total / limit);

    return { data, total, currentPage: page, lastPage };
  }

  async findOne(id: string): Promise<Listing | null> {
    return this.listingRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async getReportData(
    page: number,
    limit: number,
    search: string,
    category?: string,
    sortField?: string,
    sortOrder?: string,
    createdFrom?: string,
    createdTo?: string,
  ): Promise<{ data: Partial<Listing>[] }> {
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 1000;
    const searchStr = search || '';
    const allowedSortFields = ['createdAt', 'title', 'price'];
    const sortFieldValue = sortField ?? 'createdAt';
    const sortBy = allowedSortFields.includes(sortFieldValue)
      ? sortFieldValue
      : 'createdAt';
    const orderBy = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const qb = this.listingRepo
      .createQueryBuilder('listing')
      .select([
        'listing.id',
        'listing.title',
        'listing.category',
        'listing.description',
        'listing.price',
        'listing.location',
        'listing.phone',
        'listing.createdAt',
      ])
      .where('listing.deletedAt IS NULL');

    if (category) {
      qb.andWhere('listing.category = :category', { category });
    }
    if (searchStr) {
      qb.andWhere(
        'listing.title LIKE :search OR listing.category LIKE :search OR listing.description LIKE :search OR listing.location LIKE :search OR listing.phone LIKE :search',
        { search: `%${searchStr}%` },
      );
    }
    if (createdFrom) {
      qb.andWhere('listing.createdAt >= :createdFrom', { createdFrom });
    }
    if (createdTo) {
      qb.andWhere('listing.createdAt <= :createdTo', { createdTo });
    }
    qb.orderBy(`listing.${sortBy}`, orderBy)
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    const data = await qb.getRawMany();
    return { data };
  }
}
