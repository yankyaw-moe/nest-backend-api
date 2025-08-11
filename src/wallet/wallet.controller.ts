import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit')
  @Roles(Role.User, Role.Admin)
  @ApiOperation({ summary: 'Deposit money to wallet' })
  @ApiResponse({ status: 200, description: 'Deposit successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async deposit(@Request() req, @Body() depositDto: DepositDto) {
    return this.walletService.deposit(req.user.id, depositDto);
  }

  @Post('withdraw')
  @Roles(Role.User, Role.Admin)
  @ApiOperation({ summary: 'Withdraw money from wallet' })
  @ApiResponse({ status: 200, description: 'Withdrawal successful' })
  @ApiResponse({
    status: 400,
    description: 'Insufficient balance or bad request',
  })
  async withdraw(@Request() req, @Body() withdrawDto: WithdrawDto) {
    return this.walletService.withdraw(req.user.id, withdrawDto);
  }

  @Get('transactions')
  // @Roles(Role.User, Role.Admin)
  @ApiOperation({ summary: 'Get user transaction history' })
  @ApiResponse({
    status: 200,
    description: 'Transaction list retrieved successfully',
  })
  async getTransactions(@Request() req, @Query() query: TransactionQueryDto) {
    return this.walletService.getTransactions(req.user.id, query);
  }

  @Get('balance')
  @Roles(Role.User, Role.Admin)
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({
    status: 200,
    description: 'Wallet balance retrieved successfully',
  })
  async getBalance(@Request() req) {
    return this.walletService.getWalletBalance(req.user.id);
  }
}
