import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentQueryDto, UpdatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { createApiResponse } from '../common/interfaces/api-response.interface';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CASHIER)
  @ApiOperation({ summary: 'To\'lov qabul qilish' })
  async create(@Body() dto: CreatePaymentDto, @CurrentUser() user: any) {
    const data = await this.paymentsService.create(dto, user.id);
    return createApiResponse('To\'lov qabul qilindi', data, 201);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CASHIER)
  @ApiOperation({ summary: 'Barcha to\'lovlar' })
  async findAll(@Query() query: PaymentQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Get('statistics')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'To\'lov statistikasi' })
  @ApiQuery({ name: 'month', required: false, example: '2026-05' })
  async getStatistics(@Query('month') month?: string) {
    const data = await this.paymentsService.getStatistics(month);
    return createApiResponse('To\'lov statistikasi', data);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CASHIER)
  @ApiOperation({ summary: 'To\'lovni ID bo\'yicha olish' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.paymentsService.findOne(id);
    return createApiResponse('To\'lov topildi', data);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'To\'lovni yangilash' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePaymentDto) {
    const data = await this.paymentsService.update(id, dto);
    return createApiResponse('To\'lov yangilandi', data);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'To\'lovni o\'chirish' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.paymentsService.remove(id);
  }
}
