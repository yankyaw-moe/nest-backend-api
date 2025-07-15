import { AppDataSource } from '../data-source';
import { Listing } from '../listing/entities/listing.entity'; // Adjust the import path as necessary

async function seed() {
  await AppDataSource.initialize();

  const listingRepo = AppDataSource.getRepository(Listing);

  const listings = [
    {
      title: 'Listing 13',
      category: 'Category 1',
      description: 'Description 1',
      price: 100,
      location: 'Location 1',
      phone: '1234567890',
    },
    {
      title: 'Listing 14',
      category: 'Category 2',
      description: 'Description 2',
      price: 200,
      location: 'Location 2',
      phone: '0987654321',
    },
    {
      title: 'Listing 15',
      category: 'Category 3',
      description: 'Description 3',
      price: 300,
      location: 'Location 3',
      phone: '1122334455',
    },
    {
      title: 'Listing 4',
      category: 'Category 1',
      description: 'Description 1',
      price: 100,
      location: 'Location 1',
      phone: '1234567890',
    },
    {
      title: 'Listing 5',
      category: 'Category 2',
      description: 'Description 2',
      price: 200,
      location: 'Location 2',
      phone: '0987654321',
    },
    {
      title: 'Listing 6',
      category: 'Category 3',
      description: 'Description 3',
      price: 300,
      location: 'Location 3',
      phone: '1122334455',
    },
    {
      title: 'Listing 7',
      category: 'Category 1',
      description: 'Description 1',
      price: 100,
      location: 'Location 1',
      phone: '1234567890',
    },
    {
      title: 'Listing 8',
      category: 'Category 2',
      description: 'Description 2',
      price: 200,
      location: 'Location 2',
      phone: '0987654321',
    },
    {
      title: 'Listing 9',
      category: 'Category 3',
      description: 'Description 3',
      price: 300,
      location: 'Location 3',
      phone: '1122334455',
    },
    {
      title: 'Listing 10',
      category: 'Category 1',
      description: 'Description 1',
      price: 100,
      location: 'Location 1',
      phone: '1234567890',
    },
    {
      title: 'Listing 11',
      category: 'Category 2',
      description: 'Description 2',
      price: 200,
      location: 'Location 2',
      phone: '0987654321',
    },
    {
      title: 'Listing 12',
      category: 'Category 3',
      description: 'Description 3',
      price: 300,
      location: 'Location 3',
      phone: '1122334455',
    },
  ];

  for (const data of listings) {
    const listing = listingRepo.create(data);
    await listingRepo.save(listing);
  }

  console.log('Seed complete!');
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
