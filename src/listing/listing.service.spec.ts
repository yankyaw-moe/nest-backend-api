import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ListingService } from './listing.service';
import { Listing } from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { BadRequestException } from '@nestjs/common';

const mockListing = {
  id: '1',
  title: 'Test',
  category: 'Cat',
  description: 'Desc',
  price: 100,
  location: 'Loc',
  phone: '123',
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepo = () => ({
  create: jest.fn().mockImplementation((dto) => ({ ...dto })),
  save: jest.fn().mockResolvedValue(mockListing),
  findOne: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
  findAndCount: jest.fn(),
});

describe('ListingService', () => {
  let service: ListingService;
  let repo: Repository<Listing>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingService,
        {
          provide: getRepositoryToken(Listing),
          useFactory: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ListingService>(ListingService);
    repo = module.get<Repository<Listing>>(getRepositoryToken(Listing));
  });

  it('should create listing', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(undefined);
    const dto: CreateListingDto = { ...mockListing };
    await expect(service.create(dto)).resolves.toEqual(mockListing);
  });

  it('should throw error for duplicate title', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(mockListing);
    const dto: CreateListingDto = { ...mockListing };
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should update listing', async () => {
    (repo.update as jest.Mock).mockResolvedValue(undefined);
    (repo.findOne as jest.Mock).mockResolvedValue(mockListing);
    const dto: UpdateListingDto = { ...mockListing };
    await expect(service.update('1', dto)).resolves.toEqual(mockListing);
  });

  it('should soft delete listing', async () => {
    (repo.update as jest.Mock).mockResolvedValue(undefined);
    await expect(service.softDelete('1')).resolves.toBeUndefined();
  });

  it('should find one listing', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(mockListing);
    await expect(service.findOne('1')).resolves.toEqual(mockListing);
  });

  it('should find all listings', async () => {
    // Mock QueryBuilder
    const qb: any = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockListing], 1]),
    };
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    const result = await service.findAll(
      1,
      10,
      '',
      undefined,
      'createdAt',
      'DESC',
    );
    expect(result.data).toEqual([mockListing]);
    expect(result.total).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(result.lastPage).toBe(1);
  });
});
