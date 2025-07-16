import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingModule } from './listing.module';
import { Listing } from './entities/listing.entity';
import * as request from 'supertest';

describe('ListingController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Listing],
          synchronize: true,
        }),
        ListingModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const baseListing = {
    title: 'TestTitle',
    category: 'TestCategory',
    description: 'TestDescription',
    price: 100,
    location: 'TestLocation',
    phone: '1234567890',
  };

  let listingId: string;

  it('should create a listing', async () => {
    const res = await request(app.getHttpServer())
      .post('/listing')
      .send(baseListing)
      .expect(201);
    expect(res.body.title).toBe(baseListing.title);
    listingId = res.body.id;
  });

  it('should not create duplicate active listing', async () => {
    await request(app.getHttpServer())
      .post('/listing')
      .send(baseListing)
      .expect(400);
  });

  it('should get all listings', async () => {
    const res = await request(app.getHttpServer()).get('/listing').expect(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe(baseListing.title);
  });

  it('should get one listing', async () => {
    const res = await request(app.getHttpServer())
      .get(`/listing/${listingId}`)
      .expect(200);
    expect(res.body.title).toBe(baseListing.title);
  });

  it('should update a listing', async () => {
    const updated = { ...baseListing, description: 'UpdatedDesc' };
    const res = await request(app.getHttpServer())
      .put(`/listing/${listingId}`)
      .send(updated)
      .expect(200);
    expect(res.body.description).toBe('UpdatedDesc');
  });

  it('should soft delete a listing', async () => {
    await request(app.getHttpServer())
      .delete(`/listing/${listingId}`)
      .expect(200);
    // Should not be found in list
    const res = await request(app.getHttpServer()).get('/listing').expect(200);
    expect(res.body.data.length).toBe(0);
  });

  it('should allow re-create with same title after soft delete', async () => {
    const res = await request(app.getHttpServer())
      .post('/listing')
      .send(baseListing)
      .expect(201);
    expect(res.body.title).toBe(baseListing.title);
  });
});
