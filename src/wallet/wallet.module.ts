import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction]), SupabaseModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
