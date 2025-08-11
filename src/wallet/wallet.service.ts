import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus } from './entities/transaction.entity';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        userId,
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
      });
      wallet = await this.walletRepository.save(wallet);
    }

    return wallet;
  }

  async deposit(userId: string, depositDto: DepositDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.getOrCreateWallet(userId);

      // Create transaction record
      const transaction = this.transactionRepository.create({
        type: TransactionType.DEPOSIT,
        amount: depositDto.amount,
        status: TransactionStatus.PENDING,
        description: depositDto.description,
        reference: depositDto.reference,
        walletId: wallet.id,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Update wallet balance
      const newBalance = Number(wallet.balance) + Number(depositDto.amount);
      const newTotalDeposited = Number(wallet.totalDeposited) + Number(depositDto.amount);

      await queryRunner.manager.update(Wallet, wallet.id, {
        balance: newBalance,
        totalDeposited: newTotalDeposited,
      });

      // Update transaction with new balance and mark as completed
      await queryRunner.manager.update(Transaction, savedTransaction.id, {
        balanceAfter: newBalance,
        status: TransactionStatus.COMPLETED,
      });

      await queryRunner.commitTransaction();

      return {
        message: 'Deposit successful',
        transaction: {
          id: savedTransaction.id,
          type: savedTransaction.type,
          amount: savedTransaction.amount,
          status: TransactionStatus.COMPLETED,
          balanceAfter: newBalance,
          createdAt: savedTransaction.createdAt,
        },
        wallet: {
          balance: newBalance,
          totalDeposited: newTotalDeposited,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Deposit failed:', error);
      throw new InternalServerErrorException('Deposit failed');
    } finally {
      await queryRunner.release();
    }
  }

  async withdraw(userId: string, withdrawDto: WithdrawDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.getOrCreateWallet(userId);

      // Check if sufficient balance
      if (Number(wallet.balance) < Number(withdrawDto.amount)) {
        throw new BadRequestException('Insufficient balance');
      }

      // Create transaction record
      const transaction = this.transactionRepository.create({
        type: TransactionType.WITHDRAW,
        amount: withdrawDto.amount,
        status: TransactionStatus.PENDING,
        description: withdrawDto.description,
        reference: withdrawDto.reference,
        walletId: wallet.id,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Update wallet balance
      const newBalance = Number(wallet.balance) - Number(withdrawDto.amount);
      const newTotalWithdrawn = Number(wallet.totalWithdrawn) + Number(withdrawDto.amount);

      await queryRunner.manager.update(Wallet, wallet.id, {
        balance: newBalance,
        totalWithdrawn: newTotalWithdrawn,
      });

      // Update transaction with new balance and mark as completed
      await queryRunner.manager.update(Transaction, savedTransaction.id, {
        balanceAfter: newBalance,
        status: TransactionStatus.COMPLETED,
      });

      await queryRunner.commitTransaction();

      return {
        message: 'Withdrawal successful',
        transaction: {
          id: savedTransaction.id,
          type: savedTransaction.type,
          amount: savedTransaction.amount,
          status: TransactionStatus.COMPLETED,
          balanceAfter: newBalance,
          createdAt: savedTransaction.createdAt,
        },
        wallet: {
          balance: newBalance,
          totalWithdrawn: newTotalWithdrawn,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Withdrawal failed:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Withdrawal failed');
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactions(userId: string, query: TransactionQueryDto) {
    const wallet = await this.getOrCreateWallet(userId);
    
    const { page = 1, limit = 10, type, status, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.walletId = :walletId', { walletId: wallet.id })
      .orderBy('transaction.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWalletBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: wallet.balance,
      totalDeposited: wallet.totalDeposited,
      totalWithdrawn: wallet.totalWithdrawn,
    };
  }
}