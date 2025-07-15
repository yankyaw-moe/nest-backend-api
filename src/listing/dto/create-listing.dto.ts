import { IsString, IsNumber } from 'class-validator';

export class CreateListingDto {
  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  location: string;

  @IsString()
  phone: string;
}
