import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { FirebaseAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/types/roles';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bids')
@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una puja' })
  @ApiBody({ type: CreateBidDto })
  @ApiResponse({ status: 201, description: 'Puja creada correctamente' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.PREMIUM)
  async createBid(@Body() createBidDto: CreateBidDto, @Req() req) {
    return this.bidsService.createBid(createBidDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener pujas por subasta o usuario' })
  @ApiQuery({ name: 'auctionId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'onlyActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de pujas' })
  async getBids(
    @Query('auctionId') auctionId?: string,
    @Query('userId') userId?: string,
    @Query('onlyActive') onlyActive?: string,
  ) {
    if (auctionId) {
      // Devuelve las pujas de la subasta
      return this.bidsService.getBidsByAuction(auctionId);
    }
    if (userId) {
      // Devuelve las subastas donde el usuario ha hecho bids
      return this.bidsService.getBidsByUser(userId, onlyActive === 'true');
    }
    throw new Error('auctionId or userId query param required');
  }
}
